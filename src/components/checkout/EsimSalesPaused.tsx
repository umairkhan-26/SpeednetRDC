import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";

const TITLE = "eSIM orders are temporarily unavailable";

/** Compact notice that replaces the buy button on plan pages. */
export function EsimSalesPausedNotice() {
  return (
    <div className="mt-6 rounded-xl border border-orange/30 bg-orange/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Clock className="size-4 shrink-0 text-orange" />
        {TITLE}
      </p>
      <p className="mt-1.5 text-sm text-muted">We&apos;re making a few improvements and will be back soon.</p>
    </div>
  );
}

/** Full-page message shown at /checkout while sales are paused. */
export function EsimSalesPausedPage() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-orange/10">
        <Clock className="size-8 text-orange" />
      </span>
      <h1 className="text-2xl font-bold text-ink">{TITLE}</h1>
      <p className="max-w-md text-muted">
        We&apos;re making a few improvements behind the scenes and will be back soon. In the meantime you can
        still browse plans and check whether your phone supports eSIM.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <LinkButton href="/esim-store" size="lg">
          Browse plans
        </LinkButton>
        <LinkButton href="/device-compatibility" variant="outline" size="lg">
          Check my phone
        </LinkButton>
      </div>
      <p className="text-xs text-muted">
        Questions?{" "}
        <Link href="/help" className="font-semibold text-orange hover:underline">
          Get help
        </Link>
      </p>
    </div>
  );
}
