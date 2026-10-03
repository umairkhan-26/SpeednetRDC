"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { plans } from "@/data/plans";
import { defaultFilters, filterAndSortPlans, type PlanFilters } from "@/lib/filter-plans";
import FilterSidebar from "@/components/plans/FilterSidebar";
import SortControl from "@/components/plans/SortControl";
import PlanCard from "@/components/plans/PlanCard";
import { useNames } from "@/i18n/use-names";
import { SearchX } from "lucide-react";

export default function EsimStoreClient() {
  const t = useTranslations("store");
  const names = useNames();
  const searchParams = useSearchParams();
  const initialDestination = searchParams.get("destination") ?? "";

  const [filters, setFilters] = useState<PlanFilters>({
    ...defaultFilters,
    destination: initialDestination,
  });

  const allResults = useMemo(
    () => filterAndSortPlans(plans, filters, names.localized ? (plan) => [names.planArea(plan), names.planName(plan)] : undefined),
    [filters, names]
  );
  const CAP = 60;
  const results = allResults.slice(0, CAP);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          {t("title", { destination: filters.destination || t("everywhere") })}
        </h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
        <p className="mt-1 text-sm font-medium text-orange">
          {t("found", { count: allResults.length })}
          {allResults.length > CAP && t("capped", { cap: CAP })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar filters={filters} onChange={setFilters} />

        <div>
          <div className="mb-5 flex justify-end">
            <SortControl value={filters.sort} onChange={(sort) => setFilters({ ...filters, sort })} />
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white py-20 text-center">
              <SearchX className="size-8 text-muted" />
              <p className="font-semibold text-ink">{t("noResultsTitle")}</p>
              <p className="text-sm text-muted">{t("noResultsText")}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
