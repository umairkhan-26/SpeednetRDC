// Some addresses are secrets in themselves: the private order page (it shows
// the eSIM's activation code), one-time sign-in links and Stripe's session id
// on the payment success page. No advertising or analytics tool may ever see
// them, whatever the visitor accepted. Browser-only.

const PRIVATE_PATH = /^\/[a-z]{2}\/(order|login\/verify)(\/|$)/;
const PRIVATE_QUERY = /[?&](session_id|token)=/;

// A page first opened on a private address stays untracked until the next full
// page load, so that going "back" inside it can't reveal that address either.
const openedOnPrivatePage = typeof window !== "undefined" && PRIVATE_PATH.test(window.location.pathname);

/** True when no third-party tool may be loaded or sent anything right now. */
export function trackingBlocked(): boolean {
  if (typeof window === "undefined") return true;
  return openedOnPrivatePage || PRIVATE_PATH.test(window.location.pathname) || PRIVATE_QUERY.test(window.location.search);
}
