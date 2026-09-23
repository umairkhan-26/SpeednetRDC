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

export type OrderStatus = "Paid" | "Refunded" | "Failed";

export interface Order {
  id: string;
  countrySlug?: string;
  countryName: string;
  iso: string;
  planName: string;
  dataAmountGb: number | "unlimited";
  validityDays: number;
  price: number;
  purchaseDate: string;
  status: OrderStatus;
}

export type EsimStatus = "Active" | "Not Installed" | "Expired" | "Inactive";

export interface ActiveEsim {
  iccid: string;
  countrySlug: string;
  countryName: string;
  iso: string;
  status: EsimStatus;
  connectivity?: string;
  dataUsedGb: number;
  dataTotalGb: number | "unlimited";
  expiresInDays: number;
  activationDate: string;
  expirationDate: string;
  network: string;
  coverageCountries: number;
  apn: string;
  dataRoaming: "ON (required)" | "OFF";
  networkSelection: "Automatic" | "Manual";
  preferredNetwork: "5G/LTE" | "LTE" | "5G";
  lineLabel: string;
  activationCode: string;
  qrCodeUrl: string;
  smDpAddress: string;
}

export interface TopUpPackage {
  id: string;
  dataGb: number;
  price: number;
  bestValue?: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
}
