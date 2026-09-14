import type { Region } from "@/lib/types";
import raw from "./generated/regions.json";

// Generated from the provider's real plans.json + zones.json — see
// scripts/generate-data.mjs. Re-run that script after a new data drop.
export const regions: Region[] = raw as Region[];

export function getRegionBySlug(slug: string) {
  return regions.find((r) => r.slug === slug);
}
