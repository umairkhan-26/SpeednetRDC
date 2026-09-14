import Link from "next/link";
import { CalendarDays, Database, Globe, SignalHigh, Zap } from "lucide-react";
import type { Plan } from "@/lib/types";
import { formatData, formatPrice, formatValidity } from "@/lib/format";
import { getCountryBySlug } from "@/data/countries";
import { getRegionBySlug } from "@/data/regions";

const regionCodes: Record<string, string> = {
  africa: "AF",
  americas: "AM",
  asia: "AS",
  caribbean: "CB",
  europe: "EU",
  "latin-america": "LA",
  "middle-east": "ME",
  oceania: "OC",
  "north-america": "NA",
};

const BADGE_COPY: Record<NonNullable<Plan["badge"]>, string> = {
  "price-drop": "Price Drop",
  new: "New",
};

function planHref(plan: Plan) {
  if (plan.scope === "country") return `/destinations/${plan.countrySlug}/plans/${plan.id}`;
  if (plan.scope === "global") return `/global-plans/${plan.id}`;
  return `/regional-plans/${plan.regionSlug}/${plan.id}`;
}

export default function PlanCard({ plan }: { plan: Plan }) {
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;
  const region = plan.scope === "regional" && plan.regionSlug ? getRegionBySlug(plan.regionSlug) : undefined;
  const label =
    country?.name ?? region?.name ?? (plan.globalTier === "premium" ? "Global Plus" : "Global");
  const code = country?.iso ?? (plan.regionSlug ? regionCodes[plan.regionSlug] : undefined);

  return (
    <Link
      href={planHref(plan)}
      className={`group relative flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${plan.bestValue ? "border-orange" : "border-line"}`}
    >
      {plan.bestValue && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
          Best value
        </span>
      )}
      {plan.badge && (
        <span
          className={`absolute -top-2.5 right-5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow ${plan.badge === "new" ? "bg-emerald-600" : "bg-sky-600"}`}
        >
          {BADGE_COPY[plan.badge]}
        </span>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {code ? (
            <span className="flex size-8 items-center justify-center rounded-md bg-cream text-[11px] font-bold text-ink">
              {code}
            </span>
          ) : (
            <span className="flex size-8 items-center justify-center rounded-md bg-sky-100 text-sky-600">
              <Globe className="size-4" />
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-ink">{label}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted">
              <SignalHigh className="size-3" />
              {plan.network}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold text-ink">
          <Zap className="size-2.5 fill-current" />
          {plan.speed}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-cream p-2.5">
          <p className="flex items-center gap-1 text-[10px] text-muted">
            <Database className="size-3" /> Data
          </p>
          <p className="text-sm font-bold text-ink">{formatData(plan.dataAmountGb)}</p>
        </div>
        <div className="rounded-lg bg-cream p-2.5">
          <p className="flex items-center gap-1 text-[10px] text-muted">
            <CalendarDays className="size-3" /> Validity
          </p>
          <p className="text-sm font-bold text-ink">{formatValidity(plan.validityDays)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">From</p>
          <p className="text-lg font-bold text-orange">{formatPrice(plan.price)}</p>
        </div>
        <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-orange">
          View Plan
        </span>
      </div>
    </Link>
  );
}
