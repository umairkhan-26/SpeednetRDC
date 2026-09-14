import { checkCompatibility, listModelsForBrand } from "../device-compatibility";
import type { DeviceBrand } from "../types";
import { simulateLatency } from "./client";

export async function fetchModelsForBrand(brand: DeviceBrand) {
  return simulateLatency(listModelsForBrand(brand), 200);
}

export async function fetchCompatibility(brand: DeviceBrand, model: string) {
  return simulateLatency(checkCompatibility(brand, model) ?? null, 200);
}
