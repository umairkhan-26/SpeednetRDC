import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Headset, Package, User } from "lucide-react";
import { mockEsims } from "@/data/esims";
import EsimStatusCard from "@/components/account/EsimStatusCard";

export const metadata: Metadata = { title: "My SpeedNetRDC" };

const navCards = [
  { icon: Package, title: "Orders", description: "View past purchases", href: "/account/orders" },
  { icon: User, title: "Profile", description: "Name & email", href: "/account/profile" },
  { icon: CreditCard, title: "Payment methods", description: "Manage cards", href: "/account/payment-methods" },
  { icon: Headset, title: "Support", description: "Get help fast", href: "/help" },
];

export default function AccountHubPage() {
  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">My SpeedNetRDC</h1>
      <p className="mt-2 text-muted">Your eSIMs, data and orders in one place.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {navCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <card.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{card.title}</p>
              <p className="text-xs text-muted">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-ink">Active eSIMs</h2>
        {mockEsims.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockEsims.map((esim) => (
              <EsimStatusCard key={esim.iccid} esim={esim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
      <p className="font-semibold text-ink">Nothing here yet</p>
      <p className="mt-1 text-sm text-muted">Buy your first eSIM to see it here.</p>
      <Link href="/esim-store" className="mt-4 inline-block text-sm font-semibold text-orange hover:underline">
        Browse eSIM Plans →
      </Link>
    </div>
  );
}
