// The visitor's cookie choice for optional (Meta advertising) cookies.
// Stored in a first-party cookie for 6 months; until it says "granted",
// nothing from Meta is loaded and no Meta events are sent. Browser-only.

export const CONSENT_COOKIE = "snrdc_consent";
export type ConsentChoice = "granted" | "denied";

/** Fired on window when the choice changes (detail: ConsentChoice). */
export const CONSENT_CHANGED_EVENT = "snrdc:consent-changed";
/** Fired on window to reopen the banner ("Cookie settings" in the footer). */
export const OPEN_COOKIE_SETTINGS_EVENT = "snrdc:open-cookie-settings";

const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  const value = match?.slice(CONSENT_COOKIE.length + 1);
  return value === "granted" || value === "denied" ? value : null;
}

/** For useSyncExternalStore: re-reads the choice whenever it changes. */
export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}

export function writeConsent(choice: ConsentChoice): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_CHANGED_EVENT, { detail: choice }));
}
