import { ArrowRight, Circle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import DestinationSearch from "./DestinationSearch";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,97,4,0.25),_transparent_60%)]" />
      <div className="container-page relative flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
          Stay Connected. <span className="text-orange">Anywhere.</span>
        </h1>
        <p className="max-w-xl text-base text-white/70 sm:text-lg">
          Instant eSIM data in 190+ destinations. No roaming stress, no physical SIM, no
          contracts &mdash; just land and connect.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/esim-store" size="lg">
            Explore eSIM Plans <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton href="/how-it-works" variant="outline-light" size="lg">
            <Circle className="size-3 fill-current" /> How It Works
          </LinkButton>
        </div>

        <div className="mt-6 w-full">
          <DestinationSearch />
        </div>
      </div>
    </section>
  );
}
