import type { Plan } from "@/lib/types";
import { getCountryBySlug } from "@/data/countries";
import { getRegionBySlug } from "@/data/regions";

// Mirrors the display logic in OrderSummarySidebar so the order stored in
// the DB shows the same destination the customer saw at checkout, across
// all three plan scopes (country / regional / global).
export function resolveDestination(plan: Plan): { name: string; code: string } {
  if (plan.countrySlug) {
    const country = getCountryBySlug(plan.countrySlug);
    if (country) return { name: country.name, code: country.iso };
  }
  if (plan.regionSlug) {
    const region = getRegionBySlug(plan.regionSlug);
    if (region) return { name: region.name, code: plan.regionSlug.toUpperCase().slice(0, 8) };
  }
  return { name: "Global", code: "GLOBAL" };
}
