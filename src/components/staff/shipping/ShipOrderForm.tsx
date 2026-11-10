"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { markPhysicalOrderDeliveredAction, shipPhysicalOrderAction, type ShippingActionResult } from "@/lib/staff/shipping-actions";

/** Record the card posted for this order: scan or type its ICCID (a scanner types it and presses Enter). */
export function ShipOrderForm({ orderId }: { orderId: number }) {
  const [iccid, setIccid] = useState("");
  const [tracking, setTracking] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ShippingActionResult | null>(null);
  const t = useTranslations("admin");

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setResult(null);
        startTransition(async () => setResult(await shipPhysicalOrderAction(orderId, iccid, tracking)));
      }}
    >
      <input
        value={iccid}
        onChange={(e) => setIccid(e.target.value)}
        placeholder={t("shipping.iccidPlaceholder")}
        inputMode="numeric"
        autoComplete="off"
        required
        aria-label={t("shipping.iccidAria", { id: orderId })}
        className="w-64 rounded-lg border border-line px-3 py-2 font-mono text-sm outline-none focus:border-orange"
      />
      <input
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder={t("shipping.trackingPlaceholder")}
        maxLength={100}
        aria-label={t("shipping.trackingAria", { id: orderId })}
        className="w-64 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-orange"
      />
      <button type="submit" disabled={isPending} className="w-max rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {isPending ? t("common.saving") : t("shipping.markShipped")}
      </button>
      {result && <span className={`max-w-64 text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </form>
  );
}

export function MarkDeliveredButton({ orderId }: { orderId: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ShippingActionResult | null>(null);
  const t = useTranslations("admin.shipping");
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(t("confirmDelivered", { id: orderId }))) return;
          startTransition(async () => setResult(await markPhysicalOrderDeliveredAction(orderId)));
        }}
        className="w-max text-xs font-semibold text-orange hover:underline disabled:opacity-50"
      >
        {t("markDelivered")}
      </button>
      {result && <span className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
