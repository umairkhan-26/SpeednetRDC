"use server";

import { revalidatePath } from "next/cache";
import { getAppUrl } from "@/lib/checkout/stripe";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
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
  cleanDisplayName,
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
  removeStaff,
  renameStaff,
  setStaffPassword,
  type StaffAccount,
} from "./accounts";
import { requireAdminSession, requireStaffSession } from "./auth";
import { checkNewPassword, hashPassword, PASSWORD_LIMITS, verifyPasswordConstantTime } from "./password";
import { getAdminT } from "@/i18n/admin";
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

/** A message for the person using the panel, in their admin-panel language (keys under admin.msg). */
async function msg(key: string, values?: Record<string, string | number>): Promise<string> {
  const t = await getAdminT();
  return t(`msg.${key}`, values);
}

async function passwordProblem(password: string, confirmation: string): Promise<string | null> {
  const problem = checkNewPassword(password, confirmation);
  return problem ? msg(`password.${problem}`, PASSWORD_LIMITS) : null;
}

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

  if (!name || name.length > 255) return { error: await msg("enterName") };
  if (!isValidEmail(email)) return { error: await msg("invalidEmail") };
  if (role !== "staff" && role !== "admin") return { error: await msg("invalidRole") };
  if (!isEmailConfigured()) return { error: await msg("emailNotSetUp") };

  const existing = await getStaffAccountByEmail(email);
  if (existing) {
    return {
      error:
        existing.status === "invited"
          ? await msg("alreadyInvited")
          : await msg("accountExists"),
    };
  }

  const bucket = rateLimitBucket("staff-invite", email);
  if (await isRateLimited(bucket, 3, HOUR)) return { error: await msg("tooManyInvites") };
  await recordAttempt(bucket);

  const id = await createInvitedStaff({ name, email, role, invitedBy: session.staffId });
  const account = await getStaffAccountById(id);
  await logAudit(session.staffId, "invite_sent", id, `${role} invite to ${email}`);
  revalidateAccountPages();

  const sent = account ? await sendInvite(account, session.name) : { ok: false as const, error: "account not found" };
  if (!sent.ok) {
    return { error: await msg("inviteEmailFailed", { error: sent.error }) };
  }
  return { success: await msg("inviteSent", { email }) };
}

export async function resendInviteAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const account = await getStaffAccountById(staffId);
  if (!account || account.status !== "invited") return { ok: false, message: await msg("notWaitingInvite") };
  if (!isEmailConfigured()) return { ok: false, message: await msg("emailNotSetUp") };

  const bucket = rateLimitBucket("staff-invite", account.email);
  if (await isRateLimited(bucket, 3, HOUR)) return { ok: false, message: await msg("tooManyInvites") };
  await recordAttempt(bucket);

  const sent = await sendInvite(account, session.name);
  if (!sent.ok) return { ok: false, message: await msg("emailNotSent", { error: sent.error }) };
  await logAudit(session.staffId, "invite_sent", staffId, `invite re-sent to ${account.email}`);
  revalidateAccountPages();
  return { ok: true, message: await msg("newInviteSent", { email: account.email }) };
}

// --- Setting a password from an invite or reset link ----------------------

export interface SetPasswordState extends AccountFormState {
  signInPath?: string;
}

export async function setPasswordWithTokenAction(_prev: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const problem = await passwordProblem(password, String(formData.get("confirm") ?? ""));
  // Checked before the link is used up, so a typo doesn't burn it.
  if (problem) return { error: problem };

  const ipBucket = rateLimitBucket("staff-token-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, HOUR)) return { error: await msg("tooManyAttempts") };

  const info = await consumeStaffToken(token, ["invite", "password_reset"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;
  if (!info || !account || account.status === "deactivated") {
    await recordAttempt(ipBucket);
    return { error: await msg("linkInvalidNew") };
  }

  await setStaffPassword(account.id, hashPassword(password));
  await logAudit(account.id, info.purpose === "invite" ? "invite_accepted" : "password_reset", account.id);
  if (info.purpose === "password_reset") {
    await sendEmail({ to: account.email, ...passwordChangedNoticeEmail() });
  }
  // No revalidatePath here: any revalidation in an action makes Next.js
  // re-render the current page, and this link's page now sees a used token
  // and shows "Link expired" over the success message. The admin lists are
  // rendered fresh on every visit anyway.
  return {
    success: await msg(info.purpose === "invite" ? "passwordSet" : "passwordChangedSignIn"),
    signInPath: account.role === "admin" ? "/admin/login" : "/staff/login",
  };
}

// --- Forgot password --------------------------------------------------------


export async function forgotPasswordAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) return { error: await msg("invalidEmail") };
  if (!isEmailConfigured()) return { error: await msg("resetNotSetUp") };

  const ipBucket = rateLimitBucket("staff-reset-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 10, HOUR)) return { error: await msg("tooManyResets") };
  const emailBucket = rateLimitBucket("staff-reset-email", email);
  const emailLimited = await isRateLimited(emailBucket, 3, HOUR);
  await recordAttempt(ipBucket, emailBucket);
  // Same answer whether or not the account exists (or the limit was hit),
  // so this form can't be used to find out who has an account.
  if (emailLimited) return { success: await msg("resetSent") };

  const account = await getStaffAccountByEmail(email);
  if (account && account.status === "active") {
    const token = await createStaffToken(account.id, "password_reset");
    await sendEmail({ to: account.email, ...passwordResetEmail({ url: linkFor("/admin/set-password", token) }) });
    await logAudit(null, "password_reset_requested", account.id);
  }
  return { success: await msg("resetSent") };
}

// --- Account settings (signed in) -------------------------------------------

/** Checks the current password, rate-limited per account. */
async function checkCurrentPassword(account: StaffAccount, password: string): Promise<string | null> {
  const bucket = rateLimitBucket("staff-current-password", String(account.id));
  if (await isRateLimited(bucket, 5, 15 * 60)) return msg("tooManyWrong");
  if (!verifyPasswordConstantTime(password, account.passwordHash)) {
    await recordAttempt(bucket);
    return msg("currentWrong");
  }
  return null;
}

export async function changePasswordAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireStaffSession();
  const account = await getStaffAccountById(session.staffId);
  if (!account) return { error: await msg("accountNotFound") };

  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const wrong = await checkCurrentPassword(account, current);
  if (wrong) return { error: wrong };
  const problem = await passwordProblem(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem };
  if (password === current) return { error: await msg("samePassword") };

  // Signs out every other session; this one gets a fresh cookie.
  const sv = await setStaffPassword(account.id, hashPassword(password));
  await setStaffSessionCookie({ staffId: account.id, role: account.role, name: account.name, sv });
  await logAudit(account.id, "password_changed", account.id);
  await sendEmail({ to: account.email, ...passwordChangedNoticeEmail() });
  return { success: await msg("passwordChanged") };
}

export async function requestEmailChangeAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireStaffSession();
  const account = await getStaffAccountById(session.staffId);
  if (!account) return { error: await msg("accountNotFound") };

  const newEmail = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(newEmail)) return { error: await msg("invalidEmail") };
  if (newEmail === account.email) return { error: await msg("sameEmail") };
  if (!isEmailConfigured()) return { error: await msg("emailNotSetUp") };
  const wrong = await checkCurrentPassword(account, String(formData.get("current") ?? ""));
  if (wrong) return { error: wrong };
  if (await getStaffAccountByEmail(newEmail)) return { error: await msg("emailTaken") };

  const token = await createStaffToken(account.id, "email_change", newEmail);
  const sent = await sendEmail({ to: newEmail, ...emailChangeConfirmEmail({ url: linkFor("/admin/confirm-email", token), newEmail }) });
  if (!sent.ok) return { error: await msg("confirmEmailFailed", { error: sent.error }) };
  await logAudit(account.id, "email_change_requested", account.id, `to ${newEmail}`);
  return { success: await msg("confirmEmailSent", { email: newEmail }) };
}

/** From the link sent to the new address. Tells the old address once the change is made. */
export async function confirmEmailChangeAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const ipBucket = rateLimitBucket("staff-token-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, HOUR)) return { error: await msg("tooManyAttempts") };

  const info = await consumeStaffToken(String(formData.get("token") ?? ""), ["email_change"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;
  if (!info || !info.newEmail || !account || account.status === "deactivated") {
    await recordAttempt(ipBucket);
    return { error: await msg("linkInvalidEmail") };
  }
  if (!(await changeStaffEmail(account.id, info.newEmail))) {
    return { error: await msg("emailTakenMeantime") };
  }
  await logAudit(account.id, "email_changed", account.id, `${account.email} → ${info.newEmail}`);
  await sendEmail({ to: account.email, ...emailChangedNoticeEmail({ newEmail: info.newEmail }) });
  // No revalidatePath here, for the same reason as in setPasswordWithTokenAction.
  return { success: await msg("emailChanged", { email: info.newEmail }) };
}

// --- Display names ---------------------------------------------------------

async function rename(actorId: number, targetId: number, rawName: string): Promise<AccountActionResult> {
  const name = cleanDisplayName(rawName);
  if (!name) return { ok: false, message: await msg("nameLength") };
  const account = await getStaffAccountById(targetId);
  if (!account) return { ok: false, message: await msg("accountNotFound") };
  if (account.name === name) return { ok: true, message: await msg("nameUnchanged") };
  await renameStaff(targetId, name);
  await logAudit(actorId, "name_changed", targetId, `${account.name} → ${name}`);
  revalidateAccountPages();
  revalidatePath("/admin", "layout");
  return { ok: true, message: await msg("nameUpdated") };
}

/** Admin-only: change any admin's or staff member's display name. Email changes still go through the confirmation link. */
export async function renameStaffAction(staffId: number, name: string): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  return rename(session.staffId, staffId, name);
}

/** Change your own display name (Account page). */
export async function changeOwnNameAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireStaffSession();
  const result = await rename(session.staffId, session.staffId, String(formData.get("name") ?? ""));
  return result.ok ? { success: result.message } : { error: result.message };
}

// --- Deactivate / reactivate ------------------------------------------------

export async function deactivateStaffAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const result = await deactivateStaff(session.staffId, staffId);
  if (!result.ok) return { ok: false, message: await msg(`accounts.${result.error}`) };
  await logAudit(session.staffId, "deactivated", staffId);
  revalidateAccountPages();
  return { ok: true, message: await msg("deactivated") };
}

export async function deleteStaffAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const account = await getStaffAccountById(staffId);
  const result = await removeStaff(session.staffId, staffId);
  if (!result.ok) return { ok: false, message: await msg(`accounts.${result.error}`) };
  // The account's email is replaced on delete, so record who it was.
  await logAudit(session.staffId, "deleted", staffId, account ? `${account.name} <${account.email}>` : null);
  revalidateAccountPages();
  return { ok: true, message: await msg("deleted") };
}

export async function reactivateStaffAction(staffId: number): Promise<AccountActionResult> {
  const session = await requireAdminSession();
  const result = await reactivateStaff(staffId);
  if (!result.ok) return { ok: false, message: await msg(`accounts.${result.error}`) };
  await logAudit(session.staffId, "reactivated", staffId);
  revalidateAccountPages();
  return { ok: true, message: await msg("reactivated") };
}
