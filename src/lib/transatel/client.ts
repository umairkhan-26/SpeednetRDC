import {
  getTransatelApiBaseUrl,
  getTransatelCos,
  getTransatelLogin,
  getTransatelMvnoRef,
  getTransatelPassword,
} from "./config";

/**
 * OAuth2 client-credentials token, cached on globalThis (same pattern as
 * the Stripe client and MySQL pool) so we don't request a new token on
 * every call — Transatel's tokens are valid for ~1 hour and are meant to
 * be reused. Re-fetched a little before actual expiry to avoid edge-case
 * failures on a request that starts just as the token expires.
 */
declare global {
  var __transatelToken__: { accessToken: string; expiresAt: number } | undefined;
}

const TOKEN_SAFETY_MARGIN_MS = 30_000;

async function getAccessToken(): Promise<string> {
  const cached = globalThis.__transatelToken__;
  if (cached && cached.expiresAt > Date.now() + TOKEN_SAFETY_MARGIN_MS) {
    return cached.accessToken;
  }

  const baseUrl = getTransatelApiBaseUrl();
  const login = getTransatelLogin();
  const password = getTransatelPassword();
  const basicAuth = Buffer.from(`${login}:${password}`).toString("base64");

  const response = await fetch(`${baseUrl}/authentication/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Transatel auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  globalThis.__transatelToken__ = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function transatelFetch(path: string, init: RequestInit): Promise<Response> {
  const baseUrl = getTransatelApiBaseUrl();
  const token = await getAccessToken();
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export interface TransatelOrderResult {
  id: string;
  orderReference: string;
  status: string;
  subscriptionId: string;
  submissionDate: string;
}

export class TransatelApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "TransatelApiError";
  }
}

/**
 * Checks a product exists and is subscribable in this account's catalog
 * before placing an order — catches a wrong/stale productId with a clear
 * error instead of failing deep inside order placement.
 * GET /ocs/catalog/api/cos/{cosRef}/products/{productId}
 */
export async function checkProductInCatalog(productId: string): Promise<boolean> {
  const cos = getTransatelCos();
  const response = await transatelFetch(
    `/ocs/catalog/api/cos/${encodeURIComponent(cos)}/products/${encodeURIComponent(productId)}`,
    { method: "GET" }
  );
  if (response.status === 404) return false;
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new TransatelApiError(`Catalog lookup failed (${response.status})`, response.status, body);
  }
  const data = (await response.json()) as { products?: unknown[] };
  return Array.isArray(data.products) && data.products.length > 0;
}

/**
 * Transatel's order and inventory APIs take the MSISDN as digits only
 * (pattern [0-9]{6,15}), but SIM Search returns it with a leading "+".
 */
export function toMsisdnDigits(msisdn: string): string {
  const digits = msisdn.replace(/\D/g, "");
  if (!/^[0-9]{6,15}$/.test(digits)) throw new Error(`Invalid MSISDN "${msisdn}"`);
  return digits;
}

/**
 * Places the customer's data plan on one of our SIMs.
 *
 * orderType "preload": Transatel's OCS subscriptions spec (v1.87) defines it
 * as adding "a product on a Pre-Activated subscriber", activated when the
 * subscriber activates — exactly our Service Provider Connect SIMs, which
 * arrive pre-activated and activate at first network attach (the bundle
 * starts when first used in a covered location). "subscribe" is for
 * subscribers that are already active. History: "preload" once returned
 * 501 "Missing configuration" on the demo account, which led to a switch
 * to "subscribe"; production SPC SIMs are pre-activated, so per the spec
 * this is "preload". Payment provider "customer" per Transatel for this
 * account type.
 *
 * The order is synchronous: success is HTTP 201 with status "done".
 *
 * POST /ocs/subscriptions/api/orders/products
 */
export async function placePreloadOrder(params: {
  msisdn: string;
  productId: string;
  transactionReference: string;
}): Promise<TransatelOrderResult> {
  const mvnoRef = getTransatelMvnoRef();
  const requestBody = {
    bind: { msisdn: toMsisdnDigits(params.msisdn) },
    product: { productId: params.productId },
    payment: { provider: "customer" },
    source: "speednetrdc-webhook",
    orderType: "preload",
    mvnoRef,
    transactionReference: params.transactionReference,
  };

  // Logged because this endpoint's exact request shape has changed twice
  // already (orderType, payment.provider) chasing errors that were opaque
  // without seeing what was actually sent — see the comment above.
  console.log("[transatel] placePreloadOrder request:", JSON.stringify(requestBody));

  const response = await transatelFetch("/ocs/subscriptions/api/orders/products", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // Notably includes PRODUCT_NOT_FOUND, PRODUCT_NOT_ELIGIBLE, INSUFFICIENT_FUND —
    // see Transatel's OCS subscriptions API error table.
    throw new TransatelApiError(
      `Transatel order failed (${response.status}): ${JSON.stringify(body)}`,
      response.status,
      body
    );
  }

  return body as TransatelOrderResult;
}

async function getJson(path: string, what: string): Promise<{ status: number; body: unknown }> {
  const response = await transatelFetch(path, { method: "GET" });
  const body = await response.json().catch(() => null);
  if (!response.ok && response.status !== 404) {
    throw new TransatelApiError(`${what} failed (${response.status}): ${JSON.stringify(body)}`, response.status, body);
  }
  return { status: response.status, body };
}

/**
 * Looks a SIM up by ICCID in SIM Search. Returns its MSISDN (digits only)
 * and Transatel status (e.g. "Pre-Activated"), or null if unknown. Transatel
 * notes SIM Search can lag behind reality slightly.
 *
 * GET /sim-search/api/sim/search?simSerial=eq:{iccid}
 */
export async function searchSimByIccid(iccid: string): Promise<{ msisdn: string | null; status: string | null } | null> {
  const { body } = await getJson(
    `/sim-search/api/sim/search?simSerial=${encodeURIComponent(`eq:${iccid}`)}`,
    "SIM Search"
  );
  const sim = (body as { sims?: { msisdn?: string; status?: string }[] } | null)?.sims?.[0];
  if (!sim) return null;
  return { msisdn: sim.msisdn ? toMsisdnDigits(sim.msisdn) : null, status: sim.status ?? null };
}

export interface EsimDetails {
  /** allocated | available | released | downloaded | installed | enabled | disabled | deleted */
  status: string;
  /** "1$<SM-DP+ address>$<matching ID>" — only present once the profile is released. */
  activationCode: string | null;
  smdpAddress: string | null;
  /** Set once the profile is bound to (or installed on) a device. */
  eid: string | null;
}

/**
 * Reads an eSIM profile from the SM-DP+. Returns null for a SIM that isn't
 * an eSIM (Transatel answers 404 "Unknown eSIM", e.g. our physical cards).
 * Read-only: our account can't release profiles (no PATCH permission), but
 * our stock was delivered already released, which is all we need.
 *
 * GET /sim-management/sims/api/esims/sim-serial/{iccid}
 */
export async function getEsimDetails(iccid: string): Promise<EsimDetails | null> {
  const { status, body } = await getJson(`/sim-management/sims/api/esims/sim-serial/${encodeURIComponent(iccid)}`, "Get eSIM details");
  if (status === 404) {
    // Only Transatel's explicit "Unknown eSIM" answer means "not an eSIM".
    // Any other 404 (wrong path, gateway error) must not be mistaken for it,
    // or real eSIMs would be re-typed as physical stock.
    if ((body as { title?: string } | null)?.title === "ESIM_NOT_FOUND") return null;
    throw new TransatelApiError(`Get eSIM details failed (404): ${JSON.stringify(body)}`, 404, body);
  }
  const b = body as { status: string; activationCode?: string; smdpAddress?: string; eid?: string };
  return { status: b.status, activationCode: b.activationCode ?? null, smdpAddress: b.smdpAddress ?? null, eid: b.eid ?? null };
}

/**
 * Products currently on a SIM (any status except terminated). Used before
 * placing an order so a retried provisioning attempt never puts a second
 * copy of the plan on the SIM.
 *
 * GET /ocs/inventory/api/subscriptions/products?msisdn={digits}
 */
export async function getSubscriberProducts(msisdn: string): Promise<{ subscriptionId: string; productId: string; status: string }[]> {
  const query = new URLSearchParams({ msisdn: toMsisdnDigits(msisdn) });
  for (const status of ["active", "pending", "pendingForFirstUse", "readyForUse", "scheduled"]) query.append("statuses", status);
  const { status, body } = await getJson(`/ocs/inventory/api/subscriptions/products?${query}`, "OCS inventory");
  if (status === 404) return [];
  const list = (body as { productSubscriptions?: { subscriptionId: string; status: string; productDefinition?: { productId?: string } }[] } | null)
    ?.productSubscriptions ?? [];
  return list.map((s) => ({ subscriptionId: s.subscriptionId, productId: s.productDefinition?.productId ?? "", status: s.status }));
}
