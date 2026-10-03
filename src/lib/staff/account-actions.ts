"use server";

import { revalidatePath } from "next/cache";
import { getAppUrl } from "@/lib/checkout/stripe";
import { sendEmail } from "@/lib/email/send";
import {
  emailChangeConfirmEmail,
  emailChangedNoticeEmail,
  passwordChangedNoticeEmail,
  passwordResetEmail,
  staffInviteEmail,
} from "@/lib/email/templates";
import { getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";
import {
  changeStaffEmail,
  consumeStaffToken,
  createInvitedStaff,
  createStaffToken,
  deactivateStaff,
  getStaffAccountByEmail,
  getStaffAccountById,
  isValidEmail,
  logAudit,
  normalizeEmail,
  reactivateStaff,
  setStaffPassword,
  type StaffAccount,
} from "./accounts";
import { requireAdminSession, requireStaffSession } from "./auth";
import { checkNewPassword, hashPassword, verifyPasswordConstantTime } from "./password";
import { setStaffSessionCookie } from "./session-cookie";

export interface AccountFormState {
  error?: string;
  success?: string;
}

export interface AccountActionResult {
  ok: boolean;
  message: string;
}

const HOUR = 60 * 60;

function revalidateAccountPages() {
  revalidatePath("/admin/admins");
  revalidatePath("/admin/staff");
}

function linkFor(path: string, token: string): string {
  return `${getAppUrl()}${path}?token=${encodeURIComponent(token)}`;
}

async function sendInvite(account: StaffAccount, inviterName: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = await createStaffToken(account.id, "invite");
  const email = staffInviteEmail({ name: account.name, inviterName, role: account.role, url: linkFor("/admin/set-password", token) });
  const result = await sendEmail({ to: account.email, ...email });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// --- Invites (admins and staff) -------------------------------------------

/** Creates an account with no password and emails its owner a 24-hour link to choose one. */
export async function inviteStaffAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const role = String(formData.get("role") ?? "staff");

  if (!name || name.length > 255) return { error: "Enter their name." };
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (role !== "staff" && role !== "admin") return { error: "Invalid role." };

  const existing = await getStaffAccountByEmail(email);
  if (existing) {
    return {
      error:
        existing.status === "invited"
          ? "That person has already been invited — use “Resend invite” on their row."
          : "An account with that email already exists.",
    };
  }

  const bucket = rateLimitBucket("staff-invite", email);
  if (await isRateLimited(bucket, 3, HOUR)) return { error: "Too many invites to that address in the last hour. Try again later." };
  await recordAttempt(bucket);

  const id = await createInvitedStaff({ name, email, role, invitedBy: session.staffId });
  const account = await getStaffAccountById(id);
  await logAudit(session.staffId, "invite_sent", id, `${role} invite to ${email}`);
  revalidateAccountPages();

  const sent = account ? await sendInvite(account, session.name) : { ok: false as const, error: "account not found" };
  if (!sent.ok) {
    return { error: `The account was created but the invite email failed (${sent.error}). Fix the email settings, then use “Resend invite”.` };
  }
  return { success: `Invite sent to ${email}. The link expires in 24 hours.` };
}

export async function resendInviteAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const account = await getStaffAccountById(staffId);
  if (!account || account.status !== "invited") return { ok: false, message: "That account isn't waiting for an invite." };

  const bucket = rateLimitBucket("staff-invite", account.email);
  if (await isRateLimited(bucket, 3, HOUR)) return { ok: false, message: "Too many invites to that address in the last hour. Try again later." };
  await recordAttempt(bucket);

  const sent = await sendInvite(account, session.name);
  if (!sent.ok) return { ok: false, message: `Email not sent: ${sent.error}` };
  await logAudit(session.staffId, "invite_sent", staffId, `invite re-sent to ${account.email}`);
  revalidateAccountPages();
  return { ok: true, message: `New invite sent to ${account.email}. Earlier links no longer work.` };
}

// --- Setting a password from an invite or reset link ----------------------

export interface SetPasswordState extends AccountFormState {
  signInPath?: string;
}

export async function setPasswordWithTokenAction(_prev: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const problem = checkNewPassword(password, String(formData.get("confirm") ?? ""));
  // Checked before the link is used up, so a typo doesn't burn it.
  if (problem) return { error: problem };

  const ipBucket = rateLimitBucket("staff-token-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, HOUR)) return { error: "Too many attempts. Try again in an hour." };

  const info = await consumeStaffToken(token, ["invite", "password_reset"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;
  if (!info || !account || account.status === "deactivated") {
    await recordAttempt(ipBucket);
    return { error: "This link is invalid, has already been used or has expired. Ask for a new one." };
  }

  await setStaffPassword(account.id, hashPassword(password));
  await logAudit(account.id, info.purpose === "invite" ? "invite_accepted" : "password_reset", account.id);
  if (info.purpose === "password_reset") {
    await sendEmail({ to: account.email, ...passwordChangedNoticeEmail() });
  }
  revalidateAccountPages();
  return {
    success: info.purpose === "invite" ? "Your password is set — you can sign in now." : "Your password has been changed — sign in with the new one.",
    signInPath: account.role === "admin" ? "/admin/login" : "/staff/login",
  };
}

// --- Forgot password --------------------------------------------------------

const RESET_SENT_MESSAGE = "If there's an account for that email, we've sent it a reset link. It expires in 1 hour.";

export async function forgotPasswordAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };

  const ipBucket = rateLimitBucket("staff-reset-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 10, HOUR)) return { error: "Too many reset requests. Try again in an hour." };
  const emailBucket = rateLimitBucket("staff-reset-email", email);
  const emailLimited = await isRateLimited(emailBucket, 3, HOUR);
  await recordAttempt(ipBucket, emailBucket);
  // Same answer whether or not the account exists (or the limit was hit),
  // so this form can't be used to find out who has an account.
  if (emailLimited) return { success: RESET_SENT_MESSAGE };

  const account = await getStaffAccountByEmail(email);
  if (account && account.status === "active") {
    const token = await createStaffToken(account.id, "password_reset");
    await sendEmail({ to: account.email, ...passwordResetEmail({ url: linkFor("/admin/set-password", token) }) });
    await logAudit(null, "password_reset_requested", account.id);
  }
  return { success: RESET_SENT_MESSAGE };
}

// --- Account settings (signed in) -------------------------------------------

/** Checks the current password, rate-limited per account. */
async function checkCurrentPassword(account: StaffAccount, password: string): Promise<string | null> {
  const bucket = rateLimitBucket("staff-current-password", String(account.id));
  if (await isRateLimited(bucket, 5, 15 * 60)) return "Too many wrong passwords. Wait 15 minutes and try again.";
  if (!verifyPasswordConstantTime(password, account.passwordHash)) {
    await recordAttempt(bucket);
    return "Your current password is incorrect.";
  }
  return null;
}

export async function changePasswordAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireStaffSession();
  const account = await getStaffAccountById(session.staffId);
  if (!account) return { error: "Account not found." };

  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const wrong = await checkCurrentPassword(account, current);
  if (wrong) return { error: wrong };
  const problem = checkNewPassword(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem };
  if (password === current) return { error: "Choose a password different from your current one." };

  // Signs out every other session; this one gets a fresh cookie.
  const sv = await setStaffPassword(account.id, hashPassword(password));
  await setStaffSessionCookie({ staffId: account.id, role: account.role, name: account.name, sv });
  await logAudit(account.id, "password_changed", account.id);
  await sendEmail({ to: account.email, ...passwordChangedNoticeEmail() });
  return { success: "Password changed. You've been signed out on your other devices." };
}

export async function requestEmailChangeAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireStaffSession();
  const account = await getStaffAccountById(session.staffId);
  if (!account) return { error: "Account not found." };

  const newEmail = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(newEmail)) return { error: "Enter a valid email address." };
  if (newEmail === account.email) return { error: "That's already your email address." };
  const wrong = await checkCurrentPassword(account, String(formData.get("current") ?? ""));
  if (wrong) return { error: wrong };
  if (await getStaffAccountByEmail(newEmail)) return { error: "Another account already uses that email address." };

  const token = await createStaffToken(account.id, "email_change", newEmail);
  const sent = await sendEmail({ to: newEmail, ...emailChangeConfirmEmail({ url: linkFor("/admin/confirm-email", token), newEmail }) });
  if (!sent.ok) return { error: `The confirmation email couldn't be sent (${sent.error}).` };
  await logAudit(account.id, "email_change_requested", account.id, `to ${newEmail}`);
  return { success: `We've sent a confirmation link to ${newEmail}. Your email changes once you open it (within 24 hours).` };
}

/** From the link sent to the new address. Tells the old address once the change is made. */
export async function confirmEmailChangeAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const ipBucket = rateLimitBucket("staff-token-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, HOUR)) return { error: "Too many attempts. Try again in an hour." };

  const info = await consumeStaffToken(String(formData.get("token") ?? ""), ["email_change"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;
  if (!info || !info.newEmail || !account || account.status === "deactivated") {
    await recordAttempt(ipBucket);
    return { error: "This link is invalid, has already been used or has expired. Request the change again from your account settings." };
  }
  if (!(await changeStaffEmail(account.id, info.newEmail))) {
    return { error: "Another account started using that email address in the meantime, so it wasn't changed." };
  }
  await logAudit(account.id, "email_changed", account.id, `${account.email} → ${info.newEmail}`);
  await sendEmail({ to: account.email, ...emailChangedNoticeEmail({ newEmail: info.newEmail }) });
  revalidateAccountPages();
  return { success: `Your email address is now ${info.newEmail}. Use it the next time you sign in.` };
}

// --- Deactivate / reactivate ------------------------------------------------

export async function deactivateStaffAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const result = await deactivateStaff(session.staffId, staffId);
  if (!result.ok) return { ok: false, message: result.error };
  await logAudit(session.staffId, "deactivated", staffId);
  revalidateAccountPages();
  return { ok: true, message: "Account deactivated and signed out." };
}

export async function reactivateStaffAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const result = await reactivateStaff(staffId);
  if (!result.ok) return { ok: false, message: result.error };
  await logAudit(session.staffId, "reactivated", staffId);
  revalidateAccountPages();
  return { ok: true, message: "Account reactivated." };
}
