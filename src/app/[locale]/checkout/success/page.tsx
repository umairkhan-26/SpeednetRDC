import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "checkoutSuccess");
}

export default function CheckoutSuccessPage() {
  return <SuccessClient />;
}
