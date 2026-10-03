import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "pt"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  pt: "Português",
};

/**
 * The language tag for each site language: used for <html lang>, hreflang
 * and number/date/country-name formatting. /pt is European Portuguese.
 */
export const LANGUAGE_TAGS: Record<AppLocale, string> = {
  en: "en",
  fr: "fr",
  es: "es",
  pt: "pt-PT",
};

export function languageTag(locale: string): string {
  return LANGUAGE_TAGS[locale as AppLocale] ?? locale;
}
