import type { Metadata } from "next";
import { peekCustomerLoginToken } from "@/lib/customer/login-tokens";
import VerifyClient from "./VerifyClient";

// The token is in the URL: keep it out of search engines and Referer headers.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Opening the emailed link only shows a "Sign in" button; the link is used
// up by that button's POST, so email scanners that open links can't burn it.
export default async function VerifyLoginPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token: tokenParam } = await searchParams;
  const token = typeof tokenParam === "string" ? tokenParam : "";
  const email = await peekCustomerLoginToken(token);
  return <VerifyClient token={token} email={email} />;
}
