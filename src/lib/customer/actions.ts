"use server";

import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/checkout/stripe";
import { customerHasOrders } from "@/lib/checkout/orders-repository";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
import { customerLoginEmail } from "@/lib/email/templates";
import { getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";
import { isValidEmail } from "@/lib/validation";
import { consumeCustomerLoginToken, createCustomerLoginToken } from "./login-tokens";
import { clearCustomerSessionCookie, isCustomerSignInConfigured, setCustomerSessionCookie } from "./session";

/** Status codes the sign-in pages translate (auth.login.* / auth.verify.*). */
export interface CustomerLoginState {
  status?: "sent" | "invalidEmail" | "tooMany" | "invalidLink" | "unavailable";
}

const pickLocale = (value: FormDataEntryValue | null) => {
  const locale = String(value ?? "");
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
};

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

  const ipBucket = rateLimitBucket("customer-login-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, 60 * 60)) return { status: "tooMany" };
  const emailBucket = rateLimitBucket("customer-login-email", email);
  const emailLimited = await isRateLimited(emailBucket, 3, 15 * 60);
  await recordAttempt(ipBucket, emailBucket);
  if (emailLimited) return { status: "sent" };

  if (await customerHasOrders(email)) {
    const token = await createCustomerLoginToken(email);
    const url = `${getAppUrl()}/${locale}/login/verify?token=${encodeURIComponent(token)}`;
    await sendEmail({ to: email, ...customerLoginEmail({ url }) });
  }
  return { status: "sent" };
}

/** The "Sign in" button on the link's page (a POST, so email scanners that open links can't use them up). */
export async function verifyCustomerLoginAction(_prev: CustomerLoginState, formData: FormData): Promise<CustomerLoginState> {
  const locale = pickLocale(formData.get("locale"));
  if (!isCustomerSignInConfigured()) return { status: "unavailable" };
  const ipBucket = rateLimitBucket("customer-verify-ip", await getClientIp());
  if (await isRateLimited(ipBucket, 20, 60 * 60)) return { status: "tooMany" };

  const email = await consumeCustomerLoginToken(String(formData.get("token") ?? ""));
  if (!email) {
    await recordAttempt(ipBucket);
    return { status: "invalidLink" };
  }
  await setCustomerSessionCookie(email);
  redirect(`/${locale}/account`);
}

export async function customerLogoutAction(formData: FormData): Promise<void> {
  await clearCustomerSessionCookie();
  redirect(`/${pickLocale(formData.get("locale"))}`);
}
