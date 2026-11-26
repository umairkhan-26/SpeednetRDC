import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import { pageUrls } from "@/i18n/metadata";
import PopularDestinations from "@/components/home/PopularDestinations";
import RegionalStrip from "@/components/home/RegionalStrip";
import StepsSection from "@/components/home/StepsSection";
import ValueProps from "@/components/home/ValueProps";
import PhysicalSimPromo from "@/components/home/PhysicalSimPromo";
import { includedPlanFacts } from "@/lib/physical-sim";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageUrls(locale, "");
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularDestinations />
      <RegionalStrip />
      <StepsSection />
      <PhysicalSimPromo gb={includedPlanFacts().gb} />
      <ValueProps />
    </>
  );
}
