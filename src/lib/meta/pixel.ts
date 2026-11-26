// Meta (Facebook) Pixel in the browser. It is only ever loaded after the
// visitor accepts cookies (see src/lib/consent.ts), never on a private page
// (src/lib/tracking/private-pages.ts), and every helper here is a no-op until
// then. The Pixel ID comes from NEXT_PUBLIC_META_PIXEL_ID (built into the
// pages, so set it before deploying); without it, the Pixel is off.

import { hasConsent } from "@/lib/consent";
import { trackingBlocked } from "@/lib/tracking/private-pages";
import { addTrackingScript } from "@/lib/tracking/scripts";
import { META_PIXEL_ID as PIXEL_ID } from "@/lib/tracking/vendors";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function mayTrack(): boolean {
  return Boolean(PIXEL_ID) && hasConsent("meta") && !trackingBlocked();
}

/** Meta's standard loader, written out: queues calls until fbevents.js arrives. */
export function loadMetaPixel(): void {
  if (!mayTrack() || window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  addTrackingScript("https://connect.facebook.net/en_US/fbevents.js");

  fbq("consent", "grant");
  fbq("init", PIXEL_ID);
}

type MetaStandardEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

/** Sends a standard event if (and only if) the visitor accepted cookies and the Pixel is loaded. */
export function trackMeta(event: MetaStandardEvent, params?: Record<string, unknown>, eventId?: string): void {
  if (!mayTrack()) return;
  // A page's own event can run before the layout has loaded the Pixel.
  loadMetaPixel();
  if (!window.fbq) return;
  if (eventId) window.fbq("track", event, params ?? {}, { eventID: eventId });
  else window.fbq("track", event, params ?? {});
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

/** Meta's browser IDs (_fbp, and _fbc after a click on a Meta ad), sent with a consented order. */
export function readMetaBrowserIds(): { fbp?: string; fbc?: string } {
  if (!hasConsent("meta")) return {};
  return { fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
}
