/**
 * What kind of order a row is, from the Stripe Checkout Session it was paid
 * through (Stripe ids carry the mode they were created in):
 *   live — real money (cs_live_…)
 *   test — Stripe test mode (cs_test_…): no money moved, public test cards work
 *   demo — no Stripe session: sample rows from the old (now removed) dev seed script
 * Only live orders count in business figures or get real eSIMs.
 */
export type OrderKind = "live" | "test" | "demo";

export function orderKind(stripeCheckoutSessionId: string | null): OrderKind {
  if (stripeCheckoutSessionId?.startsWith("cs_live_")) return "live";
  if (stripeCheckoutSessionId?.startsWith("cs_test_")) return "test";
  return "demo";
}

/** SQL condition matching live orders only (orders table, unaliased). */
export const LIVE_ORDER_SQL = "LEFT(stripe_checkout_session_id, 8) = 'cs_live_'";

/** SQL expression giving 'live' | 'test' | 'demo' per orders row. */
export const ORDER_KIND_SQL =
  "CASE LEFT(stripe_checkout_session_id, 8) WHEN 'cs_live_' THEN 'live' WHEN 'cs_test_' THEN 'test' ELSE 'demo' END";
