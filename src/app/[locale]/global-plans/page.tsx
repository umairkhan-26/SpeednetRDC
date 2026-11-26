import type { Metadata } from "next";
import GlobalPlansClient from "./GlobalPlansClient";

import { pageMetadata, pageUrls } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { ...(await pageMetadata(locale, "globalPlans")), ...(await pageUrls(locale, "/global-plans")) };
}

export default function GlobalPlansPage() {
  return <GlobalPlansClient />;
}
