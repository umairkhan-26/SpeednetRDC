import { NextResponse } from "next/server";
import { getStripe } from "@/lib/checkout/stripe";
import { getOrderByStripeCheckoutSessionId, markOrderPaid } from "@/lib/checkout/orders-repository";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  let order = await getOrderByStripeCheckoutSessionId(sessionId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // The webhook is the source of truth, but it can lag behind the browser
  // redirect back from Stripe by a second or two. If the order is still
  // 'pending' here, ask Stripe directly once and reconcile immediately
  // rather than making the customer wait out the full webhook delay.
  if (order.status === "pending") {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
      await markOrderPaid(order.id, paymentIntentId);
      order = await getOrderByStripeCheckoutSessionId(sessionId);
    }
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    order: {
      id: order.id,
      planName: order.planName,
      countryName: order.countryName,
      iccid: order.iccid,
      lpaActivationCode: order.lpaActivationCode,
    },
  });
}
