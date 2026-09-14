import { clsx } from "clsx";
import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={clsx(align === "center" && "max-w-2xl")}>
        {eyebrow && (
          <p className={clsx("mb-2 text-xs font-semibold uppercase tracking-widest", light ? "text-orange-soft" : "text-orange")}>
            {eyebrow}
          </p>
        )}
        <h2 className={clsx("text-3xl font-bold tracking-tight sm:text-4xl", light ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {subtitle && (
          <p className={clsx("mt-3 text-base", light ? "text-white/70" : "text-muted")}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
