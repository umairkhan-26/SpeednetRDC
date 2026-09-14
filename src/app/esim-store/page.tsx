import { Suspense } from "react";
import type { Metadata } from "next";
import EsimStoreClient from "./EsimStoreClient";

export const metadata: Metadata = { title: "eSIM Store — SpeedNetRDC" };

export default function EsimStorePage() {
  return (
    <Suspense>
      <EsimStoreClient />
    </Suspense>
  );
}
