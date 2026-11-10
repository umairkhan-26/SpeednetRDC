import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import { getAppUrl, getStripe } from "@/lib/checkout/stripe";
import { attachStripeCheckoutSession, createPhysicalSimOrder } from "@/lib/checkout/orders-repository";
import { getPhysicalSimTaxMode, isPhysicalSimEnabled, physicalSimPricing, SHIPPING_COUNTRIES } from "@/lib/physical-sim";

/**
 * Starts checkout for one SpeedNetRDC SIM card: the card and shipping as two
 * lines (plus the 5% line, or VAT, depending on PHYSICAL_SIM_TAX_MODE), and
 * Stripe collects a shipping address in one of the 31 countries we ship to.
 * Prices come from the server. Off unless PHYSICAL_SIM_ENABLED is "true".
 */
export async function POST(request: Request) {
  if (!isPhysicalSimEnabled()) {
    return NextResponse.json({ error: "SIM cards aren't on sale yet." }, { status: 404 });
  }

  let body: { fullName?: unknown; email?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { fullName, email, locale } = body;
  if (typeof fullName !== "string" || typeof email !== "string" || !isValidFullName(fullName) || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid name and email address" }, { status: 400 });
  }
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const pricing = physicalSimPricing(getPhysicalSimTaxMode());

  const order = await createPhysicalSimOrder({
    customerName: fullName.trim(),
    customerEmail: email.trim(),
    amountEur: pricing.totalEur,
    shippingEur: pricing.shippingEur,
    locale: resolvedLocale,
  });

  const appUrl = getAppUrl();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email.trim(),
    line_items: pricing.lines.map((line) => ({
      price_data: {
        currency: "eur",
        unit_amount: Math.round(line.amountEur * 100),
        product_data: {
          name: line.key === "sim" ? "SpeedNetRDC SIM card" : line.key === "shipping" ? "Shipping (Europe, 3–5 working days)" : "Taxes & fees",
          ...(line.key === "sim" ? { description: "Physical SIM card — yours to keep. Add data plans anytime on speednetrdc.com." } : {}),
        },
      },
      quantity: 1,
    })),
    shipping_address_collection: {
      allowed_countries: [...SHIPPING_COUNTRIES] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
    },
    success_url: `${appUrl}/${resolvedLocale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${resolvedLocale}/physical-sim`,
    metadata: { order_id: String(order.id), product: "physical_sim" },
    payment_intent_data: { metadata: { order_id: String(order.id), product: "physical_sim" } },
  });

  await attachStripeCheckoutSession(order.id, session.id);
  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
