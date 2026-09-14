import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import type { CheckoutResult } from "@/lib/api/checkout";
import type { Plan } from "@/lib/types";

export default function ConfirmationStep({ result, plan }: { result: CheckoutResult; plan: Plan }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-9 text-emerald-600" />
      </span>
      <h2 className="text-2xl font-bold text-ink">You&apos;re all set!</h2>
      <p className="max-w-sm text-sm text-muted">
        Your payment for <span className="font-medium text-ink">{plan.name}</span> went through. Your
        eSIM is ready to install.
      </p>

      <div className="mt-2 rounded-xl border border-line bg-cream px-5 py-3 text-sm">
        <span className="text-muted">Order number</span>{" "}
        <span className="font-semibold text-ink">{result.orderId}</span>
      </div>

      <LinkButton href={`/account/esims/${encodeURIComponent(result.iccid)}`} size="lg" className="mt-4">
        eSIM ready to install →
      </LinkButton>
    </div>
  );
}
