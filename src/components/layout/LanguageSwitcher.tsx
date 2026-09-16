"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, LOCALE_LABELS, type AppLocale } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { clsx } from "clsx";

export default function LanguageSwitcher({ theme = "light" }: { theme?: "light" | "dark" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function handleChange(nextLocale: string) {
    router.replace(
      // @ts-expect-error -- params shape varies by the current route
      { pathname, params },
      { locale: nextLocale as AppLocale }
    );
  }

  return (
    <label
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
        theme === "dark"
          ? "border-white/25 text-white/85 hover:border-white/50"
          : "border-line text-ink/80 hover:border-ink/30",
      )}
    >
      <Globe className="size-4 shrink-0" />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className={clsx(
          "cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium outline-none",
          theme === "dark" ? "text-white/85" : "text-ink/80",
        )}
        style={theme === "dark" ? { colorScheme: "dark" } : undefined}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
