"use client";

import type { SortOption } from "@/lib/filter-plans";

const options: { label: string; value: SortOption }[] = [
  { label: "Recommended", value: "recommended" },
  { label: "Lowest price", value: "price" },
  { label: "Most data", value: "data" },
  { label: "Longest validity", value: "validity" },
  { label: "Best value", value: "value" },
];

export default function SortControl({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="sort" className="text-muted">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-line bg-white px-3 py-2 font-medium text-ink outline-none focus:border-orange"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
