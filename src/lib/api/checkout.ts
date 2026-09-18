import type { Plan } from "../types";

export interface CheckoutPayload {
  plan: Plan;
  fullName: string;
  email: string;
  locale: string;
}

export interface CheckoutSession {
  url: string;
}

export type OrderPaymentStatus = "pending" | "completed" | "refunded" | "failed";

export interface OrderStatusResult {
  status: OrderPaymentStatus;
  order: {
    id: number;
    planName: string;
    countryName: string;
    iccid: string | null;
    lpaActivationCode: string | null;
  };
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
