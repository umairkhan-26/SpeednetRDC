// Which advertising / analytics tools are switched on. Each one is on only when
// its ID is set; the NEXT_PUBLIC_* values are built into the pages, so setting
// or changing one needs a new build. With no ID at all there is no cookie banner.
// Safe to import from both server and browser code.

export type Vendor = "meta" | "google" | "tiktok";

const valid = (value: string | undefined, pattern: RegExp): string => {
  const trimmed = (value ?? "").trim();
  return pattern.test(trimmed) ? trimmed : "";
};

export const META_PIXEL_ID = valid(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{5,20}$/);
/** Google Analytics 4 measurement ID, "G-XXXXXXXXXX". */
export const GA_ID = valid(process.env.NEXT_PUBLIC_GA_ID, /^G-[A-Z0-9]{4,20}$/);
/** Google Ads tag ID, "AW-123456789". */
export const GOOGLE_ADS_ID = valid(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID, /^AW-\d{6,20}$/);
/** The label of the Google Ads "Purchase" conversion action (the part after the slash in send_to). */
export const GOOGLE_ADS_PURCHASE_LABEL = valid(process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL, /^[\w-]{5,60}$/);
export const TIKTOK_PIXEL_ID = valid(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID, /^[A-Z0-9]{15,30}$/);

export const VENDOR_NAMES: Record<Vendor, string> = { meta: "Meta (Facebook)", google: "Google", tiktok: "TikTok" };

export function enabledVendors(): Vendor[] {
  const vendors: Vendor[] = [];
  if (META_PIXEL_ID) vendors.push("meta");
  if (GA_ID || GOOGLE_ADS_ID) vendors.push("google");
  if (TIKTOK_PIXEL_ID) vendors.push("tiktok");
  return vendors;
}
