import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import TermsEn from "@/components/legal/content/terms-en";
import TermsFr from "@/components/legal/content/terms-fr";

const TITLES: Record<string, string> = { en: "Terms & Conditions", fr: "Conditions générales" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}>{locale === "fr" ? <TermsFr /> : <TermsEn />}</LegalPage>;
}
