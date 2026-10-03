import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPlanById } from "@/data/plans";
import { calculateOrderTotals } from "@/lib/pricing";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import { resolveDestination } from "@/lib/checkout/destination";
import { getAppUrl, getStripe } from "@/lib/checkout/stripe";
import { attachStripeCheckoutSession, createPendingOrder } from "@/lib/checkout/orders-repository";
import { ESIM_CHECKOUT_PAUSED_ERROR, isEsimCheckoutEnabled } from "@/lib/checkout/availability";

interface CheckoutRequestBody {
  planId?: unknown;
  fullName?: unknown;
  email?: unknown;
  locale?: unknown;
}

export async function POST(request: Request) {
  if (!isEsimCheckoutEnabled()) {
    return NextResponse.json({ error: ESIM_CHECKOUT_PAUSED_ERROR }, { status: 503 });
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { planId, fullName, email, locale } = body;
  if (typeof planId !== "string" || typeof fullName !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "planId, fullName, and email are required" }, { status: 400 });
  }
  if (!isValidFullName(fullName) || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid name and email address" }, { status: 400 });
  }

  // The plan's price is looked up server-side from plans data rather than
  // trusted from the request body, so a tampered client-side price can
  // never reach Stripe.
  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const totals = calculateOrderTotals(plan.price);
  const destination = resolveDestination(plan);

  const order = await createPendingOrder({
    planId: plan.id,
    planName: plan.name,
    countryName: destination.name,
    countryCode: destination.code,
    customerName: fullName.trim(),
    customerEmail: email.trim(),
    amountEur: totals.total,
    locale: resolvedLocale,
  });

  const appUrl = getAppUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email.trim(),
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(totals.total * 100),
          product_data: {
            name: plan.name,
            description: `${destination.name} — ${plan.validityDays} days`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/${resolvedLocale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${resolvedLocale}/checkout/cancel`,
    metadata: { order_id: String(order.id) },
    payment_intent_data: { metadata: { order_id: String(order.id) } },
  });

  await attachStripeCheckoutSession(order.id, session.id);

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
