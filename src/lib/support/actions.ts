"use server";

import { revalidatePath } from "next/cache";
import { getClientIp, isRateLimited, rateLimitBucket, recordAttempt } from "@/lib/auth/rate-limit";
import { listOrdersForCustomer } from "@/lib/checkout/orders-repository";
import { getCustomerEmail } from "@/lib/customer/session";
import { isSupportCategory, MAX_SUPPORT_MESSAGE } from "./categories";
import { notifyTeamOfTicket } from "./notify";
import { addCustomerMessage, createTicket, markTicketReadByCustomer } from "./repository";

/** error is a key under support.errors. */
export type SupportResult = { ok: true } | { ok: false; error: "notSignedIn" | "invalid" | "tooMany" | "noOrder" | "failed" };

/** A signed-in customer reports a problem with one of their own orders / SIMs. */
export async function createTicketAction(input: { orderId: number; category: string; message: string }): Promise<SupportResult> {
  const email = await getCustomerEmail();
  if (!email) return { ok: false, error: "notSignedIn" };

  const message = String(input?.message ?? "").trim();
  const orderId = Number(input?.orderId);
  if (!Number.isInteger(orderId) || !isSupportCategory(input?.category) || message.length > MAX_SUPPORT_MESSAGE) return { ok: false, error: "invalid" };
  if (input.category === "other" && message.length < 5) return { ok: false, error: "invalid" };

  // At most 6 requests an hour per customer (and per visitor IP).
  const emailBucket = rateLimitBucket("support-ticket-email", email);
  const ipBucket = rateLimitBucket("support-ticket-ip", await getClientIp());
  if ((await isRateLimited(emailBucket, 6, 60 * 60)) || (await isRateLimited(ipBucket, 20, 60 * 60))) return { ok: false, error: "tooMany" };

  // The order must be one of this customer's paid orders; the SIM comes from the order, never from the browser.
  const order = (await listOrdersForCustomer(email)).find((o) => o.id === orderId && o.status === "completed");
  if (!order) return { ok: false, error: "noOrder" };

  try {
    await recordAttempt(emailBucket, ipBucket);
    const ticketId = await createTicket({ customerEmail: email, orderId: order.id, iccid: order.iccid, category: input.category, message });
    await notifyTeamOfTicket({ ticketId, orderId: order.id, category: input.category, customerName: order.customerName, message });
    revalidatePath("/[locale]/account", "page");
    return { ok: true };
  } catch (error) {
    console.error("[support] Couldn't create a ticket:", error instanceof Error ? error.message : error);
    return { ok: false, error: "failed" };
  }
}

/** The customer answers in a request thread. */
export async function replyToTicketAction(input: { ticketId: number; message: string }): Promise<SupportResult> {
  const email = await getCustomerEmail();
  if (!email) return { ok: false, error: "notSignedIn" };
  const message = String(input?.message ?? "").trim();
  const ticketId = Number(input?.ticketId);
  if (!Number.isInteger(ticketId) || message.length < 1 || message.length > MAX_SUPPORT_MESSAGE) return { ok: false, error: "invalid" };

  const bucket = rateLimitBucket("support-reply-email", email);
  if (await isRateLimited(bucket, 30, 60 * 60)) return { ok: false, error: "tooMany" };
  try {
    await recordAttempt(bucket);
    const stored = await addCustomerMessage(email, ticketId, message);
    if (!stored) return { ok: false, error: "invalid" };
    revalidatePath("/[locale]/account", "page");
    return { ok: true };
  } catch (error) {
    console.error("[support] Couldn't save a reply:", error instanceof Error ? error.message : error);
    return { ok: false, error: "failed" };
  }
}

export async function markTicketReadAction(ticketId: number): Promise<void> {
  const email = await getCustomerEmail();
  if (!email || !Number.isInteger(Number(ticketId))) return;
  await markTicketReadByCustomer(email, Number(ticketId));
}
