"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { customerLogoutAction } from "@/lib/customer/actions";

export interface CustomerOrderSummary {
  id: number;
  planName: string;
  countryName: string;
  createdAt: string;
  state: "ready" | "preparing" | "refunded";
  /** The private order page (QR code), when there is one. */
  orderPath: string | null;
}

const STATE_STYLE = {
  ready: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700", key: "statusReady" },
  preparing: { icon: Clock, className: "bg-orange/10 text-orange", key: "statusPreparing" },
  refunded: { icon: RotateCcw, className: "bg-ink/5 text-muted", key: "statusRefunded" },
} as const;

export default function AccountView({ email, orders }: { email: string; orders: CustomerOrderSummary[] }) {
  const locale = useLocale();
  const t = useTranslations("account");
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="container-page max-w-3xl py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("subtitle", { email })}</p>
        </div>
        <form action={customerLogoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
            {t("signOut")}
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("emptyBody")}</p>
          <Link href="/esim-store" className="mt-4 inline-block text-sm font-semibold text-orange hover:underline">
            {t("emptyCta")} →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const style = STATE_STYLE[order.state];
            return (
              <li key={order.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">{order.planName}</p>
                  <p className="text-sm text-muted">{order.countryName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t("orderNumber", { id: order.id })} &middot; {t("bought", { date: formatDate(order.createdAt) })}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}>
                    <style.icon className="size-3.5" />
                    {t(style.key)}
                  </span>
                  {order.state === "ready" && order.orderPath && (
                    <Link href={order.orderPath} className="text-sm font-semibold text-orange hover:underline">
                      {t("viewEsim")} →
                    </Link>
                  )}
                  {order.state === "preparing" && <p className="text-xs text-muted">{t("preparingNote")}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 text-sm text-muted">
        {t("help")}{" "}
        <Link href="/help" className="font-semibold text-orange hover:underline">
          {t("contactSupport")}
        </Link>
      </p>
    </div>
  );
}
