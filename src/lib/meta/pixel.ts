// Meta (Facebook) Pixel in the browser. It is only ever loaded after the
// visitor accepts cookies (see src/lib/consent.ts), and every helper here
// is a no-op until then. The Pixel ID comes from NEXT_PUBLIC_META_PIXEL_ID
// (built into the pages, so set it before deploying); without it, the
// Pixel and the cookie banner are off.

import { readConsent } from "@/lib/consent";

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

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export function metaPixelEnabled(): boolean {
  return /^\d{5,20}$/.test(PIXEL_ID);
}

/** Meta's standard loader, written out: queues calls until fbevents.js arrives. */
export function loadMetaPixel(): void {
  if (!metaPixelEnabled() || readConsent() !== "granted" || window.fbq) return;
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

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("consent", "grant");
  fbq("init", PIXEL_ID);
}

type MetaStandardEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

/** Sends a standard event if (and only if) the visitor accepted cookies and the Pixel is loaded. */
export function trackMeta(event: MetaStandardEvent, params?: Record<string, unknown>, eventId?: string): void {
  if (!metaPixelEnabled() || readConsent() !== "granted") return;
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
  if (readConsent() !== "granted") return {};
  return { fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
}

/** Removes the Pixel's first-party cookies (after the visitor withdraws consent). */
export function clearMetaCookies(): void {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}
