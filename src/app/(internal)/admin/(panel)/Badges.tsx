"use client";

import { useTranslations } from "next-intl";
import type { OrderKind } from "@/lib/checkout/order-kind";
import type { StaffAccountStatus } from "@/lib/staff/types";
import type { UsageStatus } from "@/lib/sims/status";

const PILL = "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium";

const PAYMENT_STYLE: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-ink/5 text-muted",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-orange/10 text-orange",
};

const DELIVERY_STYLE: Record<string, string> = {
  provisioned: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  activating: "bg-orange/10 text-orange",
  pending: "bg-orange/10 text-orange",
};

export function PaymentBadge({ status }: { status: string }) {
  const t = useTranslations("admin.badges.payment");
  const style = PAYMENT_STYLE[status];
  return <span className={`${PILL} ${style ?? "bg-ink/5 text-muted"}`}>{style ? t(status) : status}</span>;
}

/** eSIM delivery: only meaningful once a real or test order is paid. */
export function DeliveryBadge({ kind, paymentStatus, deliveryStatus }: { kind: OrderKind; paymentStatus: string; deliveryStatus: string }) {
  const t = useTranslations("admin.badges");
  if (kind === "demo" || paymentStatus !== "completed") return <span className="text-xs text-muted">—</span>;
  if (kind === "test" && deliveryStatus !== "provisioned" && deliveryStatus !== "failed") {
    return <span className={`${PILL} bg-ink/5 text-muted`}>{t("noEsimTest")}</span>;
  }
  const style = DELIVERY_STYLE[deliveryStatus];
  return <span className={`${PILL} ${style ?? "bg-ink/5 text-muted"}`}>{style ? t(`delivery.${deliveryStatus}`) : deliveryStatus}</span>;
}

const SHIPPING_STYLE: Record<string, string> = {
  awaiting: "bg-orange/10 text-orange",
  shipped: "bg-sky-100 text-sky-700",
  delivered: "bg-green-100 text-green-700",
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
  const t = useTranslations("admin.badges.shipping");
  if (productType !== "physical_sim") return <DeliveryBadge kind={kind} paymentStatus={paymentStatus} deliveryStatus={deliveryStatus} />;
  if (paymentStatus !== "completed" || !shippingStatus) return <span className="text-xs text-muted">—</span>;
  const style = SHIPPING_STYLE[shippingStatus];
  return <span className={`${PILL} ${style ?? "bg-ink/5 text-muted"}`}>{style ? t(shippingStatus) : shippingStatus}</span>;
}

export function KindBadge({ kind }: { kind: OrderKind }) {
  const t = useTranslations("admin.badges");
  if (kind === "live") return null;
  return (
    <span className={`${PILL} ${kind === "test" ? "bg-sky-100 text-sky-700" : "bg-ink/10 text-ink/60"}`}>
      {kind === "test" ? t("test") : t("demo")}
    </span>
  );
}

const ACCOUNT_STYLE: Record<StaffAccountStatus, string> = {
  active: "bg-green-100 text-green-700",
  invited: "bg-orange/10 text-orange",
  deactivated: "bg-ink/10 text-ink/60",
};

export function AccountStatusBadge({ status }: { status: StaffAccountStatus }) {
  const t = useTranslations("admin.badges.account");
  return <span className={`${PILL} ${ACCOUNT_STYLE[status]}`}>{t(status)}</span>;
}

const USAGE_STYLE: Record<UsageStatus, string> = {
  active: "bg-green-100 text-green-700",
  not_used: "bg-sky-100 text-sky-700",
  expired: "bg-ink/10 text-ink/60",
  unknown: "bg-ink/5 text-muted",
};

export function UsageBadge({ status }: { status: UsageStatus }) {
  const t = useTranslations("admin.badges.usage");
  return <span className={`${PILL} ${USAGE_STYLE[status]}`}>{t(status)}</span>;
}
