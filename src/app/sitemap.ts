import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { countries } from "@/data/countries";
import { regions } from "@/data/regions";

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
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const destinationEntries: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${SITE_URL}/destinations/${country.slug}`,
    lastModified: new Date(),
  }));

  const regionEntries: MetadataRoute.Sitemap = regions.map((region) => ({
    url: `${SITE_URL}/regional-plans/${region.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...destinationEntries, ...regionEntries];
}
