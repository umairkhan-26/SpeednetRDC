import * as Flags from "country-flag-icons/react/3x2";
import { Globe } from "lucide-react";
import { clsx } from "clsx";
import type { ComponentType, SVGProps } from "react";

const flagMap = Flags as unknown as Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

export default function Flag({ iso, className }: { iso: string; className?: string }) {
  const Icon = flagMap[iso];
  if (!Icon) {
    return (
      <span className={clsx("inline-flex items-center justify-center rounded-sm bg-orange/10 text-orange", className)}>
        <Globe className="size-[70%]" />
      </span>
    );
  }
  return <Icon className={clsx("rounded-sm object-cover shadow-sm ring-1 ring-black/5", className)} />;
}
