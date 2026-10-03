"use server";

import { getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";
import { listCustomerSims } from "@/lib/checkout/orders-repository";
import { isPhysicalSimEnabled } from "@/lib/physical-sim";
import { findTopUpTarget } from "@/lib/sims/eligibility";
import { getCustomerEmail } from "./session";

export type TopUpSimCheck = { ok: true; iccid: string; simType: "esim" | "physical" } | { ok: false; error: string };

/**
 * "Add to my SIM" without signing in: is this ICCID one of our SIMs that
 * reached a customer? Answers only yes/no, and wrong guesses are
 * rate-limited per (hashed) IP so ICCIDs can't be probed.
 */
export async function checkTopUpSimAction(rawIccid: string): Promise<TopUpSimCheck> {
  if (!isPhysicalSimEnabled()) return { ok: false, error: "Adding data to an existing SIM isn't available yet." };
  const bucket = rateLimitBucket("topup-iccid-ip", await getClientIp());
  if (await isRateLimited(bucket, 20, 60 * 60)) return { ok: false, error: "Too many attempts. Please try again later." };
  const target = await findTopUpTarget(String(rawIccid ?? ""));
  if (!target) {
    await recordAttempt(bucket);
    return { ok: false, error: "We couldn't find that SIM. Check the number printed on your SIM card." };
  }
  return { ok: true, iccid: target.iccid, simType: target.simType };
}

/** The signed-in customer's own SIMs, to pick one for "Add to my SIM". Empty when not signed in. */
export async function listMySimsAction(): Promise<{ iccid: string; simType: "esim" | "physical" }[]> {
  if (!isPhysicalSimEnabled()) return [];
  const email = await getCustomerEmail();
  if (!email) return [];
  return (await listCustomerSims(email)).map((s) => ({ iccid: s.iccid, simType: s.simType }));
}
