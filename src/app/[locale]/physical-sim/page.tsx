import type { Metadata } from "next";
import PhysicalSimView from "./PhysicalSimView";

export const metadata: Metadata = { title: "Physical SIM card — SpeedNetRDC" };

// Information only: the SIM card can't be ordered yet, so the page offers a
// contact button instead of a checkout.
export default function PhysicalSimPage() {
  return <PhysicalSimView />;
}
