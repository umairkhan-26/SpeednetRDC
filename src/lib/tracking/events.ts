// Checkout events for Google and TikTok (Meta has its own, in
// src/lib/meta/pixel.ts). Each helper does nothing for a tool that is switched
// off or not accepted. Browser-only.

import { googleBeginCheckout, googlePurchase } from "./google";
import { tikTokBeginCheckout, tikTokPurchase } from "./tiktok";
import type { TrackedItem, TrackedPurchase } from "./types";

export function trackBeginCheckout(item: TrackedItem): void {
  googleBeginCheckout(item);
  tikTokBeginCheckout(item);
}

function sendOnce(vendor: string, transactionId: string, send: () => boolean): void {
  const key = `snrdc-purchase-${vendor}-${transactionId}`;
  try {
    if (localStorage.getItem(key)) return;
  } catch {
    // Storage unavailable: send anyway; both tools drop a repeat by the order number.
  }
  if (!send()) return;
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Not fatal, for the same reason.
  }
}

/** The purchase event, once per order and per tool, even if the success page is opened again. */
export function trackPurchase(purchase: TrackedPurchase): void {
  sendOnce("google", purchase.transactionId, () => googlePurchase(purchase));
  sendOnce("tiktok", purchase.transactionId, () => tikTokPurchase(purchase));
}
