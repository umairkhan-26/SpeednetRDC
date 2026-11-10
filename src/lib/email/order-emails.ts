import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getOrderById, markConfirmationEmailSent, type CheckoutOrder } from "@/lib/checkout/orders-repository";
import { getAppUrl } from "@/lib/checkout/stripe";
import { pendingAnswer, SHIPS_FROM } from "@/lib/physical-sim";
import { sendEmail } from "./send";
import { orderReadyEmail, simOnItsWayEmail, simShippedEmail, topUpReadyEmail } from "./templates";

const DELIVERY_ESTIMATE = "3–5 working days";

type EmailResult = { ok: boolean; message: string };

/** The customer's private order page, in the language they checked out in. */
export function orderPageUrl(order: Pick<CheckoutOrder, "accessToken" | "locale">): string | null {
  if (!order.accessToken) return null;
  const locale = hasLocale(routing.locales, order.locale) ? order.locale : routing.defaultLocale;
  return `${getAppUrl()}/${locale}/order/${order.accessToken}`;
}

export interface OrderEmailResult {
  ok: boolean;
  /** For the admin panel's translated message: a key under admin.msg.orderEmail. */
  code: "notFound" | "notProvisioned" | "alreadySent" | "noLink" | "notSent" | "sent" | "unexpected" | "simCardOrder" | "topupNotReady";
  /** English, for logs. */
  message: string;
  email?: string;
  error?: string;
}

/**
 * Emails the customer the link to their private order page once their
 * eSIM is provisioned — never the activation code itself. Sent once per
 * order unless `resend` is set (admin "Resend email"). A top-up gets its
 * own "data added" email instead. Never throws.
 */
export async function sendOrderReadyEmail(orderId: number, opts: { resend?: boolean } = {}): Promise<OrderEmailResult> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return { ok: false, code: "notFound", message: "Order not found." };
    if (order.productType === "topup") return sendTopUpReadyEmail(orderId, opts);
    if (order.productType === "physical_sim") return { ok: false, code: "simCardOrder", message: "SIM card orders get shipping emails instead." };
    if (order.provisioningStatus !== "provisioned") return { ok: false, code: "notProvisioned", message: "The eSIM isn't provisioned yet." };
    if (order.confirmationEmailSentAt && !opts.resend) return { ok: true, code: "alreadySent", message: "Already sent." };
    const url = orderPageUrl(order);
    if (!url) return { ok: false, code: "noLink", message: "Order has no private link." };

    const email = orderReadyEmail({ customerName: order.customerName, planName: order.planName, orderNumber: order.id, orderUrl: url, withdrawalConsentAt: order.withdrawalConsentAt });
    const result = await sendEmail({
      to: order.customerEmail,
      ...email,
      idempotencyKey: opts.resend ? `order-ready-${order.id}-${Date.now()}` : `order-ready-${order.id}`,
    });
    if (!result.ok) return { ok: false, code: "notSent", error: result.error, message: `Email not sent: ${result.error}` };
    await markConfirmationEmailSent(order.id);
    return { ok: true, code: "sent", email: order.customerEmail, message: `Email sent to ${order.customerEmail}.` };
  } catch (error) {
    console.error(`[email] Order ${orderId} ready email failed:`, error);
    return { ok: false, code: "unexpected", message: "Email not sent (unexpected error — see server logs)." };
  }
}

/** "Your SIM is on its way" — sent once, when a SIM card order is paid. Never throws. */
export async function sendSimOnItsWayEmail(orderId: number): Promise<EmailResult> {
  try {
    const order = await getOrderById(orderId);
    if (!order || order.productType !== "physical_sim" || order.status !== "completed") return { ok: false, message: "Not a paid SIM card order." };
    if (order.confirmationEmailSentAt) return { ok: true, message: "Already sent." };
    const url = orderPageUrl(order);
    if (!url) return { ok: false, message: "Order has no private link." };
    const email = simOnItsWayEmail({
      customerName: order.customerName,
      orderNumber: order.id,
      orderUrl: url,
      deliveryEstimate: DELIVERY_ESTIMATE,
      shipsFrom: SHIPS_FROM,
      returnsText: pendingAnswer("returns", "en"),
    });
    const result = await sendEmail({ to: order.customerEmail, ...email, idempotencyKey: `sim-on-its-way-${order.id}` });
    if (!result.ok) return { ok: false, message: `Email not sent: ${result.error}` };
    await markConfirmationEmailSent(order.id);
    return { ok: true, message: `Email sent to ${order.customerEmail}.` };
  } catch (error) {
    console.error(`[email] Order ${orderId} "on its way" email failed:`, error);
    return { ok: false, message: "Email not sent (unexpected error — see server logs)." };
  }
}

/** "Your SIM has shipped" — after staff record the card and tracking number. Never throws. */
export async function sendSimShippedEmail(orderId: number): Promise<EmailResult> {
  try {
    const order = await getOrderById(orderId);
    if (!order || order.productType !== "physical_sim" || order.shippingStatus !== "shipped") return { ok: false, message: "Order isn't shipped." };
    const url = orderPageUrl(order);
    if (!url) return { ok: false, message: "Order has no private link." };
    const email = simShippedEmail({
      customerName: order.customerName,
      orderNumber: order.id,
      orderUrl: url,
      trackingNumber: order.trackingNumber,
      deliveryEstimate: DELIVERY_ESTIMATE,
    });
    const result = await sendEmail({ to: order.customerEmail, ...email, idempotencyKey: `sim-shipped-${order.id}` });
    return result.ok ? { ok: true, message: `Shipping email sent to ${order.customerEmail}.` } : { ok: false, message: `Shipping email not sent: ${result.error}` };
  } catch (error) {
    console.error(`[email] Order ${orderId} "shipped" email failed:`, error);
    return { ok: false, message: "Shipping email not sent (unexpected error — see server logs)." };
  }
}

/** "Data added to your SIM" — sent once, when a top-up's plan is on the SIM. Never throws. */
export async function sendTopUpReadyEmail(orderId: number, opts: { resend?: boolean } = {}): Promise<OrderEmailResult> {
  try {
    const order = await getOrderById(orderId);
    if (!order || order.productType !== "topup") return { ok: false, code: "notFound", message: "Not a top-up order." };
    if (order.provisioningStatus !== "provisioned") return { ok: false, code: "topupNotReady", message: "The plan isn't on the SIM yet." };
    if (order.confirmationEmailSentAt && !opts.resend) return { ok: true, code: "alreadySent", message: "Already sent." };
    const url = orderPageUrl(order);
    if (!url || !order.iccid) return { ok: false, code: "noLink", message: "Order has no private link." };
    const email = topUpReadyEmail({
      customerName: order.customerName,
      planName: order.planName,
      orderNumber: order.id,
      simEnding: order.iccid.slice(-4),
      orderUrl: url,
      startWindowText: pendingAnswer("startWindow", "en"),
      withdrawalConsentAt: order.withdrawalConsentAt,
    });
    const result = await sendEmail({
      to: order.customerEmail,
      ...email,
      idempotencyKey: opts.resend ? `topup-ready-${order.id}-${Date.now()}` : `topup-ready-${order.id}`,
    });
    if (!result.ok) return { ok: false, code: "notSent", error: result.error, message: `Email not sent: ${result.error}` };
    await markConfirmationEmailSent(order.id);
    return { ok: true, code: "sent", email: order.customerEmail, message: `Email sent to ${order.customerEmail}.` };
  } catch (error) {
    console.error(`[email] Order ${orderId} top-up email failed:`, error);
    return { ok: false, code: "unexpected", message: "Email not sent (unexpected error — see server logs)." };
  }
}
