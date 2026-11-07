"use server";

import { revalidatePath } from "next/cache";
import { dismissOrderAttention, getOrderById, resetProvisioningForRetry } from "@/lib/checkout/orders-repository";
import { getStripe } from "@/lib/checkout/stripe";
import { logAudit } from "./accounts";
import { orderKind } from "@/lib/checkout/order-kind";
import { sendOrderReadyEmail } from "@/lib/email/order-emails";
import { backfillStripeFees } from "@/lib/checkout/stripe-fees";
import { provisionEsimOrder } from "@/lib/transatel/provisioning";
import { requireAdminSession } from "./auth";
import { getAdminT } from "@/i18n/admin";

/** A message for the person using the panel, in their admin-panel language (keys under admin.msg). */
async function msg(key: string, values?: Record<string, string | number>): Promise<string> {
  const t = await getAdminT();
  return t(`msg.${key}`, values);
}


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
    return { ok: false, message: await msg("provisioning.notPaidCheckout") };
  }
  // Retrying buys a real plan from Transatel: never for Stripe test-mode or
  // demo orders, whatever ESIM_PROVISION_TEST_ORDERS says.
  if (orderKind(order.stripeCheckoutSessionId) !== "live") {
    return { ok: false, message: await msg("provisioning.testOrder") };
  }
  if (order.provisioningStatus === "provisioned") {
    return { ok: false, message: await msg("provisioning.alreadyProvisioned") };
  }
  if (order.provisioningStatus !== "pending" && !(await resetProvisioningForRetry(orderId))) {
    return { ok: false, message: await msg("provisioning.stillRunning") };
  }

  await provisionEsimOrder(orderId);
  const after = await getOrderById(orderId);
  revalidatePath("/admin");
  return after?.provisioningStatus === "provisioned"
    ? { ok: true, message: await msg("provisioning.provisioned") }
    : { ok: false, message: await msg("provisioning.stillStatus", { status: after?.provisioningStatus ?? "unknown" }) };
}

/** Admin-only: sends the "your eSIM is ready" email (with the private order link) again. */
export async function resendOrderEmailAction(orderId: number): Promise<RetryProvisioningResult> {
  await requireAdminSession();
  const result = await sendOrderReadyEmail(orderId, { resend: true });
  revalidatePath("/admin/orders");
  return { ok: result.ok, message: await msg(`orderEmail.${result.code}`, { email: result.email ?? "", error: result.error ?? "" }) };
}

/** Admin-only: reads Stripe's fee for paid live orders that don't have one yet (read-only Stripe calls). */
export async function fetchStripeFeesAction(): Promise<RetryProvisioningResult> {
  await requireAdminSession();
  try {
    const { filled, missing } = await backfillStripeFees(50);
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    if (filled === 0 && missing === 0) return { ok: true, message: await msg("fees.allHaveFee") };
    return { ok: missing === 0, message: [await msg("fees.fetched", { count: filled }), missing ? await msg("fees.notAvailable", { count: missing }) : ""].join(" ").trim() };
  } catch (error) {
    return { ok: false, message: await msg("fees.error", { error: error instanceof Error ? error.message : String(error) }) };
  }
}

/**
 * Admin-only: removes a paid order from the dashboard's "needing attention"
 * list. "refunded" first checks with Stripe (read-only) that the payment was
 * fully refunded, then marks the order refunded; "resolved" only hides the
 * alert (e.g. the customer was helped another way). The order is kept.
 */
export async function dismissOrderAttentionAction(orderId: number, reason: "refunded" | "resolved"): Promise<RetryProvisioningResult> {
  const session = await requireAdminSession();
  const order = await getOrderById(orderId);
  if (!order || order.status !== "completed") return { ok: false, message: await msg("dismiss.notPaid") };
  if (order.provisioningStatus === "provisioned") return { ok: false, message: await msg("dismiss.hasEsim") };

  if (reason === "refunded") {
    if (!order.stripePaymentIntentId) return { ok: false, message: await msg("dismiss.noPayment") };
    try {
      const intent = await getStripe().paymentIntents.retrieve(order.stripePaymentIntentId, { expand: ["latest_charge"] });
      const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
      if (!charge?.refunded) {
        return {
          ok: false,
          message: await msg(charge && charge.amount_refunded > 0 ? "dismiss.partialRefund" : "dismiss.noRefund"),
        };
      }
    } catch (error) {
      return { ok: false, message: await msg("dismiss.checkError", { error: error instanceof Error ? error.message : String(error) }) };
    }
  }

  if (!(await dismissOrderAttention(orderId, reason === "refunded"))) return { ok: false, message: await msg("dismiss.alreadyRemoved") };
  await logAudit(session.staffId, reason === "refunded" ? "order_marked_refunded" : "order_attention_dismissed", null, `ORD-${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { ok: true, message: await msg(reason === "refunded" ? "dismiss.markedRefunded" : "dismiss.removed") };
}
