"use client";

import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";

/** Compact notice that replaces the buy button on plan pages. */
export function EsimSalesPausedNotice() {
  const t = useTranslations("salesPaused");
  return (
    <div className="mt-6 rounded-xl border border-orange/30 bg-orange/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Clock className="size-4 shrink-0 text-orange" />
        {t("title")}
      </p>
      <p className="mt-1.5 text-sm text-muted">{t("notice")}</p>
    </div>
  );
}

/** Full-page message shown at /checkout while sales are paused. */
export function EsimSalesPausedPage() {
  const t = useTranslations("salesPaused");
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-orange/10">
        <Clock className="size-8 text-orange" />
      </span>
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="max-w-md text-muted">{t("page")}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <LinkButton href="/esim-store" size="lg">
          {t("browsePlans")}
        </LinkButton>
        <LinkButton href="/device-compatibility" variant="outline" size="lg">
          {t("checkPhone")}
        </LinkButton>
      </div>
      <p className="text-xs text-muted">
        {t("questions")}{" "}
        <Link href="/help" className="font-semibold text-orange hover:underline">
          {t("getHelp")}
        </Link>
      </p>
    </div>
  );
}
