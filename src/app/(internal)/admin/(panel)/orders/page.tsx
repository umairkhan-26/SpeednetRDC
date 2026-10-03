import { ADMIN_ORDER_SEARCH_LIMIT, searchOrdersForAdmin } from "@/lib/checkout/orders-repository";
import { orderKind, type OrderKind } from "@/lib/checkout/order-kind";
import { formatPrice } from "@/lib/format";
import { DeliveryBadge, KindBadge, PaymentBadge } from "../Badges";
import ResendEmailButton from "./ResendEmailButton";

const KIND_FILTERS: { value: OrderKind | "all"; label: string }[] = [
  { value: "all", label: "All orders" },
  { value: "live", label: "Live only" },
  { value: "test", label: "Test only" },
  { value: "demo", label: "Demo only" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; kind?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kindParam = typeof params.kind === "string" ? params.kind : "all";
  const kind = KIND_FILTERS.some((f) => f.value === kindParam) ? (kindParam as OrderKind | "all") : "all";
  const orders = await searchOrdersForAdmin(q, kind);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Every order, newest first. A customer page link shows that customer&apos;s eSIM QR code — treat it like a password and
          only send it to the customer.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Order number, name, email, plan, ICCID or MSISDN"
          className="w-full max-w-md rounded-lg border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-orange"
        />
        <select name="kind" defaultValue={kind} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange">
          {KIND_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Search
        </button>
      </form>

      <p className="text-xs text-muted">
        {orders.length === 0
          ? "No orders match."
          : orders.length === ADMIN_ORDER_SEARCH_LIMIT
            ? `Showing the ${ADMIN_ORDER_SEARCH_LIMIT} newest matching orders — refine your search to see older ones.`
            : `${orders.length} order${orders.length === 1 ? "" : "s"}.`}
      </p>

      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Delivery</th>
                <th className="px-4 py-3 font-semibold">SIM</th>
                <th className="px-4 py-3 font-semibold">Customer page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const orderKindValue = orderKind(order.stripeCheckoutSessionId);
                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        ORD-{order.id} <KindBadge kind={orderKindValue} />
                      </p>
                      <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{order.customerName}</p>
                      <p className="text-xs text-muted">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{order.planName}</p>
                      <p className="text-xs text-muted">{order.countryName}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink">{formatPrice(order.amountEur)}</td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryBadge kind={orderKindValue} paymentStatus={order.status} deliveryStatus={order.provisioningStatus} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink">
                      {order.iccid ?? <span className="font-sans text-muted">—</span>}
                      {order.msisdn && <p className="text-muted">+{order.msisdn}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {order.accessToken && order.status === "completed" ? (
                        <div className="flex flex-col gap-1">
                          <a href={`/en/order/${order.accessToken}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-orange hover:underline">
                            Open
                          </a>
                          {order.provisioningStatus === "provisioned" && (
                            <>
                              <span className="text-xs text-muted">
                                {order.confirmationEmailSentAt ? `Emailed ${formatDateTime(order.confirmationEmailSentAt)}` : "Not emailed"}
                              </span>
                              <ResendEmailButton orderId={order.id} email={order.customerEmail} />
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
