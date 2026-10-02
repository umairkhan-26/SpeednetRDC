import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { isEsimCheckoutEnabled } from "@/lib/checkout/availability";
import { EsimSalesPausedPage } from "@/components/checkout/EsimSalesPaused";

export const metadata: Metadata = { title: "Checkout — SpeedNetRDC" };

export default function CheckoutPage() {
  if (!isEsimCheckoutEnabled()) return <EsimSalesPausedPage />;
  return <CheckoutClient />;
}
