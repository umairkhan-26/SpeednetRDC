"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Apple, CheckCircle2, Smartphone } from "lucide-react";
import { clsx } from "clsx";
import { deviceBrands, listModelsForBrand, checkCompatibility } from "@/lib/device-compatibility";
import type { DeviceBrand } from "@/lib/types";

const brandIcons: Partial<Record<DeviceBrand, React.ReactNode>> = {
  Apple: <Apple className="size-5" />,
};

// Translated model labels and notes, matched on the catalogue's English model
// name; models not listed (plain product names) are shown as they are.
type ModelText = { model: string; label: string; notes?: string };

export default function DeviceCompatibilityChecker() {
  const t = useTranslations("deviceChecker");
  const modelText = new Map((t.raw("models") as ModelText[]).map((m) => [m.model, m]));
  const modelLabel = (model: string) => modelText.get(model)?.label ?? model;
  const [brand, setBrand] = useState<DeviceBrand | null>(null);
  const [model, setModel] = useState<string>("");

  const models = brand ? listModelsForBrand(brand) : [];
  const result = brand && model ? checkCompatibility(brand, model) : undefined;

  function selectBrand(next: DeviceBrand) {
    setBrand(next);
    setModel("");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-orange">{t("pickBrand")}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {deviceBrands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => selectBrand(b)}
                className={clsx(
                  "flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-xs font-semibold transition-colors",
                  brand === b
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-line text-ink hover:border-orange/40",
                )}
              >
                {brandIcons[b] ?? <Smartphone className="size-5" />}
                {b === "Other" ? t("otherBrand") : b}
              </button>
            ))}
          </div>
        </div>

        {brand && (
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wide text-orange">{t("selectModel")}</p>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-4 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-orange"
            >
              <option value="">{t("chooseModel")}</option>
              {models.map((m) => (
                <option key={m.model} value={m.model}>
                  {modelLabel(m.model)}
                </option>
              ))}
            </select>
          </div>
        )}

        {result && (
          <div
            className={clsx(
              "mt-6 flex items-start gap-3 rounded-xl border p-4",
              result.esimCompatible
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50",
            )}
          >
            {result.esimCompatible ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            )}
            <div>
              <p className={clsx("font-semibold", result.esimCompatible ? "text-emerald-800" : "text-amber-800")}>
                {result.esimCompatible ? t("compatible") : t("mayNotSupport")}
              </p>
              <p className={clsx("mt-1 text-sm", result.esimCompatible ? "text-emerald-700" : "text-amber-700")}>
                {result.esimCompatible
                  ? t("compatibleText", { model: modelLabel(result.model) })
                  : result.notes
                    ? (modelText.get(result.model)?.notes ?? result.notes)
                    : t("unconfirmedText", { model: modelLabel(result.model) })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
