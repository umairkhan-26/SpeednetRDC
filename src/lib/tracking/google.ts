// Google tag (Google Analytics 4 and Google Ads) in the browser. It is only
// ever loaded after the visitor accepts cookies naming Google, and never on a
// private page; every helper here is a no-op until then. Browser-only.

import { hasConsent } from "@/lib/consent";
import { trackingBlocked } from "./private-pages";
import { addTrackingScript } from "./scripts";
import { GA_ID, GOOGLE_ADS_ID, GOOGLE_ADS_PURCHASE_LABEL } from "./vendors";
import type { TrackedItem, TrackedPurchase } from "./types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_SIGNALS = ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"] as const;
const signals = (state: "granted" | "denied") => Object.fromEntries(CONSENT_SIGNALS.map((name) => [name, state]));

function mayTrack(): boolean {
  return Boolean(GA_ID || GOOGLE_ADS_ID) && hasConsent("google") && !trackingBlocked();
}

/**
 * Loads the Google tag once; true when events can be sent. The tag counts page
 * views itself, including page changes inside the site, so none are sent here.
 */
export function loadGoogleTag(): boolean {
  if (!mayTrack()) return false;
  if (window.gtag) return true;
  const dataLayer = (window.dataLayer = window.dataLayer ?? []);
  // Google's tag only understands the "arguments" object itself, not an array.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  // Consent Mode: everything starts refused; this code only runs once the visitor has accepted.
  window.gtag("consent", "default", signals("denied"));
  window.gtag("consent", "update", signals("granted"));
  window.gtag("js", new Date());
  if (GA_ID) window.gtag("config", GA_ID);
  if (GOOGLE_ADS_ID) window.gtag("config", GOOGLE_ADS_ID);
  addTrackingScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID || GOOGLE_ADS_ID}`);
  return true;
}

const googleItem = (item: TrackedItem) => ({ item_id: item.contentId, item_name: item.contentName, price: item.value, quantity: 1 });

export function googleBeginCheckout(item: TrackedItem): void {
  if (!loadGoogleTag()) return;
  window.gtag?.("event", "begin_checkout", { value: item.value, currency: item.currency, items: [googleItem(item)] });
}

/** Sends the purchase to Analytics and, with an ID and label set, as the Google Ads conversion. True when sent. */
export function googlePurchase(purchase: TrackedPurchase): boolean {
  if (!loadGoogleTag()) return false;
  const order = { transaction_id: purchase.transactionId, value: purchase.value, currency: purchase.currency };
  if (GA_ID) window.gtag?.("event", "purchase", { ...order, items: [googleItem(purchase)], send_to: GA_ID });
  if (GOOGLE_ADS_ID && GOOGLE_ADS_PURCHASE_LABEL) {
    window.gtag?.("event", "conversion", { ...order, send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}` });
  }
  return true;
}
