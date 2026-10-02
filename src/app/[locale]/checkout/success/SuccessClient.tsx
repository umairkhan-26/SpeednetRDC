"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";
import { getOrderStatus } from "@/lib/api/checkout";

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
  | { kind: "error"; message: string };

export default function SuccessClient() {
  const router = useRouter();
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

        if (result.status === "failed") return setState({ kind: "paymentFailed" });
        if (result.status === "completed") {
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
      } catch (err) {
        if (cancelled) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
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
            {state.kind === "confirming" ? "Confirming your payment…" : "Payment received — setting up your eSIM…"}
          </h1>
          <p className="max-w-sm text-muted">This usually takes a few seconds. Don&apos;t close this page.</p>
        </>
      )}

      {(state.kind === "provisioningFailed" || state.kind === "stillPreparing") && (
        <>
          <h1 className="text-2xl font-bold text-ink">
            {state.kind === "provisioningFailed" ? "Payment received — your eSIM needs a moment" : "Payment received — still preparing your eSIM"}
          </h1>
          <p className="max-w-md text-muted">
            {state.kind === "provisioningFailed"
              ? "We hit a snag setting up your eSIM automatically. It's been flagged for our team, who will finish setting it up for you."
              : "This is taking longer than usual."}{" "}
            Your eSIM and QR code will appear on your private order page. Bookmark it — anyone with the link can see your eSIM.
          </p>
          {state.token && (
            <LinkButton href={`/order/${state.token}`} size="lg">
              Open my order page
            </LinkButton>
          )}
          <Link href="/help" className="text-sm font-semibold text-orange hover:underline">
            Get help
          </Link>
        </>
      )}

      {(state.kind === "paymentFailed" || state.kind === "timeout" || state.kind === "error") && (
        <>
          <h1 className="text-2xl font-bold text-ink">
            {state.kind === "paymentFailed" ? "Payment didn't go through" : "We couldn't confirm your payment yet"}
          </h1>
          <p className="max-w-sm text-muted">
            {state.kind === "paymentFailed"
              ? "Your card wasn't charged. You can try again or use a different payment method."
              : "This can happen if confirmation is taking longer than usual. If you were charged, contact support and we'll sort it out."}
          </p>
          {state.kind === "error" && <p className="text-xs text-muted">{state.message}</p>}
          <div className="mt-2 flex gap-3">
            <LinkButton href="/esim-store" size="lg">
              Back to plans
            </LinkButton>
            <Link href="/help" className="inline-flex items-center px-4 text-sm font-semibold text-orange hover:underline">
              Get help
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
