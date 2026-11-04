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

/** Admin-only: reads Stripe's fee for paid live orders that don't have one yet (read-only Stripe calls). */
export async function fetchStripeFeesAction(): Promise<RetryProvisioningResult> {
  await requireAdminSession();
  try {
    const { filled, missing } = await backfillStripeFees(50);
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    if (filled === 0 && missing === 0) return { ok: true, message: "All paid orders already have their Stripe fee." };
    return { ok: missing === 0, message: `Fetched ${filled} fee(s).${missing ? ` ${missing} not available from Stripe yet.` : ""}` };
  } catch (error) {
    return { ok: false, message: `Couldn't read fees from Stripe: ${error instanceof Error ? error.message : String(error)}` };
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
  if (!order || order.status !== "completed") return { ok: false, message: "Not a paid order." };
  if (order.provisioningStatus === "provisioned") return { ok: false, message: "This order already has its eSIM." };

  if (reason === "refunded") {
    if (!order.stripePaymentIntentId) return { ok: false, message: "No Stripe payment found for this order — use \u201cResolved another way\u201d." };
    try {
      const intent = await getStripe().paymentIntents.retrieve(order.stripePaymentIntentId, { expand: ["latest_charge"] });
      const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
      if (!charge?.refunded) {
        return {
          ok: false,
          message: charge && charge.amount_refunded > 0
            ? "Stripe shows only a partial refund. Refund the rest in Stripe, or use \u201cResolved another way\u201d."
            : "Stripe doesn't show a refund for this payment yet. Refund it in Stripe first, then try again.",
        };
      }
    } catch (error) {
      return { ok: false, message: `Couldn't check the refund with Stripe: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  if (!(await dismissOrderAttention(orderId, reason === "refunded"))) return { ok: false, message: "Already removed from the list." };
  await logAudit(session.staffId, reason === "refunded" ? "order_marked_refunded" : "order_attention_dismissed", null, `ORD-${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { ok: true, message: reason === "refunded" ? "Marked refunded and removed from the list." : "Removed from the list." };
}
