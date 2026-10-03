"use client";

import type { Country } from "@/lib/types";
import { useNames } from "@/i18n/use-names";
import DestinationTile from "./DestinationTile";

export default function CountryCard({ country }: { country: Country }) {
  const names = useNames();
  return (
    <DestinationTile
      href={`/destinations/${country.slug}`}
      imageUrl={country.heroImage}
      code={country.iso}
      name={names.country(country)}
      subtitle={names.region(country.region)}
      fromPrice={country.fromPrice}
      speed={country.speed}
    />
  );
}
