import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhysicalSimTaxMode, isPhysicalSimEnabled, pendingAnswer, physicalSimPricing, SHIPPING_COUNTRIES } from "@/lib/physical-sim";
import PhysicalSimView from "./PhysicalSimView";

export const metadata: Metadata = { title: "Physical SIM card — SpeedNetRDC" };

// Hidden (404) until PHYSICAL_SIM_ENABLED is "true".
export default async function PhysicalSimPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPhysicalSimEnabled()) notFound();

  return (
    <PhysicalSimView
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
