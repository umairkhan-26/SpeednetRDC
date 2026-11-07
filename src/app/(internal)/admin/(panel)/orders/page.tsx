import { ADMIN_ORDER_SEARCH_LIMIT, searchOrdersForAdmin } from "@/lib/checkout/orders-repository";
import { orderKind, type OrderKind } from "@/lib/checkout/order-kind";
import { formatPrice } from "@/lib/format";
import { DeliveryBadge, KindBadge, PaymentBadge } from "../Badges";
import ResendEmailButton from "./ResendEmailButton";
import FetchFeesButton from "./FetchFeesButton";
import { orderProfit } from "@/lib/checkout/order-profit";
import { getAdminT, type AdminTranslator } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";

const KIND_FILTERS: (OrderKind | "all")[] = ["all", "live", "test", "demo"];

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(adminDateLocale(locale), { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ProfitCell({ order, t }: { order: Parameters<typeof orderProfit>[0]; t: AdminTranslator }) {
  const p = orderProfit(order);
  if (p.profit === null) return <span className="text-muted">—</span>;
  return (
    <div className="space-y-0.5">
      <p className="text-muted">
        {t("orders.cost")}{" "}
        {p.cost !== null ? (
          <span className="text-ink">{formatPrice(p.cost)}</span>
        ) : p.costUnknown ? (
          <span className="text-red-700">{t("orders.costUnknown")}</span>
        ) : (
          t("orders.costNone")
        )}
      </p>
      <p className="font-semibold text-ink">{t("orders.profit", { amount: formatPrice(p.profit) })}</p>
      {p.profitAfterStripeFee !== null && (
        <p className="text-muted">
          {t("orders.afterFee", { fee: formatPrice(order.stripeFeeEur ?? 0), amount: formatPrice(p.profitAfterStripeFee) })}
        </p>
      )}
    </div>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; kind?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kindParam = typeof params.kind === "string" ? params.kind : "all";
  const kind = KIND_FILTERS.includes(kindParam as OrderKind | "all") ? (kindParam as OrderKind | "all") : "all";
  const orders = await searchOrdersForAdmin(q, kind);
  const t = await getAdminT();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("orders.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("orders.intro")}</p>
        <p className="mt-1 text-xs text-muted">{t("orders.costIntro")}</p>
        <div className="mt-2">
          <FetchFeesButton />
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t("orders.searchPlaceholder")}
          className="w-full max-w-md rounded-lg border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-orange"
        />
        <select name="kind" defaultValue={kind} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange">
          {KIND_FILTERS.map((f) => (
            <option key={f} value={f}>
              {t(`orders.filters.${f}`)}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          {t("orders.search")}
        </button>
      </form>

      <p className="text-xs text-muted">
        {orders.length === 0
          ? t("orders.noMatch")
          : orders.length === ADMIN_ORDER_SEARCH_LIMIT
            ? t("orders.limit", { limit: ADMIN_ORDER_SEARCH_LIMIT })
            : t("orders.count", { count: orders.length })}
      </p>

      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                {(["order", "customer", "plan", "amount", "costProfit", "payment", "delivery", "sim", "customerPage"] as const).map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold">
                    {t(`orders.columns.${c}`)}
                  </th>
                ))}
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
                      <p className="text-xs text-muted">{formatDateTime(order.createdAt, t.locale)}</p>
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
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <ProfitCell order={order} t={t} />
                    </td>
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
                            {t("orders.open")}
                          </a>
                          {order.provisioningStatus === "provisioned" && (
                            <>
                              <span className="text-xs text-muted">
                                {order.confirmationEmailSentAt ? t("orders.emailed", { date: formatDateTime(order.confirmationEmailSentAt, t.locale) }) : t("orders.notEmailed")}
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
