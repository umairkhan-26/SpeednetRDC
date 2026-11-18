import { countries, getCountryBySlug } from "@/data/countries";
import { plans } from "@/data/plans";
import { isoForPlace } from "@/lib/sims/coverage";
import type { Plan } from "@/lib/types";

/** A place a plan works in (or is missing from). `iso` lets us show its name in the visitor's language. */
export interface Place {
  name: string;
  iso?: string;
}

// A "Not included" list only helps when it is short and the plan covers a real
// area: a two-country plan next to 27 other Asian countries is just noise.
const MIN_COVERED_FOR_LEFT_OUT = 5;
const MAX_REGIONAL_LEFT_OUT = 30;

// "The Americas" plans span three of our regions.
const REGION_GROUPS: Record<string, string[]> = {
  americas: ["latin-america", "north-america", "caribbean"],
};

const place = (name: string): Place => ({ name, iso: isoForPlace(name) });
const keyOf = (p: Place) => (p.iso ?? p.name).toLowerCase();
const byName = (a: Place, b: Place) => a.name.localeCompare(b.name);

/** Every place the plan works in. A plain country plan is just that one country. */
export function coveredPlaces(plan: Plan): Place[] {
  if (plan.countriesIncluded?.length) return plan.countriesIncluded.map(place);
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;
  return country ? [{ name: country.name, iso: country.iso.toUpperCase() }] : [];
}

const leftOutCache = new Map<string, Place[]>();

/**
 * Places in the same area that this plan does NOT cover, so nobody assumes
 * "French Caribbean" means "all of the Caribbean". Empty for country plans.
 */
export function leftOutPlaces(plan: Plan): Place[] {
  const cached = leftOutCache.get(plan.id);
  if (cached) return cached;

  let result: Place[] = [];
  if (plan.scope !== "country") {
    const covered = new Set(coveredPlaces(plan).map(keyOf));
    const universe = new Map<string, Place>();
    const add = (p: Place) => universe.set(keyOf(p), p);

    if (plan.scope === "global") {
      for (const c of countries) add({ name: c.name, iso: c.iso.toUpperCase() });
    } else if (plan.regionSlug) {
      const regions = REGION_GROUPS[plan.regionSlug] ?? [plan.regionSlug];
      for (const c of countries) if (regions.includes(c.region)) add({ name: c.name, iso: c.iso.toUpperCase() });
      // Places only other plans of this region cover (e.g. Aruba, Jamaica).
      for (const p of plans) {
        if (p.scope === "regional" && p.regionSlug === plan.regionSlug) for (const name of p.countriesIncluded ?? []) add(place(name));
      }
    }

    result = [...universe.entries()].filter(([key]) => !covered.has(key)).map(([, p]) => p).sort(byName);
    if (plan.scope === "regional" && (covered.size < MIN_COVERED_FOR_LEFT_OUT || result.length > MAX_REGIONAL_LEFT_OUT)) result = [];
  }
  leftOutCache.set(plan.id, result);
  return result;
}
