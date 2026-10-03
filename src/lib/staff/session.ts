import { createHmac, timingSafeEqual } from "node:crypto";
import type { StaffRole } from "./types";

export const STAFF_SESSION_COOKIE = "staff_session";
export const STAFF_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export interface StaffSessionPayload {
  staffId: number;
  role: StaffRole;
  name: string;
  /** staff_members.session_version when the cookie was issued. */
  sv: number;
  /** Expiry, in seconds since the epoch (the cookie's own max-age is only a hint to the browser). */
  exp: number;
}

function getSecret(): string {
  const secret = process.env.STAFF_SESSION_SECRET;
  if (!secret) {
    throw new Error("STAFF_SESSION_SECRET environment variable is not set");
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createStaffSessionToken(payload: Omit<StaffSessionPayload, "exp">): string {
  const full: StaffSessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + STAFF_SESSION_MAX_AGE };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyStaffSessionToken(token: string): StaffSessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = sign(body);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (
      typeof payload?.staffId !== "number" ||
      typeof payload?.name !== "string" ||
      typeof payload?.sv !== "number" ||
      typeof payload?.exp !== "number" ||
      payload.exp < Date.now() / 1000 ||
      (payload?.role !== "staff" && payload?.role !== "admin")
    ) {
      return null;
    }
    return payload as StaffSessionPayload;
  } catch {
    return null;
  }
}
