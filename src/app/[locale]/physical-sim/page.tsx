import type { Metadata } from "next";
import PhysicalSimView from "./PhysicalSimView";
import PhysicalSimCheckoutView from "./PhysicalSimCheckoutView";
import { getPhysicalSimTaxMode, includedPlanFacts, isPhysicalSimEnabled, pendingAnswer, physicalSimPricing } from "@/lib/physical-sim";
import { pageMetadata, pageUrls } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { ...(await pageMetadata(locale, "physicalSim")), ...(await pageUrls(locale, "/physical-sim")) };
}

// With PHYSICAL_SIM_ENABLED on: the card checkout. Otherwise the page still
// shows the card, and customers order it by email.
export default async function PhysicalSimPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = physicalSimPricing(getPhysicalSimTaxMode());
  const included = includedPlanFacts();
  if (!isPhysicalSimEnabled()) return <PhysicalSimView included={included} vatEur={pricing.vatEur} />;

  return (
    <PhysicalSimCheckoutView
      pricing={pricing}
      included={included}
      pending={{
        inactivityPeriod: pendingAnswer("inactivityPeriod", locale),
        planPriority: pendingAnswer("planPriority", locale),
        startWindow: pendingAnswer("startWindow", locale),
        returns: pendingAnswer("returns", locale),
      }}
    />
  );
}
