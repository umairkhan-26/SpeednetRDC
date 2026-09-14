"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink } from "lucide-react";
import { generateQrDataUrl } from "@/lib/qr";
import type { ActiveEsim } from "@/lib/types";

const steps = [
  "Open your phone settings",
  "Select Mobile / Cellular",
  "Add eSIM",
  "Scan the QR code or paste the activation code",
];

export default function InstallationGuideTab({ esim }: { esim: ActiveEsim }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(esim.activationCode).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [esim.activationCode]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(esim.activationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — copy manually is still an option via select text.
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex size-56 items-center justify-center rounded-2xl border border-line bg-white p-4">
        {qrDataUrl ? (
          <Image src={qrDataUrl} alt="eSIM activation QR code" width={220} height={220} unoptimized />
        ) : (
          <div className="size-full animate-pulse rounded-lg bg-ink/5" />
        )}
      </div>

      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Activation code</p>
        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
          <code className="flex-1 truncate text-left text-xs text-ink">{esim.activationCode}</code>
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1 rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold text-white"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy Activation Code"}
          </button>
        </div>
      </div>

      <a href="/how-it-works" className="inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline">
        View Full Installation Guide <ExternalLink className="size-3.5" />
      </a>

      <ol className="mt-2 grid w-full gap-3 text-left sm:grid-cols-2">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
              {i + 1}
            </span>
            <p className="text-sm text-ink">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
