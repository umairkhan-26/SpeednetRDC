"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/checkout/stripe";
import { customerHasOrders } from "@/lib/checkout/orders-repository";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
import { customerLoginEmail } from "@/lib/email/templates";
import { getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";
import { isValidEmail } from "@/lib/validation";
import { consumeCustomerLoginToken, createCustomerLoginToken, hashToken } from "./login-tokens";
import { clearCustomerSessionCookie, isCustomerSignInConfigured, setCustomerSessionCookie } from "./session";
import { clearPendingLink, readPendingLink, savePendingLink } from "./social/cookies";
import { linkIdentity } from "./social/identities";

/** Status codes the sign-in pages translate (auth.login.* / auth.verify.*). */
export interface CustomerLoginState {
  status?: "sent" | "invalidEmail" | "tooMany" | "invalidLink" | "unavailable" | "expired";
}

const pickLocale = (value: FormDataEntryValue | null) => {
  const locale = String(value ?? "");
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
};

async function sendLoginLink(email: string, token: string, locale: string): Promise<void> {
  const url = `${getAppUrl()}/${locale}/login/verify?token=${encodeURIComponent(token)}`;
  await sendEmail({ to: email, ...customerLoginEmail({ url }) });
}

/** Counts a request for a link: "limited" once one address has asked too often, "tooMany" once one visitor has. */
async function linkRequestLimit(email: string): Promise<"ok" | "limited" | "tooMany"> {
  const ipBucket = rateLimitBucket("customer-login-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, 60 * 60)) return "tooMany";
  const emailBucket = rateLimitBucket("customer-login-email", email);
  const emailLimited = await isRateLimited(emailBucket, 3, 15 * 60);
  await recordAttempt(ipBucket, emailBucket);
  return emailLimited ? "limited" : "ok";
}

/**
 * Emails a one-time sign-in link — but only to an address that has paid
 * orders, and with the same answer either way, so the form can't be used
 * to find out who our customers are or to send mail to arbitrary people.
 */
export async function requestCustomerLoginAction(_prev: CustomerLoginState, formData: FormData): Promise<CustomerLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = pickLocale(formData.get("locale"));
  if (!isValidEmail(email)) return { status: "invalidEmail" };
  if (!isCustomerSignInConfigured() || !isEmailConfigured()) {
    console.warn("[customer] Sign-in requested but CUSTOMER_SESSION_SECRET or email isn't configured — sign-in is unavailable");
    return { status: "unavailable" };
  }

  const limit = await linkRequestLimit(email);
  if (limit === "tooMany") return { status: "tooMany" };
  if (limit === "limited") return { status: "sent" };

  if (await customerHasOrders(email)) await sendLoginLink(email, await createCustomerLoginToken(email), locale);
  return { status: "sent" };
}

/**
 * After Google or Apple, when their address isn't enough by itself: emails a
 * sign-in link to the address the customer orders with. Using that link, in
 * the same browser, connects the two for next time.
 */
export async function requestIdentityLinkAction(_prev: CustomerLoginState, formData: FormData): Promise<CustomerLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = pickLocale(formData.get("locale"));
  const pending = await readPendingLink();
  if (!pending) return { status: "expired" };
  if (!isValidEmail(email)) return { status: "invalidEmail" };
  if (!isEmailConfigured()) return { status: "unavailable" };

  const limit = await linkRequestLimit(email);
  if (limit === "tooMany") return { status: "tooMany" };
  if (limit === "limited") return { status: "sent" };

  // The address Google itself gave may be new to us; any other must have orders.
  const send = (!pending.relay && email === pending.email) || (await customerHasOrders(email));
  const token = send ? await createCustomerLoginToken(email) : randomBytes(32).toString("base64url");
  // Saved either way, so the cookie doesn't reveal whether an address is a customer's.
  await savePendingLink({ ...pending, tokenHash: hashToken(token) });
  if (send) await sendLoginLink(email, token, locale);
  return { status: "sent" };
}

/** "I'm new here": signs in with the hidden Apple address, which has no orders yet. */
export async function continueWithHiddenEmailAction(formData: FormData): Promise<void> {
  const locale = pickLocale(formData.get("locale"));
  const pending = await readPendingLink();
  if (!pending?.relay) redirect(`/${locale}/login`);
  await clearPendingLink();
  await setCustomerSessionCookie(pending.email);
  redirect(`/${locale}/account`);
}

/** The "Sign in" button on the link's page (a POST, so email scanners that open links can't use them up). */
export async function verifyCustomerLoginAction(_prev: CustomerLoginState, formData: FormData): Promise<CustomerLoginState> {
  const locale = pickLocale(formData.get("locale"));
  if (!isCustomerSignInConfigured()) return { status: "unavailable" };
  const ipBucket = rateLimitBucket("customer-verify-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, 60 * 60)) return { status: "tooMany" };

  const token = String(formData.get("token") ?? "");
  const email = await consumeCustomerLoginToken(token);
  if (!email) {
    await recordAttempt(ipBucket);
    return { status: "invalidLink" };
  }
  const pending = await readPendingLink();
  if (pending?.tokenHash === hashToken(token)) {
    // Signing in must still work if saving the connection fails.
    await linkIdentity(pending.provider, pending.subject, email).catch((error) => console.error("[customer] Couldn't connect the account:", error));
    await clearPendingLink();
  }
  await setCustomerSessionCookie(email);
  redirect(`/${locale}/account`);
}

export async function customerLogoutAction(formData: FormData): Promise<void> {
  await clearCustomerSessionCookie();
  await clearPendingLink();
  redirect(`/${pickLocale(formData.get("locale"))}`);
}
