import { listPhysicalSimOrders, type ShippingAddress, type ShippingStatus } from "@/lib/checkout/orders-repository";
import { orderKind } from "@/lib/checkout/order-kind";
import { formatPrice } from "@/lib/format";
import { isPhysicalSimEnabled, needsCustomsDeclaration } from "@/lib/physical-sim";
import { getAdminT, type AdminTranslator } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";
import { MarkDeliveredButton, ShipOrderForm } from "./ShipOrderForm";

const FILTERS: (ShippingStatus | "all")[] = ["awaiting", "shipped", "delivered", "all"];

const STATUS_STYLE: Record<ShippingStatus, string> = {
  awaiting: "bg-orange/10 text-orange",
  shipped: "bg-sky-100 text-sky-700",
  delivered: "bg-green-100 text-green-700",
};

function formatDate(iso: string | null, locale: string): string {
  return iso ? new Date(iso).toLocaleDateString(adminDateLocale(locale), { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function AddressBlock({ address, t }: { address: ShippingAddress | null; t: AdminTranslator }) {
  if (!address?.line1) return <span className="text-red-700">{t("shipping.noAddress")}</span>;
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
  const status = FILTERS.includes(statusParam as ShippingStatus | "all") ? (statusParam as ShippingStatus | "all") : "awaiting";
  const orders = await listPhysicalSimOrders(status);
  const t = await getAdminT();
  const fmt = (iso: string | null) => formatDate(iso, t.locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("shipping.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t("shipping.intro")}</p>
        {!isPhysicalSimEnabled() && <p className="mt-2 text-xs text-muted">{t("shipping.salesOff")}</p>}
      </div>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f}
            href={`${basePath}?status=${f}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${f === status ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-orange"}`}
          >
            {t(`shipping.filters.${f}`)}
          </a>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">{t("shipping.none")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                {(["order", "customer", "shipTo", "status", "action"] as const).map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold">
                    {t(`shipping.columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const shipping = order.shippingStatus ?? "awaiting";
                const style = STATUS_STYLE[shipping];
                const customs = needsCustomsDeclaration(order.shippingCountry, order.shippingAddress?.postalCode ?? null);
                const kind = orderKind(order.stripeCheckoutSessionId);
                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        ORD-{order.id} {kind !== "live" && <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{t(`badges.${kind}`)}</span>}
                      </p>
                      <p className="text-xs text-muted">{t("shipping.paid", { date: fmt(order.createdAt) })}</p>
                      <p className="text-xs text-muted">{formatPrice(order.amountEur)}</p>
                      {order.status === "refunded" && <p className="text-xs font-semibold text-red-700">{t("shipping.refunded")}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{order.customerName}</p>
                      <p className="text-xs text-muted">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">
                      <AddressBlock address={order.shippingAddress} t={t} />
                      {customs && (
                        <p className="mt-1.5 w-max rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">{t("shipping.customs")}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-block rounded-full px-2 py-0.5 font-medium ${style}`}>{t(`badges.shipping.${shipping}`)}</span>
                      {order.shippedAt && <p className="mt-1 text-muted">{t("shipping.posted", { date: fmt(order.shippedAt) })}</p>}
                      {order.iccid && <p className="font-mono text-muted">{order.iccid}</p>}
                      {order.trackingNumber && <p className="text-muted">{t("shipping.tracking", { number: order.trackingNumber })}</p>}
                      {order.deliveredAt && <p className="text-muted">{t("shipping.delivered", { date: fmt(order.deliveredAt) })}</p>}
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
