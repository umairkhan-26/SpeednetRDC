import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/checkout/stripe";
import {
  attachActivationTransaction,
  attachReservedSim,
  getOrderById,
  markOrderFailed,
  markOrderPaid,
  markProvisioningFailed,
} from "@/lib/checkout/orders-repository";
import { activateSim, TransatelApiError } from "@/lib/transatel/client";
import { reserveSimForOrder } from "@/lib/transatel/inventory";
import { preloadCustomerPlan } from "@/lib/transatel/provisioning";

// Kicks off real eSIM provisioning for a paid order by reserving an unused
// SIM from inventory, then branches on whether that SIM already has an
// MSISDN:
//   - Already has one (e.g. the demo account's "Pre-activée" test eSIMs,
//     imported with a known MSISDN from a SIM management portal export) —
//     go straight to giving it the customer's purchased plan.
//   - Doesn't have one yet (e.g. brand-new production stock, status
//     "Available") — ask Transatel to activate it first. Activation is
//     asynchronous, so the actual "give the customer their purchased
//     plan" step happens later, in src/app/api/transatel/events/route.ts,
//     once Transatel reports the SIM is active and tells us its real
//     MSISDN.
//
// Payment has already succeeded by the time this runs (markOrderPaid), so
// a failure here is logged and recorded on the order rather than thrown —
// the customer has been charged either way, and provisioning_status =
// 'failed' is what should drive a manual-follow-up / retry path (not built
// yet) or an admin-panel alert.
async function startEsimProvisioning(orderId: number): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) {
    console.error(`[transatel] Order ${orderId} not found, cannot provision eSIM`);
    return;
  }

  try {
    const sim = await reserveSimForOrder(orderId);
    await attachReservedSim(orderId, sim.iccid);

    if (sim.msisdn) {
      await preloadCustomerPlan(order, sim.msisdn);
    } else {
      const activation = await activateSim({
        iccid: sim.iccid,
        externalReference: `order-${orderId}`,
      });
      await attachActivationTransaction(orderId, activation.transactionId);
    }
  } catch (error) {
    if (error instanceof TransatelApiError) {
      console.error(`[transatel] Order ${orderId} provisioning failed (${error.status}):`, error.body);
    } else {
      console.error(`[transatel] Order ${orderId} provisioning failed:`, error);
    }
    await markProvisioningFailed(orderId);
  }
}

function orderIdFromMetadata(metadata: Stripe.Metadata | null | undefined): number | null {
  const raw = metadata?.order_id;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new NextResponse("Webhook not configured", { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new NextResponse("Webhook signature verification failed", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = orderIdFromMetadata(session.metadata);
      if (orderId !== null && session.payment_status === "paid") {
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
        const wasPending = await markOrderPaid(orderId, paymentIntentId);
        // Only provision on the transition into 'completed' — guards
        // against a duplicate webhook delivery reserving a second real
        // SIM for the same payment.
        if (wasPending) {
          await startEsimProvisioning(orderId);
        }
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = orderIdFromMetadata(session.metadata);
      if (orderId !== null) {
        await markOrderFailed(orderId);
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = orderIdFromMetadata(paymentIntent.metadata);
      if (orderId !== null) {
        await markOrderFailed(orderId);
      }
      break;
    }
  }

  return new NextResponse("ok", { status: 200 });
}
