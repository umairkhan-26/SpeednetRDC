import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { customerHasOrders } from "@/lib/checkout/orders-repository";
import { setCustomerSessionCookie } from "@/lib/customer/session";
import { clearPendingLink, savePendingLink, takePendingSignIn } from "@/lib/customer/social/cookies";
import { findLinkedEmail } from "@/lib/customer/social/identities";
import { appOrigin, exchangeCode, verifyIdToken } from "@/lib/customer/social/oauth";
import { isProviderEnabled, isSocialProvider, type SocialProvider } from "@/lib/customer/social/providers";

type Context = { params: Promise<{ provider: string }> };

const go = (path: string) => NextResponse.redirect(`${appOrigin()}${path}`, 303);

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

async function finish(provider: SocialProvider, answer: URLSearchParams) {
  const pending = await takePendingSignIn(provider);
  const locale = pending?.locale ?? routing.defaultLocale;
  const failed = () => go(`/${locale}/login?social=failed&provider=${provider}`);

  // The visitor pressed "Cancel" on the provider's page.
  const refused = answer.get("error");
  if (refused === "access_denied" || refused === "user_cancelled_authorize") return go(`/${locale}/login`);

  const code = answer.get("code");
  if (!pending || !code || !same(answer.get("state") ?? "", pending.state)) return failed();

  try {
    const identity = await verifyIdToken(provider, await exchangeCode(provider, code, pending.codeVerifier), pending.nonce);

    let email = await findLinkedEmail(provider, identity.subject);
    if (!email) {
      // A hidden Apple address is only enough by itself once orders use it.
      const enough = identity.relay ? await customerHasOrders(identity.email) : identity.authoritative;
      if (enough) email = identity.email;
    }
    if (!email) {
      await savePendingLink({ provider, subject: identity.subject, email: identity.email, relay: identity.relay, locale });
      return go(`/${locale}/login/link`);
    }

    await clearPendingLink();
    await setCustomerSessionCookie(email);
    return go(`/${locale}/account`);
  } catch (error) {
    // The message only: never the code or the token.
    console.error(`[customer] ${provider} sign-in failed:`, error instanceof Error ? error.message : "unknown error");
    return failed();
  }
}

/** Google answers with the browser coming back to this address. */
export async function GET(request: NextRequest, { params }: Context) {
  const { provider } = await params;
  if (provider !== "google" || !isProviderEnabled(provider)) return go(`/${routing.defaultLocale}/login`);
  return finish(provider, request.nextUrl.searchParams);
}

/** Apple answers with a form posted to this address. */
export async function POST(request: NextRequest, { params }: Context) {
  const { provider } = await params;
  if (!isSocialProvider(provider) || provider !== "apple" || !isProviderEnabled(provider)) return go(`/${routing.defaultLocale}/login`);
  const form = await request.formData().catch(() => null);
  const answer = new URLSearchParams();
  for (const name of ["code", "state", "error"]) {
    const value = form?.get(name);
    if (typeof value === "string") answer.set(name, value);
  }
  return finish(provider, answer);
}
