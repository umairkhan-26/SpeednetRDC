"use client";

import { useState, useTransition } from "react";
import { fetchStripeFeesAction } from "@/lib/staff/provisioning-actions";

/** Reads Stripe's processing fee for paid live orders that don't have one yet. */
export default function FetchFeesButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setResult(null);
          startTransition(async () => setResult(await fetchStripeFeesAction()));
        }}
        className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink hover:border-orange disabled:opacity-50"
      >
        {isPending ? "Asking Stripe…" : "Fetch missing Stripe fees"}
      </button>
      {result && <span className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
