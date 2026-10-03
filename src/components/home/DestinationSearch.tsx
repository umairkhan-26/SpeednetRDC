"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Globe, Search } from "lucide-react";
import { countries, searchCountries } from "@/data/countries";
import { searchSuggestions } from "@/data/popular-destinations";
import { useNames } from "@/i18n/use-names";

export default function DestinationSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations("home.hero");
  const tFormat = useTranslations("format");
  const names = useNames();

  // Translated pages also match (and show) country names in their own language.
  const results = useMemo(() => {
    if (!names.localized) return searchCountries(query).slice(0, 6).map((c) => ({ ...c, label: c.name }));
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return countries
      .map((c) => ({ ...c, label: names.country(c) }))
      .filter((c) => c.label.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, names]);

  function goToStore(term: string) {
    router.push(`/esim-store?destination=${encodeURIComponent(term)}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToStore(query || tFormat("global"));
        }}
        className="relative flex items-center rounded-full bg-white p-1.5 shadow-xl"
      >
        <Search className="ml-4 size-5 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-soft"
        >
          {t("search")}
        </button>
      </form>

      {focused && query && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          {results.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => goToStore(c.label)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-cream"
            >
              <span className="flex size-5 items-center justify-center rounded bg-cream text-[9px] font-bold text-ink">
                {c.iso}
              </span>
              <span className="font-medium text-ink">{c.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {searchSuggestions.map((s) => {
          const label = s.code === "GLOBAL" ? tFormat("global") : names.country({ name: s.name, iso: s.code });
          return (
          <button
            key={s.name}
            type="button"
            onClick={() => goToStore(label)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white/85 transition-colors hover:border-white/50 hover:text-white"
          >
            {s.code === "GLOBAL" ? (
              <Globe className="size-3" />
            ) : (
              <span className="text-[10px] font-bold text-orange-soft">{s.code}</span>
            )}
            {label}
          </button>
          );
        })}
      </div>
    </div>
  );
}
