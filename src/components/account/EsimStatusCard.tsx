import Link from "next/link";
import { clsx } from "clsx";
import type { ActiveEsim } from "@/lib/types";
import { formatData } from "@/lib/format";
import ProgressBar from "@/components/ui/ProgressBar";
import { LinkButton } from "@/components/ui/Button";

const statusTone: Record<ActiveEsim["status"], string> = {
  Active: "text-emerald-600",
  "Not Installed": "text-amber-600",
  Expired: "text-red-600",
  Inactive: "text-muted",
};

export default function EsimStatusCard({ esim }: { esim: ActiveEsim }) {
  const totalGb = esim.dataTotalGb === "unlimited" ? esim.dataUsedGb + 1 : esim.dataTotalGb;
  const remainingGb = esim.dataTotalGb === "unlimited" ? "Unlimited" : Math.max(0, esim.dataTotalGb - esim.dataUsedGb).toFixed(1);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white">
      <div className="h-1.5 w-full bg-gradient-to-r from-orange to-amber-300" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cream text-xs font-bold text-ink">
              {esim.iso}
            </span>
            <div>
              <p className="font-semibold text-ink">{esim.countryName} eSIM</p>
              <p className={clsx("text-xs font-semibold", statusTone[esim.status])}>&#9679; {esim.status}</p>
            </div>
          </div>
          {esim.connectivity && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
              {esim.connectivity}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-ink">
              {remainingGb === "Unlimited" ? "Unlimited" : `${remainingGb} GB`}{" "}
              <span className="text-sm font-normal text-muted">remaining / {formatData(esim.dataTotalGb)}</span>
            </p>
            <span className="text-xs text-muted">{esim.dataUsedGb}GB used</span>
          </div>
          <ProgressBar value={esim.dataUsedGb} max={totalGb} className="mt-2" />
        </div>

        <p className="text-xs text-muted">Expires in {esim.expiresInDays} days</p>

        <div className="flex gap-2">
          <LinkButton href={`/account/esims/${encodeURIComponent(esim.iccid)}`} variant="outline" size="sm" className="flex-1 justify-center">
            Manage
          </LinkButton>
          <Link
            href={`/account/esims/${encodeURIComponent(esim.iccid)}?tab=topup`}
            className="flex flex-1 items-center justify-center rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-soft"
          >
            Top Up
          </Link>
        </div>
      </div>
    </div>
  );
}
