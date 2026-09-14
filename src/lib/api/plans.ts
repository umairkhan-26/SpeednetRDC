import {
  getGlobalPlans,
  getPlanById,
  getPlansForCountry,
  getPlansForRegion,
} from "@/data/plans";
import type { RegionSlug } from "../types";
import { simulateLatency } from "./client";

export async function fetchPlan(id: string) {
  return simulateLatency(getPlanById(id) ?? null);
}

export async function fetchPlansForCountry(countrySlug: string) {
  return simulateLatency(getPlansForCountry(countrySlug));
}

export async function fetchPlansForRegion(regionSlug: RegionSlug) {
  return simulateLatency(getPlansForRegion(regionSlug));
}

export async function fetchGlobalPlans() {
  return simulateLatency(getGlobalPlans());
}
