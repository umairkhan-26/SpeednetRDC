import type { Metadata } from "next";
import DestinationsClient from "./DestinationsClient";

import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "destinations");
}

export default function DestinationsPage() {
  return <DestinationsClient />;
}
