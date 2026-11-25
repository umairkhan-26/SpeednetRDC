import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyEn from "@/components/legal/content/privacy-en";
import PrivacyFr from "@/components/legal/content/privacy-fr";
import PrivacyEs from "@/components/legal/content/privacy-es";
import PrivacyPt from "@/components/legal/content/privacy-pt";
import PrivacyNl from "@/components/legal/content/privacy-nl";
import PrivacyDe from "@/components/legal/content/privacy-de";
import PrivacyIt from "@/components/legal/content/privacy-it";

const TITLES: Record<string, string> = { en: "Privacy Policy", fr: "Politique de confidentialité", es: "Política de privacidad", pt: "Política de Privacidade", nl: "Privacybeleid", de: "Datenschutzerklärung", it: "Informativa sulla privacy" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const CONTENT = { en: PrivacyEn, fr: PrivacyFr, es: PrivacyEs, pt: PrivacyPt, nl: PrivacyNl, de: PrivacyDe, it: PrivacyIt };
  const Content = CONTENT[locale as keyof typeof CONTENT] ?? PrivacyEn;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}><Content /></LegalPage>;
}
