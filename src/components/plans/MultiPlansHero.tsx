import { CalendarDays, Globe2, Radio, SignalHigh, Wifi } from "lucide-react";
import type { Plan } from "@/lib/types";
import PlanCard from "./PlanCard";

export default function MultiPlansHero({
  eyebrow,
  title,
  subtitle,
  stats,
  plans,
  countriesIncluded,
  networks,
  speed = "4G/5G",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  stats: { label: string; value: string }[];
  plans: Plan[];
  countriesIncluded: string[];
  networks: string[];
  speed?: string;
}) {
  const statIcons = [Globe2, SignalHigh, Wifi, CalendarDays];

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,97,4,0.25),_transparent_60%)]" />
        <div className="container-page relative flex flex-col items-center gap-5 py-16 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-soft">{eyebrow}</p>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="max-w-lg text-white/70">{subtitle}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={s.label} className="rounded-2xl bg-white/5 px-6 py-5 text-center">
                  <Icon className="mx-auto size-4 text-amber-400" />
                  <p className="mt-2 text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold text-ink">Data options</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-ink">Coverage & networks</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-line bg-cream p-5">
              <p className="text-sm font-semibold text-ink">Countries covered ({countriesIncluded.length})</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{countriesIncluded.join(", ")}</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-cream p-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Radio className="size-4" /> Available networks
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {networks.map((n) => (
                    <li key={n}>&bull; {n}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-line bg-cream p-5">
                <p className="text-sm font-semibold text-ink">Speed</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink">
                  <Wifi className="size-3.5" /> {speed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
