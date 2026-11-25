import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import RefundsEn from "@/components/legal/content/refunds-en";
import RefundsFr from "@/components/legal/content/refunds-fr";
import RefundsEs from "@/components/legal/content/refunds-es";
import RefundsPt from "@/components/legal/content/refunds-pt";
import RefundsNl from "@/components/legal/content/refunds-nl";
import RefundsDe from "@/components/legal/content/refunds-de";
import RefundsIt from "@/components/legal/content/refunds-it";

const TITLES: Record<string, string> = { en: "Refund Policy", fr: "Politique de remboursement", es: "Política de reembolso", pt: "Política de Reembolso", nl: "Terugbetalingsbeleid", de: "Erstattungsrichtlinie", it: "Politica di rimborso" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function RefundsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const CONTENT = { en: RefundsEn, fr: RefundsFr, es: RefundsEs, pt: RefundsPt, nl: RefundsNl, de: RefundsDe, it: RefundsIt };
  const Content = CONTENT[locale as keyof typeof CONTENT] ?? RefundsEn;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}><Content /></LegalPage>;
}
