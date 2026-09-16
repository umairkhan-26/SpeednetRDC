"use client";

import { useMemo, useState } from "react";
import { countries } from "@/data/countries";
import { regions } from "@/data/regions";
import CountryCard from "@/components/destinations/CountryCard";
import { Search } from "lucide-react";

export default function DestinationsClient() {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regions
      .filter((r) => r.slug !== "global")
      .map((region) => ({
        region,
        countries: countries.filter(
          (c) => c.region === region.slug && (!q || c.name.toLowerCase().includes(q)),
        ),
      }))
      .filter((group) => group.countries.length > 0);
  }, [query]);

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Every country, one tap away</h1>
        <p className="mt-3 text-muted">
          Browse eSIM data plans in 190+ destinations, grouped by region.
        </p>
      </div>

      <div className="relative mt-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter countries..."
          className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange"
        />
      </div>

      <div className="mt-12 flex flex-col gap-14">
        {grouped.map(({ region, countries: regionCountries }) => (
          <div key={region.slug}>
            <h2 className="text-xl font-bold text-ink">{region.name}</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {regionCountries.map((c) => (
                <CountryCard key={c.slug} country={c} />
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="py-16 text-center text-muted">No countries match &ldquo;{query}&rdquo;.</p>
        )}
      </div>
    </div>
  );
}
