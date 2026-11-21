import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyEn from "@/components/legal/content/privacy-en";
import PrivacyFr from "@/components/legal/content/privacy-fr";

const TITLES: Record<string, string> = { en: "Privacy Policy", fr: "Politique de confidentialité" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${TITLES[locale] ?? TITLES.en} — SpeedNetRDC` };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage title={TITLES[locale] ?? TITLES.en} locale={locale}>{locale === "fr" ? <PrivacyFr /> : <PrivacyEn />}</LegalPage>;
}
