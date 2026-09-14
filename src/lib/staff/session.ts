import { createHmac, timingSafeEqual } from "node:crypto";
import type { StaffRole } from "./types";

export const STAFF_SESSION_COOKIE = "staff_session";
export const STAFF_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export interface StaffSessionPayload {
  staffId: number;
  role: StaffRole;
  name: string;
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

export function createStaffSessionToken(payload: StaffSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
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
      (payload?.role !== "staff" && payload?.role !== "admin")
    ) {
      return null;
    }
    return payload as StaffSessionPayload;
  } catch {
    return null;
  }
}
