import type { OrderKind } from "@/lib/checkout/order-kind";

const PILL = "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium";

const PAYMENT: Record<string, [label: string, style: string]> = {
  completed: ["Paid", "bg-green-100 text-green-700"],
  pending: ["Awaiting payment", "bg-ink/5 text-muted"],
  failed: ["Payment failed", "bg-red-100 text-red-700"],
  refunded: ["Refunded", "bg-orange/10 text-orange"],
};

const DELIVERY: Record<string, [label: string, style: string]> = {
  provisioned: ["eSIM delivered", "bg-green-100 text-green-700"],
  failed: ["Delivery failed", "bg-red-100 text-red-700"],
  activating: ["Delivery pending", "bg-orange/10 text-orange"],
  pending: ["Delivery pending", "bg-orange/10 text-orange"],
};

export function PaymentBadge({ status }: { status: string }) {
  const [label, style] = PAYMENT[status] ?? [status, "bg-ink/5 text-muted"];
  return <span className={`${PILL} ${style}`}>{label}</span>;
}

/** eSIM delivery: only meaningful once a real or test order is paid. */
export function DeliveryBadge({ kind, paymentStatus, deliveryStatus }: { kind: OrderKind; paymentStatus: string; deliveryStatus: string }) {
  if (kind === "demo" || paymentStatus !== "completed") return <span className="text-xs text-muted">—</span>;
  if (kind === "test" && deliveryStatus !== "provisioned" && deliveryStatus !== "failed") {
    return <span className={`${PILL} bg-ink/5 text-muted`}>No eSIM (test)</span>;
  }
  const [label, style] = DELIVERY[deliveryStatus] ?? [deliveryStatus, "bg-ink/5 text-muted"];
  return <span className={`${PILL} ${style}`}>{label}</span>;
}

export function KindBadge({ kind }: { kind: OrderKind }) {
  if (kind === "live") return null;
  return (
    <span className={`${PILL} ${kind === "test" ? "bg-sky-100 text-sky-700" : "bg-ink/10 text-ink/60"}`}>
      {kind === "test" ? "Test" : "Demo"}
    </span>
  );
}
