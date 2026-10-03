import { listPhysicalSimOrders, type ShippingAddress, type ShippingStatus } from "@/lib/checkout/orders-repository";
import { orderKind } from "@/lib/checkout/order-kind";
import { formatPrice } from "@/lib/format";
import { isPhysicalSimEnabled, needsCustomsDeclaration, SHIPS_FROM } from "@/lib/physical-sim";
import { MarkDeliveredButton, ShipOrderForm } from "./ShipOrderForm";

const FILTERS: { value: ShippingStatus | "all"; label: string }[] = [
  { value: "awaiting", label: "Awaiting shipment" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "all", label: "All" },
];

const STATUS_STYLE: Record<ShippingStatus, [string, string]> = {
  awaiting: ["Awaiting shipment", "bg-orange/10 text-orange"],
  shipped: ["Shipped", "bg-sky-100 text-sky-700"],
  delivered: ["Delivered", "bg-green-100 text-green-700"],
};

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function AddressBlock({ address }: { address: ShippingAddress | null }) {
  if (!address?.line1) return <span className="text-red-700">No address from Stripe — contact the customer</span>;
  return (
    <span className="whitespace-pre-line">
      {[address.name, address.line1, address.line2, [address.postalCode, address.city].filter(Boolean).join(" "), address.state, address.country]
        .filter(Boolean)
        .join("\n")}
    </span>
  );
}

/** Physical SIM orders to post, shared by /admin/shipping and /staff/shipping. */
export default async function ShippingBoard({ basePath, statusParam }: { basePath: string; statusParam: string | undefined }) {
  const status = FILTERS.some((f) => f.value === statusParam) ? (statusParam as ShippingStatus | "all") : "awaiting";
  const orders = await listPhysicalSimOrders(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Physical SIM orders</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Paid SIM card orders to post from {SHIPS_FROM}. To ship one, scan or type the ICCID printed on the card you&apos;re sending (it must
          be an available physical SIM in stock) and add the tracking number if there is one: the card is then assigned to the customer and
          they get a &ldquo;shipped&rdquo; email.
        </p>
        {!isPhysicalSimEnabled() && (
          <p className="mt-2 text-xs text-muted">SIM card sales are switched off (PHYSICAL_SIM_ENABLED), so no new orders arrive.</p>
        )}
      </div>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f.value}
            href={`${basePath}?status=${f.value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${f.value === status ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-orange"}`}
          >
            {f.label}
          </a>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders here.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Ship to</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const shipping = order.shippingStatus ?? "awaiting";
                const [label, style] = STATUS_STYLE[shipping];
                const customs = needsCustomsDeclaration(order.shippingCountry, order.shippingAddress?.postalCode ?? null);
                const kind = orderKind(order.stripeCheckoutSessionId);
                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        ORD-{order.id} {kind !== "live" && <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{kind}</span>}
                      </p>
                      <p className="text-xs text-muted">Paid {formatDate(order.createdAt)}</p>
                      <p className="text-xs text-muted">{formatPrice(order.amountEur)}</p>
                      {order.status === "refunded" && <p className="text-xs font-semibold text-red-700">Refunded — don&apos;t ship</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{order.customerName}</p>
                      <p className="text-xs text-muted">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">
                      <AddressBlock address={order.shippingAddress} />
                      {customs && (
                        <p className="mt-1.5 w-max rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">Outside the EU — customs declaration</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-block rounded-full px-2 py-0.5 font-medium ${style}`}>{label}</span>
                      {order.shippedAt && <p className="mt-1 text-muted">Posted {formatDate(order.shippedAt)}</p>}
                      {order.iccid && <p className="font-mono text-muted">{order.iccid}</p>}
                      {order.trackingNumber && <p className="text-muted">Tracking: {order.trackingNumber}</p>}
                      {order.deliveredAt && <p className="text-muted">Delivered {formatDate(order.deliveredAt)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {shipping === "awaiting" && order.status === "completed" && <ShipOrderForm orderId={order.id} />}
                      {shipping === "shipped" && <MarkDeliveredButton orderId={order.id} />}
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
