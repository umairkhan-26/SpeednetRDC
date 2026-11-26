import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { languageTag, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/** A translated page title ("<title> — SpeedNetRDC") from the "meta" namespace. */
export async function pageMetadata(locale: string, key: string, values?: Record<string, string | number>): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: `${t(key, values)} — SpeedNetRDC` };
}

/**
 * A page's own address for search engines and link previews: its canonical URL,
 * the same page in every other language (hreflang) and the Open Graph URL.
 * `path` is the part after the language ("" for the home page, "/help").
 * Every indexable page spreads this into its metadata; the layout sets none,
 * so a page that forgets it claims no other page's address.
 */
export async function pageUrls(locale: string, path: string): Promise<Pick<Metadata, "alternates" | "openGraph">> {
  const t = await getTranslations({ locale, namespace: "meta" });
  // hreflang: one entry per site language, keyed by its language tag
  // (European Portuguese is "pt-PT").
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[languageTag(l)] = `${SITE_URL}/${l}${path}`;
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;

  const url = `${SITE_URL}/${locale}${path}`;
  return {
    alternates: { canonical: url, languages },
    // Next replaces openGraph as a whole, so the site's title and description come along.
    openGraph: { title: t("siteTitle"), description: t("siteDescription"), url, siteName: "SpeedNetRDC", type: "website" },
  };
}
