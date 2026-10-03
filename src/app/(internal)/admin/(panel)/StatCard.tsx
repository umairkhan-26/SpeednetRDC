import type { ReactNode } from "react";

export default function StatCard({ label, value, note }: { label: string; value: string; note?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {note && <div className="mt-1.5 text-xs leading-snug text-muted">{note}</div>}
    </div>
  );
}
