import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Checkout cancelled — SpeedNetRDC" };

export default function CheckoutCancelPage() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-ink/5">
        <XCircle className="size-9 text-muted" />
      </span>
      <h1 className="text-2xl font-bold text-ink">Checkout cancelled</h1>
      <p className="max-w-sm text-muted">
        You weren&apos;t charged. Your cart wasn&apos;t saved, but you can pick your plan again in a couple
        of taps.
      </p>
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
    </div>
  );
}
