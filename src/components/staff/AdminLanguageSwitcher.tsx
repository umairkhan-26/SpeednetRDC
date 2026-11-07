"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { clsx } from "clsx";
import { LOCALE_LABELS, routing } from "@/i18n/routing";
import { ADMIN_LOCALE_COOKIE } from "@/i18n/admin-locale";

/** Language picker for the admin panel, staff portal and their sign-in pages (stored in a cookie, not the URL). */
export default function AdminLanguageSwitcher({ theme = "light" }: { theme?: "light" | "dark" }) {
  const locale = useLocale();
  const t = useTranslations("admin.common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ADMIN_LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
    startTransition(() => router.refresh());
  }

  return (
    <label
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
        theme === "dark" ? "border-white/25 text-white/85 hover:border-white/50" : "border-line text-ink/80 hover:border-ink/30",
        isPending && "opacity-60",
      )}
    >
      <Globe className="size-4 shrink-0" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className={clsx("cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium outline-none", theme === "dark" ? "text-white/85" : "text-ink/80")}
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
