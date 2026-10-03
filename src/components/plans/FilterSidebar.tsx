"use client";

import { useTranslations } from "next-intl";
import { regions } from "@/data/regions";
import { countries } from "@/data/countries";
import type { PlanFilters } from "@/lib/filter-plans";
import { useNames } from "@/i18n/use-names";

const dataOptions: PlanFilters["minData"][] = ["any", 1, 3, 5, 10, 15, 20];
const durationOptions: PlanFilters["duration"][] = ["any", 3, 5, 7, 10, 15, 30];
const maxPriceOptions: PlanFilters["maxPrice"][] = ["any", 10, 25, 50, 100];
const networks = Array.from(new Set(countries.flatMap((c) => c.networks))).sort();

export default function FilterSidebar({
  filters,
  onChange,
}: {
  filters: PlanFilters;
  onChange: (next: PlanFilters) => void;
}) {
  const t = useTranslations("filters");
  const names = useNames();
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";
  const selectClass = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange";

  return (
    <aside className="flex h-max flex-col gap-6 rounded-2xl border border-line bg-white p-5">
      <div>
        <label htmlFor="filter-destination" className={labelClass}>
          {t("destination")}
        </label>
        <input
          id="filter-destination"
          type="text"
          value={filters.destination}
          onChange={(e) => onChange({ ...filters, destination: e.target.value })}
          placeholder={t("destinationPlaceholder")}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-orange"
        />
      </div>

      <div>
        <label htmlFor="filter-region" className={labelClass}>
          {t("region")}
        </label>
        <select
          id="filter-region"
          value={filters.region}
          onChange={(e) => onChange({ ...filters, region: e.target.value as PlanFilters["region"] })}
          className={selectClass}
        >
          <option value="all">{t("allRegions")}</option>
          {regions.map((r) => (
            <option key={r.slug} value={r.slug}>
              {names.region(r.slug, r.name)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-data" className={labelClass}>
          {t("dataAmount")}
        </label>
        <select
          id="filter-data"
          value={String(filters.minData)}
          onChange={(e) =>
            onChange({
              ...filters,
              minData: (e.target.value === "any" ? "any" : Number(e.target.value)) as PlanFilters["minData"],
            })
          }
          className={selectClass}
        >
          {dataOptions.map((o) => (
            <option key={String(o)} value={String(o)}>
              {o === "any" ? t("anyData") : t("dataMin", { amount: o })}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-duration" className={labelClass}>
          {t("duration")}
        </label>
        <select
          id="filter-duration"
          value={String(filters.duration)}
          onChange={(e) =>
            onChange({
              ...filters,
              duration: (e.target.value === "any" ? "any" : Number(e.target.value)) as PlanFilters["duration"],
            })
          }
          className={selectClass}
        >
          {durationOptions.map((o) => (
            <option key={String(o)} value={String(o)}>
              {o === "any" ? t("anyDuration") : t("days", { count: o })}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-price" className={labelClass}>
          {t("maxPrice")}
        </label>
        <select
          id="filter-price"
          value={String(filters.maxPrice)}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: (e.target.value === "any" ? "any" : Number(e.target.value)) as PlanFilters["maxPrice"],
            })
          }
          className={selectClass}
        >
          {maxPriceOptions.map((o) => (
            <option key={String(o)} value={String(o)}>
              {o === "any" ? t("anyPrice") : t("under", { price: names.price(o).replace(/[.,]00(?=\D|$)/, "") })}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-network" className={labelClass}>
          {t("network")}
        </label>
        <select
          id="filter-network"
          value={filters.network}
          onChange={(e) => onChange({ ...filters, network: e.target.value })}
          className={selectClass}
        >
          <option value="all">{t("allNetworks")}</option>
          {networks.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center justify-between text-sm font-medium text-ink">
        {t("unlimitedOnly")}
        <input
          type="checkbox"
          checked={filters.unlimitedOnly}
          onChange={(e) => onChange({ ...filters, unlimitedOnly: e.target.checked })}
          className="size-4 accent-orange"
        />
      </label>

      <label className="flex items-center justify-between text-sm font-medium text-ink">
        {t("fiveG")}
        <input
          type="checkbox"
          checked={filters.fiveGOnly}
          onChange={(e) => onChange({ ...filters, fiveGOnly: e.target.checked })}
          className="size-4 accent-orange"
        />
      </label>
    </aside>
  );
}
