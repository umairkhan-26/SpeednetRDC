// Temporary kill switch for eSIM sales while provisioning is reworked for
// Transatel Service Provider Connect. Sales are paused unless
// ESIM_CHECKOUT_ENABLED is exactly "true", so deploying this pauses
// checkout immediately; to resume, set the variable in Hostinger and
// redeploy. Orders already paid are unaffected (the Stripe webhook doesn't
// check this).
export function isEsimCheckoutEnabled(): boolean {
  return process.env.ESIM_CHECKOUT_ENABLED === "true";
}

export const ESIM_CHECKOUT_PAUSED_ERROR = "eSIM orders are temporarily unavailable. We'll be back soon — please try again later.";
