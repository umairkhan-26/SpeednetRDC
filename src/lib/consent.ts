// The visitor's cookie choice for optional (advertising and analytics)
// cookies. Stored in a first-party cookie for 6 months; until it covers a
// tool, nothing from that tool is loaded and nothing is sent to it.
// Browser-only.
//
// The cookie says which tools were accepted, because consent only covers what
// the banner named at the time: "granted" means Meta only (the only tool the
// site had when that value was first written), "granted.meta.google" lists
// them, "denied" rejects everything. When a new tool is switched on, visitors
// who accepted before are asked again and it stays off until they accept.

import type { Vendor } from "@/lib/tracking/vendors";

export const CONSENT_COOKIE = "snrdc_consent";
export type ConsentChoice = "granted" | "denied";

/** Fired on window when the choice changes. */
export const CONSENT_CHANGED_EVENT = "snrdc:consent-changed";
/** Fired on window to reopen the banner ("Cookie settings" in the footer). */
export const OPEN_COOKIE_SETTINGS_EVENT = "snrdc:open-cookie-settings";

const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

/** The cookie's raw value (a stable string, so it works with useSyncExternalStore). */
export function readConsentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return match?.slice(CONSENT_COOKIE.length + 1) ?? null;
}

/** The tools a cookie value accepts. */
export function acceptedVendors(value: string | null): string[] {
  if (value === "granted") return ["meta"];
  return value?.startsWith("granted.") ? value.split(".").slice(1) : [];
}

/** What a cookie value says overall; null when no valid choice has been made. */
export function consentChoice(value: string | null): ConsentChoice | null {
  if (value === "denied") return "denied";
  return acceptedVendors(value).length > 0 ? "granted" : null;
}

/** Whether the visitor accepted this tool's cookies. */
export function hasConsent(vendor: Vendor): boolean {
  return acceptedVendors(readConsentCookie()).includes(vendor);
}

/** For useSyncExternalStore: re-reads the choice whenever it changes. */
export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}

/** Saves the choice; `vendors` are the tools the banner named. */
export function writeConsent(choice: ConsentChoice, vendors: Vendor[]): void {
  const metaOnly = vendors.length === 1 && vendors[0] === "meta";
  const value = choice === "denied" ? "denied" : metaOnly ? "granted" : ["granted", ...vendors].join(".");
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
