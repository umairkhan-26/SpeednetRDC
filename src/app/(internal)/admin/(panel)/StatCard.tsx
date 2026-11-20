import type { ReactNode } from "react";

export default function StatCard({ label, value, note, warn }: { label: string; value: string; note?: ReactNode; warn?: boolean }) {
  return (
    <div className={warn ? "rounded-2xl border border-orange bg-orange/5 p-5" : "rounded-2xl border border-line bg-white p-5"}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={warn ? "mt-2 text-2xl font-bold text-orange" : "mt-2 text-2xl font-bold text-ink"}>{value}</p>
      {note && <div className="mt-1.5 text-xs leading-snug text-muted">{note}</div>}
    </div>
  );
}
