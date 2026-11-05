import { createHash } from "node:crypto";
import { getOrderById } from "@/lib/checkout/orders-repository";
import { orderKind } from "@/lib/checkout/order-kind";
import { getAppUrl } from "@/lib/checkout/stripe";
import { claimCapiSend, getMetaConsent, releaseCapiSend } from "./consent-repository";

// Meta Conversions API: the Purchase event, sent from our server once Stripe
// confirms payment. Server-only (META_CAPI_TOKEN must never reach the
// browser, a log line or a URL: it goes in the POST body only).
//
// Sent only for orders whose buyer accepted Meta cookies before checkout,
// with the same event_id the browser uses, so Meta counts the purchase
// once. Stripe test-mode orders are sent only when META_CAPI_TEST_EVENT_CODE
// is set, and then only to Events Manager's "Test events" tab.

const DEFAULT_GRAPH_API_VERSION = "v26.0";

const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/** Never throws: a Meta problem must never affect an order. */
export async function sendMetaPurchase(orderId: number): Promise<void> {
  try {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
    const token = process.env.META_CAPI_TOKEN ?? "";
    if (!/^\d{5,20}$/.test(pixelId) || !token) return;

    const consent = await getMetaConsent(orderId);
    if (!consent || consent.capiSentAt) return;
    const order = await getOrderById(orderId);
    if (!order || order.status !== "completed") return;

    const kind = orderKind(order.stripeCheckoutSessionId);
    const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE || "";
    if (kind !== "live" && !testEventCode) return;
    if (!(await claimCapiSend(orderId))) return;

    const event = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: consent.eventId,
      action_source: "website",
      event_source_url: `${getAppUrl()}/${order.locale ?? "en"}/checkout/success`,
      user_data: {
        em: [sha256(order.customerEmail)],
        ...(order.billingCountry ? { country: [sha256(order.billingCountry)] } : {}),
        ...(consent.fbp ? { fbp: consent.fbp } : {}),
        ...(consent.fbc ? { fbc: consent.fbc } : {}),
        ...(consent.userAgent ? { client_user_agent: consent.userAgent } : {}),
      },
      custom_data: {
        currency: "EUR",
        value: Number(order.amountEur),
        content_ids: order.planId ? [order.planId] : [],
        content_type: "product",
        num_items: 1,
        order_id: `ORD-${order.id}`,
      },
    };

    const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
    const response = await fetch(`https://graph.facebook.com/${version}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        access_token: token,
        ...(kind !== "live" ? { test_event_code: testEventCode } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      await releaseCapiSend(orderId);
      const body = (await response.json().catch(() => null)) as { error?: { message?: string; code?: number } } | null;
      console.error(`[meta] Purchase for ORD-${orderId} not accepted (HTTP ${response.status}): ${body?.error?.message ?? "no details"}`);
      return;
    }
    console.log(`[meta] Purchase sent for ORD-${orderId}${kind !== "live" ? " (test event)" : ""}`);
  } catch (error) {
    await releaseCapiSend(orderId).catch(() => {});
    console.error(`[meta] Purchase for ORD-${orderId} not sent: ${error instanceof Error ? error.name : "error"}`);
  }
}
