"use client";

import { useTranslations } from "next-intl";
import type { SortOption } from "@/lib/filter-plans";

const options: SortOption[] = ["recommended", "price", "data", "validity", "value"];

export default function SortControl({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  const t = useTranslations("sort");
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="sort" className="text-muted">
        {t("sortBy")}
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-line bg-white px-3 py-2 font-medium text-ink outline-none focus:border-orange"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {t(o)}
          </option>
        ))}
      </select>
    </div>
  );
}
