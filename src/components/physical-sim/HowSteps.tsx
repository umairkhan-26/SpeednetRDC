import type { LucideIcon } from "lucide-react";

export interface HowStep {
  icon: LucideIcon;
  title: string;
  text: string;
}

/**
 * The numbered "How it works" steps.
 * - "list": one step per row, for a narrow column (the order page next to the payment box).
 *   Every step is the same height and its text always has room to breathe.
 * - "grid": cards side by side on a wide page, equal height, number inside the card.
 * The number sits inside the card (it used to hang over the top edge and crowd the heading).
 */
export default function HowSteps({ steps, layout = "list" }: { steps: HowStep[]; layout?: "list" | "grid" }) {
  if (layout === "grid") {
    return (
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
                <step.icon className="size-5" aria-hidden />
              </span>
              <span className="flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
            </div>
            <p className="mt-4 font-semibold text-ink">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="mt-6 space-y-3">
      {steps.map((step, i) => (
        <li key={step.title} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
            <step.icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">
              <span className="mr-2 text-orange">{i + 1}.</span>
              {step.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
