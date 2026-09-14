import type { Metadata } from "next";
import { Smartphone, Unlock, Wifi } from "lucide-react";
import DeviceCompatibilityChecker from "@/components/device-compat/DeviceCompatibilityChecker";

export const metadata: Metadata = { title: "Device Compatibility — SpeedNetRDC" };

const infoCards = [
  {
    icon: Smartphone,
    title: "eSIM-capable phone",
    description: "Most phones released after 2018 support eSIM — check your model above to confirm.",
  },
  {
    icon: Unlock,
    title: "Carrier-unlocked",
    description: "Locked phones can't install a third-party eSIM. Ask your carrier to unlock it first.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi to install",
    description: "You'll need an internet connection for the roughly 2-minute setup — Wi-Fi works best.",
  },
];

export default function DeviceCompatibilityPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Will SpeedNetRDC work on my phone?
        </h1>
        <p className="mt-3 text-muted">
          Pick your device below and we&apos;ll tell you instantly whether it supports eSIM.
        </p>
      </div>

      <div className="mt-10">
        <DeviceCompatibilityChecker />
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-3">
        {infoCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-line bg-white p-5">
            <card.icon className="size-6 text-orange" />
            <p className="mt-3 text-sm font-semibold text-ink">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
