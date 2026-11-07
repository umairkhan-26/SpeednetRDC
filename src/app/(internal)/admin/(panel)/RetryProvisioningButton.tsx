"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { retryProvisioningAction } from "@/lib/staff/provisioning-actions";

export default function RetryProvisioningButton({ orderId }: { orderId: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const t = useTranslations("admin.dashboard");

  function retry() {
    if (!window.confirm(t("retryConfirm", { id: orderId }))) return;
    setResult(null);
    startTransition(async () => {
      setResult(await retryProvisioningAction(orderId));
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={retry}
        disabled={isPending}
        className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? t("retrying") : t("retry")}
      </button>
      {result && <span className={`max-w-56 text-right text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
