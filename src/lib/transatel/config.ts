/**
 * Central place for Transatel (Service Provider Connect / OCS) account
 * configuration. Always read these values through this module rather than
 * `process.env` directly, so a missing variable fails loudly at the call
 * site instead of silently sending an empty/undefined value to Transatel.
 *
 * Env vars (see .env.example):
 *   TRANSATEL_API_LOGIN, TRANSATEL_API_PASSWORD, TRANSATEL_MVNO_REF — needed
 *     to provision orders
 *   TRANSATEL_COS — only for catalog lookups
 *   TRANSATEL_EVENTS_SECRET — only for the optional events webhook
 *   TRANSATEL_API_BASE_URL — optional, defaults to Transatel's gateway
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

export function getTransatelLogin(): string {
  return requireEnv("TRANSATEL_API_LOGIN");
}

export function getTransatelPassword(): string {
  return requireEnv("TRANSATEL_API_PASSWORD");
}

/**
 * Class of Service (COS) for this account: WW_M2MA_COS_SPC — verified with
 * scripts/transatel-check.mjs on 2026-10-03 ("COS_SPC" is refused with
 * INSUFFICIENT_PERMISSION). Used for catalog lookups.
 */
export function getTransatelCos(): string {
  return requireEnv("TRANSATEL_COS");
}

/** MVNO reference for this account (M2MA_WW_TSL_SPEEDNETRDC), required when placing an order. */
export function getTransatelMvnoRef(): string {
  return requireEnv("TRANSATEL_MVNO_REF");
}

// Confirmed from Transatel's docs: "All Transatel APIs are available
// through our unique API gateway https://api.transatel.com".
export function getTransatelApiBaseUrl(): string {
  return process.env.TRANSATEL_API_BASE_URL || "https://api.transatel.com";
}

/**
 * Secret we choose ourselves and enter in the Transatel Console (Data
 * Stream tab) when registering our webhook. Transatel signs every event
 * with it (X-TSL-Signature-256 header), which
 * src/app/api/transatel/events/route.ts verifies so nobody else can post
 * fake events. Generate one the same way as STAFF_SESSION_SECRET.
 */
export function getTransatelEventsSecret(): string {
  return requireEnv("TRANSATEL_EVENTS_SECRET");
}
