"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createNames, type Names } from "./names";

/** Localized country/region/plan names, data amounts, durations and prices for client components. */
export function useNames(): Names {
  const locale = useLocale();
  const tFormat = useTranslations("format");
  const tRegions = useTranslations("regions");
  return useMemo(
    () => createNames(locale, (k, v) => tFormat(k, v), (k) => tRegions(k)),
    [locale, tFormat, tRegions]
  );
}
