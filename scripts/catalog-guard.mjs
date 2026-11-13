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
// Exit code: 0 = nothing to do or fixed, 2 = could not check (nothing changed),
// 1 = unexpected error. The report is printed as plain lines for the daily report.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { api, authenticate } from "./lib/transatel-readonly.mjs";

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
