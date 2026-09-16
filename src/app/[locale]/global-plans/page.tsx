import type { Metadata } from "next";
import GlobalPlansClient from "./GlobalPlansClient";

export const metadata: Metadata = { title: "Global Plans — SpeedNetRDC" };

export default function GlobalPlansPage() {
  return <GlobalPlansClient />;
}
