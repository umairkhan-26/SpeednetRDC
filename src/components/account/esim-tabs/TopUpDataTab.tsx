"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import { topUpPackages } from "@/data/esims";
import type { ActiveEsim } from "@/lib/types";
import { formatData, formatPrice } from "@/lib/format";
import ProgressBar from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { topUpEsim } from "@/lib/api/esims";

export default function TopUpDataTab({ esim }: { esim: ActiveEsim }) {
  const [selected, setSelected] = useState(topUpPackages[2]?.id ?? topUpPackages[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalGb = esim.dataTotalGb === "unlimited" ? esim.dataUsedGb + 1 : esim.dataTotalGb;

  async function handleAddData() {
    setSubmitting(true);
    await topUpEsim(esim, selected);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="space-y-6 py-2">
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-ink">
            {esim.dataUsedGb}GB used of {formatData(esim.dataTotalGb)}
          </span>
        </div>
        <ProgressBar value={esim.dataUsedGb} max={totalGb} className="mt-2" />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Choose a top-up package</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {topUpPackages.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => setSelected(pack.id)}
              className={clsx(
                "relative rounded-xl border px-4 py-4 text-left transition-colors",
                selected === pack.id ? "border-orange bg-orange/10" : "border-line hover:border-orange/40",
              )}
            >
              {pack.bestValue && (
                <span className="absolute -top-2 right-3 rounded-full bg-orange px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Best value
                </span>
              )}
              <p className="font-bold text-ink">{pack.dataGb}GB</p>
              <p className="text-sm text-muted">{formatPrice(pack.price)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleAddData} disabled={submitting} size="lg">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Add Data
        </Button>
        {success && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="size-4" /> Data added successfully
          </span>
        )}
      </div>
    </div>
  );
}
