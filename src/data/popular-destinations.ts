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
export const popularDestinations: PopularDestination[] = [
  { slug: "australia", name: "Australia", subtitle: "Oceania", iso: "AU", heroImage: "/destinations/australia.webp", fromPrice: 2.84, href: "/destinations/australia" },
  { slug: "canada", name: "Canada", subtitle: "North America", iso: "CA", heroImage: "/destinations/canada.webp", fromPrice: 3.04, href: "/destinations/canada" },
  { slug: "europe", name: "Europe", subtitle: "22+ countries", iso: "EU", heroImage: "/destinations/switzerland.webp", fromPrice: 2.64, href: "/regional-plans/europe" },
  { slug: "global", name: "Global", subtitle: "81+ countries", iso: "GLOBAL", heroImage: "/destinations/global.webp", fromPrice: 3.84, href: "/global-plans" },
  { slug: "japan", name: "Japan", subtitle: "Asia", iso: "JP", heroImage: "/destinations/japan.webp", fromPrice: 2.74, href: "/destinations/japan" },
  { slug: "saudi-arabia", name: "Saudi Arabia", subtitle: "Middle East", iso: "SA", heroImage: "/destinations/saudi-arabia.webp", fromPrice: 3.24, href: "/destinations/saudi-arabia" },
  { slug: "thailand", name: "Thailand", subtitle: "Asia", iso: "TH", heroImage: "/destinations/thailand.webp", fromPrice: 2.14, href: "/destinations/thailand" },
  { slug: "turkey", name: "Turkey", subtitle: "Europe", iso: "TR", heroImage: "/destinations/turkey.webp", fromPrice: 2.64, href: "/destinations/turkey" },
  { slug: "uae", name: "UAE", subtitle: "Middle East", iso: "AE", heroImage: "/destinations/uae.webp", fromPrice: 3.44, href: "/destinations/uae" },
  { slug: "united-kingdom", name: "United Kingdom", subtitle: "Europe", iso: "GB", heroImage: "/destinations/united-kingdom.webp", fromPrice: 2.34, href: "/destinations/united-kingdom" },
];

export const searchSuggestions = [
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "UAE" },
  { code: "US", name: "United States" },
  { code: "GLOBAL", name: "Global" },
];
