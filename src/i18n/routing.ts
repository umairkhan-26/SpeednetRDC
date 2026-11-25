import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "pt", "nl", "de", "it", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  pt: "Português",
  nl: "Nederlands",
  de: "Deutsch",
  it: "Italiano",
  ar: "العربية",
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
  nl: "nl",
  de: "de",
  it: "it",
  ar: "ar",
};

export function languageTag(locale: string): string {
  return LANGUAGE_TAGS[locale as AppLocale] ?? locale;
}

/** Languages written right to left: the page is mirrored and uses an Arabic font. */
const RIGHT_TO_LEFT = new Set(["ar"]);

export function textDirection(locale: string): "ltr" | "rtl" {
  return RIGHT_TO_LEFT.has(locale) ? "rtl" : "ltr";
}

/** The tag used to format numbers, prices and dates. Arabic keeps the digits 0-9, the same on the server and in every browser. */
export function formatTag(locale: string): string {
  return locale === "ar" ? "ar-u-nu-latn" : languageTag(locale);
}
