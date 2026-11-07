// The admin panel, staff portal and their sign-in pages have no language in
// the URL (unlike the public site), so the chosen language lives in a cookie.
// Safe to import from client components.

import { languageTag, type AppLocale } from "./routing";

export const ADMIN_LOCALE_COOKIE = "snrdc_admin_lang";

/** For toLocaleString: English keeps the day-month order the panel has always used. */
export function adminDateLocale(locale: string): string {
  return locale === "en" ? "en-GB" : languageTag(locale as AppLocale);
}
