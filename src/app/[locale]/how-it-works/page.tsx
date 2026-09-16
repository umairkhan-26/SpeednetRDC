import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import StepsSection from "@/components/home/StepsSection";
import InstallSteps from "@/components/destinations/InstallSteps";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "How It Works — SpeedNetRDC" };

export default function HowItWorksPage() {
  return (
    <div>
      <section className="bg-ink py-16 sm:py-20">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            From search to <span className="text-orange">connected</span> in minutes
          </h1>
          <p className="max-w-lg text-white/70">
            No SIM trays, no store visits, no roaming surprises. Here&apos;s exactly how SpeedNetRDC
            gets you online.
          </p>
          <LinkButton href="/esim-store" size="lg">
            Explore eSIM Plans <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      </section>

      <StepsSection />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Setup" title="Installing your eSIM" align="center" />
          <div className="mt-8">
            <InstallSteps />
          </div>
        </div>
      </section>
    </div>
  );
}
