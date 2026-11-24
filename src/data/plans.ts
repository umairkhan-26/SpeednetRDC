import type { Plan, RegionSlug } from "@/lib/types";
import raw from "./generated/plans.json";
import retiredRaw from "./generated/retired-plans.json";

// Generated from the provider's real plans.json + zones.json — see
// scripts/generate-data.mjs. Re-run that script after a new data drop.
export const plans: Plan[] = raw as Plan[];

export function getPlanById(id: string) {
  return plans.find((p) => p.id === id);
}

/**
 * Plans Transatel has closed ("Closed" in the price grid): never for sale, so
 * plan pages and the checkout (getPlanById) don't know them, but customers who
 * already bought one keep their order page, coverage list and email.
 */
export const retiredPlans: Plan[] = retiredRaw as Plan[];

/** A plan for an EXISTING order or SIM: on sale or closed. Never use this for selling. */
export function getPlanForOrder(id: string) {
  return getPlanById(id) ?? retiredPlans.find((p) => p.id === id);
}

export function getPlansForCountry(countrySlug: string) {
  return plans.filter((p) => p.scope === "country" && p.countrySlug === countrySlug);
}

/**
 * Regional and global plans whose coverage includes this country: the
 * cheapest plan of each such product, cheapest first. Shown on country pages
 * so travellers see every option that works there.
 */
export function getMultiCountryPlansCovering(countryName: string, limit = 4) {
  const cheapestPerProduct = new Map<string, (typeof plans)[number]>();
  for (const p of plans) {
    if (p.scope === "country" || !p.countriesIncluded?.includes(countryName)) continue;
    const key = p.zone ?? `global:${p.globalTier}`;
    const current = cheapestPerProduct.get(key);
    if (!current || p.price < current.price) cheapestPerProduct.set(key, p);
  }
  return [...cheapestPerProduct.values()].sort((a, b) => a.price - b.price).slice(0, limit);
}

export function getPlansForRegion(regionSlug: RegionSlug) {
  return plans.filter((p) => p.scope === "regional" && p.regionSlug === regionSlug);
}

/** Global plans, optionally filtered to one tier ("budget" = Global, "premium" = Global Plus). */
export function getGlobalPlans(tier?: "budget" | "premium") {
  return plans.filter((p) => p.scope === "global" && (!tier || p.globalTier === tier));
}
