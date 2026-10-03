"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { countries } from "@/data/countries";
import { regions } from "@/data/regions";
import CountryCard from "@/components/destinations/CountryCard";
import { useNames } from "@/i18n/use-names";
import { Search } from "lucide-react";

export default function DestinationsClient() {
  const t = useTranslations("destinations");
  const names = useNames();
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (c: (typeof countries)[number]) =>
      !q || c.name.toLowerCase().includes(q) || names.country(c).toLowerCase().includes(q);
    return regions
      .filter((r) => r.slug !== "global")
      .map((region) => ({
        region,
        countries: countries
          .filter((c) => c.region === region.slug && matches(c))
          .sort((a, b) => names.country(a).localeCompare(names.country(b), names.locale)),
      }))
      .filter((group) => group.countries.length > 0);
  }, [query, names]);

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
      </div>

      <div className="relative mt-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filterPlaceholder")}
          aria-label={t("filterPlaceholder")}
          className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange"
        />
      </div>

      <div className="mt-12 flex flex-col gap-14">
        {grouped.map(({ region, countries: regionCountries }) => (
          <div key={region.slug}>
            <h2 className="text-xl font-bold text-ink">{names.region(region.slug, region.name)}</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {regionCountries.map((c) => (
                <CountryCard key={c.slug} country={c} />
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <p className="py-16 text-center text-muted">{t("noMatch", { query })}</p>}
      </div>
    </div>
  );
}
