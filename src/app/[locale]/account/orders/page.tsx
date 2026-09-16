import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { mockOrders } from "@/data/orders";
import { formatData, formatDate, formatPrice, formatValidity } from "@/lib/format";
import { Badge } from "@/components/ui/Chip";

export const metadata: Metadata = { title: "Orders — My SpeedNetRDC" };

export default function OrdersPage() {
  return (
    <div className="container-page py-14">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> My SpeedNetRDC
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">Order history</h1>

      {mockOrders.length === 0 ? (
        <p className="mt-10 text-center text-muted">Nothing here yet.</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
          {mockOrders.map((order, i) => (
            <div
              key={order.id}
              className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cream text-xs font-bold text-ink">
                  {order.iso}
                </span>
                <div>
                  <p className="font-semibold text-ink">{order.countryName}</p>
                  <p className="text-xs text-muted">
                    {formatData(order.dataAmountGb)} &middot; {formatValidity(order.validityDays)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted sm:text-center">
                <p>{formatDate(order.purchaseDate)}</p>
                <p className="text-xs">{order.id}</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                <p className="font-semibold text-ink">{formatPrice(order.price)}</p>
                <Badge tone={order.status === "Paid" ? "success" : "dark"}>{order.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
