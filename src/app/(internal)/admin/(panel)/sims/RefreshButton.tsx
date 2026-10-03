"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshAllSimsAction, refreshSimAction, type SimRefreshResult } from "@/lib/sims/actions";

/** Re-reads SIM status from Transatel: every sold SIM, or just `iccid`. */
export default function RefreshButton({ iccid, label }: { iccid?: string; label: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SimRefreshResult | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setResult(null);
          startTransition(async () => setResult(await (iccid ? refreshSimAction(iccid) : refreshAllSimsAction())));
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Asking Transatel…" : label}
      </button>
      {result && <span className={`max-w-sm text-right text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
