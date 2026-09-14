import { cookies } from "next/headers";
import { STAFF_SESSION_COOKIE, verifyStaffSessionToken, type StaffSessionPayload } from "./session";

export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyStaffSessionToken(token);
}

export async function requireStaffSession(): Promise<StaffSessionPayload> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
}

export async function requireAdminSession(): Promise<StaffSessionPayload> {
  const session = await requireStaffSession();
  if (session.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}
