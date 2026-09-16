"use client";

import { useRouter } from "@/i18n/navigation";
import { Clock, Database, Network, ShieldCheck, Signal, Smartphone, Undo2, Wifi } from "lucide-react";
import type { Plan } from "@/lib/types";
import { formatData, formatPrice, formatValidity } from "@/lib/format";
import { useCheckoutStore } from "@/lib/store/checkout-store";
import { LinkButton, Button } from "@/components/ui/Button";

export default function PlanDetailView({
  plan,
  title,
  subtitle,
  iconSlot,
}: {
  plan: Plan;
  title: string;
  subtitle: string;
  iconSlot: React.ReactNode;
}) {
  const router = useRouter();
  const startCheckout = useCheckoutStore((s) => s.startCheckout);

  function handleBuy() {
    startCheckout(plan);
    router.push("/checkout");
  }

  return (
    <div className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center gap-4">
            {iconSlot}
            <div>
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
              <p className="text-sm text-muted">{subtitle}</p>
            </div>
          </div>

          {plan.countriesIncluded && plan.countriesIncluded.length > 1 && (
            <div className="mt-8 rounded-2xl border border-line bg-cream p-5">
              <p className="text-sm font-semibold text-ink">
                Countries covered ({plan.countriesIncluded.length})
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{plan.countriesIncluded.join(", ")}</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile icon={Database} label="Data allowance" value={formatData(plan.dataAmountGb)} />
            <InfoTile icon={Signal} label="Validity" value={formatValidity(plan.validityDays)} />
            <InfoTile icon={Network} label="Network" value={plan.network} />
            <InfoTile icon={Wifi} label="Speed" value={plan.speed} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoTile icon={Wifi} label="Hotspot" value={plan.hotspot ? "Supported" : "Not supported"} />
            <InfoTile
              icon={Clock}
              label="Activation policy"
              value="Activates automatically on first connection to a supported network"
            />
            <InfoTile icon={Smartphone} label="Supported devices" value="eSIM-capable, unlocked phones" />
            <InfoTile icon={Undo2} label="Refunds" value="30 days if not installed" />
          </div>
        </div>

        <aside className="h-max rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total price</p>
          <p className="mt-1 text-3xl font-bold text-orange">{formatPrice(plan.price)}</p>

          <Button onClick={handleBuy} className="mt-6 w-full" size="lg">
            Buy This eSIM
          </Button>
          <LinkButton href="/device-compatibility" variant="outline" size="lg" className="mt-3 w-full">
            Check Device Compatibility
          </LinkButton>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="size-4 text-orange" />
            Instant delivery &middot; Secure checkout
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <Icon className="size-4 text-orange" />
      <p className="mt-2 text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
