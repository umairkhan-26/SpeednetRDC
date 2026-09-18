"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";
import { getOrderStatus, type OrderStatusResult } from "@/lib/api/checkout";
import ConfirmationStep from "@/components/checkout/steps/ConfirmationStep";

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 10;

type ViewState =
  | { kind: "confirming" }
  | { kind: "paid"; result: OrderStatusResult }
  | { kind: "failed" }
  | { kind: "timeout" }
  | { kind: "error"; message: string };

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [pollState, setState] = useState<ViewState>({ kind: "confirming" });
  const state: ViewState = sessionId ? pollState : { kind: "error", message: "Missing checkout session." };

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

        if (result.status === "completed") {
          setState({ kind: "paid", result });
          return;
        }
        if (result.status === "failed") {
          setState({ kind: "failed" });
          return;
        }
        if (attempt >= MAX_ATTEMPTS) {
          setState({ kind: "timeout" });
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.kind === "paid") {
    return (
      <div className="container-page py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-6 sm:p-8">
          <ConfirmationStep
            order={{
              id: state.result.order.id,
              planName: state.result.order.planName,
              countryName: state.result.order.countryName,
              iccid: state.result.order.iccid,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      {state.kind === "confirming" && (
        <>
          <Loader2 className="size-10 animate-spin text-orange" />
          <h1 className="text-2xl font-bold text-ink">Confirming your payment&hellip;</h1>
          <p className="max-w-sm text-muted">This only takes a moment. Don&apos;t close this page.</p>
        </>
      )}

      {(state.kind === "failed" || state.kind === "timeout" || state.kind === "error") && (
        <>
          <h1 className="text-2xl font-bold text-ink">
            {state.kind === "failed" ? "Payment didn't go through" : "We couldn't confirm your payment yet"}
          </h1>
          <p className="max-w-sm text-muted">
            {state.kind === "failed"
              ? "Your card wasn't charged. You can try again or use a different payment method."
              : "This can happen if confirmation is taking longer than usual. If you were charged, contact support with your session ID and we'll sort it out."}
          </p>
          {state.kind === "error" && <p className="text-xs text-muted">{state.message}</p>}
          <div className="mt-2 flex gap-3">
            <LinkButton href="/esim-store" size="lg">
              Back to plans
            </LinkButton>
            <Link
              href="/help"
              className="inline-flex items-center px-4 text-sm font-semibold text-orange hover:underline"
            >
              Get help
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
