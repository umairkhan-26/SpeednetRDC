import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { countries } from "@/data/countries";
import { regions } from "@/data/regions";
import { legalPagesLive } from "@/lib/legal";
import { routing, languageTag } from "@/i18n/routing";

const STATIC_PATHS = [
  "",
  "/esim-store",
  "/destinations",
  "/regional-plans",
  "/global-plans",
  "/how-it-works",
  "/device-compatibility",
  "/help",
  "/login",
  "/physical-sim",
];

// Hidden until the company details are filled in (see src/lib/legal.ts).
const LEGAL_PATHS = ["/privacy", "/terms", "/refunds"];

// Each page is listed once per site language, with hreflang links to the
// same page in the other languages.
function localizedEntries(path: string): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[languageTag(l)] = `${SITE_URL}/${l}${path}`;
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;
  return routing.locales.map((l) => ({
    url: `${SITE_URL}/${l}${path}`,
    lastModified: new Date(),
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...(legalPagesLive() ? LEGAL_PATHS : []),
    ...countries.map((country) => `/destinations/${country.slug}`),
    ...regions.map((region) => `/regional-plans/${region.slug}`),
  ];
  return paths.flatMap(localizedEntries);
}
