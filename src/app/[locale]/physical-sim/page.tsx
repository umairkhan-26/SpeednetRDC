import type { Metadata } from "next";
import PhysicalSimView from "./PhysicalSimView";
import PhysicalSimCheckoutView from "./PhysicalSimCheckoutView";
import { getPhysicalSimTaxMode, isPhysicalSimEnabled, pendingAnswer, physicalSimPricing, SHIPPING_COUNTRIES } from "@/lib/physical-sim";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "physicalSim");
}

// With PHYSICAL_SIM_ENABLED on: the card checkout. Otherwise the page still
// shows the card, and customers order it by email.
export default async function PhysicalSimPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPhysicalSimEnabled()) return <PhysicalSimView />;

  return (
    <PhysicalSimCheckoutView
      pricing={physicalSimPricing(getPhysicalSimTaxMode())}
      shippingCountries={[...SHIPPING_COUNTRIES]}
      pending={{
        inactivityPeriod: pendingAnswer("inactivityPeriod", locale),
        planPriority: pendingAnswer("planPriority", locale),
        startWindow: pendingAnswer("startWindow", locale),
        returns: pendingAnswer("returns", locale),
      }}
    />
  );
}
