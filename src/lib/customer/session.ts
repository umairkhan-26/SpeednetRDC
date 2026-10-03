import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";

// Customer sign-in is passwordless: an emailed one-time link proves the
// visitor owns the address, and this signed cookie remembers it for 30
// days. The address is the account — "My eSIMs" lists the paid orders
// placed with it at checkout.

export const CUSTOMER_SESSION_COOKIE = "customer_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

interface CustomerSessionPayload {
  email: string;
  exp: number;
}

/** False until CUSTOMER_SESSION_SECRET is set: customer sign-in is then switched off (nobody is signed in), nothing crashes. */
export function isCustomerSignInConfigured(): boolean {
  return Boolean(process.env.CUSTOMER_SESSION_SECRET);
}

function sign(data: string): string {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret) throw new Error("CUSTOMER_SESSION_SECRET environment variable is not set");
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function verify(token: string): CustomerSessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const provided = Buffer.from(signature);
  const expected = Buffer.from(sign(body));
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload?.email !== "string" || typeof payload?.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload as CustomerSessionPayload;
  } catch {
    return null;
  }
}

export async function setCustomerSessionCookie(email: string): Promise<void> {
  const payload: CustomerSessionPayload = { email, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

/** The signed-in customer's email address, or null. */
export const getCustomerEmail = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token || !isCustomerSignInConfigured()) return null;
  return verify(token)?.email ?? null;
});
