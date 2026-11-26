// Sign in with Google and with Apple (OpenID Connect, authorization code
// flow). We ask for the email address only, and accept an identity only from
// an ID token whose signature, issuer, audience, expiry and nonce all check
// out. Server-only; nothing here is ever logged.

import { createPrivateKey, createPublicKey, createSign, createVerify, type JsonWebKey, type KeyObject } from "node:crypto";
import { getAppUrl } from "@/lib/checkout/stripe";
import type { SocialProvider } from "./providers";

const ENDPOINTS = {
  google: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    keys: "https://www.googleapis.com/oauth2/v3/certs",
    issuers: ["https://accounts.google.com", "accounts.google.com"],
  },
  apple: {
    authorize: "https://appleid.apple.com/auth/authorize",
    token: "https://appleid.apple.com/auth/token",
    keys: "https://appleid.apple.com/auth/keys",
    issuers: ["https://appleid.apple.com"],
  },
} as const;

const clientId = (provider: SocialProvider) => process.env[provider === "google" ? "GOOGLE_CLIENT_ID" : "APPLE_CLIENT_ID"]!;

export const appOrigin = () => getAppUrl().replace(/\/+$/, "");

/** Must be registered, exactly, in the Google client / Apple Services ID. */
export const redirectUri = (provider: SocialProvider) => `${appOrigin()}/api/auth/${provider}/callback`;

export function authorizationUrl(provider: SocialProvider, opts: { state: string; nonce: string; codeChallenge: string; locale: string }): string {
  const url = new URL(ENDPOINTS[provider].authorize);
  const params: Record<string, string> = {
    client_id: clientId(provider),
    redirect_uri: redirectUri(provider),
    response_type: "code",
    state: opts.state,
    nonce: opts.nonce,
  };
  if (provider === "google") {
    Object.assign(params, {
      scope: "openid email",
      code_challenge: opts.codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
      hl: opts.locale,
    });
  } else {
    // Apple sends the answer as a form POST whenever an email is asked for.
    Object.assign(params, { scope: "email", response_mode: "form_post" });
  }
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** The .p8 key as pasted: the whole file (real or "\n" line breaks) or just the base64 between its two header lines. */
function applePrivateKey(): KeyObject {
  const raw = process.env.APPLE_PRIVATE_KEY!.trim();
  if (raw.includes("BEGIN")) return createPrivateKey(raw.replace(/\\n/g, "\n"));
  return createPrivateKey({ key: Buffer.from(raw.replace(/\s+/g, ""), "base64"), format: "der", type: "pkcs8" });
}

/** Apple has no fixed client secret: it is a short-lived token signed with our key. */
function appleClientSecret(): string {
  const now = Math.floor(Date.now() / 1000);
  const body = `${base64url({ alg: "ES256", kid: process.env.APPLE_KEY_ID })}.${base64url({
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 5 * 60,
    aud: "https://appleid.apple.com",
    sub: clientId("apple"),
  })}`;
  const signature = createSign("SHA256").update(body).sign({ key: applePrivateKey(), dsaEncoding: "ieee-p1363" });
  return `${body}.${signature.toString("base64url")}`;
}

/** Swaps the one-time code for the ID token. */
export async function exchangeCode(provider: SocialProvider, code: string, codeVerifier: string): Promise<string> {
  const form: Record<string, string> = {
    client_id: clientId(provider),
    client_secret: provider === "google" ? process.env.GOOGLE_CLIENT_SECRET! : appleClientSecret(),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri(provider),
  };
  if (provider === "google") form.code_verifier = codeVerifier;
  const response = await fetch(ENDPOINTS[provider].token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(form),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await response.json().catch(() => null)) as { id_token?: unknown; error?: unknown } | null;
  if (!response.ok || typeof data?.id_token !== "string") {
    throw new Error(`token exchange failed (HTTP ${response.status}, ${typeof data?.error === "string" ? data.error : "no id_token"})`);
  }
  return data.id_token;
}

export interface SocialIdentity {
  /** The provider's permanent id for this account. */
  subject: string;
  email: string;
  /** An Apple "Hide My Email" address: it won't match the one used on earlier orders. */
  relay: boolean;
  /** The provider itself runs this mailbox or vouches for it today, so no emailed confirmation is needed. */
  authoritative: boolean;
}

type Claims = Record<string, unknown>;

const decode = (part: string): Claims => JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as Claims;
// Apple sends some true/false values as text.
const isTrue = (value: unknown) => value === true || value === "true";

export async function verifyIdToken(provider: SocialProvider, idToken: string, nonce: string): Promise<SocialIdentity> {
  const [headerPart, bodyPart, signaturePart] = idToken.split(".");
  if (!headerPart || !bodyPart || !signaturePart) throw new Error("malformed ID token");
  const header = decode(headerPart);
  if (header.alg !== "RS256") throw new Error("unexpected ID token algorithm");

  const response = await fetch(ENDPOINTS[provider].keys, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`could not read the signing keys (HTTP ${response.status})`);
  const { keys } = (await response.json()) as { keys: (JsonWebKey & { kid?: string })[] };
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("unknown ID token signing key");
  const valid = createVerify("RSA-SHA256")
    .update(`${headerPart}.${bodyPart}`)
    .verify(createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(signaturePart, "base64url"));
  if (!valid) throw new Error("bad ID token signature");

  const claims = decode(bodyPart);
  if (!(ENDPOINTS[provider].issuers as readonly string[]).includes(String(claims.iss))) throw new Error("wrong ID token issuer");
  if (claims.aud !== clientId(provider)) throw new Error("ID token is for another app");
  if (typeof claims.exp !== "number" || claims.exp < Date.now() / 1000) throw new Error("ID token expired");
  if (claims.nonce !== nonce) throw new Error("ID token nonce mismatch");
  if (typeof claims.sub !== "string" || !claims.sub) throw new Error("ID token has no subject");
  if (typeof claims.email !== "string" || !isTrue(claims.email_verified)) throw new Error("no verified email address");

  const email = claims.email.trim().toLowerCase();
  const relay = provider === "apple" && (isTrue(claims.is_private_email) || email.endsWith("@privaterelay.appleid.com"));
  // Google only guarantees current ownership for its own mailboxes and
  // company (Workspace) accounts; for any other address it was checked once,
  // when the Google account was made.
  const authoritative = provider === "apple" || /@(gmail|googlemail)\.com$/.test(email) || typeof claims.hd === "string";
  return { subject: claims.sub, email, relay, authoritative };
}
