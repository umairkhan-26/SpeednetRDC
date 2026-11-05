"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";
import { getOrderStatus, type OrderStatusResult } from "@/lib/api/checkout";
import { trackMeta } from "@/lib/meta/pixel";

const POLL_INTERVAL_MS = 1500;
// Payment confirmation usually takes a few seconds; setting up the eSIM
// with Transatel a few more. Give up waiting after ~90s and hand the
// customer their private order link instead.
const MAX_ATTEMPTS = 60;

type ViewState =
  | { kind: "confirming" }
  | { kind: "preparing" }
  | { kind: "provisioningFailed"; token: string | null }
  | { kind: "stillPreparing"; token: string | null }
  | { kind: "paymentFailed" }
  | { kind: "timeout" }
  | { kind: "error"; missingSession: boolean };

/** Browser Purchase event, once per order (same event_id as the server event, so Meta counts it once). */
function trackPurchaseOnce(purchase: OrderStatusResult["metaPurchase"]) {
  if (!purchase) return;
  const key = `meta-purchase-${purchase.eventId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage unavailable: still send; Meta drops the duplicate by event_id.
  }
  trackMeta(
    "Purchase",
    { value: purchase.value, currency: purchase.currency, content_ids: purchase.contentId ? [purchase.contentId] : [], content_type: "product", num_items: 1 },
    purchase.eventId
  );
}

export default function SuccessClient() {
  const t = useTranslations("checkout.success");
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [pollState, setState] = useState<ViewState>({ kind: "confirming" });
  const state: ViewState = sessionId ? pollState : { kind: "error", missingSession: true };

  useEffect(() => {
    if (!sessionId) return;
    const currentSessionId = sessionId;
    let cancelled = false;
    let attempt = 0;

    async function poll() {
      attempt += 1;
      try {
        const result = await getOrderStatus(currentSessionId);
        if (cancelled) return;

        if (result.status === "failed") return setState({ kind: "paymentFailed" });
        if (result.status === "completed") {
          trackPurchaseOnce(result.metaPurchase);
          if (result.provisioningStatus === "provisioned" && result.accessToken) {
            router.replace(`/order/${result.accessToken}`);
            return;
          }
          if (result.provisioningStatus === "failed") return setState({ kind: "provisioningFailed", token: result.accessToken });
          if (attempt >= MAX_ATTEMPTS) return setState({ kind: "stillPreparing", token: result.accessToken });
          setState({ kind: "preparing" });
        } else if (attempt >= MAX_ATTEMPTS) {
          return setState({ kind: "timeout" });
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        setState({ kind: "error", missingSession: false });
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      {(state.kind === "confirming" || state.kind === "preparing") && (
        <>
          <Loader2 className="size-10 animate-spin text-orange" />
          <h1 className="text-2xl font-bold text-ink">
            {state.kind === "confirming" ? t("confirming") : t("settingUp")}
          </h1>
          <p className="max-w-sm text-muted">{t("fewSeconds")}</p>
        </>
      )}

      {(state.kind === "provisioningFailed" || state.kind === "stillPreparing") && (
        <>
          <h1 className="text-2xl font-bold text-ink">
            {state.kind === "provisioningFailed" ? t("needsMomentTitle") : t("stillPreparingTitle")}
          </h1>
          <p className="max-w-md text-muted">
            {state.kind === "provisioningFailed" ? t("needsMomentText") : t("stillPreparingText")} {t("orderPageNote")}
          </p>
          {state.token && (
            <LinkButton href={`/order/${state.token}`} size="lg">
              {t("openOrderPage")}
            </LinkButton>
          )}
          <Link href="/help" className="text-sm font-semibold text-orange hover:underline">
            {t("getHelp")}
          </Link>
        </>
      )}

      {(state.kind === "paymentFailed" || state.kind === "timeout" || state.kind === "error") && (
        <>
          <h1 className="text-2xl font-bold text-ink">
            {state.kind === "paymentFailed" ? t("paymentFailedTitle") : t("notConfirmedTitle")}
          </h1>
          <p className="max-w-sm text-muted">
            {state.kind === "paymentFailed" ? t("paymentFailedText") : t("notConfirmedText")}
          </p>
          {state.kind === "error" && (
            <p className="text-xs text-muted">{state.missingSession ? t("missingSession") : t("somethingWrong")}</p>
          )}
          <div className="mt-2 flex gap-3">
            <LinkButton href="/esim-store" size="lg">
              {t("backToPlans")}
            </LinkButton>
            <Link href="/help" className="inline-flex items-center px-4 text-sm font-semibold text-orange hover:underline">
              {t("getHelp")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
