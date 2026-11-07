"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { dismissOrderAttentionAction } from "@/lib/staff/provisioning-actions";

/** Takes a paid order off the "needing attention" list: refunded (checked with Stripe) or resolved another way. */
export default function DismissOrderButton({ orderId }: { orderId: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const t = useTranslations("admin");

  function dismiss(reason: "refunded" | "resolved") {
    const text = t(reason === "refunded" ? "dashboard.confirmRefunded" : "dashboard.confirmResolved", { id: orderId });
    if (!window.confirm(text)) return;
    setResult(null);
    startTransition(async () => {
      const res = await dismissOrderAttentionAction(orderId, reason);
      setResult(res);
      if (res.ok) setOpen(false);
    });
  }

  const linkClass = "text-xs font-semibold hover:underline disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-1">
      {open ? (
        <div className="flex items-center gap-3">
          <button type="button" disabled={isPending} className={`${linkClass} text-ink`} onClick={() => dismiss("refunded")}>
            {t("dashboard.refundedInStripe")}
          </button>
          <button type="button" disabled={isPending} className={`${linkClass} text-ink`} onClick={() => dismiss("resolved")}>
            {t("dashboard.resolvedOtherWay")}
          </button>
          <button type="button" disabled={isPending} className={`${linkClass} text-muted`} onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </button>
        </div>
      ) : (
        <button type="button" disabled={isPending} className={`${linkClass} text-red-700`} onClick={() => setOpen(true)}>
          {t("dashboard.remove")}
        </button>
      )}
      {isPending && <span className="text-xs text-muted">{t("common.working")}</span>}
      {result && <span className={`max-w-56 text-right text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
