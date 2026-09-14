import fs from "node:fs";

const plans = JSON.parse(fs.readFileSync(new URL("./source/plans.json", import.meta.url)));
const zones = JSON.parse(fs.readFileSync(new URL("./source/zones.json", import.meta.url)));

function norm(s) {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

// Areas that are zones (regional/global), not single countries — excluded from matching.
const nonCountryAreas = new Set([
  "AFRICA", "AMERICAS", "ASIA", "BEST AFRICA", "BEST ASIA", "BEST CARIBBEAN", "BEST LATAM",
  "BEST MIDDLE EAST", "BEST WORLD", "CARIBBEAN", "EUROPE", "EUROPE EXTENDED", "MEDITERRANEAN",
  "MIDDLE EAST", "NORTH AMERICA", "OCEANIA", "SCANDINAVIA & BALTIC", "WORLD",
  "AUSTRALIA+NZL", "MALAYSIA + SINGAPORE", "ILE OF MAN + CHANNEL ISLANDS",
]);

// Manual aliases for areas whose plans.json spelling doesn't normalize-match zones.json.
const aliases = {
  USA: "UNITED STATES OF AMERICA",
  UK: "UNITED KINGDOM",
  "CÔTE D'IVOIRE": "IVORY COAST",
  "DEMOCRATIC REPUBLIC OF THE CONGO": "CONGO DEMOCRATIC REPUBLIC",
  CONGO: "CONGOBRAZZAVILLE",
  MACEDONIA: "MACEDONIA",
  MACAU: "MACAO",
  "CAPE VERDE": "CABO VERDE",
  "GUINEA BISSAU": "GUINEABISSAU",
  "BOSNIA & HERZEGOVINA": "BOSNIA AND HERZEGOVINA",
  BRUNEI: "BRUNEI",
  PALESTINE: "PALESTINE",
  ESWATINI: "ESWATINI",
  REUNION: "REUNION",
  UAE: "UNITED ARAB EMIRATES",
  "SAINT MARTIN (FRENCH PART)": "SAINTMARTINFRENCHPART",
  "SAINT BARTHELEMY": "SAINTBARTHELEMY",
  COMOROS: "COMORES",
  NAMIBIA: "NAMBIA", // zones.json has a typo, missing the second "i"
  RUSSIA: "RUSSIAN FEDERATION",
};

const areaCounts = {};
for (const p of plans) areaCounts[p.area] = (areaCounts[p.area] || 0) + 1;
const areas = Object.keys(areaCounts).filter((a) => !nonCountryAreas.has(a));

// Map every unique normalized name variant (across all 21 zones) to its code —
// zones.json spells some countries differently depending which zone list they're in
// (e.g. GBR is "United Kingdom" in most zones but "United Kingdom of Great Britain
// and Northern Ireland" in WORLD/BEST WORLD), so a single first-seen name isn't enough.
const byNorm = new Map();
const canonicalName = new Map();
for (const list of Object.values(zones)) {
  for (const c of list) {
    byNorm.set(norm(c.name), { code: c.code, name: c.name });
    // Prefer the shortest name variant as canonical/display (formal UN-style
    // names in WORLD/BEST WORLD tend to be the longest of the variants).
    const existing = canonicalName.get(c.code);
    if (!existing || c.name.length < existing.length) canonicalName.set(c.code, c.name);
  }
}

const matched = [];
const unmatched = [];
for (const area of areas) {
  const aliasTarget = aliases[area];
  const key = norm(aliasTarget ?? area);
  const hit = byNorm.get(key);
  if (hit) {
    matched.push({ area, code: hit.code, zoneName: canonicalName.get(hit.code), plans: areaCounts[area] });
  } else {
    unmatched.push({ area, plans: areaCounts[area] });
  }
}

console.log(`Matched: ${matched.length} / ${areas.length}`);
console.log("--- UNMATCHED ---");
for (const u of unmatched) console.log(u.area, u.plans);
console.log("--- MATCHED SAMPLE (first 15) ---");
console.log(matched.slice(0, 15));

fs.writeFileSync(
  new URL("./country-match.json", import.meta.url),
  JSON.stringify({ matched, unmatched }, null, 2),
);
