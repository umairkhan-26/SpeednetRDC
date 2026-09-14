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
  const slug = curated ? curated.slug : slugify(m.zoneName);
  slugByCode.set(m.code, slug);
  countries.push({
    slug,
    name: curated ? curated.name : m.zoneName,
    region: classification[m.code],
    iso: iso2,
    heroImage: curated ? curated.heroImage : newPhotos[m.code],
    tagline: curated ? curated.tagline : `Instant eSIM data for ${curated ? curated.name : m.zoneName}.`,
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

const skippedNullPrice = [];
const excludedRecurring = [];
const outPlans = [];

for (const p of plans) {
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
    price: p.recommended_retail_price_eur,
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
    const zoneKey = REGION_ZONE_SOURCE[regionSlug];
    outPlans.push({
      ...base,
      scope: "regional",
      regionSlug,
      name: `${REGION_DISPLAY_NAME[regionSlug]} ${dataLabel(resolvedGb, p.unlimited_data)} / ${validityDays} Days`,
      countriesIncluded: zones[zoneKey].map((c) => c.name),
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
  outPlans.push({
    ...base,
    scope: "country",
    countrySlug: slug,
    name: `${countryName} ${dataLabel(resolvedGb, p.unlimited_data)} / ${validityDays} Days`,
    countriesIncluded: [countryName],
  });
}

// Compute best-value ribbon per natural group (country / region / global tier).
const groups = new Map();
for (const p of outPlans) {
  const key =
    p.scope === "country" ? `c:${p.countrySlug}` : p.scope === "regional" ? `r:${p.regionSlug}` : `g:${p.globalTier}`;
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
console.log("Plans excluded (recurring bundle):", excludedRecurring.length);
console.log("Plans skipped (null price):", skippedNullPrice.length, skippedNullPrice);
console.log(
  "Scope breakdown:",
  outPlans.reduce((acc, p) => ((acc[p.scope] = (acc[p.scope] || 0) + 1), acc), {}),
);
console.log("Badges:", outPlans.reduce((acc, p) => (p.badge && (acc[p.badge] = (acc[p.badge] || 0) + 1), acc), {}));
