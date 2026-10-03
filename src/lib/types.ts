export type RegionSlug =
  | "africa"
  | "americas"
  | "asia"
  | "caribbean"
  | "europe"
  | "global"
  | "latin-america"
  | "middle-east"
  | "oceania"
  | "north-america";

export interface Region {
  slug: RegionSlug;
  name: string;
  countryCount: number;
  fromPrice: number;
}

export interface Country {
  slug: string;
  name: string;
  region: RegionSlug;
  iso: string;
  heroImage: string;
  tagline: string;
  fromPrice: number;
  networks: string[];
  networkCount: number;
  speed: "4G" | "4G/5G" | "5G";
  popular?: boolean;
}

export interface Plan {
  /**
   * Internal identifier, used for routing and lookup (getPlanById).
   *
   * IMPORTANT: this is also Transatel's exact Technical Reference /
   * productId, passed straight through from their catalog export (see
   * scripts/generate-data.mjs, `id: p.technical_reference`). Never rename
   * or regenerate this value without updating
   * src/lib/transatel/product.ts, and never read `plan.id` directly when
   * calling Transatel's API — use getTransatelProductId(plan) instead, so
   * a future refactor that renames `id` fails loudly there instead of
   * silently breaking order placement.
   */
  id: string;
  scope: "country" | "regional" | "global";
  countrySlug?: string;
  regionSlug?: RegionSlug;
  name: string;
  dataAmountGb: number | "unlimited";
  validityDays: number;
  price: number;
  network: string;
  speed: "4G" | "4G/5G" | "5G";
  hotspot: boolean;
  bestValue?: boolean;
  badge?: "price-drop" | "new";
  globalTier?: "budget" | "premium";
  countriesIncluded?: string[];
}

export interface FaqItem {
  /** Stable id, used by the chat helper to pick questions. */
  id?: string;
  question: string;
  answer: string;
}

export type DeviceBrand =
  | "Apple"
  | "Samsung"
  | "Google"
  | "Xiaomi"
  | "Motorola"
  | "Other";

export interface DeviceModel {
  brand: DeviceBrand;
  model: string;
  esimCompatible: boolean;
  carrierLockWarning?: boolean;
  notes?: string;
}

