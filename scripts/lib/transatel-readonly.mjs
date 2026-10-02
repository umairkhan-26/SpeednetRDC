// Read-only Transatel API access for operational scripts
// (scripts/transatel-check.mjs, scripts/import-esims.mjs). The request
// helper refuses anything but GET/OPTIONS, so these scripts can never place
// orders, activate SIMs or release eSIM profiles. Reads credentials from
// the environment (run with --env-file=.env.local).

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set. Add it to .env.local.`);
    process.exit(1);
  }
  return value;
}

export const BASE = (process.env.TRANSATEL_API_BASE_URL || "https://api.transatel.com").replace(/\/+$/, "");
export const LOGIN = requireEnv("TRANSATEL_API_LOGIN");
const PASSWORD = requireEnv("TRANSATEL_API_PASSWORD");
export const MVNO_REF = requireEnv("TRANSATEL_MVNO_REF");

let token;

export async function authenticate() {
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

export async function api(method, path, query) {
  if (method !== "GET" && method !== "OPTIONS") throw new Error(`Refusing ${method} ${path}: read-only`);
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

export const errorSummary = (r) =>
  r.body && typeof r.body === "object" ? `${r.body.title ?? ""} ${r.body.detail ?? ""}`.trim() : String(r.body ?? "");

/** Every SIM on the account, via SIM Search (pages of up to 10,000). */
export async function searchAllSims() {
  const sims = [];
  let page = 1;
  let totalPages = 1;
  do {
    const r = await api("GET", "/sim-search/api/sim/search", { size: "10000", page: String(page) });
    if (r.status !== 200) return { error: `HTTP ${r.status} ${errorSummary(r)}`, sims };
    sims.push(...(r.body.sims || []));
    totalPages = r.body.totalPages || 1;
    page++;
  } while (page <= totalPages);
  return { sims };
}

/** ICCIDs from Transatel's CSO_7434 delivery file (the 1,000 physical SIMs). */
export async function readPhysicalDeliveryIccids(path = "scripts/source/sim-inventory.csv") {
  const fs = await import("node:fs");
  return fs
    .readFileSync(path, "utf8")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(";")[3]?.trim())
    .filter(Boolean);
}
