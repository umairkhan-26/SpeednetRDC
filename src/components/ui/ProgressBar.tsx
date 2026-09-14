import { clsx } from "clsx";

export default function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-ink/10", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-orange to-orange-soft transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
