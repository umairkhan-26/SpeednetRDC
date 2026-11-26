// The two short-lived cookies behind Google / Apple sign-in, both signed:
// - snrdc_oauth: the sign-in in progress (ties the provider's answer to this
//   browser, so nobody can slip their own answer into someone else's visit);
// - snrdc_link: a sign-in that still needs an email address confirmed.
// Server-only.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SocialProvider } from "./providers";

const OAUTH_COOKIE = "snrdc_oauth";
const LINK_COOKIE = "snrdc_link";
const OAUTH_MINUTES = 10;
const LINK_MINUTES = 30;

export interface PendingSignIn {
  provider: SocialProvider;
  state: string;
  nonce: string;
  codeVerifier: string;
  locale: string;
}

export interface PendingLink {
  provider: SocialProvider;
  subject: string;
  /** The address the provider gave. */
  email: string;
  relay: boolean;
  locale: string;
  /** Hash of the sign-in link asked for on the confirmation page: only that link may connect the account. */
  tokenHash?: string;
}

// The cookie's name is part of what is signed, so one cookie can never stand
// in for another (or for the customer session).
function sign(name: string, body: string): Buffer {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret) throw new Error("CUSTOMER_SESSION_SECRET environment variable is not set");
  return Buffer.from(createHmac("sha256", secret).update(`${name}|${body}`).digest("base64url"));
}

async function write(name: string, value: object, minutes: number, crossSite: boolean): Promise<void> {
  const body = Buffer.from(JSON.stringify({ ...value, exp: Math.floor(Date.now() / 1000) + minutes * 60 })).toString("base64url");
  (await cookies()).set(name, `${body}.${sign(name, body).toString()}`, {
    httpOnly: true,
    // Apple answers with a form POST from its own site, which only carries SameSite=None cookies.
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: minutes * 60,
  });
}

async function read<T>(name: string): Promise<T | null> {
  const [body, signature] = ((await cookies()).get(name)?.value ?? "").split(".");
  if (!body || !signature || !process.env.CUSTOMER_SESSION_SECRET) return null;
  const provided = Buffer.from(signature);
  const expected = sign(name, body);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return typeof value?.exp === "number" && value.exp > Date.now() / 1000 ? (value as T) : null;
  } catch {
    return null;
  }
}

async function remove(name: string, crossSite: boolean): Promise<void> {
  (await cookies()).set(name, "", { path: "/", maxAge: 0, sameSite: crossSite ? "none" : "lax", secure: crossSite });
}

export const savePendingSignIn = (value: PendingSignIn) => write(OAUTH_COOKIE, value, OAUTH_MINUTES, value.provider === "apple");

/** Reads the sign-in in progress and ends it: each one is answered once. */
export async function takePendingSignIn(provider: SocialProvider): Promise<PendingSignIn | null> {
  const pending = await read<PendingSignIn>(OAUTH_COOKIE);
  await remove(OAUTH_COOKIE, provider === "apple");
  return pending?.provider === provider ? pending : null;
}

export const savePendingLink = (value: PendingLink) => write(LINK_COOKIE, value, LINK_MINUTES, false);
export const readPendingLink = () => read<PendingLink>(LINK_COOKIE);
export const clearPendingLink = () => remove(LINK_COOKIE, false);
