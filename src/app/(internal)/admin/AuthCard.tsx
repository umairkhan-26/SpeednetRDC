import type { ReactNode } from "react";

/** The centred card used by the sign-in and one-time-link pages. */
export default function AuthCard({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange">SpeedNetRDC</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{title}</h1>
        {intro && <div className="mt-1 text-sm text-muted">{intro}</div>}
        {children}
      </div>
    </div>
  );
}
