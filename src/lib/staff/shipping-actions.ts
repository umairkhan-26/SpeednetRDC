"use server";

import { revalidatePath } from "next/cache";
import { markPhysicalOrderDelivered, shipPhysicalOrder } from "@/lib/checkout/orders-repository";
import { sendSimShippedEmail } from "@/lib/email/order-emails";
import { normalizeIccid } from "@/lib/sims/eligibility";
import { provisionEsimOrder } from "@/lib/transatel/provisioning";
import { logAudit } from "./accounts";
import { requireStaffSession } from "./auth";
import { getAdminT } from "@/i18n/admin";

/** A message for the person using the panel, in their admin-panel language (keys under admin.msg). */
async function msg(key: string, values?: Record<string, string | number>): Promise<string> {
  const t = await getAdminT();
  return t(`msg.${key}`, values);
}

export interface ShippingActionResult {
  ok: boolean;
  message: string;
}

function revalidateShipping() {
  revalidatePath("/staff/shipping");
  revalidatePath("/admin/shipping");
  revalidatePath("/admin/sims");
}

/**
 * Staff record which card they posted (typed or scanned ICCID) and an
 * optional tracking number. The ICCID must be an available physical SIM in
 * stock; the card is then assigned to this customer and they get a
 * "shipped" email.
 */
export async function shipPhysicalOrderAction(orderId: number, rawIccid: string, rawTracking: string): Promise<ShippingActionResult> {
  const session = await requireStaffSession();
  const iccid = normalizeIccid(rawIccid);
  if (!iccid) return { ok: false, message: await msg("shipping.enterIccid") };
  const tracking = rawTracking.trim().slice(0, 100) || null;

  const result = await shipPhysicalOrder(orderId, iccid, tracking, session.staffId);
  if (!result.ok) return { ok: false, message: await msg(`shipping.${result.error}`, { status: result.simStatus ?? "" }) };
  await logAudit(session.staffId, "sim_shipped", null, `ORD-${orderId}: SIM ${iccid}${tracking ? `, tracking ${tracking}` : ""}`);
  // Puts the included data plan on the card (live orders only; never throws:
  // a failure lands in the dashboard's "needing attention" list with Retry).
  await provisionEsimOrder(orderId);
  const email = await sendSimShippedEmail(orderId);
  revalidateShipping();
  const emailNote = email.ok ? await msg("shipping.emailSent") : await msg("shipping.emailNotSent");
  return { ok: true, message: `${await msg("shipping.shipped", { iccid })} ${emailNote}` };
}

export async function markPhysicalOrderDeliveredAction(orderId: number): Promise<ShippingActionResult> {
  const session = await requireStaffSession();
  if (!(await markPhysicalOrderDelivered(orderId))) return { ok: false, message: await msg("shipping.onlyShipped") };
  await logAudit(session.staffId, "sim_delivered", null, `ORD-${orderId}`);
  revalidateShipping();
  return { ok: true, message: await msg("shipping.markedDelivered") };
}
