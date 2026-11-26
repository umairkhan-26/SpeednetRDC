import type { Metadata } from "next";
import DestinationsClient from "./DestinationsClient";

import { pageMetadata, pageUrls } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { ...(await pageMetadata(locale, "destinations")), ...(await pageUrls(locale, "/destinations")) };
}

export default function DestinationsPage() {
  return <DestinationsClient />;
}
