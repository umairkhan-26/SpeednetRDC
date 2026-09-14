import type { Country } from "@/lib/types";
import DestinationTile from "./DestinationTile";

const regionLabels: Record<string, string> = {
  africa: "Africa",
  asia: "Asia",
  caribbean: "Caribbean",
  europe: "Europe",
  global: "Global",
  "latin-america": "Latin America",
  "middle-east": "Middle East",
  oceania: "Oceania",
  "north-america": "North America",
};

export default function CountryCard({ country }: { country: Country }) {
  return (
    <DestinationTile
      href={`/destinations/${country.slug}`}
      imageUrl={country.heroImage}
      code={country.iso}
      name={country.name}
      subtitle={regionLabels[country.region]}
      fromPrice={country.fromPrice}
      speed={country.speed}
    />
  );
}
