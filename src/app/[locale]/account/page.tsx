import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/i18n/metadata";
import { getCustomerEmail } from "@/lib/customer/session";
import { listOrdersForCustomer } from "@/lib/checkout/orders-repository";
import AccountView, { type CustomerOrderSummary } from "./AccountView";
import { isTopUpEnabled } from "@/lib/topup";
import { getCustomerSimStatuses } from "@/lib/sims/customer-sims";
import { listTicketsForCustomer } from "@/lib/support/repository";
import type { CustomerTicket } from "./SupportPanel";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { ...(await pageMetadata(locale, "account")), robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const email = await getCustomerEmail();
  if (!email) redirect(`/${locale}/login`);

  // Only what the list needs goes to the browser — never the activation
  // code or SIM details; those stay on each order's private page.
  const orders: CustomerOrderSummary[] = (await listOrdersForCustomer(email)).map((order) => ({
    id: order.id,
    planName: order.planName,
    countryName: order.countryName,
    createdAt: order.createdAt,
    state:
      order.status === "refunded"
        ? "refunded"
        : order.productType === "physical_sim"
          ? order.shippingStatus === "awaiting" || !order.shippingStatus
            ? "preparing"
            : "ready"
          : order.provisioningStatus === "provisioned"
            ? "ready"
            : "preparing",
    orderPath: order.status === "completed" && order.accessToken ? `/order/${order.accessToken}` : null,
    productType: order.productType,
  }));

  // "My SIMs" (plans, data left, Buy more data) comes with the physical SIM / top-up feature.
  const sims = isTopUpEnabled() ? await getCustomerSimStatuses(email) : [];

  // Support requests: only what the customer needs (no staff names, no SIM details).
  const tickets: CustomerTicket[] = (await listTicketsForCustomer(email).catch(() => [])).map((ticket) => ({
    id: ticket.id,
    orderId: ticket.orderId,
    category: ticket.category,
    status: ticket.status,
    customerUnread: ticket.customerUnread,
    updatedAt: ticket.updatedAt,
    messages: ticket.messages.map((m) => ({ id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt })),
  }));

  return <AccountView email={email} orders={orders} sims={sims} tickets={tickets} />;
}
