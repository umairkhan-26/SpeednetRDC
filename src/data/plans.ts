import type { Plan, RegionSlug } from "@/lib/types";
import raw from "./generated/plans.json";

// Generated from the provider's real plans.json + zones.json — see
// scripts/generate-data.mjs. Re-run that script after a new data drop.
export const plans: Plan[] = raw as Plan[];

export function getPlanById(id: string) {
  return plans.find((p) => p.id === id);
}

export function getPlansForCountry(countrySlug: string) {
  return plans.filter((p) => p.scope === "country" && p.countrySlug === countrySlug);
}

export function getPlansForRegion(regionSlug: RegionSlug) {
  return plans.filter((p) => p.scope === "regional" && p.regionSlug === regionSlug);
}

/** Global plans, optionally filtered to one tier ("budget" = Global, "premium" = Global Plus). */
export function getGlobalPlans(tier?: "budget" | "premium") {
  return plans.filter((p) => p.scope === "global" && (!tier || p.globalTier === tier));
}
