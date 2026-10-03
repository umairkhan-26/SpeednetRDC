import type { Metadata } from "next";
import GlobalPlansClient from "./GlobalPlansClient";

import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "globalPlans");
}

export default function GlobalPlansPage() {
  return <GlobalPlansClient />;
}
