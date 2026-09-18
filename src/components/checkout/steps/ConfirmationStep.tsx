import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export interface ConfirmedOrder {
  id: number;
  planName: string;
  countryName: string;
  iccid: string | null;
}

export default function ConfirmationStep({ order }: { order: ConfirmedOrder }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-9 text-emerald-600" />
      </span>
      <h2 className="text-2xl font-bold text-ink">You&apos;re all set!</h2>
      <p className="max-w-sm text-sm text-muted">
        Your payment for <span className="font-medium text-ink">{order.planName}</span> went through.
        {order.iccid
          ? " Your eSIM is ready to install."
          : " We're provisioning your eSIM now and will email you as soon as it's ready to install."}
      </p>

      <div className="mt-2 rounded-xl border border-line bg-cream px-5 py-3 text-sm">
        <span className="text-muted">Order number</span>{" "}
        <span className="font-semibold text-ink">ORD-{order.id}</span>
      </div>

      {order.iccid ? (
        <LinkButton href={`/account/esims/${encodeURIComponent(order.iccid)}`} size="lg" className="mt-4">
          eSIM ready to install →
        </LinkButton>
      ) : (
        <LinkButton href="/account" size="lg" className="mt-4">
          View my orders →
        </LinkButton>
      )}
    </div>
  );
}
