import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import TermsEn from "@/components/legal/content/terms-en";
import TermsFr from "@/components/legal/content/terms-fr";
import TermsEs from "@/components/legal/content/terms-es";
import TermsPt from "@/components/legal/content/terms-pt";
import TermsNl from "@/components/legal/content/terms-nl";
import TermsDe from "@/components/legal/content/terms-de";
import TermsIt from "@/components/legal/content/terms-it";

const TITLES: Record<string, string> = { en: "Terms & Conditions", fr: "Conditions générales", es: "Términos y condiciones", pt: "Termos e Condições", nl: "Algemene voorwaarden", de: "Allgemeine Geschäftsbedingungen", it: "Termini e condizioni" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const CONTENT = { en: TermsEn, fr: TermsFr, es: TermsEs, pt: TermsPt, nl: TermsNl, de: TermsDe, it: TermsIt };
  const Content = CONTENT[locale as keyof typeof CONTENT] ?? TermsEn;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}><Content /></LegalPage>;
}
