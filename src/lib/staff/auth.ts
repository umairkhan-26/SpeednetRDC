import { cache } from "react";
import { cookies } from "next/headers";
import { STAFF_SESSION_COOKIE, verifyStaffSessionToken, type StaffSessionPayload } from "./session";
import { getStaffAccountById } from "./accounts";

/**
 * The signed-in staff member, or null. Beyond checking the cookie's
 * signature and expiry, this checks the account in the database on every
 * request: a deactivated account, or a cookie issued before a password
 * change (session_version bumped), is signed out. Role and name come from
 * the database, not the cookie. (proxy.ts only checks the cookie — it's a
 * first gate, not the authority.)
 */
export const getStaffSession = cache(async (): Promise<StaffSessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyStaffSessionToken(token);
  if (!payload) return null;

  const account = await getStaffAccountById(payload.staffId);
  if (!account || account.status !== "active" || account.sessionVersion !== payload.sv) return null;
  return { ...payload, role: account.role, name: account.name };
});

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
