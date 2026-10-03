"use server";

import { revalidatePath } from "next/cache";
import { markPhysicalOrderDelivered, shipPhysicalOrder } from "@/lib/checkout/orders-repository";
import { sendSimShippedEmail } from "@/lib/email/order-emails";
import { normalizeIccid } from "@/lib/sims/eligibility";
import { logAudit } from "./accounts";
import { requireStaffSession } from "./auth";

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
  if (!iccid) return { ok: false, message: "Enter the ICCID printed on the card (18–22 digits)." };
  const tracking = rawTracking.trim().slice(0, 100) || null;

  const result = await shipPhysicalOrder(orderId, iccid, tracking, session.staffId);
  if (!result.ok) return { ok: false, message: result.error };
  await logAudit(session.staffId, "sim_shipped", null, `ORD-${orderId}: SIM ${iccid}${tracking ? `, tracking ${tracking}` : ""}`);
  const email = await sendSimShippedEmail(orderId);
  revalidateShipping();
  return { ok: true, message: `Marked shipped with SIM ${iccid}. ${email.message}` };
}

export async function markPhysicalOrderDeliveredAction(orderId: number): Promise<ShippingActionResult> {
  const session = await requireStaffSession();
  if (!(await markPhysicalOrderDelivered(orderId))) return { ok: false, message: "Only shipped orders can be marked delivered." };
  await logAudit(session.staffId, "sim_delivered", null, `ORD-${orderId}`);
  revalidateShipping();
  return { ok: true, message: "Marked delivered." };
}
