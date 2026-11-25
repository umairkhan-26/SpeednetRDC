import { getCountryBySlug } from "./countries";
import { getGlobalPlans } from "./plans";
import { getRegionBySlug } from "./regions";

export interface PopularDestination {
  slug: string;
  name: string;
  subtitle: string;
  iso: string;
  heroImage: string;
  fromPrice: number;
  href: string;
}

// Mix of single-country destinations and multi-country passes, matching
// what ships on the homepage's "Popular destinations" grid.
const destinations: Omit<PopularDestination, "fromPrice">[] = [
  { slug: "australia", name: "Australia", subtitle: "Oceania", iso: "AU", heroImage: "/destinations/australia.webp", href: "/destinations/australia" },
  { slug: "canada", name: "Canada", subtitle: "North America", iso: "CA", heroImage: "/destinations/canada.webp", href: "/destinations/canada" },
  { slug: "europe", name: "Europe", subtitle: "22+ countries", iso: "EU", heroImage: "/destinations/switzerland.webp", href: "/regional-plans/europe" },
  { slug: "global", name: "Global", subtitle: "81+ countries", iso: "GLOBAL", heroImage: "/destinations/global.webp", href: "/global-plans" },
  { slug: "japan", name: "Japan", subtitle: "Asia", iso: "JP", heroImage: "/destinations/japan.webp", href: "/destinations/japan" },
  { slug: "saudi-arabia", name: "Saudi Arabia", subtitle: "Middle East", iso: "SA", heroImage: "/destinations/saudi-arabia.webp", href: "/destinations/saudi-arabia" },
  { slug: "thailand", name: "Thailand", subtitle: "Asia", iso: "TH", heroImage: "/destinations/thailand.webp", href: "/destinations/thailand" },
  { slug: "turkey", name: "Turkey", subtitle: "Europe", iso: "TR", heroImage: "/destinations/turkey.webp", href: "/destinations/turkey" },
  { slug: "uae", name: "UAE", subtitle: "Middle East", iso: "AE", heroImage: "/destinations/uae.webp", href: "/destinations/uae" },
  { slug: "united-kingdom", name: "United Kingdom", subtitle: "Europe", iso: "GB", heroImage: "/destinations/united-kingdom.webp", href: "/destinations/united-kingdom" },
];

/** The cheapest plan on sale behind a tile, from the generated price data. */
function cheapestPrice(slug: string): number {
  const price =
    slug === "global"
      ? Math.min(...getGlobalPlans().map((p) => p.price))
      : (getRegionBySlug(slug) ?? getCountryBySlug(slug))?.fromPrice;
  // Fail the build rather than advertise a price no plan has.
  if (!price || !Number.isFinite(price)) throw new Error(`No plan on sale for popular destination "${slug}"`);
  return price;
}

export const popularDestinations: PopularDestination[] = destinations.map((d) => ({
  ...d,
  fromPrice: cheapestPrice(d.slug),
}));

export const searchSuggestions = [
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "UAE" },
  { code: "US", name: "United States" },
  { code: "GLOBAL", name: "Global" },
];
