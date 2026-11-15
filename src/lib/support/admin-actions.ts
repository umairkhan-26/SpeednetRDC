"use server";

import { revalidatePath } from "next/cache";
import { getOrderById } from "@/lib/checkout/orders-repository";
import { requireAdminSession } from "@/lib/staff/auth";
import { isTicketStatus, MAX_SUPPORT_MESSAGE } from "./categories";
import { notifyCustomerOfReply } from "./notify";
import { addStaffMessage, getTicketForAdmin, setTicketStatus } from "./repository";

/** An admin answers a customer's request; the customer is emailed and sees it in their account. */
export async function replyToTicketAsAdminAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const ticketId = Number(formData.get("ticketId"));
  const message = String(formData.get("message") ?? "").trim();
  if (!Number.isInteger(ticketId) || message.length < 1 || message.length > MAX_SUPPORT_MESSAGE) return;

  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket || !(await addStaffMessage(session.staffId, ticketId, message))) return;

  const order = await getOrderById(ticket.orderId);
  await notifyCustomerOfReply({ ticketId, orderId: ticket.orderId, to: ticket.customerEmail, locale: order?.locale ?? null, reply: message });
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
}

/** Resolve or reopen a request. */
export async function setTicketStatusAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const ticketId = Number(formData.get("ticketId"));
  const status = formData.get("status");
  if (!Number.isInteger(ticketId) || !isTicketStatus(status)) return;
  await setTicketStatus(ticketId, status);
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
}
