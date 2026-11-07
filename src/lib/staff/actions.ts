"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { STAFF_SESSION_COOKIE } from "./session";
import { setStaffSessionCookie } from "./session-cookie";
import { verifyPasswordConstantTime } from "./password";
import { clearAttempts, getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";
import { getStaffAccountByEmail, logAudit, normalizeEmail, recordStaffLogin } from "./accounts";
import {
  clockIn as clockInRow,
  clockOut as clockOutRow,
  createMessage,
  createTask,
  getOpenShift,
  getTaskById,
  listStaff,
  updateTaskStatus as updateTaskStatusRow,
} from "./repository";
import { getStaffSession, requireAdminSession, requireStaffSession } from "./auth";
import type { TaskStatus } from "./types";
import { getAdminT } from "@/i18n/admin";

/** A message for the person using the panel, in their admin-panel language (keys under admin.msg). */
async function msg(key: string, values?: Record<string, string | number>): Promise<string> {
  const t = await getAdminT();
  return t(`msg.${key}`, values);
}


function taskTitleFromMessage(message: string): string {
  return message.length > 80 ? `${message.slice(0, 77)}...` : message;
}

export interface LoginActionState {
  error?: string;
}

const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 30;

/**
 * Shared by the staff and admin sign-in forms. Failed attempts are
 * rate-limited per email address and per (hashed) IP address, and an
 * unknown email takes as long to reject as a wrong password.
 */
async function signIn(formData: FormData, adminOnly: boolean): Promise<LoginActionState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: await msg("login.missing") };
  }

  const emailBucket = rateLimitBucket("staff-login-email", email);
  const ipBucket = rateLimitBucket("staff-login-ip", await getClientIp());
  if (
    (await isRateLimited(emailBucket, MAX_FAILURES_PER_EMAIL, LOGIN_WINDOW_SECONDS)) ||
    (await isRateLimited(ipBucket, MAX_FAILURES_PER_IP, LOGIN_WINDOW_SECONDS))
  ) {
    return { error: await msg("login.tooManyFailed") };
  }

  const staff = await getStaffAccountByEmail(email);
  if (!staff || !verifyPasswordConstantTime(password, staff.passwordHash)) {
    await recordAttempt(emailBucket, ipBucket);
    if (staff) await logAudit(null, "login_failed", staff.id, "wrong password");
    return { error: await msg("login.incorrect") };
  }
  if (staff.status === "deactivated") {
    await logAudit(null, "login_failed", staff.id, "account deactivated");
    return { error: await msg("login.deactivated") };
  }
  if (adminOnly && staff.role !== "admin") {
    return { error: await msg("login.adminOnly") };
  }

  await clearAttempts(emailBucket);
  await recordStaffLogin(staff.id);
  await logAudit(staff.id, "login", staff.id, adminOnly ? "admin sign-in" : "staff sign-in");
  await setStaffSessionCookie({ staffId: staff.id, role: staff.role, name: staff.name, sv: staff.sessionVersion });
  redirect(staff.role === "admin" ? "/admin" : "/staff");
}

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  return signIn(formData, false);
}

export async function adminLoginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  return signIn(formData, true);
}

export async function logoutAction(): Promise<void> {
  const session = await getStaffSession();
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_SESSION_COOKIE);
  redirect(session?.role === "admin" ? "/admin/login" : "/staff/login");
}

export async function clockInAction(): Promise<void> {
  const session = await requireStaffSession();
  if (!(await getOpenShift(session.staffId))) {
    await clockInRow(session.staffId);
  }
  revalidatePath("/staff");
  // The whole admin panel: the sidebar shows the admin's own shift on every page.
  revalidatePath("/admin", "layout");
}

export async function clockOutAction(): Promise<void> {
  const session = await requireStaffSession();
  const openShift = await getOpenShift(session.staffId);
  if (openShift) {
    await clockOutRow(openShift.id);
  }
  revalidatePath("/staff");
  // The whole admin panel: the sidebar shows the admin's own shift on every page.
  revalidatePath("/admin", "layout");
}

export async function updateTaskStatusAction(taskId: number, status: TaskStatus): Promise<void> {
  const session = await requireStaffSession();
  const task = await getTaskById(taskId);
  if (!task) return;
  if (session.role !== "admin" && task.assignedTo !== session.staffId) {
    throw new Error("Forbidden");
  }

  await updateTaskStatusRow(taskId, status);
  revalidatePath("/staff/tasks");
  revalidatePath("/admin");
}

export async function sendAdminDirectMessageAction(
  recipientId: number,
  message: string,
  attachAsTask: boolean
): Promise<void> {
  const session = await requireAdminSession();
  const trimmed = message.trim();
  if (!trimmed) return;

  await createMessage({ senderId: session.staffId, recipientId, message: trimmed, isTeamBroadcast: false });

  if (attachAsTask) {
    await createTask({
      title: taskTitleFromMessage(trimmed),
      description: trimmed,
      assignedTo: recipientId,
      dueDate: null,
      createdBy: session.staffId,
    });
  }

  revalidatePath("/admin/staff");
  revalidatePath("/staff/messages");
  revalidatePath("/staff/tasks");
}

export async function sendTeamBroadcastAction(message: string, attachAsTask: boolean): Promise<void> {
  const session = await requireAdminSession();
  const trimmed = message.trim();
  if (!trimmed) return;

  await createMessage({ senderId: session.staffId, recipientId: null, message: trimmed, isTeamBroadcast: true });

  if (attachAsTask) {
    for (const member of (await listStaff()).filter((m) => m.status === "active")) {
      await createTask({
        title: taskTitleFromMessage(trimmed),
        description: trimmed,
        assignedTo: member.id,
        dueDate: null,
        createdBy: session.staffId,
      });
    }
  }

  revalidatePath("/admin/staff");
  revalidatePath("/staff/messages");
  revalidatePath("/staff/tasks");
}

export async function sendStaffReplyAction(recipientId: number, message: string): Promise<void> {
  const session = await requireStaffSession();
  const trimmed = message.trim();
  if (!trimmed) return;

  await createMessage({ senderId: session.staffId, recipientId, message: trimmed, isTeamBroadcast: false });
  revalidatePath("/staff/messages");
  revalidatePath("/admin/staff");
}

export async function postTeamReplyAction(message: string): Promise<void> {
  const session = await requireStaffSession();
  const trimmed = message.trim();
  if (!trimmed) return;

  await createMessage({ senderId: session.staffId, recipientId: null, message: trimmed, isTeamBroadcast: true });
  revalidatePath("/staff/messages");
  revalidatePath("/admin/staff");
}
