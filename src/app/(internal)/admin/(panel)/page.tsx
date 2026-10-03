import {
  countActiveStaffNow,
  countOpenComplaints,
  getOrderStats,
  getOrdersByDay,
  getRevenueByDay,
  getTopCountries,
  listRecentComplaints,
  listRecentOrders,
} from "@/lib/staff/repository";
import { listOrdersNeedingProvisioning } from "@/lib/checkout/orders-repository";
import { formatPrice } from "@/lib/format";
import Flag from "@/components/ui/Flag";
import StatCard from "./StatCard";
import { OrdersChart, RevenueChart, TopCountriesDonut } from "./DashboardCharts";
import RetryProvisioningButton from "./RetryProvisioningButton";
import { DeliveryBadge, KindBadge, PaymentBadge } from "./Badges";
import Link from "next/link";

const PROVISIONING_LABELS: Record<string, string> = {
  failed: "Failed",
  pending: "Never started",
  activating: "Stuck",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COMPLAINT_STATUS_STYLES: Record<string, string> = {
  open: "bg-orange/10 text-orange",
  resolved: "bg-green-100 text-green-700",
};

export default async function AdminDashboardPage() {
  const [orderStats, activeStaff, openComplaints, revenueByDay, ordersByDay, topCountries, recentOrders, recentComplaints, needsProvisioning] =
    await Promise.all([
      getOrderStats(),
      countActiveStaffNow(),
      countOpenComplaints(),
      getRevenueByDay(14),
      getOrdersByDay(14),
      getTopCountries(6),
      listRecentOrders(8),
      listRecentComplaints(5),
      listOrdersNeedingProvisioning(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Business overview across staff, orders, and support.</p>
        <p className="mt-1 text-xs text-muted">
          Revenue, orders, charts, top countries and conversion count live (real-payment) orders only — Stripe test-mode and demo
          orders are excluded.
        </p>
      </div>

      {needsProvisioning.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-white">
          <div className="border-b border-line px-5 py-4">
            <p className="text-sm font-semibold text-ink">Paid eSIM orders needing attention ({needsProvisioning.length})</p>
            <p className="mt-0.5 text-xs text-muted">
              The customer paid but doesn&apos;t have a working eSIM yet. Retry resumes provisioning where it stopped.
            </p>
          </div>
          <div className="divide-y divide-line">
            {needsProvisioning.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    ORD-{order.id} &middot; {order.customerName}{" "}
                    <span className="font-normal text-muted">({order.customerEmail})</span>
                  </p>
                  <p className="text-xs text-muted">
                    {order.planName} &middot; {formatDateTime(order.createdAt)}
                    {order.iccid ? ` · SIM ${order.iccid}` : ""}
                    {order.accessToken && (
                      <>
                        {" · "}
                        <a href={`/en/order/${order.accessToken}`} target="_blank" rel="noreferrer" className="text-orange hover:underline">
                          customer page
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    {PROVISIONING_LABELS[order.provisioningStatus] ?? order.provisioningStatus}
                  </span>
                  <RetryProvisioningButton orderId={order.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Revenue" value={formatPrice(orderStats.totalRevenue)} />
        <StatCard label="Total Orders" value={String(orderStats.totalOrders)} />
        <StatCard label="Active Staff Right Now" value={String(activeStaff)} />
        <StatCard label="Total Complaints" value={String(openComplaints)} />
        <StatCard label="Conversion Rate" value={`${orderStats.conversionRate.toFixed(1)}%`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-ink">Revenue (last 14 days)</p>
          <RevenueChart data={revenueByDay} />
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-ink">Orders (last 14 days)</p>
          <OrdersChart data={ordersByDay} />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-ink">Top countries</p>
        <div className="mt-2">
          <TopCountriesDonut data={topCountries} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="text-sm font-semibold text-ink">Recent orders</p>
            <Link href="/admin/orders" className="text-xs font-semibold text-orange hover:underline">
              All orders
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <Flag iso={order.countryCode} className="h-4 w-6 shrink-0" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-medium text-ink">
                      {order.customerName} <KindBadge kind={order.kind} />
                    </p>
                    <p className="text-xs text-muted">
                      ORD-{order.id} &middot; {order.planName} &middot; {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="font-semibold text-ink">{formatPrice(order.amountEur)}</p>
                  <div className="flex gap-1">
                    <PaymentBadge status={order.status} />
                    <DeliveryBadge kind={order.kind} paymentStatus={order.status} deliveryStatus={order.deliveryStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white">
          <p className="border-b border-line px-5 py-4 text-sm font-semibold text-ink">Recent complaints</p>
          <div className="divide-y divide-line">
            {recentComplaints.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">No complaints logged.</p>
            ) : (
              recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{complaint.customerName}</p>
                    <p className="text-xs text-muted">{complaint.subject}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${COMPLAINT_STATUS_STYLES[complaint.status]}`}>
                    {complaint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
