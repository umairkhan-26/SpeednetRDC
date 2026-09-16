import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Globe, Zap } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function DestinationTile({
  href,
  imageUrl,
  code,
  isGlobal = false,
  name,
  subtitle,
  fromPrice,
  speed = "5G",
  size = "md",
}: {
  href: string;
  imageUrl: string;
  code: string;
  isGlobal?: boolean;
  name: string;
  subtitle: string;
  fromPrice: number;
  speed?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div
        className={`relative w-full overflow-hidden ${size === "sm" ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square"}`}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/0" />

        <span className="absolute left-2.5 top-2.5 flex size-7 items-center justify-center rounded-md bg-white/95 text-[11px] font-bold text-ink shadow">
          {isGlobal ? <Globe className="size-4 text-sky-600" /> : code}
        </span>
        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold text-ink shadow">
          <Zap className="size-2.5 fill-current" />
          {speed}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-[11px] text-white/75">
            {subtitle} &middot; from <span className="font-semibold text-orange-soft">{formatPrice(fromPrice)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
