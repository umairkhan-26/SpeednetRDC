"use server";

import { revalidatePath } from "next/cache";
import { getOrderById, resetProvisioningForRetry } from "@/lib/checkout/orders-repository";
import { orderKind } from "@/lib/checkout/order-kind";
import { sendOrderReadyEmail } from "@/lib/email/order-emails";
import { provisionEsimOrder } from "@/lib/transatel/provisioning";
import { requireAdminSession } from "./auth";

export interface RetryProvisioningResult {
  ok: boolean;
  message: string;
}

/**
 * Admin-only: re-runs eSIM provisioning for a paid order that failed, got
 * stuck mid-attempt, or never started (e.g. the Stripe webhook didn't
 * arrive). Provisioning resumes where it stopped and never places a second
 * Transatel order for the same order. Returns a result rather than
 * throwing, because Next.js hides thrown error messages in production.
 */
export async function retryProvisioningAction(orderId: number): Promise<RetryProvisioningResult> {
  await requireAdminSession();

  const order = await getOrderById(orderId);
  if (!order || order.status !== "completed" || !order.planId) {
    return { ok: false, message: "Not a paid checkout order." };
  }
  // Retrying buys a real plan from Transatel: never for Stripe test-mode or
  // demo orders, whatever ESIM_PROVISION_TEST_ORDERS says.
  if (orderKind(order.stripeCheckoutSessionId) !== "live") {
    return { ok: false, message: "Test-mode order — not retried (it would buy a real plan for a payment that never happened)." };
  }
  if (order.provisioningStatus === "provisioned") {
    return { ok: false, message: "Already provisioned." };
  }
  if (order.provisioningStatus !== "pending" && !(await resetProvisioningForRetry(orderId))) {
    return { ok: false, message: "An attempt is still running — try again in a few minutes." };
  }

  await provisionEsimOrder(orderId);
  const after = await getOrderById(orderId);
  revalidatePath("/admin");
  return after?.provisioningStatus === "provisioned"
    ? { ok: true, message: "Provisioned — the customer's order page now shows their QR code." }
    : { ok: false, message: `Still ${after?.provisioningStatus ?? "unknown"} — check the server logs ([transatel] lines) for the reason.` };
}

/** Admin-only: sends the "your eSIM is ready" email (with the private order link) again. */
export async function resendOrderEmailAction(orderId: number): Promise<RetryProvisioningResult> {
  await requireAdminSession();
  const result = await sendOrderReadyEmail(orderId, { resend: true });
  revalidatePath("/admin/orders");
  return result;
}
