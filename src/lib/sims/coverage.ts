import { countries } from "@/data/countries";
import { getPlanById } from "@/data/plans";
import extraPlaces from "@/data/extra-place-iso.json";

// Places that plans cover but that have no country page of their own (name -> ISO code).
// Kept in a JSON file so scripts/catalog-guard.mjs reads the same list.
const EXTRA_ISO: Record<string, string> = extraPlaces;
const NAME_TO_ISO = new Map(countries.map((c) => [c.name, c.iso.toUpperCase()]));

/** ISO code of a place named in a plan's coverage list, when we know it. */
export function isoForPlace(name: string): string | undefined {
  return NAME_TO_ISO.get(name) ?? EXTRA_ISO[name];
}

/**
 * True when a SIM was last seen in a country its plan does not cover (the
 * customer probably has no data there). False when we cannot tell: unknown
 * plan, unknown country, or a covered place we cannot map to a country code.
 */
export function seenOutsidePlanCoverage(planId: string | null, lastCountryIso: string | null): boolean {
  if (!planId || !lastCountryIso) return false;
  const covered = getPlanById(planId)?.countriesIncluded;
  if (!covered?.length) return false;
  const iso = covered.map((name) => NAME_TO_ISO.get(name) ?? EXTRA_ISO[name]);
  if (iso.some((code) => !code)) return false;
  return !iso.includes(lastCountryIso.toUpperCase());
}
