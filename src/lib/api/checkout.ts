import type { Plan } from "../types";

export interface CheckoutPayload {
  plan: Plan;
  fullName: string;
  email: string;
  locale: string;
  /** The checkout's withdrawal-right consent box (only shown once the legal pages are live). */
  withdrawalConsent?: boolean;
  /** Set only when the visitor accepted Meta cookies. */
  meta?: { consent: true; fbp?: string; fbc?: string };
  /** "Add to my SIM": the ICCID of the customer's SIM (already checked). */
  topUpIccid?: string | null;
}

export interface CheckoutSession {
  url: string;
}

export type OrderPaymentStatus = "pending" | "completed" | "refunded" | "failed";

export type OrderProvisioningStatus = "pending" | "activating" | "provisioned" | "failed";

export interface OrderStatusResult {
  status: OrderPaymentStatus;
  provisioningStatus: OrderProvisioningStatus;
  /** Token for the private order page (/order/[token]); set once the order is paid. */
  accessToken: string | null;
  /** Present only when the buyer accepted Meta cookies; event_id shared with the server event. */
  metaPurchase: { eventId: string; value: number; currency: string; contentId: string | null } | null;
  /** esim | physical_sim | topup (older servers don't send it: treat as esim). */
  productType?: "esim" | "physical_sim" | "topup";
}

// Starts a real Stripe Checkout Session server-side (src/app/api/checkout/route.ts
// verifies the plan/price itself) and returns the URL to redirect the
// browser to. Whether the payment actually succeeds is decided later by
// Stripe's webhook, never here.
export async function submitOrder(payload: CheckoutPayload): Promise<CheckoutSession> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId: payload.plan.id,
      fullName: payload.fullName,
      email: payload.email,
      locale: payload.locale,
      withdrawalConsent: payload.withdrawalConsent === true,
      ...(payload.meta ? { meta: payload.meta } : {}),
      ...(payload.topUpIccid ? { topUpIccid: payload.topUpIccid } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Could not start checkout. Please try again.");
  }

  return response.json();
}

export async function getOrderStatus(sessionId: string): Promise<OrderStatusResult> {
  const response = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Could not check payment status.");
  }
  return response.json();
}
