import { cookies } from "next/headers";
import { createStaffSessionToken, STAFF_SESSION_COOKIE, STAFF_SESSION_MAX_AGE, type StaffSessionPayload } from "./session";

// Not a server action module on purpose: anything exported from a
// "use server" file can be called from the browser.
export async function setStaffSessionCookie(payload: Omit<StaffSessionPayload, "exp">): Promise<void> {
  const token = createStaffSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STAFF_SESSION_MAX_AGE,
  });
}
