import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/checkout/stripe";
import { markOrderFailed, markOrderPaid } from "@/lib/checkout/orders-repository";

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
        await markOrderPaid(orderId, paymentIntentId);
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
