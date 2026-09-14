import Link from "next/link";
import { clsx } from "clsx";
import LogoMark from "./LogoMark";

export default function Logo({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoMark className="size-9" />
      <span
        className={clsx(
          "text-lg font-extrabold tracking-tight",
          theme === "dark" ? "text-white" : "text-ink",
        )}
      >
        SpeedNet<span className="text-orange">RDC</span>
      </span>
    </Link>
  );
}
