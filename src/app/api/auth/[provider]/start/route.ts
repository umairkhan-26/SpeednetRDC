import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPlanById } from "@/data/plans";
import { savePendingSignIn } from "@/lib/customer/social/cookies";
import { appOrigin, authorizationUrl } from "@/lib/customer/social/oauth";
import { isProviderEnabled, isSocialProvider } from "@/lib/customer/social/providers";

/** The "Continue with …" button: remembers who is asking, then sends them to the provider. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const requested = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  if (!isSocialProvider(provider) || !isProviderEnabled(provider)) {
    return NextResponse.redirect(`${appOrigin()}/${locale}/login`, 303);
  }

  // The provider answers on the site's main address, so a visit that began on
  // its "www." twin has to move there first or the cookie below would be lost.
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").toLowerCase();
  const mainHost = new URL(appOrigin()).host.toLowerCase();
  if (host === `www.${mainHost}` || mainHost === `www.${host}`) {
    return NextResponse.redirect(`${appOrigin()}/api/auth/${provider}/start${request.nextUrl.search}`, 303);
  }

  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  // From the checkout: come back to it, with the same plan.
  const planId = request.nextUrl.searchParams.get("plan") ?? "";
  const checkout = getPlanById(planId) ? { planId, topUp: request.nextUrl.searchParams.get("mode") === "topup" } : undefined;
  await savePendingSignIn({ provider, state, nonce, codeVerifier, locale, checkout });
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return NextResponse.redirect(authorizationUrl(provider, { state, nonce, codeChallenge, locale }), 303);
}
