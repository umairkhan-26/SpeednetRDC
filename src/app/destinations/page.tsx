import type { Metadata } from "next";
import DestinationsClient from "./DestinationsClient";

export const metadata: Metadata = { title: "Destinations — SpeedNetRDC" };

export default function DestinationsPage() {
  return <DestinationsClient />;
}
