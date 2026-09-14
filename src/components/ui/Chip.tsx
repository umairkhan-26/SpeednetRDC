import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Badge({
  children,
  tone = "orange",
}: {
  children: ReactNode;
  tone?: "orange" | "dark" | "success";
}) {
  const tones = {
    orange: "bg-orange text-white",
    dark: "bg-ink text-white",
    success: "bg-emerald-600 text-white",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}
