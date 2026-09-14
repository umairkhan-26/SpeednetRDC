import { countries, getCountryBySlug, searchCountries } from "@/data/countries";
import { regions } from "@/data/regions";
import { simulateLatency } from "./client";

export async function fetchCountries() {
  return simulateLatency(countries);
}

export async function fetchCountry(slug: string) {
  return simulateLatency(getCountryBySlug(slug) ?? null);
}

export async function fetchRegions() {
  return simulateLatency(regions);
}

export async function searchDestinations(query: string) {
  return simulateLatency(searchCountries(query), 150);
}
