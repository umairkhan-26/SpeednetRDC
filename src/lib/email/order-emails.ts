import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getOrderById, markConfirmationEmailSent, type CheckoutOrder } from "@/lib/checkout/orders-repository";
import { getAppUrl } from "@/lib/checkout/stripe";
import { sendEmail } from "./send";
import { orderReadyEmail } from "./templates";

/** The customer's private order page, in the language they checked out in. */
export function orderPageUrl(order: Pick<CheckoutOrder, "accessToken" | "locale">): string | null {
  if (!order.accessToken) return null;
  const locale = hasLocale(routing.locales, order.locale) ? order.locale : routing.defaultLocale;
  return `${getAppUrl()}/${locale}/order/${order.accessToken}`;
}

/**
 * Emails the customer the link to their private order page once their
 * eSIM is provisioned — never the activation code itself. Sent once per
 * order unless `resend` is set (admin "Resend email"). Never throws.
 */
export async function sendOrderReadyEmail(orderId: number, opts: { resend?: boolean } = {}): Promise<{ ok: boolean; message: string }> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return { ok: false, message: "Order not found." };
    if (order.provisioningStatus !== "provisioned") return { ok: false, message: "The eSIM isn't provisioned yet." };
    if (order.confirmationEmailSentAt && !opts.resend) return { ok: true, message: "Already sent." };
    const url = orderPageUrl(order);
    if (!url) return { ok: false, message: "Order has no private link." };

    const email = orderReadyEmail({ customerName: order.customerName, planName: order.planName, orderNumber: order.id, orderUrl: url });
    const result = await sendEmail({
      to: order.customerEmail,
      ...email,
      idempotencyKey: opts.resend ? `order-ready-${order.id}-${Date.now()}` : `order-ready-${order.id}`,
    });
    if (!result.ok) return { ok: false, message: `Email not sent: ${result.error}` };
    await markConfirmationEmailSent(order.id);
    return { ok: true, message: `Email sent to ${order.customerEmail}.` };
  } catch (error) {
    console.error(`[email] Order ${orderId} ready email failed:`, error);
    return { ok: false, message: "Email not sent (unexpected error — see server logs)." };
  }
}
