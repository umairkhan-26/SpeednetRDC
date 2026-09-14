import { ShieldCheck } from "lucide-react";
import type { Plan } from "@/lib/types";
import { formatData, formatPrice, formatValidity } from "@/lib/format";
import { calculateOrderTotals } from "@/lib/pricing";
import { getCountryBySlug } from "@/data/countries";

export default function OrderSummarySidebar({ plan }: { plan: Plan }) {
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;
  const fallbackDestination = plan.name.split(" / ")[0].replace(/\s*\d.*$/, "").trim() || plan.name;
  const destination = country?.name ?? fallbackDestination;
  const totals = calculateOrderTotals(plan.price);

  return (
    <aside className="h-max rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Order summary</p>

      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Destination" value={destination} />
        <Row label="Plan" value={plan.name} />
        <Row label="Validity" value={formatValidity(plan.validityDays)} />
        <Row label="Data" value={formatData(plan.dataAmountGb)} />
      </dl>

      <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <Row label="Price" value={formatPrice(totals.subtotal)} />
        <Row label="Taxes & fees" value={formatPrice(totals.taxesAndFees)} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-semibold text-ink">Total</span>
        <span className="text-xl font-bold text-orange">{formatPrice(totals.total)}</span>
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
        Encrypted checkout &middot; Instant delivery &middot; 30-day refund on uninstalled eSIMs
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
