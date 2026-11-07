"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { resendOrderEmailAction } from "@/lib/staff/provisioning-actions";

export default function ResendEmailButton({ orderId, email }: { orderId: number; email: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const t = useTranslations("admin");

  function resend() {
    if (!window.confirm(t("orders.resendConfirm", { id: orderId, email }))) return;
    setResult(null);
    startTransition(async () => setResult(await resendOrderEmailAction(orderId)));
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button type="button" onClick={resend} disabled={isPending} className="text-left text-xs font-semibold text-orange hover:underline disabled:opacity-50">
        {isPending ? t("common.sending") : t("orders.resend")}
      </button>
      {result && <span className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
