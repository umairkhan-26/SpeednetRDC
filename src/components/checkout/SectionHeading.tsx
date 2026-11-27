/** Numbered title of one part of the one-page checkout. */
export default function SectionHeading({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
