"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { checkTopUpSimAction, listMySimsAction } from "@/lib/customer/sim-actions";
import { useCheckoutStore } from "@/lib/store/checkout-store";


/**
 * "Add to my SIM": signed-in customers pick one of their SIMs; anyone can
 * type the ICCID printed on their SIM card, which is checked against our
 * stock before they can continue.
 */
export default function TopUpSimPicker() {
  const { topUpIccid, suggestedIccid, setTopUpIccid } = useCheckoutStore();
  const [mySims, setMySims] = useState<{ iccid: string; simType: "esim" | "physical" }[] | null>(null);
  const [typed, setTyped] = useState(suggestedIccid ?? "");
  const [error, setError] = useState<string | null>(null);
  const [checkedLabel, setCheckedLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("topUpPicker");
  const simLabel = (sim: { iccid: string; simType: "esim" | "physical" }) =>
    t(sim.simType === "physical" ? "simCard" : "esim", { last4: sim.iccid.slice(-4) });

  useEffect(() => {
    let cancelled = false;
    listMySimsAction()
      .then((sims) => {
        if (cancelled) return;
        setMySims(sims);
        const suggested = suggestedIccid ? sims.find((s) => s.iccid === suggestedIccid) : undefined;
        if (suggested) setTopUpIccid(suggested.iccid);
      })
      .catch(() => !cancelled && setMySims([]));
    return () => {
      cancelled = true;
    };
  }, [suggestedIccid, setTopUpIccid]);

  function check() {
    setError(null);
    setCheckedLabel(null);
    setTopUpIccid(null);
    startTransition(async () => {
      const result = await checkTopUpSimAction(typed);
      if (result.ok) {
        setTopUpIccid(result.iccid);
        setCheckedLabel(simLabel(result));
      } else {
        setError(t(`errors.${result.error}`));
      }
    });
  }

  const own = mySims ?? [];
  const pickedOwn = own.find((s) => s.iccid === topUpIccid);

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
      <p className="font-semibold text-ink">{t("title")}</p>

      {own.length > 0 && (
        <div className="space-y-2">
          {own.map((sim) => (
            <label key={sim.iccid} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm hover:border-orange">
              <input
                type="radio"
                name="topup-sim"
                checked={topUpIccid === sim.iccid}
                onChange={() => {
                  setError(null);
                  setCheckedLabel(null);
                  setTopUpIccid(sim.iccid);
                }}
                className="accent-orange"
              />
              <span className="text-ink">{simLabel(sim)}</span>
              <span className="font-mono text-xs text-muted">{sim.iccid}</span>
            </label>
          ))}
          <p className="text-xs text-muted">{t("orAnother")}</p>
        </div>
      )}

      <div>
        <label htmlFor="topup-iccid" className="mb-1.5 block text-sm font-medium text-ink">
          {t("iccidLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="topup-iccid"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="89…"
            className="w-64 rounded-lg border border-line px-3 py-2.5 font-mono text-sm outline-none focus:border-orange"
          />
          <button
            type="button"
            onClick={check}
            disabled={isPending || typed.trim().length < 18}
            className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 disabled:opacity-50"
          >
            {isPending ? t("checking") : t("check")}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">{t("hint")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {(checkedLabel || pickedOwn) && topUpIccid && (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> {t("willAdd", { sim: checkedLabel ?? simLabel(pickedOwn!) })}
        </p>
      )}
    </div>
  );
}
