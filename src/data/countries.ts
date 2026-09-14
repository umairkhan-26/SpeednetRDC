import type { Country } from "@/lib/types";
import raw from "./generated/countries.json";

// Generated from the provider's real plans.json + zones.json — see
// scripts/generate-data.mjs. Re-run that script after a new data drop.
export const countries: Country[] = raw as Country[];

export function getCountryBySlug(slug: string) {
  return countries.find((c) => c.slug === slug);
}

export function getCountriesByRegion(region: string) {
  return countries.filter((c) => c.region === region);
}

export function searchCountries(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return countries.filter((c) => c.name.toLowerCase().includes(q));
}
