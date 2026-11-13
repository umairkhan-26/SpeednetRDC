import fs from "node:fs";
import { ALPHA3_TO_ALPHA2 } from "./iso-alpha3-to-alpha2.mjs";

const plans = JSON.parse(fs.readFileSync(new URL("./source/plans.json", import.meta.url)));
const zones = JSON.parse(fs.readFileSync(new URL("./source/zones.json", import.meta.url)));
const matchData = JSON.parse(fs.readFileSync(new URL("./country-match.json", import.meta.url)));
const { classification } = JSON.parse(
  fs.readFileSync(new URL("./region-classification.json", import.meta.url)),
);
const newPhotos = JSON.parse(fs.readFileSync(new URL("./country-photos.json", import.meta.url)));

// -- Existing 32 hand-curated countries keep their existing slug/photo/tagline/speed. --
const CURATED = JSON.parse(fs.readFileSync(new URL("./curated-countries.json", import.meta.url)));
const curatedByCode = new Map(CURATED.map((c) => [c.iso3, c]));

// Transatel spells some countries differently from everyone else.
const COUNTRY_NAME_FIXES = { Nambia: "Namibia" };

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const areaToCountry = new Map(matchData.matched.map((m) => [m.area, m]));

// -- Build the country list --
const countries = [];
const slugByCode = new Map();
for (const m of matchData.matched) {
  const curated = curatedByCode.get(m.code);
  const iso2 = ALPHA3_TO_ALPHA2[m.code];
  const zoneName = COUNTRY_NAME_FIXES[m.zoneName] ?? m.zoneName;
  const slug = curated ? curated.slug : slugify(zoneName);
  slugByCode.set(m.code, slug);
  countries.push({
    slug,
    name: curated ? curated.name : zoneName,
    region: classification[m.code],
    iso: iso2,
    heroImage: curated ? curated.heroImage : newPhotos[m.code],
    tagline: curated ? curated.tagline : `Instant eSIM data for ${curated ? curated.name : zoneName}.`,
    speed: curated ? curated.speed : "4G/5G",
    networks: ["SpeedNetRDC"],
    networkCount: 1,
    popular: curated ? true : false,
    code3: m.code, // kept only for downstream plan-mapping in this script, not part of the app's Country type
  });
}
countries.sort((a, b) => a.name.localeCompare(b.name));

// -- Region definitions: plans.json area -> our region slug --
const REGION_AREA_MAP = {
  AFRICA: "africa",
  "BEST AFRICA": "africa",
  ASIA: "asia",
  "BEST ASIA": "asia",
  "MALAYSIA + SINGAPORE": "asia",
  CARIBBEAN: "caribbean",
  "BEST CARIBBEAN": "caribbean",
  EUROPE: "europe",
  "EUROPE EXTENDED": "europe",
  MEDITERRANEAN: "europe",
  "SCANDINAVIA & BALTIC": "europe",
  "BEST LATAM": "latin-america",
  "MIDDLE EAST": "middle-east",
  "BEST MIDDLE EAST": "middle-east",
  OCEANIA: "oceania",
  "AUSTRALIA+NZL": "oceania",
  "NORTH AMERICA": "north-america",
  AMERICAS: "americas",
};

const REGION_ZONE_SOURCE = {
  africa: "AFRICA",
  asia: "ASIA",
  caribbean: "CARIBBEAN",
  europe: "EU EXTENDED",
  "latin-america": "BEST LATAM",
  "middle-east": "MIDDLE EAST",
  oceania: "OCEANIA",
  "north-america": "NORTH AMERICA",
  americas: "AMERICA",
};

const REGION_DISPLAY_NAME = {
  africa: "Africa",
  asia: "Asia",
  caribbean: "Caribbean",
  europe: "Europe",
  "latin-america": "Latin America",
  "middle-east": "Middle East",
  oceania: "Oceania",
  "north-america": "North America",
  americas: "The Americas",
  global: "Global",
};

/**
 * Each Transatel area is its own product: the "Best" areas and the named
 * sub-areas cover fewer countries than their region. Every plan lists the
 * countries of ITS area (from zones.json) and gets its own name, so two
 * different plans never look the same. Smaller/cheaper area = the region's
 * name; the bigger one = "Plus" (like Global / Global Plus). `zone` is the
 * key for translated names (messages: regions.<zone>).
 */
const AREA_ZONE = {
  AFRICA: { zone: "africa-plus", name: "Africa Plus", zoneKey: "AFRICA" },
  "BEST AFRICA": { zone: "africa", name: "Africa", zoneKey: "BEST AFRICA" },
  ASIA: { zone: "asia-plus", name: "Asia Plus", zoneKey: "ASIA" },
  "BEST ASIA": { zone: "asia", name: "Asia", zoneKey: "BEST ASIA" },
  "MALAYSIA + SINGAPORE": { zone: "malaysia-singapore", name: "Malaysia & Singapore", countries: ["Malaysia", "Singapore"] },
  CARIBBEAN: { zone: "caribbean-plus", name: "Caribbean Plus", zoneKey: "CARIBBEAN" },
  "BEST CARIBBEAN": { zone: "caribbean", name: "Caribbean", zoneKey: "BEST CARIBBEAN" },
  EUROPE: { zone: "europe", name: "Europe", zoneKey: "EU28PLUS (EUROPE)" },
  "EUROPE EXTENDED": { zone: "europe-plus", name: "Europe Plus", zoneKey: "EU EXTENDED" },
  MEDITERRANEAN: { zone: "europe-maghreb", name: "Europe, Morocco & Tunisia", zoneKey: "MEDITERRANEAN" },
  "SCANDINAVIA & BALTIC": { zone: "scandinavia-baltics", name: "Scandinavia & Baltics", zoneKey: "SCANDINAVIA  & BALTIC" },
  "BEST LATAM": { zone: "latin-america", name: "Latin America", zoneKey: "BEST LATAM" },
  "MIDDLE EAST": { zone: "middle-east-plus", name: "Middle East Plus", zoneKey: "MIDDLE EAST" },
  "BEST MIDDLE EAST": { zone: "middle-east", name: "Middle East", zoneKey: "BEST MIDDLE EAST" },
  OCEANIA: { zone: "oceania", name: "Oceania", zoneKey: "OCEANIA" },
  "AUSTRALIA+NZL": { zone: "australia-new-zealand", name: "Australia & New Zealand", zoneKey: "ANZ" },
  "NORTH AMERICA": { zone: "north-america", name: "North America", zoneKey: "NORTH AMERICA" },
  AMERICAS: { zone: "americas", name: "The Americas", zoneKey: "AMERICA" },
};

function areaCountries(info) {
  return info.countries ?? zones[info.zoneKey].map((c) => c.name);
}

// --- Pricing ------------------------------------------------------------------
// Price = Transatel wholesale × a margin that shrinks as plans get more
// expensive, never less than €2.50 above cost; the checkout then adds its 5%
// "taxes & fees" line, so the target is divided by 1.05. Prices end in .99.
// (Price audit, 2026-11-12, option B. Option A = cap at Transatel's
// recommended consumer price: see PRICING_RULE below.)
const PRICING_RULE = "tiered"; // "tiered" (option B) | "transatel-cap" (option A) | "legacy" (the old ×2.5 prices)
const CHECKOUT_FEE = 1.05;
const end99 = (x) => Math.max(0.99, Math.ceil(x) - 0.01);
function priceFor(p) {
  const w = p.wholesale_price_excl_vat_eur;
  if (PRICING_RULE === "legacy" || typeof w !== "number") return p.recommended_retail_price_eur;
  if (PRICING_RULE === "transatel-cap") {
    const cap = p.retail_price_incl_vat_eur / CHECKOUT_FEE;
    return cap >= w * 1.15 ? Math.min(p.recommended_retail_price_eur, end99(cap)) : p.recommended_retail_price_eur;
  }
  const margin = w <= 5 ? 2.5 : w <= 10 ? 2.0 : w <= 20 ? 1.7 : 1.5;
  // The rule fixes overpricing; it never raises a plan above its old price.
  return Math.min(p.recommended_retail_price_eur, end99(Math.max(w * margin, w + 2.5) / CHECKOUT_FEE));
}

// "Unlimited" plans all have a fair-use limit, in the reference: …_FUP20 = 20 GB.
function fairUseGb(p) {
  const m = /_FUP(\d+)/.exec(p.technical_reference);
  return p.unlimited_data && m ? Number(m[1]) : undefined;
}

// UK also carries the Channel-Islands-only plans (no clean home elsewhere).
const FOLD_INTO_COUNTRY = {
  "ILE OF MAN + CHANNEL ISLANDS": "GBR",
};

function dataLabel(gb, unlimited) {
  return unlimited ? "Unlimited" : gb < 1 ? `${Math.round(gb * 1000)}MB` : `${gb}GB`;
}

// A handful of "500MB" plans have data_gb: null in the source (the value only
// appears in the free-text description) — recover it from there.
function resolveDataGb(p) {
  if (p.unlimited_data) return null;
  if (p.data_gb !== null) return p.data_gb;
  const match = /([\d.]+)\s*MB/i.exec(p.description);
  if (match) return Number(match[1]) / 1000;
  console.warn("Could not resolve data_gb for", p.technical_reference, p.description);
  return 0;
}

function bestValueFlags(group) {
  // Mark the lowest EUR-per-GB finite-data plan in the group as best value.
  let best = null;
  for (const p of group) {
    if (p.dataAmountGb === "unlimited") continue;
    const perGb = p.price / p.dataAmountGb;
    if (!best || perGb < best.perGb) best = { plan: p, perGb };
  }
  if (best) best.plan.bestValue = true;
}

// In Transatel's price grid but missing from our account's live OCS catalog
// (found with `npm run transatel:check`, 2026-10-03), so an order for them
// would fail with PRODUCT_NOT_FOUND after the customer has paid. Never sold
// until Transatel adds them; re-run the check after each new grid.
const NOT_IN_TRANSATEL_CATALOG = new Set([
  "WW_901O_STACK_ONEOFF_CAMBO_UNLIMITED_7D_FUP20",
  "WW_901O_STACK_ONEOFF_CONGO_3GB_15D",
  "WW_901O_STACK_ONEOFF_JPN_1GB_3D",
  // Found missing by `npm run transatel:check` on 2026-11-13:
  "WW_901O_STACK_ONEOFF_CHILE_UNLIMITED_30D_FUP15",
  "WW_901O_STACK_ONEOFF_COSTARICA_1GB_7D",
  "WW_901O_STACK_ONEOFF_COSTARICA_3GB_15D",
  "WW_901O_STACK_ONEOFF_FRANCE_UNLIMITED_1D_FUP7",
  "WW_901O_STACK_ONEOFF_GROENLAND_10GB_30D",
  "WW_901O_STACK_ONEOFF_GROENLAND_1GB_7D",
  "WW_901O_STACK_ONEOFF_GROENLAND_3GB_15D",
  "WW_901O_STACK_ONEOFF_INDIA_25GB_30D",
  "WW_901O_STACK_ONEOFF_JPN_1GB_30D",
  "WW_901O_STACK_ONEOFF_JPN_3GB_15D",
  "WW_901O_STACK_ONEOFF_PHILIPPINES_1GB_7D",
  "WW_901O_STACK_ONEOFF_USA_500MB_1D",
]);

const skippedNullPrice = [];
const skippedNotInCatalog = [];
const excludedRecurring = [];
const outPlans = [];

for (const p of plans) {
  if (NOT_IN_TRANSATEL_CATALOG.has(p.technical_reference)) {
    skippedNotInCatalog.push(p.technical_reference);
    continue;
  }
  if (p.bundle_type !== "One-Off") {
    excludedRecurring.push(p.technical_reference);
    continue;
  }
  if (p.recommended_retail_price_eur === null) {
    skippedNullPrice.push(p.description);
    continue;
  }

  const badge = p.status === "Price drop" ? "price-drop" : p.status === "New" ? "new" : undefined;
  // A handful of "One-Off" plans (long-validity global bundles) specify
  // duration_months instead of duration_days — normalize to days (×30).
  const validityDays = p.duration_days ?? p.duration_months * 30;
  const resolvedGb = resolveDataGb(p);
  const base = {
    id: p.technical_reference,
    dataAmountGb: p.unlimited_data ? "unlimited" : resolvedGb,
    validityDays,
    price: priceFor(p),
    ...(fairUseGb(p) ? { fairUseGb: fairUseGb(p) } : {}),
    network: "SpeedNetRDC",
    speed: "4G/5G",
    hotspot: true,
    badge,
  };

  if (p.area === "WORLD" || p.area === "BEST WORLD") {
    const globalTier = p.is_budget_global_tier ? "budget" : "premium";
    const zoneKey = p.is_budget_global_tier ? "BEST WORLD" : "WORLD";
    outPlans.push({
      ...base,
      scope: "global",
      regionSlug: "global",
      globalTier,
      name: `${globalTier === "budget" ? "Global" : "Global Plus"} ${dataLabel(resolvedGb, p.unlimited_data)} / ${validityDays} Days`,
      countriesIncluded: zones[zoneKey].map((c) => c.name),
    });
    continue;
  }

  const regionSlug = REGION_AREA_MAP[p.area];
  if (regionSlug) {
    const area = AREA_ZONE[p.area];
    if (!area) throw new Error(`No zone mapping for regional area ${p.area}`);
    outPlans.push({
      ...base,
      scope: "regional",
      regionSlug,
      zone: area.zone,
      zoneName: area.name,
      name: `${area.name} ${dataLabel(resolvedGb, p.unlimited_data)} / ${validityDays} Days`,
      countriesIncluded: areaCountries(area),
    });
    continue;
  }

  // Single-country plan (including the ones folded into an existing country).
  const foldCode = FOLD_INTO_COUNTRY[p.area];
  const match = foldCode
    ? matchData.matched.find((m) => m.code === foldCode)
    : areaToCountry.get(p.area);
  if (!match) {
    console.warn("UNMAPPED AREA:", p.area, p.technical_reference);
    continue;
  }
  const slug = slugByCode.get(match.code);
  const countryName = countries.find((c) => c.slug === slug).name;
  if (p.area === "ILE OF MAN + CHANNEL ISLANDS") {
    outPlans.push({
      ...base,
      scope: "country",
      countrySlug: slug,
      zone: "isle-of-man-channel-islands",
      zoneName: "Isle of Man & Channel Islands",
      name: `Isle of Man & Channel Islands ${dataLabel(resolvedGb, p.unlimited_data)} / ${validityDays} Days`,
      countriesIncluded: ["Isle of Man", "Jersey", "Guernsey"],
    });
    continue;
  }
  outPlans.push({
    ...base,
    scope: "country",
    countrySlug: slug,
    name: `${countryName} ${dataLabel(resolvedGb, p.unlimited_data)} / ${validityDays} Days`,
    countriesIncluded: [countryName],
  });
}

// Hide plans another plan of the same product beats on every point (at least
// as much data — counting an unlimited plan's fair-use limit — at least as
// many days, for no more money): nobody should buy them.
const productKey = (p) =>
  p.scope === "country" ? `c:${p.countrySlug}:${p.zone ?? ""}` : p.scope === "regional" ? `r:${p.zone}` : `g:${p.globalTier}`;
const effectiveGb = (p) => (p.dataAmountGb === "unlimited" ? p.fairUseGb ?? Infinity : p.dataAmountGb);
const hiddenDominated = [];
for (let i = outPlans.length - 1; i >= 0; i--) {
  const a = outPlans[i];
  const beatenBy = outPlans.find(
    (b) =>
      b !== a &&
      productKey(b) === productKey(a) &&
      effectiveGb(b) >= effectiveGb(a) &&
      b.validityDays >= a.validityDays &&
      b.price <= a.price &&
      (effectiveGb(b) > effectiveGb(a) || b.validityDays > a.validityDays || b.price < a.price),
  );
  if (beatenBy) {
    hiddenDominated.push(`${a.name} (€${a.price}) — beaten by ${beatenBy.name} (€${beatenBy.price})`);
    outPlans.splice(i, 1);
  }
}

// Compute best-value ribbon per natural group (country / region / global tier).
const groups = new Map();
for (const p of outPlans) {
  const key =
    p.scope === "country" ? `c:${p.countrySlug}:${p.zone ?? ""}` : p.scope === "regional" ? `r:${p.zone}` : `g:${p.globalTier}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(p);
}
for (const group of groups.values()) bestValueFlags(group);

// -- Regions (excludes "global", which the app treats as a dedicated page, not a RegionSlug entry) --
const outRegions = [];
for (const [slug, zoneKey] of Object.entries(REGION_ZONE_SOURCE)) {
  const regionPlans = outPlans.filter((p) => p.scope === "regional" && p.regionSlug === slug);
  const fromPrice = Math.min(...regionPlans.map((p) => p.price));
  outRegions.push({
    slug,
    name: REGION_DISPLAY_NAME[slug],
    countryCount: zones[zoneKey].length,
    fromPrice: Math.round(fromPrice * 100) / 100,
  });
}

// -- fromPrice per country, for country cards --
for (const c of countries) {
  const countryPlans = outPlans.filter((p) => p.scope === "country" && p.countrySlug === c.slug);
  c.fromPrice = countryPlans.length ? Math.round(Math.min(...countryPlans.map((p) => p.price)) * 100) / 100 : null;
  delete c.code3;
}

const outDir = new URL("../src/data/generated/", import.meta.url);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(new URL("countries.json", outDir), JSON.stringify(countries, null, 2));
fs.writeFileSync(new URL("regions.json", outDir), JSON.stringify(outRegions, null, 2));
fs.writeFileSync(new URL("plans.json", outDir), JSON.stringify(outPlans, null, 2));

console.log("Countries:", countries.length);
console.log("Countries with no plans (fromPrice null):", countries.filter((c) => c.fromPrice === null).length);
console.log("Regions:", outRegions.length, outRegions.map((r) => `${r.slug}(${r.countryCount})`).join(", "));
console.log("Plans written:", outPlans.length);
console.log("Plans hidden (beaten on every point by a plan of the same product):", hiddenDominated.length, hiddenDominated);
console.log("Plans excluded (recurring bundle):", excludedRecurring.length);
console.log("Plans skipped (null price):", skippedNullPrice.length, skippedNullPrice);
console.log("Plans skipped (not in Transatel's live catalog):", skippedNotInCatalog.length, skippedNotInCatalog);
console.log(
  "Scope breakdown:",
  outPlans.reduce((acc, p) => ((acc[p.scope] = (acc[p.scope] || 0) + 1), acc), {}),
);
console.log("Badges:", outPlans.reduce((acc, p) => (p.badge && (acc[p.badge] = (acc[p.badge] || 0) + 1), acc), {}));
