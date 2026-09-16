import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Payment Methods — My SpeedNetRDC" };

export default function PaymentMethodsPage() {
  return (
    <div className="container-page max-w-xl py-14">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> My SpeedNetRDC
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">Payment methods</h1>
      <p className="mt-2 text-muted">Cards used for checkout and top-ups.</p>

      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-white">
          <CreditCard className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-ink">Visa ending in 4242</p>
          <p className="text-xs text-muted">Expires 08/29</p>
        </div>
        <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">Default</span>
      </div>

      <Button variant="outline" className="mt-4">
        <Plus className="size-4" /> Add payment method
      </Button>
    </div>
  );
}
