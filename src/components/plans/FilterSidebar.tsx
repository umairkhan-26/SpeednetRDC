"use client";

import { regions } from "@/data/regions";
import { countries } from "@/data/countries";
import type { PlanFilters } from "@/lib/filter-plans";

const dataOptions: { label: string; value: PlanFilters["minData"] }[] = [
  { label: "Any data", value: "any" },
  { label: "1GB+", value: 1 },
  { label: "3GB+", value: 3 },
  { label: "5GB+", value: 5 },
  { label: "10GB+", value: 10 },
  { label: "15GB+", value: 15 },
  { label: "20GB+", value: 20 },
];

const durationOptions: { label: string; value: PlanFilters["duration"] }[] = [
  { label: "Any duration", value: "any" },
  { label: "3 days", value: 3 },
  { label: "5 days", value: 5 },
  { label: "7 days", value: 7 },
  { label: "10 days", value: 10 },
  { label: "15 days", value: 15 },
  { label: "30 days", value: 30 },
];

const maxPriceOptions: { label: string; value: PlanFilters["maxPrice"] }[] = [
  { label: "Any price", value: "any" },
  { label: "Under €10", value: 10 },
  { label: "Under €25", value: 25 },
  { label: "Under €50", value: 50 },
  { label: "Under €100", value: 100 },
];

const networkOptions = ["All networks", ...Array.from(new Set(countries.flatMap((c) => c.networks))).sort()];

export default function FilterSidebar({
  filters,
  onChange,
}: {
  filters: PlanFilters;
  onChange: (next: PlanFilters) => void;
}) {
  return (
    <aside className="flex h-max flex-col gap-6 rounded-2xl border border-line bg-white p-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Destination
        </label>
        <input
          type="text"
          value={filters.destination}
          onChange={(e) => onChange({ ...filters, destination: e.target.value })}
          placeholder="Search country or region"
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-orange"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Region
        </label>
        <select
          value={filters.region}
          onChange={(e) => onChange({ ...filters, region: e.target.value as PlanFilters["region"] })}
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Data amount
        </label>
        <select
          value={String(filters.minData)}
          onChange={(e) =>
            onChange({
              ...filters,
              minData: (e.target.value === "any" ? "any" : Number(e.target.value)) as PlanFilters["minData"],
            })
          }
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
        >
          {dataOptions.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Duration
        </label>
        <select
          value={String(filters.duration)}
          onChange={(e) =>
            onChange({
              ...filters,
              duration: (e.target.value === "any" ? "any" : Number(e.target.value)) as PlanFilters["duration"],
            })
          }
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
        >
          {durationOptions.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Max price
        </label>
        <select
          value={String(filters.maxPrice)}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: (e.target.value === "any" ? "any" : Number(e.target.value)) as PlanFilters["maxPrice"],
            })
          }
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
        >
          {maxPriceOptions.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Network
        </label>
        <select
          value={filters.network}
          onChange={(e) => onChange({ ...filters, network: e.target.value === "All networks" ? "all" : e.target.value })}
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
        >
          {networkOptions.map((n) => (
            <option key={n} value={n === "All networks" ? "all" : n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center justify-between text-sm font-medium text-ink">
        Unlimited data only
        <input
          type="checkbox"
          checked={filters.unlimitedOnly}
          onChange={(e) => onChange({ ...filters, unlimitedOnly: e.target.checked })}
          className="size-4 accent-orange"
        />
      </label>

      <label className="flex items-center justify-between text-sm font-medium text-ink">
        5G available
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
