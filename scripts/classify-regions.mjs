import fs from "node:fs";

const zones = JSON.parse(fs.readFileSync(new URL("./source/zones.json", import.meta.url)));
const matchData = JSON.parse(fs.readFileSync(new URL("./country-match.json", import.meta.url)));

function codesOf(zoneKey) {
  return new Set(zones[zoneKey].map((c) => c.code));
}

// Priority order resolves overlaps (e.g. Turkey is in both MIDDLE EAST and EU
// EXTENDED; Egypt is in both AFRICA and MEDITERRANEAN) — first match wins.
const priority = [
  ["caribbean", codesOf("CARIBBEAN")],
  ["middle-east", codesOf("MIDDLE EAST")],
  ["africa", codesOf("AFRICA")],
  ["oceania", codesOf("OCEANIA")],
  ["north-america", codesOf("NORTH AMERICA")],
  ["latin-america", codesOf("AMERICA")],
  ["asia", codesOf("ASIA")],
  ["europe", codesOf("EU EXTENDED")],
];

const classification = {};
const unclassified = [];
for (const m of matchData.matched) {
  let region = null;
  for (const [slug, codes] of priority) {
    if (codes.has(m.code)) {
      region = slug;
      break;
    }
  }
  if (region) classification[m.code] = region;
  else unclassified.push(m);
}

console.log("Classified:", Object.keys(classification).length, "/", matchData.matched.length);
console.log("Unclassified:", unclassified.length);
console.log(unclassified.map((m) => `${m.code} ${m.zoneName}`).join("\n"));

const counts = {};
for (const region of Object.values(classification)) counts[region] = (counts[region] || 0) + 1;
// Manual fallback for countries absent from every broad zone list we checked.
const manualOverrides = { AGO: "africa", BTN: "asia", COD: "africa", NAM: "africa" };
for (const [code, region] of Object.entries(manualOverrides)) {
  if (!classification[code]) {
    classification[code] = region;
    counts[region] = (counts[region] || 0) + 1;
  }
}
console.log("Per-region counts (after manual overrides):", counts);
console.log("Total classified:", Object.keys(classification).length);

fs.writeFileSync(
  new URL("./region-classification.json", import.meta.url),
  JSON.stringify({ classification, unclassified }, null, 2),
);
