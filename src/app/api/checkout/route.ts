import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPlanById } from "@/data/plans";
import { calculateOrderTotals } from "@/lib/pricing";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import { resolveDestination } from "@/lib/checkout/destination";
import { getAppUrl, getStripe } from "@/lib/checkout/stripe";
import { attachStripeCheckoutSession, createPendingOrder, recordWithdrawalConsent } from "@/lib/checkout/orders-repository";
import { legalPagesLive } from "@/lib/legal";
import { ESIM_CHECKOUT_PAUSED_ERROR, isEsimCheckoutEnabled } from "@/lib/checkout/availability";
import { recordMetaConsent } from "@/lib/meta/consent-repository";
import { isTopUpEnabled } from "@/lib/topup";
import { findTopUpTarget } from "@/lib/sims/eligibility";
import { getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";

interface CheckoutRequestBody {
  planId?: unknown;
  fullName?: unknown;
  email?: unknown;
  locale?: unknown;
  withdrawalConsent?: unknown;
  meta?: unknown;
  /** "Add to my SIM": the ICCID of a SIM the customer already has. */
  topUpIccid?: unknown;
}

/** Meta's _fbp / _fbc cookie values: short, printable, nothing else accepted. */
function metaId(value: unknown): string | null {
  return typeof value === "string" && /^fb\.\d\.\d+\.[\w.-]{1,200}$/.test(value) ? value : null;
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

  // Asked only once the legal pages are published (src/lib/legal.ts).
  const consentRequired = legalPagesLive();
  if (consentRequired && body.withdrawalConsent !== true) {
    return NextResponse.json({ error: "Please tick the box to confirm immediate delivery of your eSIM." }, { status: 400 });
  }

  // "Add to my SIM": re-check the SIM here (never trust the browser) — it
  // must be one of our SIMs that reached a customer. Failed lookups are
  // rate-limited so the endpoint can't be used to probe ICCIDs.
  let topUpIccid: string | undefined;
  if (body.topUpIccid !== undefined && body.topUpIccid !== null && body.topUpIccid !== "") {
    if (!isTopUpEnabled()) {
      return NextResponse.json({ error: "Adding a plan to an existing SIM isn't available yet." }, { status: 400 });
    }
    const ipBucket = rateLimitBucket("topup-iccid-ip", await getClientIp());
    if (await isRateLimited(ipBucket, 20, 60 * 60)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    const target = typeof body.topUpIccid === "string" ? await findTopUpTarget(body.topUpIccid) : null;
    if (!target) {
      await recordAttempt(ipBucket);
      return NextResponse.json({ error: "We couldn't find that SIM. Check the number printed on your SIM card." }, { status: 400 });
    }
    topUpIccid = target.iccid;
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
    topUpIccid,
  });
  if (consentRequired) await recordWithdrawalConsent(order.id);

  // Only when the buyer accepted Meta cookies: what the server-side Purchase
  // event needs later. A problem here must never stop the checkout.
  const meta = body.meta as { consent?: unknown; fbp?: unknown; fbc?: unknown } | undefined;
  if (meta?.consent === true) {
    try {
      await recordMetaConsent({
        orderId: order.id,
        eventId: crypto.randomUUID(),
        fbp: metaId(meta.fbp),
        fbc: metaId(meta.fbc),
        userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
      });
    } catch (error) {
      console.error(`[meta] Couldn't record consent for ORD-${order.id}:`, error instanceof Error ? error.message : error);
    }
  }

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
            description: topUpIccid
              ? `${destination.name} — ${plan.validityDays} days · added to SIM ending ${topUpIccid.slice(-4)}`
              : `${destination.name} — ${plan.validityDays} days`,
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
