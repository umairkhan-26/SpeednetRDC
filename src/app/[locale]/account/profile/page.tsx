"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Bell, ChevronLeft, Check, CreditCard, LifeBuoy, Smartphone } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/Button";
import { isValidEmail, isValidFullName } from "@/lib/validation";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  const valid = isValidFullName(fullName) && isValidEmail(email);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    updateProfile({ fullName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="container-page max-w-xl py-14">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> My SpeedNetRDC
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">Profile</h1>
      <p className="mt-2 text-muted">Used for receipts and eSIM delivery.</p>

      <form onSubmit={handleSave} className="mt-8 space-y-5 rounded-2xl border border-line bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!valid}>
            Save changes
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="size-4" /> Saved
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {profileNavCards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4 transition-colors hover:border-orange/40"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <c.icon className="size-4" />
            </span>
            <span className="text-sm font-semibold text-ink">{c.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const profileNavCards = [
  { icon: Smartphone, label: "My eSIMs", href: "/account" },
  { icon: CreditCard, label: "Payment methods & receipts", href: "/account/payment-methods" },
  { icon: Bell, label: "Notifications", href: "/account/notifications" },
  { icon: LifeBuoy, label: "Support", href: "/help" },
];
