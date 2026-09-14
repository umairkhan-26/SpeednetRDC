"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createStaffSessionToken, STAFF_SESSION_COOKIE, STAFF_SESSION_MAX_AGE } from "./session";
import { hashPassword, verifyPassword } from "./password";
import {
  clockIn as clockInRow,
  clockOut as clockOutRow,
  createMessage,
  createStaffMember,
  createTask,
  getOpenShift,
  getStaffByEmail,
  getTaskById,
  listStaff,
  updateTaskStatus as updateTaskStatusRow,
} from "./repository";
import { requireAdminSession, requireStaffSession } from "./auth";
import type { StaffRole, TaskStatus } from "./types";

function taskTitleFromMessage(message: string): string {
  return message.length > 80 ? `${message.slice(0, 77)}...` : message;
}

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const staff = getStaffByEmail(email);
  if (!staff || !verifyPassword(password, staff.passwordHash)) {
    return { error: "Incorrect email or password." };
  }

  const token = createStaffSessionToken({
    staffId: staff.id,
    role: staff.role,
    name: staff.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STAFF_SESSION_MAX_AGE,
  });

  redirect(staff.role === "admin" ? "/admin" : "/staff");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_SESSION_COOKIE);
  redirect("/staff/login");
}

export async function clockInAction(): Promise<void> {
  const session = await requireStaffSession();
  if (!getOpenShift(session.staffId)) {
    clockInRow(session.staffId);
  }
  revalidatePath("/staff");
  revalidatePath("/admin");
  revalidatePath("/admin/staff");
}

export async function clockOutAction(): Promise<void> {
  const session = await requireStaffSession();
  const openShift = getOpenShift(session.staffId);
  if (openShift) {
    clockOutRow(openShift.id);
  }
  revalidatePath("/staff");
  revalidatePath("/admin");
  revalidatePath("/admin/staff");
}

export async function updateTaskStatusAction(taskId: number, status: TaskStatus): Promise<void> {
  const session = await requireStaffSession();
  const task = getTaskById(taskId);
  if (!task) return;
  if (session.role !== "admin" && task.assignedTo !== session.staffId) {
    throw new Error("Forbidden");
  }

  updateTaskStatusRow(taskId, status);
  revalidatePath("/staff/tasks");
  revalidatePath("/admin");
}

export interface CreateStaffActionState {
  error?: string;
  success?: boolean;
}

export async function createStaffAction(
  _prevState: CreateStaffActionState,
  formData: FormData
): Promise<CreateStaffActionState> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "staff") as StaffRole;

  if (!name || !email || !password) {
    return { error: "Fill in name, email, and a temporary password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (role !== "staff" && role !== "admin") {
    return { error: "Invalid role." };
  }
  if (getStaffByEmail(email)) {
    return { error: "A staff member with that email already exists." };
  }

  createStaffMember({ name, email, passwordHash: hashPassword(password), role });
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function sendAdminDirectMessageAction(
  recipientId: number,
  message: string,
  attachAsTask: boolean
): Promise<void> {
  const session = await requireAdminSession();
  const trimmed = message.trim();
  if (!trimmed) return;

  createMessage({ senderId: session.staffId, recipientId, message: trimmed, isTeamBroadcast: false });

  if (attachAsTask) {
    createTask({
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

  createMessage({ senderId: session.staffId, recipientId: null, message: trimmed, isTeamBroadcast: true });

  if (attachAsTask) {
    for (const member of listStaff()) {
      createTask({
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

  createMessage({ senderId: session.staffId, recipientId, message: trimmed, isTeamBroadcast: false });
  revalidatePath("/staff/messages");
  revalidatePath("/admin/staff");
}

export async function postTeamReplyAction(message: string): Promise<void> {
  const session = await requireStaffSession();
  const trimmed = message.trim();
  if (!trimmed) return;

  createMessage({ senderId: session.staffId, recipientId: null, message: trimmed, isTeamBroadcast: true });
  revalidatePath("/staff/messages");
  revalidatePath("/admin/staff");
}
