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
import { formatPrice } from "@/lib/format";
import Flag from "@/components/ui/Flag";
import StatCard from "./StatCard";
import { OrdersChart, RevenueChart, TopCountriesDonut } from "./DashboardCharts";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  refunded: "bg-orange/10 text-orange",
  failed: "bg-red-100 text-red-700",
};

const COMPLAINT_STATUS_STYLES: Record<string, string> = {
  open: "bg-orange/10 text-orange",
  resolved: "bg-green-100 text-green-700",
};

export default async function AdminDashboardPage() {
  const [orderStats, activeStaff, openComplaints, revenueByDay, ordersByDay, topCountries, recentOrders, recentComplaints] =
    await Promise.all([
      getOrderStats(),
      countActiveStaffNow(),
      countOpenComplaints(),
      getRevenueByDay(14),
      getOrdersByDay(14),
      getTopCountries(6),
      listRecentOrders(8),
      listRecentComplaints(5),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Business overview across staff, orders, and support.</p>
      </div>

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
          <p className="border-b border-line px-5 py-4 text-sm font-semibold text-ink">Recent orders</p>
          <div className="divide-y divide-line">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Flag iso={order.countryCode} className="h-4 w-6" />
                  <div>
                    <p className="font-medium text-ink">{order.customerName}</p>
                    <p className="text-xs text-muted">
                      {order.planName} &middot; {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink">{formatPrice(order.amountEur)}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
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
