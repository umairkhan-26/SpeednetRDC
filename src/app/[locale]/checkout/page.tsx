import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { isEsimCheckoutEnabled } from "@/lib/checkout/availability";
import { EsimSalesPausedPage } from "@/components/checkout/EsimSalesPaused";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "checkout");
}

export default function CheckoutPage() {
  if (!isEsimCheckoutEnabled()) return <EsimSalesPausedPage />;
  return <CheckoutClient />;
}
