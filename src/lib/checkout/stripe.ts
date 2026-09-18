import Stripe from "stripe";

declare global {
  var __stripeClient__: Stripe | undefined;
}

// Cached on globalThis for the same reason as the MySQL pool in
// src/lib/staff/db.ts: avoids re-instantiating on every module reload in
// dev, and is never constructed at import time (Next collects build-time
// page data even for routes that won't run during the build).
export function getStripe(): Stripe {
  if (!globalThis.__stripeClient__) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    globalThis.__stripeClient__ = new Stripe(secretKey);
  }
  return globalThis.__stripeClient__;
}

export function getAppUrl(): string {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
