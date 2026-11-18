// Catalogue guard: keeps what we sell in step with Transatel's live OCS catalogue.
//
// Makes ONLY GET requests (plus the OAuth token request) through
// scripts/lib/transatel-readonly.mjs, which refuses anything else. Never
// places orders, never prints tokens, activation codes or credentials.
//
// Usage (credentials come from .env.local):
//   npm run catalog:guard             report only, changes nothing
//   npm run catalog:guard -- --fix    also hides plans that are missing from the
//                                     catalogue or not sellable: adds them to
//                                     scripts/not-in-catalog.json and regenerates
//                                     src/data/generated/*.json
//
// It also prints a "COVERAGE CHECK": for every plan we sell, the countries we list
// next to the plan are compared with the countryList in the SAME catalogue answer
// (no extra request). It only reports differences; it never changes a plan.
//
// Exit code: 0 = nothing to do or fixed, 2 = could not check (nothing changed),
// 1 = unexpected error. The report is printed as plain lines for the daily report.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { api, authenticate } from "./lib/transatel-readonly.mjs";
import { ALPHA3_TO_ALPHA2 } from "./iso-alpha3-to-alpha2.mjs";

const FIX = process.argv.includes("--fix");
// Test hook: pretend these plan codes are missing from the catalogue (never used in production).
const PRETEND = process.argv.filter((a) => a.startsWith("--pretend-missing=")).flatMap((a) => a.slice(18).split(","));
const COS = "WW_M2MA_COS_SPC";
const LIST_FILE = new URL("./not-in-catalog.json", import.meta.url);

const out = (line = "") => console.log(line);
const read = (rel) => JSON.parse(fs.readFileSync(new URL(rel, import.meta.url), "utf8"));

const onSale = read("../src/data/generated/plans.json").map((p) => p.id);
const grid = new Set(read("./source/plans.json").map((p) => p.technical_reference));
const hiddenList = read("./not-in-catalog.json");

const auth = await authenticate();
if (!auth.ok) {
  out(`CATALOG GUARD: could not check — Transatel login failed (HTTP ${auth.status}). Nothing was changed.`);
  process.exit(2);
}
const res = await api("GET", `/ocs/catalog/api/cos/${COS}/products`);
const products = Array.isArray(res.body?.products) ? res.body.products : [];
if (res.status !== 200 || products.length < 500) {
  // A broken or partial answer must never make us hide plans.
  out(`CATALOG GUARD: could not check — catalogue answer looks wrong (HTTP ${res.status}, ${products.length} products). Nothing was changed.`);
  process.exit(2);
}

const byId = new Map(products.map((p) => [p.productDefinition?.productId, p]));
for (const id of PRETEND) byId.delete(id);

const missing = onSale.filter((id) => !byId.has(id));
const notSellable = onSale.filter(
  (id) => byId.has(id) && (byId.get(id).canSubscribe?.allowed === false || byId.get(id).availability?.available === false),
);
const toHide = [...new Set([...missing, ...notSellable])];
const returned = hiddenList.ids.filter((id) => byId.has(id) && byId.get(id).canSubscribe?.allowed !== false && !PRETEND.includes(id));
const ours = new Set(onSale);
const newPlans = [...byId.keys()].filter((id) => id && /ONEOFF/.test(id) && !ours.has(id) && !grid.has(id));

out(`CATALOG GUARD (${new Date().toISOString().slice(0, 10)}): Transatel lists ${products.length} products; we sell ${onSale.length} plans.`);
out(`- Sold by us but missing from the catalogue: ${missing.length}${missing.length ? ` — ${missing.join(", ")}` : ""}`);
out(`- Sold by us but not sellable/available: ${notSellable.length}${notSellable.length ? ` — ${notSellable.join(", ")}` : ""}`);
out(`- Hidden earlier and now back in the catalogue (not re-listed automatically): ${returned.length}${returned.length ? ` — ${returned.join(", ")}` : ""}`);
out(`- New one-off plans in the catalogue that are not in our price grid (no price known): ${newPlans.length}`);

// --- Coverage check (report only) ---------------------------------------------------
// Transatel's legacy code "AN" (Netherlands Antilles) means Curaçao + Bonaire + Sint Maarten.
const NL_ANTILLES = ["CW", "BQ", "SX"];
const expandAntilles = (codes) => new Set([...codes].flatMap((c) => (c === "AN" ? NL_ANTILLES : [c])));
const siteCountries = read("../src/data/generated/countries.json");
const nameToIso = new Map([
  ...siteCountries.map((c) => [c.name, c.iso.toUpperCase()]),
  ...Object.entries(read("../src/data/extra-place-iso.json")),
  ["Netherlands Antilles", "AN"],
]);
const isoToName = new Map([...nameToIso].filter(([, iso]) => iso !== "AN").map(([name, iso]) => [iso, name]));
const label = (iso) => isoToName.get(iso) ?? iso;
let sameCoverage = 0;
let noCountryList = 0;
let unmappedPlaces = 0;
const coverageDiffs = new Map();
for (const plan of read("../src/data/generated/plans.json")) {
  const product = byId.get(plan.id);
  if (!product) continue; // already reported above as missing
  const list = product.productDefinition?.countryList;
  if (!Array.isArray(list) || list.length === 0) {
    noCountryList++;
    continue;
  }
  const siteIso = (plan.countriesIncluded ?? []).map((n) => nameToIso.get(n));
  if (siteIso.length === 0 || siteIso.some((c) => !c)) {
    unmappedPlaces++;
    continue;
  }
  const site = expandAntilles(siteIso);
  const theirs = expandAntilles(list.map((c) => (c.length === 2 ? c : (ALPHA3_TO_ALPHA2[c] ?? `?${c}`))));
  const missingOnSite = [...theirs].filter((c) => !site.has(c)).sort();
  const extraOnSite = [...site].filter((c) => !theirs.has(c)).sort();
  if (!missingOnSite.length && !extraOnSite.length) {
    sameCoverage++;
    continue;
  }
  const key = `${missingOnSite.join(",")}|${extraOnSite.join(",")}`;
  const g = coverageDiffs.get(key) ?? { missingOnSite, extraOnSite, ids: [] };
  g.ids.push(plan.id);
  coverageDiffs.set(key, g);
}
const differing = [...coverageDiffs.values()].reduce((n, g) => n + g.ids.length, 0);
out("");
out(`COVERAGE CHECK: ${sameCoverage} plans list exactly the countries Transatel states; ${differing} differ; ${unmappedPlaces} could not be compared (a place has no country code); ${noCountryList} have no country list in the catalogue.`);
for (const g of [...coverageDiffs.values()].sort((a, b) => b.ids.length - a.ids.length).slice(0, 15)) {
  const parts = [];
  if (g.missingOnSite.length) parts.push(`Transatel also covers: ${g.missingOnSite.map(label).join(", ")}`);
  if (g.extraOnSite.length) parts.push(`we list but Transatel does not: ${g.extraOnSite.map(label).join(", ")}`);
  out(`- ${g.ids.length} plan(s), e.g. ${g.ids.slice(0, 2).join(", ")} — ${parts.join("; ")}`);
}
if (coverageDiffs.size > 15) out(`- … and ${coverageDiffs.size - 15} more kinds of difference.`);
out("(Coverage differences are only reported: check them before changing any plan's country list.)");
out("");

if (!toHide.length) {
  out("RESULT: nothing to hide. Customers are not affected.");
  process.exit(0);
}
if (!FIX) {
  out(`RESULT: ${toHide.length} plan(s) should be hidden. Re-run with --fix to hide them.`);
  process.exit(0);
}

hiddenList.ids = [...new Set([...hiddenList.ids, ...toHide])];
fs.writeFileSync(LIST_FILE, JSON.stringify(hiddenList, null, 2) + "\n");
execFileSync(process.execPath, [fileURLToPath(new URL("./generate-data.mjs", import.meta.url))], { stdio: "ignore" });
const after = read("../src/data/generated/plans.json").map((p) => p.id);
const stillSold = toHide.filter((id) => after.includes(id));
out(`RESULT: hid ${toHide.length} plan(s); we now sell ${after.length} plans.${stillSold.length ? ` WARNING: still listed after regenerating: ${stillSold.join(", ")}` : ""}`);
out("NEXT: type check, build, commit and push the changed files (scripts/not-in-catalog.json, src/data/generated/*.json).");
