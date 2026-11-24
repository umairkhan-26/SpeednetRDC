import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import RefundsEn from "@/components/legal/content/refunds-en";
import RefundsFr from "@/components/legal/content/refunds-fr";
import RefundsEs from "@/components/legal/content/refunds-es";
import RefundsPt from "@/components/legal/content/refunds-pt";

const TITLES: Record<string, string> = { en: "Refund Policy", fr: "Politique de remboursement", es: "Política de reembolso", pt: "Política de Reembolso" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function RefundsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}>{locale === "fr" ? <RefundsFr /> : locale === "es" ? <RefundsEs /> : locale === "pt" ? <RefundsPt /> : <RefundsEn />}</LegalPage>;
}
