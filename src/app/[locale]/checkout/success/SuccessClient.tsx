"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";
import { getOrderStatus, type OrderStatusResult } from "@/lib/api/checkout";
import { acceptedVendors, readConsentCookie } from "@/lib/consent";
import { trackMeta } from "@/lib/meta/pixel";
import { trackPurchase } from "@/lib/tracking/events";
import { trackingSettled } from "@/lib/tracking/scripts";

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

// The Stripe session id, kept in this tab once it has been taken out of the
// address bar, so that reloading the page still finds the order.
const SESSION_KEY = "snrdc-checkout-session";

function storedSessionId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

const noSubscription = () => () => {};

/**
 * Advertising tools must never see the Stripe session id in the address, so
 * it is removed before any of them loads. Without storage to keep it in, the
 * address is left alone and nothing is tracked.
 */
function hideSessionId(sessionId: string): void {
  if (!window.location.search.includes("session_id=")) return;
  try {
    sessionStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    return;
  }
  window.history.replaceState(null, "", window.location.pathname);
}

/** Meta's browser Purchase event, once per order (same event_id as the server event, so Meta counts it once). */
function trackMetaPurchaseOnce(purchase: OrderStatusResult["metaPurchase"]) {
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

/** Sends the purchase to whichever tools the buyer accepted (none: does nothing at all). */
function trackCompletedOrder(sessionId: string, result: OrderStatusResult) {
  if (acceptedVendors(readConsentCookie()).length === 0) return;
  hideSessionId(sessionId);
  trackMetaPurchaseOnce(result.metaPurchase);
  if (result.purchase) trackPurchase(result.purchase);
}

export default function SuccessClient() {
  const t = useTranslations("checkout.success");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const restoredSessionId = useSyncExternalStore(noSubscription, storedSessionId, () => null);
  const sessionId = searchParams.get("session_id") ?? restoredSessionId;
  const [pollState, setState] = useState<ViewState>({ kind: "confirming" });
  const state: ViewState = sessionId ? pollState : { kind: "error", missingSession: true };

  useEffect(() => {
    if (!sessionId) return;
    const currentSessionId = sessionId;
    let cancelled = false;
    let attempt = 0;

    // The order page is opened with a full page load: its address is private,
    // so it must start without any advertising tool running.
    async function openOrderPage(token: string) {
      await trackingSettled();
      if (!cancelled) window.location.replace(`/${locale}/order/${token}`);
    }

    async function poll() {
      attempt += 1;
      try {
        const result = await getOrderStatus(currentSessionId);
        if (cancelled) return;

        if (result.status === "failed") return setState({ kind: "paymentFailed" });
        if (result.status === "completed") {
          trackCompletedOrder(currentSessionId, result);
          // A SIM card is posted, not provisioned: its order page shows the shipping status.
          const ready = result.productType === "physical_sim" || result.provisioningStatus === "provisioned";
          if (ready && result.accessToken) {
            setState({ kind: "preparing" });
            return openOrderPage(result.accessToken);
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
  }, [sessionId, locale]);

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
            <LinkButton href={`/${locale}/order/${state.token}`} fullPageLoad size="lg">
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
