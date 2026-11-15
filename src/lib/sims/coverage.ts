import { countries } from "@/data/countries";
import { getPlanById } from "@/data/plans";

// Places that plans cover but that have no country page of their own.
const EXTRA_ISO: Record<string, string> = {
  Anguilla: "AI",
  "Antigua and Barbuda": "AG",
  Barbados: "BB",
  Bermuda: "BM",
  Bonaire: "BQ",
  "British Virgin Islands": "VG",
  "Cayman Islands": "KY",
  Dominica: "DM",
  Grenada: "GD",
  Haiti: "HT",
  Jamaica: "JM",
  Montserrat: "MS",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC",
  "Turks and Caicos Islands": "TC",
  "Sint Maarten (Dutch part)": "SX",
  "Puerto Rico": "PR",
};
const NAME_TO_ISO = new Map(countries.map((c) => [c.name, c.iso.toUpperCase()]));

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
