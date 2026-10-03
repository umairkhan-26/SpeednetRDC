import type { Metadata } from "next";
import PhysicalSimView from "./PhysicalSimView";

import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "physicalSim");
}

// Information only: the SIM card can't be ordered yet, so the page offers a
// contact button instead of a checkout.
export default function PhysicalSimPage() {
  return <PhysicalSimView />;
}
