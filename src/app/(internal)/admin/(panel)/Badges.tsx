import type { OrderKind } from "@/lib/checkout/order-kind";
import type { StaffAccountStatus } from "@/lib/staff/types";
import { USAGE_STATUS_LABELS, type UsageStatus } from "@/lib/sims/status";

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

const SHIPPING: Record<string, [label: string, style: string]> = {
  awaiting: ["Awaiting shipment", "bg-orange/10 text-orange"],
  shipped: ["Shipped", "bg-sky-100 text-sky-700"],
  delivered: ["Delivered", "bg-green-100 text-green-700"],
};

/** Delivery for any product: shipping for SIM cards, provisioning for eSIMs and top-ups. */
export function OrderDeliveryBadge({
  kind,
  productType,
  paymentStatus,
  deliveryStatus,
  shippingStatus,
}: {
  kind: OrderKind;
  productType: string;
  paymentStatus: string;
  deliveryStatus: string;
  shippingStatus: string | null;
}) {
  if (productType !== "physical_sim") return <DeliveryBadge kind={kind} paymentStatus={paymentStatus} deliveryStatus={deliveryStatus} />;
  if (paymentStatus !== "completed" || !shippingStatus) return <span className="text-xs text-muted">—</span>;
  const [label, style] = SHIPPING[shippingStatus] ?? [shippingStatus, "bg-ink/5 text-muted"];
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

const ACCOUNT_STATUS: Record<StaffAccountStatus, [label: string, style: string]> = {
  active: ["Active", "bg-green-100 text-green-700"],
  invited: ["Invite pending", "bg-orange/10 text-orange"],
  deactivated: ["Deactivated", "bg-ink/10 text-ink/60"],
};

export function AccountStatusBadge({ status }: { status: StaffAccountStatus }) {
  const [label, style] = ACCOUNT_STATUS[status];
  return <span className={`${PILL} ${style}`}>{label}</span>;
}

const USAGE_STYLE: Record<UsageStatus, string> = {
  active: "bg-green-100 text-green-700",
  not_used: "bg-sky-100 text-sky-700",
  expired: "bg-ink/10 text-ink/60",
  unknown: "bg-ink/5 text-muted",
};

export function UsageBadge({ status }: { status: UsageStatus }) {
  return <span className={`${PILL} ${USAGE_STYLE[status]}`}>{USAGE_STATUS_LABELS[status]}</span>;
}
