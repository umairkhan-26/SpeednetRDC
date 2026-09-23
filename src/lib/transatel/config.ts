/**
 * Central place for Transatel (Service Provider Connect / OCS) account
 * configuration. Always read these values through this module rather than
 * `process.env` directly, so a missing variable fails loudly at the call
 * site instead of silently sending an empty/undefined value to Transatel.
 *
 * Required env vars (see .env.example):
 *   TRANSATEL_API_LOGIN
 *   TRANSATEL_API_PASSWORD
 *   TRANSATEL_COS
 *   TRANSATEL_MVNO_REF
 *   TRANSATEL_RATE_PLAN
 *   TRANSATEL_EVENTS_SECRET
 *   TRANSATEL_API_BASE_URL (optional — defaults to Transatel's public gateway)
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
 * Class of Service (COS) for this account — confirmed directly by
 * Transatel support as WW_M2MA_COS_SPC. Required alongside a plan's
 * productId (see getTransatelProductId in ./product) for catalog lookups
 * and order placement.
 */
export function getTransatelCos(): string {
  return requireEnv("TRANSATEL_COS");
}

/** MVNO reference for this account, required when placing an order. */
export function getTransatelMvnoRef(): string {
  return requireEnv("TRANSATEL_MVNO_REF");
}

/**
 * Base connectivity rate plan for this account, assigned by Transatel at
 * contract signature — distinct from the per-customer data plan
 * (productId). Required to activate a brand-new SIM (one that has never
 * had a subscriber before) via the Connectivity Management API; see
 * activateSim in ./client. Ask your Transatel account contact for this
 * value if you don't have it — it isn't listed in any catalog file.
 */
export function getTransatelRatePlan(): string {
  return requireEnv("TRANSATEL_RATE_PLAN");
}

// Confirmed from Transatel's docs: "All Transatel APIs are available
// through our unique API gateway https://api.transatel.com".
export function getTransatelApiBaseUrl(): string {
  return process.env.TRANSATEL_API_BASE_URL || "https://api.transatel.com";
}

/**
 * Shared secret we choose ourselves and put in the webhook URL we register
 * with Transatel's Console (Data Stream tab) for the
 * CONNECTIVITY-MANAGEMENT/SUBSCRIBER/ACTIVATED event — e.g.
 * https://speednetrdc.com/api/transatel/events?token=<this value>. Checked
 * by src/app/api/transatel/events/route.ts so a stranger can't post fake
 * activation events at that URL. Generate one the same way as
 * STAFF_SESSION_SECRET (see .env.example).
 */
export function getTransatelEventsSecret(): string {
  return requireEnv("TRANSATEL_EVENTS_SECRET");
}
