import type { DeviceModel } from "@/lib/types";

export const devices: DeviceModel[] = [
  // Apple — eSIM shipped from iPhone XS/XR (2018) onward
  { brand: "Apple", model: "iPhone 17 Pro / Pro Max", esimCompatible: true },
  { brand: "Apple", model: "iPhone 17 / Air", esimCompatible: true },
  { brand: "Apple", model: "iPhone 16 Pro / Pro Max", esimCompatible: true },
  { brand: "Apple", model: "iPhone 16 / 16 Plus", esimCompatible: true },
  { brand: "Apple", model: "iPhone 15 Pro / Pro Max", esimCompatible: true },
  { brand: "Apple", model: "iPhone 15 / 15 Plus", esimCompatible: true },
  { brand: "Apple", model: "iPhone 14 Pro / Pro Max", esimCompatible: true },
  { brand: "Apple", model: "iPhone 14 / 14 Plus", esimCompatible: true },
  { brand: "Apple", model: "iPhone 13 series", esimCompatible: true },
  { brand: "Apple", model: "iPhone 12 series", esimCompatible: true },
  { brand: "Apple", model: "iPhone 11 series", esimCompatible: true },
  { brand: "Apple", model: "iPhone XS / XS Max / XR", esimCompatible: true },
  { brand: "Apple", model: "iPhone SE (2nd gen or later)", esimCompatible: true },
  { brand: "Apple", model: "iPhone SE (1st gen)", esimCompatible: false },
  { brand: "Apple", model: "iPhone X / 8 / 8 Plus or earlier", esimCompatible: false },

  // Samsung — Galaxy S20+ and select Note/Z-series, region and carrier dependent
  { brand: "Samsung", model: "Galaxy S25 series", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy S24 series", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy S23 series", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy S22 series", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy S21 series", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy S20 series", esimCompatible: true, carrierLockWarning: true, notes: "Some carrier variants ship eSIM-locked to that carrier." },
  { brand: "Samsung", model: "Galaxy Z Fold / Z Flip (all generations)", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy Note 20 series", esimCompatible: true },
  { brand: "Samsung", model: "Galaxy S10 series or earlier", esimCompatible: false },
  { brand: "Samsung", model: "Galaxy A-series (budget line)", esimCompatible: false, notes: "Most A-series phones do not include an eSIM chip." },

  // Google — Pixel 3 onward, with a 3a gap
  { brand: "Google", model: "Pixel 9 series", esimCompatible: true },
  { brand: "Google", model: "Pixel 8 series", esimCompatible: true },
  { brand: "Google", model: "Pixel 7 series", esimCompatible: true },
  { brand: "Google", model: "Pixel 6 series", esimCompatible: true },
  { brand: "Google", model: "Pixel 5", esimCompatible: true },
  { brand: "Google", model: "Pixel 4 series", esimCompatible: true },
  { brand: "Google", model: "Pixel 3 / 3 XL", esimCompatible: true },
  { brand: "Google", model: "Pixel 3a / 3a XL", esimCompatible: false, notes: "The 3a line shipped without an eSIM chip." },

  // Xiaomi — limited, flagship-only, region dependent
  { brand: "Xiaomi", model: "Xiaomi 14 / 14 Ultra", esimCompatible: true, carrierLockWarning: true, notes: "eSIM support varies by region — confirm your unit was sold in an eSIM-enabled market." },
  { brand: "Xiaomi", model: "Xiaomi 13 / 13 Pro", esimCompatible: true, carrierLockWarning: true, notes: "eSIM support varies by region — confirm your unit was sold in an eSIM-enabled market." },
  { brand: "Xiaomi", model: "Redmi / Poco series", esimCompatible: false, notes: "Redmi and Poco phones do not currently ship with eSIM." },
  { brand: "Xiaomi", model: "Other Xiaomi model", esimCompatible: false },

  // Motorola — mainly Razr foldables
  { brand: "Motorola", model: "Razr / Razr+ (all generations)", esimCompatible: true },
  { brand: "Motorola", model: "Edge 40 / 50 series", esimCompatible: true },
  { brand: "Motorola", model: "Moto G series", esimCompatible: false, notes: "The G line does not include an eSIM chip." },
  { brand: "Motorola", model: "Other Motorola model", esimCompatible: false },

  { brand: "Other", model: "My device isn't listed", esimCompatible: false, notes: "We couldn't confirm eSIM support automatically — check your device settings for \"Add eSIM\" under Mobile/Cellular, or contact support." },
];

export function getModelsForBrand(brand: string) {
  return devices.filter((d) => d.brand === brand);
}
