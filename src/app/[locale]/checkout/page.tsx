import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { isEsimCheckoutEnabled } from "@/lib/checkout/availability";
import { EsimSalesPausedPage } from "@/components/checkout/EsimSalesPaused";
import { pageMetadata } from "@/i18n/metadata";
import { getCheckoutCustomer } from "@/lib/customer/checkout-customer";
import { getPlanById } from "@/data/plans";
import { enabledProviders, isSocialProvider, PROVIDER_NAMES } from "@/lib/customer/social/providers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "checkout");
}

type Query = Record<"plan" | "mode" | "social" | "provider", string | string[] | undefined>;

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Query> }) {
  if (!isEsimCheckoutEnabled()) return <EsimSalesPausedPage />;
  // Only set when coming back from "Continue with Google / Apple".
  const { plan: planId, mode, social, provider } = await searchParams;
  const plan = typeof planId === "string" ? getPlanById(planId) : undefined;
  const failed = social === "failed" && typeof provider === "string" && isSocialProvider(provider) ? PROVIDER_NAMES[provider] : null;
  return (
    <CheckoutClient
      customer={await getCheckoutCustomer()}
      providers={enabledProviders()}
      resume={plan ? { plan, topUp: mode === "topup" } : null}
      failedProvider={failed}
    />
  );
}
