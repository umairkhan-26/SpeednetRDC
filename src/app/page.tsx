import Hero from "@/components/home/Hero";
import PopularDestinations from "@/components/home/PopularDestinations";
import RegionalStrip from "@/components/home/RegionalStrip";
import StepsSection from "@/components/home/StepsSection";
import ValueProps from "@/components/home/ValueProps";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularDestinations />
      <RegionalStrip />
      <StepsSection />
      <ValueProps />
    </>
  );
}
