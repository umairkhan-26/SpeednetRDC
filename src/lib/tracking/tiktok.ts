// TikTok Pixel in the browser. It is only ever loaded after the visitor accepts
// cookies naming TikTok, and never on a private page; every helper here is a
// no-op until then. Browser-only.

import { hasConsent } from "@/lib/consent";
import { trackingBlocked } from "./private-pages";
import { addTrackingScript } from "./scripts";
import { TIKTOK_PIXEL_ID } from "./vendors";
import type { TrackedItem, TrackedPurchase } from "./types";

// What TikTok's own loader queues calls into until its script arrives.
type Queue = unknown[] & { [name: string]: unknown };
type TikTokQueue = Queue & {
  page: () => void;
  track: (event: string, params: Record<string, unknown>, options?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: TikTokQueue;
  }
}

const METHODS = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
const SCRIPT_URL = "https://analytics.tiktok.com/i18n/pixel/events.js";

function defer(target: Queue, method: string): void {
  target[method] = (...args: unknown[]) => {
    target.push([method, ...args]);
  };
}

function mayTrack(): boolean {
  return Boolean(TIKTOK_PIXEL_ID) && hasConsent("tiktok") && !trackingBlocked();
}

/** TikTok's standard loader, written out. Counts the current page when it first loads. */
function loadTikTokPixel(): boolean {
  if (!mayTrack()) return false;
  if (window.ttq) return true;
  window.TiktokAnalyticsObject = "ttq";
  const ttq = [] as unknown as TikTokQueue;
  for (const method of METHODS) defer(ttq, method);
  ttq.methods = METHODS;
  ttq.instance = (id: string) => {
    const instances = ttq._i as Record<string, Queue>;
    const instance = instances[id] ?? ([] as unknown as Queue);
    for (const method of METHODS) defer(instance, method);
    return instance;
  };
  const instance = [] as unknown as Queue;
  instance._u = SCRIPT_URL;
  ttq._i = { [TIKTOK_PIXEL_ID]: instance };
  ttq._t = { [TIKTOK_PIXEL_ID]: Date.now() };
  ttq._o = { [TIKTOK_PIXEL_ID]: {} };
  window.ttq = ttq;
  addTrackingScript(`${SCRIPT_URL}?sdkid=${TIKTOK_PIXEL_ID}&lib=ttq`);
  ttq.page();
  return true;
}

/** Counts a page view: loads the Pixel on the first one. */
export function tikTokPageView(): void {
  if (!mayTrack()) return;
  if (window.ttq) window.ttq.page();
  else loadTikTokPixel();
}

const tikTokParams = (item: TrackedItem) => ({
  contents: [{ content_id: item.contentId, content_type: "product", content_name: item.contentName, quantity: 1, price: item.value }],
  value: item.value,
  currency: item.currency,
});

export function tikTokBeginCheckout(item: TrackedItem): void {
  if (!loadTikTokPixel()) return;
  window.ttq?.track("InitiateCheckout", tikTokParams(item));
}

/** True when sent. The order number is the event id, so TikTok counts an order once. */
export function tikTokPurchase(purchase: TrackedPurchase): boolean {
  if (!loadTikTokPixel()) return false;
  window.ttq?.track("Purchase", tikTokParams(purchase), { event_id: purchase.transactionId });
  return true;
}
