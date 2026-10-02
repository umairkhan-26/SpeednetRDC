// Read-only health check of our Transatel production setup.
//
// Makes ONLY GET and OPTIONS requests (plus the OAuth token request). It
// never places orders, activates SIMs, or releases eSIM profiles — the
// request helper refuses any other method. Writes nothing to our database.
//
// Usage:
//   npm run transatel:check
//
// Needs in .env.local (production values):
//   TRANSATEL_API_LOGIN, TRANSATEL_API_PASSWORD, TRANSATEL_MVNO_REF
//   TRANSATEL_API_BASE_URL is optional (defaults to https://api.transatel.com).
//
// Never prints activation codes, matching IDs, QR codes or tokens: every
// printed value goes through redact().
import fs from "node:fs";

const ORDER_13_ICCID = "8988247000148411086";
const COS_CANDIDATES = ["COS_SPC", "WW_M2MA_COS_SPC"];
const KNOWN_GOOD_PRODUCT = "WW_901O_STACK_ONEOFF_ALBANIA_1GB_7D";
const DELIVERY_CSV = "scripts/source/sim-inventory.csv"; // CSO_7434, byte-identical to Transatel's delivery file

// --- Config ---------------------------------------------------------------
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set. Add it to .env.local (see the header of this script).`);
    process.exit(1);
  }
  return value;
}
const BASE = (process.env.TRANSATEL_API_BASE_URL || "https://api.transatel.com").replace(/\/+$/, "");
const LOGIN = requireEnv("TRANSATEL_API_LOGIN");
const PASSWORD = requireEnv("TRANSATEL_API_PASSWORD");
const MVNO_REF = requireEnv("TRANSATEL_MVNO_REF");
if (process.env.TRANSATEL_COS && !COS_CANDIDATES.includes(process.env.TRANSATEL_COS)) {
  COS_CANDIDATES.push(process.env.TRANSATEL_COS);
}

// --- Output safety --------------------------------------------------------
const SECRET_KEYS = new Set(["activationCode", "matchingId", "qrCode", "access_token", "accessToken", "dataUrl"]);
const LPA_PATTERN = /(^|LPA:)1\$[^$\s]+\$[^$\s]+/;
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SECRET_KEYS.has(k) ? "[redacted]" : redact(v)]));
  }
  if (typeof value === "string" && LPA_PATTERN.test(value)) return "[redacted]";
  return value;
}
const print = (...parts) => console.log(...parts.map((p) => (typeof p === "string" ? redact(p) : JSON.stringify(redact(p)))));
const heading = (title) => console.log(`\n=== ${title} ===`);
const tally = (items, key) =>
  items.reduce((acc, item) => {
    const k = String(key(item) ?? "(none)");
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

// --- HTTP -----------------------------------------------------------------
let token;
async function authenticate() {
  const response = await fetch(`${BASE}/authentication/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${LOGIN}:${PASSWORD}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) return { ok: false, status: response.status, body };
  token = body.access_token;
  return { ok: true, status: response.status, expiresIn: body.expires_in, scope: body.scope ?? "(not returned)" };
}

async function api(method, path, query) {
  if (method !== "GET" && method !== "OPTIONS") throw new Error(`Refusing ${method} ${path}: this script is read-only`);
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v);
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(60_000),
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text.slice(0, 300);
  }
  return { status: response.status, allow: response.headers.get("allow"), body };
}
const errorSummary = (r) => (r.body && typeof r.body === "object" ? `${r.body.title ?? ""} ${r.body.detail ?? ""}`.trim() : String(r.body ?? ""));

// --- Local data -----------------------------------------------------------
const onSaleCodes = JSON.parse(fs.readFileSync("src/data/generated/plans.json", "utf8")).map((p) => p.id);
const sourceCosts = new Map(
  JSON.parse(fs.readFileSync("scripts/source/plans.json", "utf8")).map((p) => [p.technical_reference, p.wholesale_price_excl_vat_eur])
);
const deliveryIccids = fs
  .readFileSync(DELIVERY_CSV, "utf8")
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(";")[3]?.trim())
  .filter(Boolean);

// --- 1. Authentication ----------------------------------------------------
heading("1. Authentication");
print(`Base URL: ${BASE} | mvnoRef in .env.local: ${MVNO_REF} | login: ${LOGIN.slice(0, 3)}…`);
const auth = await authenticate();
if (!auth.ok) {
  print(`FAILED (HTTP ${auth.status}):`, auth.body);
  print("Nothing else can be checked without a token. Check TRANSATEL_API_LOGIN / TRANSATEL_API_PASSWORD.");
  process.exit(1);
}
print(`OK — token valid for ${auth.expiresIn}s. Scopes: ${auth.scope}`);

// --- 2. Catalog, per COS --------------------------------------------------
heading("2. OCS catalog — which COS works, and do our plan codes exist?");
const catalogResults = {};
for (const cos of COS_CANDIDATES) {
  const single = await api("GET", `/ocs/catalog/api/cos/${encodeURIComponent(cos)}/products/${KNOWN_GOOD_PRODUCT}`);
  const list = await api("GET", `/ocs/catalog/api/cos/${encodeURIComponent(cos)}/products`);
  const products = Array.isArray(list.body?.products) ? list.body.products : [];
  catalogResults[cos] = { single: single.status, list: list.status, count: products.length };
  print(`\nCOS "${cos}": single product ${KNOWN_GOOD_PRODUCT} -> HTTP ${single.status}${single.status >= 400 ? ` (${errorSummary(single)})` : ""}; full list -> HTTP ${list.status}${list.status >= 400 ? ` (${errorSummary(list)})` : `, ${products.length} products`}`);
  if (!products.length) continue;

  const byId = new Map(products.map((p) => [p.productDefinition?.productId, p]));
  const missing = onSaleCodes.filter((code) => !byId.has(code));
  const notSubscribable = onSaleCodes.filter((code) => byId.has(code) && byId.get(code).canSubscribe?.allowed === false);
  const notAvailable = onSaleCodes.filter((code) => byId.has(code) && byId.get(code).availability?.available === false);
  print(`  Our ${onSaleCodes.length} on-sale plan codes: ${onSaleCodes.length - missing.length} found, ${missing.length} missing, ${notSubscribable.length} not subscribable, ${notAvailable.length} not available`);
  if (missing.length) print(`  Missing (first 10): ${missing.slice(0, 10).join(", ")}`);
  if (notSubscribable.length) print(`  Not subscribable (first 10): ${notSubscribable.slice(0, 10).join(", ")}`);

  // Informational: compare the catalog's subscription fee with the cost
  // recorded from the 2026-08-25 grid.
  let same = 0;
  const differ = [];
  for (const code of onSaleCodes) {
    const fee = byId.get(code)?.prices?.subscriptionFee?.flat?.()?.[0];
    const cost = sourceCosts.get(code);
    if (!fee || typeof cost !== "number") continue;
    if (fee.amount === Math.round(cost * 100)) same++;
    else differ.push(`${code}: catalog ${fee.amount} ${fee.unit} vs grid €${cost}`);
  }
  print(`  Catalog fee vs 2026-08-25 grid cost: ${same} match, ${differ.length} differ${differ.length ? ` — e.g. ${differ.slice(0, 5).join("; ")}` : ""}`);
}

// --- 3. SIM fleet ---------------------------------------------------------
heading("3. SIM Search — our whole fleet");
const sims = [];
let page = 1;
let totalPages = 1;
let searchError;
do {
  const r = await api("GET", "/sim-search/api/sim/search", { size: "10000", page: String(page) });
  if (r.status !== 200) {
    searchError = `HTTP ${r.status} ${errorSummary(r)}`;
    break;
  }
  sims.push(...(r.body.sims || []));
  totalPages = r.body.totalPages || 1;
  page++;
} while (page <= totalPages);

// The 1,000 SIMs in the CSO_7434 delivery file are physical. SIM Search
// returns no order reference, so the eSIM candidates are identified as the
// SIMs on the account that are NOT in that file.
const deliverySet = new Set(deliveryIccids);
const PHYSICAL = "CSO_7434 file (physical)";
const CANDIDATES = "not in CSO_7434 file (eSIM candidates)";
const groupOf = (s) => (deliverySet.has(s.simSerial) ? PHYSICAL : CANDIDATES);
const esimCandidates = sims.filter((s) => !deliverySet.has(s.simSerial));
const digitsOnly = (msisdn) => String(msisdn ?? "").replace(/\D/g, "");

if (searchError) {
  print(`SIM Search FAILED: ${searchError}`);
} else {
  print(`SIMs visible to this account: ${sims.length}`);
  print("By mvnoRef:", tally(sims, (s) => s.mvnoRef));
  print("By simOrderReference:", tally(sims, (s) => s.simOrderReference));
  for (const label of [PHYSICAL, CANDIDATES]) {
    const group = sims.filter((s) => groupOf(s) === label);
    print(`\n${label}: ${group.length} SIMs`);
    print("  status:", tally(group, (s) => s.status));
    print("  lastEsimProfileStatus:", tally(group, (s) => s.lastEsimProfileStatus));
    print(`  with MSISDN: ${group.filter((s) => s.msisdn).length} (of which starting with "+": ${group.filter((s) => String(s.msisdn ?? "").startsWith("+")).length}) | ratePlan:`, tally(group, (s) => s.ratePlan));
  }
  print(`\nCSO_7434 delivery file: ${deliveryIccids.length} ICCIDs, ${deliveryIccids.filter((i) => sims.some((s) => s.simSerial === i)).length} found in SIM Search`);
}

// OCS inventory takes the MSISDN as digits only (pattern [0-9]{6,15}); a
// leading "+" from SIM Search made the first version of this call fail with
// 400 BAD_REQUEST. Subscriptions come back under `productSubscriptions`.
async function ocsInventory(msisdn) {
  const r = await api("GET", "/ocs/inventory/api/subscriptions/products", { msisdn: digitsOnly(msisdn) });
  if (r.status !== 200) return `HTTP ${r.status} ${errorSummary(r)}`;
  const subscriptions = r.body?.productSubscriptions ?? [];
  if (!subscriptions.length) return "0 products";
  return `${subscriptions.length} product(s): ${subscriptions
    .slice(0, 10)
    .map((s) => `${s.productDefinition?.productId ?? "?"} [${s.status}${s.activationDate ? `, activated ${s.activationDate}` : ""}${s.expirationDate ? `, expires ${s.expirationDate}` : ""}]`)
    .join("; ")}`;
}

// --- 4. Order 13's SIM ----------------------------------------------------
heading(`4. Order 13's SIM (ICCID ${ORDER_13_ICCID})`);
const order13Search = await api("GET", "/sim-search/api/sim/search", { simSerial: `eq:${ORDER_13_ICCID}` });
const order13 = order13Search.body?.sims?.[0];
if (!order13) {
  print(`Not found by SIM Search (HTTP ${order13Search.status} ${errorSummary(order13Search)})`);
} else {
  const { simSerial, msisdn, status, mvnoRef, simOrderReference, ratePlan, activationDate, lastEsimProfileStatus, lastSeenDate } = order13;
  print({ group: groupOf(order13), simSerial, msisdn, status, mvnoRef, simOrderReference, ratePlan, activationDate, lastEsimProfileStatus, lastSeenDate });
}

// --- 5. SIMs that aren't in the usual state ---------------------------------
heading("5. SIMs not in the fleet's usual state (e.g. Active, or with an eSIM profile status)");
const usualStatus = Object.entries(tally(sims, (s) => s.status)).sort((a, b) => b[1] - a[1])[0]?.[0];
const unusual = sims.filter((s) => s.status !== usualStatus || s.lastEsimProfileStatus);
print(`Usual status: ${usualStatus}. SIMs that differ: ${unusual.length}`);
for (const s of unusual.slice(0, 20)) {
  const { simSerial, msisdn, status, lastEsimProfileStatus, lastEsimProfileDate, activationDate, lastSeenDate, lastOriginCountry } = s;
  print({ group: groupOf(s), simSerial, msisdn, status, lastEsimProfileStatus, lastEsimProfileDate, activationDate, lastSeenDate, lastOriginCountry });
  if (s.msisdn) print(`  OCS products on it: ${await ocsInventory(s.msisdn)}`);
}

// --- 6. eSIM or physical? Profile released? -------------------------------
heading("6. eSIM or physical, and is the eSIM profile released? (Get eSIM details)");
const pick = (list, n) => (list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.round((i * (list.length - 1)) / (n - 1))]));
const samples = [
  ...pick(deliveryIccids, 5).map((iccid) => [PHYSICAL, iccid]),
  ...pick(esimCandidates.map((s) => s.simSerial), 10).map((iccid) => [CANDIDATES, iccid]),
  ...unusual.filter((s) => !deliverySet.has(s.simSerial)).slice(0, 3).map((s) => ["unusual SIM from section 5", s.simSerial]),
];
const verdicts = {};
const esimProfiles = [];
for (const [group, iccid] of samples) {
  const r = await api("GET", `/sim-management/sims/api/esims/sim-serial/${iccid}`);
  let verdict;
  if (r.status === 200) verdict = "eSIM";
  else if (r.status === 401 || r.status === 403) verdict = "no access to the SIM Management API — can't tell";
  else if (r.status === 400 || r.status === 404) verdict = "not an eSIM";
  else verdict = `unknown (HTTP ${r.status})`;
  (verdicts[group] ||= []).push(verdict);
  if (r.status === 200 && group === CANDIDATES) esimProfiles.push({ status: r.body.status, hasCode: Boolean(r.body.activationCode) });
  const details =
    r.status === 200
      ? `profile status=${r.body.status}, statusDate=${r.body.statusDate}, activation code present: ${Boolean(r.body.activationCode)}, smdpAddress=${r.body.smdpAddress ?? "-"}, eid present: ${Boolean(r.body.eid)}`
      : errorSummary(r);
  print(`${group} ${iccid}: HTTP ${r.status} -> ${verdict}${details ? ` | ${details}` : ""}`);
}
for (const [group, list] of Object.entries(verdicts)) print(`Verdict ${group}:`, tally(list, (v) => v));
if (esimProfiles.length) {
  print("eSIM candidates — profile status:", tally(esimProfiles, (p) => p.status), `| activation code present: ${esimProfiles.filter((p) => p.hasCode).length}/${esimProfiles.length}`);
}

// --- 7. OCS inventory of order 13's SIM -----------------------------------
heading("7. OCS inventory on order 13's SIM (expect 0 products)");
print(order13?.msisdn ? `MSISDN ${digitsOnly(order13.msisdn)}: ${await ocsInventory(order13.msisdn)}` : "Skipped: no MSISDN known for this SIM yet.");

// --- 8. Permissions (OPTIONS only — nothing is executed) -------------------
heading("8. Permissions — which methods our account may use (OPTIONS)");
for (const [label, path] of [
  ["Place order (needs POST)", "/ocs/subscriptions/api/orders/products"],
  ["Release eSIM profile (needs PATCH)", `/sim-management/sims/api/esims/sim-serial/${ORDER_13_ICCID}`],
  ["SIM Search (needs GET)", "/sim-search/api/sim/search"],
]) {
  const r = await api("OPTIONS", path);
  print(`${label}: HTTP ${r.status}, Allow: ${r.allow ?? "(no Allow header)"}`);
}

// --- 9. Verdicts ------------------------------------------------------------
heading("9. Verdicts");
const all = (group, verdict) => (verdicts[group] || []).length > 0 && verdicts[group].every((v) => v === verdict);
const allReleased = esimProfiles.length > 0 && esimProfiles.every((p) => p.status === "released" && p.hasCode);
const checks = [
  [`CSO_7434 file has 1,000 SIMs (has ${deliveryIccids.length})`, deliveryIccids.length === 1000],
  ["CSO_7434 samples are all not eSIMs (physical)", all(PHYSICAL, "not an eSIM")],
  [`SIMs on the account not in the CSO_7434 file: 500 (found ${esimCandidates.length})`, esimCandidates.length === 500],
  ["Those samples are all eSIMs", all(CANDIDATES, "eSIM")],
  ["Sampled eSIM profiles are all already released with an activation code (GET-only provisioning works)", allReleased],
];
for (const [label, ok] of checks) print(`${ok ? "CONFIRMED    " : "NOT CONFIRMED"}  ${label}`);
if (esimProfiles.length && !allReleased) {
  print(
    "NOTE: some sampled eSIM profiles are not 'released' (see section 6). 'available'/'allocated' profiles need releasing, which our account can't do (no PATCH permission) — ask Transatel. Profiles 'downloaded', 'installed', 'enabled', 'disabled' or 'deleted' have already been on a device and must not be sold."
  );
}

console.log("\nDone. Read-only: no orders placed, no SIMs activated, no eSIM profiles released.");
