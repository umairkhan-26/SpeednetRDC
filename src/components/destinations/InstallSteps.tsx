"use client";

import { useTranslations } from "next-intl";

const steps = ["openSettings", "selectMobile", "addEsim", "scanQr", "enableData"] as const;

export default function InstallSteps() {
  const t = useTranslations("installSteps");
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, i) => (
        <li key={step} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
            {i + 1}
          </span>
          <p className="text-sm font-medium text-ink">{t(step)}</p>
        </li>
      ))}
    </ol>
  );
}
