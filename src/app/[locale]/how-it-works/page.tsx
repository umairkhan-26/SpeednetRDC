import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import StepsSection from "@/components/home/StepsSection";
import InstallSteps from "@/components/destinations/InstallSteps";
import SectionHeading from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "howItWorks");
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howItWorks" });
  return (
    <div>
      <section className="bg-ink py-16 sm:py-20">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t.rich("title", { accent: (chunks) => <span className="text-orange">{chunks}</span> })}
          </h1>
          <p className="max-w-lg text-white/70">{t("subtitle")}</p>
          <LinkButton href="/esim-store" size="lg">
            {t("explore")} <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      </section>

      <StepsSection />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow={t("setupEyebrow")} title={t("setupTitle")} align="center" />
          <div className="mt-8">
            <InstallSteps />
          </div>
        </div>
      </section>
    </div>
  );
}
