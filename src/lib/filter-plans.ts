import { getCountryBySlug } from "@/data/countries";
import type { Plan, RegionSlug } from "./types";

export type SortOption = "recommended" | "price" | "data" | "validity" | "value";

export interface PlanFilters {
  destination: string;
  region: RegionSlug | "all";
  minData: "any" | 1 | 3 | 5 | 10 | 15 | 20;
  duration: "any" | 3 | 5 | 7 | 10 | 15 | 30;
  maxPrice: "any" | 10 | 25 | 50 | 100;
  network: "all" | string;
  unlimitedOnly: boolean;
  fiveGOnly: boolean;
  sort: SortOption;
}

export const defaultFilters: PlanFilters = {
  destination: "",
  region: "all",
  minData: "any",
  duration: "any",
  maxPrice: "any",
  network: "all",
  unlimitedOnly: false,
  fiveGOnly: false,
  sort: "recommended",
};

function planRegion(plan: Plan): RegionSlug | undefined {
  if (plan.regionSlug) return plan.regionSlug;
  if (plan.countrySlug) return getCountryBySlug(plan.countrySlug)?.region;
  return undefined;
}

function planMatchesDestination(plan: Plan, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (plan.name.toLowerCase().includes(q)) return true;
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;
  if (country?.name.toLowerCase().includes(q)) return true;
  if (q === "global" && plan.scope === "global") return true;
  const region = planRegion(plan);
  if (region?.replace("-", " ").includes(q)) return true;
  return false;
}

function dataValueGb(amount: Plan["dataAmountGb"]): number {
  return amount === "unlimited" ? Number.POSITIVE_INFINITY : amount;
}

export function filterAndSortPlans(plans: Plan[], filters: PlanFilters): Plan[] {
  let result = plans.filter((plan) => {
    if (!planMatchesDestination(plan, filters.destination)) return false;
    if (filters.region !== "all" && planRegion(plan) !== filters.region) return false;
    if (filters.network !== "all" && plan.network !== filters.network) return false;
    if (filters.unlimitedOnly && plan.dataAmountGb !== "unlimited") return false;
    if (filters.fiveGOnly && !plan.speed.includes("5G")) return false;
    if (filters.minData !== "any" && dataValueGb(plan.dataAmountGb) < filters.minData) return false;
    if (filters.duration !== "any" && plan.validityDays !== filters.duration) return false;
    if (filters.maxPrice !== "any" && plan.price > filters.maxPrice) return false;
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "price":
        return a.price - b.price;
      case "data":
        return dataValueGb(b.dataAmountGb) - dataValueGb(a.dataAmountGb);
      case "validity":
        return b.validityDays - a.validityDays;
      case "value": {
        const aValue = a.price / (dataValueGb(a.dataAmountGb) || 1);
        const bValue = b.price / (dataValueGb(b.dataAmountGb) || 1);
        return aValue - bValue;
      }
      case "recommended":
      default:
        return Number(b.bestValue ?? false) - Number(a.bestValue ?? false) || a.price - b.price;
    }
  });

  return result;
}
