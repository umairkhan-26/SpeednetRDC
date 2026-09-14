import { devices, getModelsForBrand } from "@/data/devices";
import type { DeviceBrand, DeviceModel } from "./types";

export const deviceBrands: DeviceBrand[] = ["Apple", "Samsung", "Google", "Xiaomi", "Motorola", "Other"];

export function listModelsForBrand(brand: DeviceBrand): DeviceModel[] {
  return getModelsForBrand(brand);
}

export function checkCompatibility(brand: DeviceBrand, model: string): DeviceModel | undefined {
  return devices.find((d) => d.brand === brand && d.model === model);
}
