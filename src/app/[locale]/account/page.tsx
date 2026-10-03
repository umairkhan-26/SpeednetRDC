import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerEmail } from "@/lib/customer/session";
import { listOrdersForCustomer } from "@/lib/checkout/orders-repository";
import AccountView, { type CustomerOrderSummary } from "./AccountView";

export const metadata: Metadata = {
  title: "My eSIMs — SpeedNetRDC",
  robots: { index: false, follow: false },
};

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
    state: order.status === "refunded" ? "refunded" : order.provisioningStatus === "provisioned" ? "ready" : "preparing",
    orderPath: order.status === "completed" && order.accessToken ? `/order/${order.accessToken}` : null,
  }));

  return <AccountView email={email} orders={orders} />;
}
