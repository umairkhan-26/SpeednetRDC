import { Suspense } from "react";
import type { Metadata } from "next";
import EsimStoreClient from "./EsimStoreClient";

import { pageMetadata, pageUrls } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { ...(await pageMetadata(locale, "store")), ...(await pageUrls(locale, "/esim-store")) };
}

export default function EsimStorePage() {
  return (
    <Suspense>
      <EsimStoreClient />
    </Suspense>
  );
}
