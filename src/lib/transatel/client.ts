import {
  getTransatelApiBaseUrl,
  getTransatelCos,
  getTransatelLogin,
  getTransatelMvnoRef,
  getTransatelPassword,
  getTransatelRatePlan,
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
 * Places a "preload" order: adds a product to a Pre-Activated subscriber
 * (i.e. one of our uninstalled physical/eSIM SIMs), to be activated when
 * the customer activates their SIM. This is the right orderType for SIMs
 * that haven't been used yet — see Transatel's OCS subscriptions API docs
 * ("preload" vs "subscribe").
 *
 * POST /ocs/subscriptions/api/orders/products
 */
export async function placePreloadOrder(params: {
  msisdn: string;
  productId: string;
  transactionReference: string;
}): Promise<TransatelOrderResult> {
  const mvnoRef = getTransatelMvnoRef();

  const response = await transatelFetch("/ocs/subscriptions/api/orders/products", {
    method: "POST",
    body: JSON.stringify({
      bind: { msisdn: params.msisdn },
      product: { productId: params.productId },
      payment: { provider: "credit" },
      source: "speednetrdc-webhook",
      orderType: "preload",
      mvnoRef,
      transactionReference: params.transactionReference,
    }),
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

export interface TransatelActivationResult {
  transactionId: string;
  simSerial: string;
  transactionStatus: string;
}

/**
 * Activates a brand-new SIM (one that has never had a subscriber before —
 * status "Available" in Transatel's delivery file, no MSISDN yet) via the
 * Connectivity Management API, using the SIM's ICCID as its serial number.
 *
 * IMPORTANT: this is asynchronous. A successful call only means the
 * activation request was accepted (transactionStatus: "PENDING") — the
 * actual MSISDN is not known yet and is delivered later via a
 * CONNECTIVITY-MANAGEMENT/SUBSCRIBER/ACTIVATED event (see
 * src/app/api/transatel/events/route.ts, which finishes provisioning once
 * that event arrives). Do not call placePreloadOrder with a guessed
 * MSISDN after this — wait for that event.
 *
 * POST /connectivity-management/subscribers/api/subscribers/sim-serial/{iccid}/activate
 */
export async function activateSim(params: {
  iccid: string;
  externalReference: string;
}): Promise<TransatelActivationResult> {
  const ratePlan = getTransatelRatePlan();

  const response = await transatelFetch(
    `/connectivity-management/subscribers/api/subscribers/sim-serial/${encodeURIComponent(params.iccid)}/activate`,
    {
      method: "POST",
      body: JSON.stringify({
        ratePlan,
        externalReference: params.externalReference,
      }),
    }
  );

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new TransatelApiError(
      `Transatel SIM activation failed (${response.status}): ${JSON.stringify(body)}`,
      response.status,
      body
    );
  }

  return body as TransatelActivationResult;
}
