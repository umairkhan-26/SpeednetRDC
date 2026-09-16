"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

const defaultPrefs = [
  { key: "purchase", label: "Purchase confirmations", description: "Receipt and order confirmation after checkout." },
  { key: "ready", label: "eSIM ready to install", description: "Let me know as soon as my QR code is ready." },
  { key: "activated", label: "eSIM activated", description: "Confirm when my eSIM connects for the first time." },
  { key: "low-data", label: "Low data warnings", description: "Alert me when I'm running low on data." },
  { key: "expiring", label: "Plan expiring soon", description: "Remind me a few days before my plan expires." },
  { key: "topup", label: "Top-up confirmations", description: "Confirm when a top-up is added successfully." },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultPrefs.map((p) => [p.key, true])),
  );

  return (
    <div className="container-page max-w-xl py-14">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> My SpeedNetRDC
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">Notifications</h1>
      <p className="mt-2 text-muted">Choose what SpeedNetRDC should email or push to you.</p>

      <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
        {defaultPrefs.map((p) => (
          <label key={p.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-ink">{p.label}</p>
              <p className="text-xs text-muted">{p.description}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs[p.key]}
              onChange={(e) => setPrefs((prev) => ({ ...prev, [p.key]: e.target.checked }))}
              className="size-4 shrink-0 accent-orange"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
