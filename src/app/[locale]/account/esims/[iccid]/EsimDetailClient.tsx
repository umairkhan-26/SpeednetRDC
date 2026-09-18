"use client";

import { useMemo, useState } from "react";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { mockEsims } from "@/data/esims";
import { formatData, formatDate } from "@/lib/format";
import ProgressBar from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Chip";
import InstallationGuideTab from "@/components/account/esim-tabs/InstallationGuideTab";
import TopUpDataTab from "@/components/account/esim-tabs/TopUpDataTab";
import NetworkSettingsTab from "@/components/account/esim-tabs/NetworkSettingsTab";
import ContactSupportTab from "@/components/account/esim-tabs/ContactSupportTab";
import type { ActiveEsim } from "@/lib/types";

type TabKey = "install" | "topup" | "network" | "support";
const tabs: { key: TabKey; label: string }[] = [
  { key: "install", label: "Installation Guide" },
  { key: "topup", label: "Top Up Data" },
  { key: "network", label: "Network Settings" },
  { key: "support", label: "Contact Support" },
];

export default function EsimDetailClient() {
  const params = useParams<{ iccid: string }>();
  const searchParams = useSearchParams();
  const iccid = decodeURIComponent(params.iccid);
  const requestedTab = searchParams.get("tab");
  const initialTab = tabs.some((t) => t.key === requestedTab) ? (requestedTab as TabKey) : "install";
  const [tab, setTab] = useState<TabKey>(initialTab);

  const esim = useMemo<ActiveEsim | undefined>(() => {
    return mockEsims.find((e) => e.iccid === iccid);
  }, [iccid]);

  // toLocaleDateString() is timezone-sensitive: the server (UTC) and the
  // browser's local timezone can render the same instant as different
  // calendar dates near midnight, which triggers a hydration mismatch if
  // computed inline during render. Gate the formatting behind useHasMounted
  // so it only ever runs client-side, after hydration is already reconciled.
  const mounted = useHasMounted();

  const expirationLabel = mounted && esim ? formatDate(esim.expirationDate) : "—";
  const activatedLabel =
    mounted && esim
      ? new Date(esim.activationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "—";

  if (!esim) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">eSIM not found</h1>
        <p className="max-w-sm text-muted">This eSIM doesn&apos;t exist or belongs to another account.</p>
        <Link href="/account" className="font-semibold text-orange hover:underline">
          Back to My SpeedNetRDC
        </Link>
      </div>
    );
  }

  const remainingGb =
    esim.dataTotalGb === "unlimited" ? "Unlimited" : Math.max(0, esim.dataTotalGb - esim.dataUsedGb).toFixed(1);
  const totalForBar = esim.dataTotalGb === "unlimited" ? esim.dataUsedGb + 1 : esim.dataTotalGb;
  const statusTone = esim.status === "Active" ? "success" : esim.status === "Expired" ? "dark" : "orange";

  return (
    <div className="container-page py-14">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> My SpeedNetRDC
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cream text-xs font-bold text-ink">
            {esim.iso}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{esim.countryName} eSIM</h1>
            <p className="text-sm text-muted">ICCID {esim.iccid}</p>
          </div>
        </div>
        <Badge tone={statusTone}>{esim.status}</Badge>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <p className="text-3xl font-bold text-ink">
          {remainingGb === "Unlimited" ? "Unlimited" : `${remainingGb} GB`}{" "}
          <span className="text-base font-normal text-muted">remaining / {formatData(esim.dataTotalGb)}</span>
        </p>
        <ProgressBar value={esim.dataUsedGb} max={totalForBar} className="mt-3" />

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoCell label="Data used" value={`${esim.dataUsedGb} GB`} />
          <InfoCell label="Expiration date" value={expirationLabel} />
          <InfoCell label="Current network" value={`${esim.network} · ${esim.preferredNetwork}`} />
          <InfoCell
            label="Coverage"
            value={`${esim.coverageCountries} ${esim.coverageCountries === 1 ? "country" : "countries"}`}
          />
          <InfoCell label="Activation status" value={`Activated ${activatedLabel}`} />
          <InfoCell label="SM-DP+ address" value={esim.smDpAddress} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap gap-2 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={clsx(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                tab === t.key ? "border-orange text-orange" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {tab === "install" && <InstallationGuideTab esim={esim} />}
          {tab === "topup" && <TopUpDataTab esim={esim} />}
          {tab === "network" && <NetworkSettingsTab esim={esim} />}
          {tab === "support" && <ContactSupportTab />}
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-cream p-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
