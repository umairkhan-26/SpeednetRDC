import type { Plan } from "../types";
import { simulateLatency } from "./client";

export interface CheckoutPayload {
  plan: Plan;
  fullName: string;
  email: string;
  paymentMethod: "card" | "apple-pay" | "google-pay" | "paypal";
}

export interface CheckoutResult {
  orderId: string;
  iccid: string;
  activationCode: string;
  activationDate: string;
  expirationDate: string;
}

function randomOrderId() {
  return `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
}

function randomIccid() {
  const block = () => Math.floor(1000 + Math.random() * 9000);
  return `8944 4500 ${block()} ${block()} ${block()}`;
}

export async function submitOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  const suffix = Math.random().toString(16).slice(2, 10).toUpperCase();
  const planTag = payload.plan.id.split("-")[0].toUpperCase();
  const now = new Date();
  const expiration = new Date(now.getTime() + payload.plan.validityDays * 86400000);
  return simulateLatency(
    {
      orderId: randomOrderId(),
      iccid: randomIccid(),
      activationCode: `LPA:1$esim.speednetrdc.net$${planTag}-${suffix}`,
      activationDate: now.toISOString(),
      expirationDate: expiration.toISOString(),
    },
    900,
  );
}
