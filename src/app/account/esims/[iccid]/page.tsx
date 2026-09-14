import { Suspense } from "react";
import EsimDetailClient from "./EsimDetailClient";

export default function EsimDetailPage() {
  return (
    <Suspense>
      <EsimDetailClient />
    </Suspense>
  );
}
