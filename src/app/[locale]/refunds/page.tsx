import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import RefundsEn from "@/components/legal/content/refunds-en";
import RefundsFr from "@/components/legal/content/refunds-fr";

const TITLES: Record<string, string> = { en: "Refund Policy", fr: "Politique de remboursement" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function RefundsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}>{locale === "fr" ? <RefundsFr /> : <RefundsEn />}</LegalPage>;
}
