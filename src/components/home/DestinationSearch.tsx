"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Globe, Search } from "lucide-react";
import { searchCountries } from "@/data/countries";
import { searchSuggestions } from "@/data/popular-destinations";

export default function DestinationSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations("home.hero");

  const results = useMemo(() => searchCountries(query).slice(0, 6), [query]);

  function goToStore(term: string) {
    router.push(`/esim-store?destination=${encodeURIComponent(term)}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToStore(query || "Global");
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
              onClick={() => goToStore(c.name)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-cream"
            >
              <span className="flex size-5 items-center justify-center rounded bg-cream text-[9px] font-bold text-ink">
                {c.iso}
              </span>
              <span className="font-medium text-ink">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {searchSuggestions.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => goToStore(s.name)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white/85 transition-colors hover:border-white/50 hover:text-white"
          >
            {s.code === "GLOBAL" ? (
              <Globe className="size-3" />
            ) : (
              <span className="text-[10px] font-bold text-orange-soft">{s.code}</span>
            )}
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
