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
  { slug: "australia", name: "Australia", subtitle: "Oceania", iso: "AU", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/1280px-Sydney_Australia._%2821339175489%29.jpg", fromPrice: 2.84, href: "/destinations/australia" },
  { slug: "canada", name: "Canada", subtitle: "North America", iso: "CA", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/1280px-3Falls_Niagara.jpg", fromPrice: 3.04, href: "/destinations/canada" },
  { slug: "europe", name: "Europe", subtitle: "22+ countries", iso: "EU", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Matterhorn_from_Domh%C3%BCtte_-_2.jpg/1280px-Matterhorn_from_Domh%C3%BCtte_-_2.jpg", fromPrice: 2.64, href: "/regional-plans/europe" },
  { slug: "global", name: "Global", subtitle: "81+ countries", iso: "GLOBAL", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/The_Blue_Marble%2C_AS17-148-22727.jpg/1280px-The_Blue_Marble%2C_AS17-148-22727.jpg", fromPrice: 3.84, href: "/global-plans" },
  { slug: "japan", name: "Japan", subtitle: "Asia", iso: "JP", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1280px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg", fromPrice: 2.74, href: "/destinations/japan" },
  { slug: "saudi-arabia", name: "Saudi Arabia", subtitle: "Middle East", iso: "SA", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/The_Ka%27ba%2C_Great_Mosque_of_Mecca%2C_Saudi_Arabia_%284%29.jpg/1280px-The_Ka%27ba%2C_Great_Mosque_of_Mecca%2C_Saudi_Arabia_%284%29.jpg", fromPrice: 3.24, href: "/destinations/saudi-arabia" },
  { slug: "thailand", name: "Thailand", subtitle: "Asia", iso: "TH", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg/1280px-%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg", fromPrice: 2.14, href: "/destinations/thailand" },
  { slug: "turkey", name: "Turkey", subtitle: "Europe", iso: "TR", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Hagia_Sophia_%28228968325%29.jpeg/1280px-Hagia_Sophia_%28228968325%29.jpeg", fromPrice: 2.64, href: "/destinations/turkey" },
  { slug: "uae", name: "UAE", subtitle: "Middle East", iso: "AE", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/1280px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg", fromPrice: 3.44, href: "/destinations/uae" },
  { slug: "united-kingdom", name: "United Kingdom", subtitle: "Europe", iso: "GB", heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg/1280px-Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg", fromPrice: 2.34, href: "/destinations/united-kingdom" },
];

export const searchSuggestions = [
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "UAE" },
  { code: "US", name: "United States" },
  { code: "GLOBAL", name: "Global" },
];
