import type { Plan } from "@/lib/types";
import { getCountryBySlug } from "@/data/countries";
import { getRegionBySlug } from "@/data/regions";
import { formatPrice as formatPriceEur } from "@/lib/format";
import { isoForPlace } from "@/lib/sims/coverage";
import { languageTag } from "./routing";

// Names that come from data rather than translation files: countries,
// regions, plan names ("Albania 1GB / 7 Days"), data amounts, durations and
// prices. They're shown in a language's own words only for languages whose
// pages are fully translated, so a page never mixes English text with
// translated names. Add a language here once its pages are fully translated.
// (French and Spanish joined on 23 Nov 2026, once every text key was translated.)
const LOCALIZED_NAME_LOCALES = new Set(["fr", "es", "pt"]);

export function localizesNames(locale: string): boolean {
  return LOCALIZED_NAME_LOCALES.has(locale);
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

/** Where the browser's standard name reads awkwardly on a travel site ("Hong Kong, RAE da China"). */
const NAME_OVERRIDES: Record<string, Record<string, string>> = {
  fr: { CD: "RD Congo", HK: "Hong Kong", MO: "Macao" },
  es: { CD: "RD Congo", HK: "Hong Kong", MO: "Macao" },
  pt: { CI: "Costa do Marfim", HK: "Hong Kong", MO: "Macau" },
};

/** The provider's "Netherlands Antilles" has no ISO code any more, so it is matched by its English name. */
const NAME_OVERRIDES_BY_ENGLISH_NAME: Record<string, Record<string, string>> = {
  fr: { "Netherlands Antilles": "Antilles néerlandaises" },
  es: { "Netherlands Antilles": "Antillas Neerlandesas" },
  pt: { "Netherlands Antilles": "Antilhas Holandesas" },
};

const displayNames = new Map<string, Intl.DisplayNames | null>();

function regionDisplayNames(locale: string): Intl.DisplayNames | null {
  if (!displayNames.has(locale)) {
    try {
      displayNames.set(locale, new Intl.DisplayNames([languageTag(locale)], { type: "region", fallback: "none" }));
    } catch {
      displayNames.set(locale, null);
    }
  }
  return displayNames.get(locale) ?? null;
}

/** The labels formatter for one language. `tFormat` / `tRegions` are translators for the "format" and "regions" namespaces. */
export function createNames(locale: string, tFormat: Translate, tRegions: Translate) {
  const localized = localizesNames(locale);

  const country = (c: { name: string; iso: string }): string => {
    if (!localized) return c.name;
    const iso = c.iso.toUpperCase();
    const name =
      NAME_OVERRIDES_BY_ENGLISH_NAME[locale]?.[c.name] ??
      NAME_OVERRIDES[locale]?.[iso] ??
      (iso.length === 2 ? regionDisplayNames(locale)?.of(iso) : undefined);
    return name || c.name;
  };

  /** A list of place names as the catalogue spells them (English) → this language, sorted for the reader. */
  const countryList = (englishNames: string[]): string[] => {
    const mapped = englishNames.map((n) => country({ name: n, iso: isoForPlace(n) ?? "" }));
    return localized ? mapped.sort((a, b) => a.localeCompare(b, languageTag(locale))) : mapped;
  };

  const region = (slug: string, englishName?: string): string => {
    const fallback = englishName ?? getRegionBySlug(slug)?.name ?? slug;
    return localized ? tRegions(slug) : fallback;
  };

  const data = (gb: number | "unlimited"): string =>
    gb === "unlimited" ? tFormat("unlimited") : gb < 1 ? `${Math.round(gb * 1000)}MB` : `${String(gb).replace(".", localized ? "," : ".")}GB`;

  const validity = (days: number): string => tFormat("days", { count: days });

  const price = (amount: number): string =>
    localized
      ? new Intl.NumberFormat(languageTag(locale), { style: "currency", currency: "EUR" }).format(amount)
      : formatPriceEur(amount);

  /** "Albania", "Europe", "Global Plus"… */
  const planArea = (plan: Plan): string => {
    if (plan.scope === "country" && plan.countrySlug && !plan.zone) {
      const c = getCountryBySlug(plan.countrySlug);
      if (c) return country(c);
    }
    if (plan.scope === "global") return plan.globalTier === "premium" ? tFormat("globalPlus") : tFormat("global");
    if (plan.zone) return localized ? tRegions(plan.zone) : (plan.zoneName ?? plan.name);
    if (plan.regionSlug) return region(plan.regionSlug);
    return plan.name;
  };

  /** "Albania 1GB / 7 Days" in this language; English keeps the catalogue name as-is. */
  const planName = (plan: Plan): string =>
    localized ? tFormat("planName", { area: planArea(plan), data: data(plan.dataAmountGb), validity: validity(plan.validityDays) }) : plan.name;

  return { locale, localized, country, countryList, region, data, validity, price, planArea, planName };
}

export type Names = ReturnType<typeof createNames>;
