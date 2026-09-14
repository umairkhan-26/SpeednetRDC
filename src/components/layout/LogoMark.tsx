import { clsx } from "clsx";

/**
 * The SpeedNetRDC bar-chart mark: a white rounded-square card with four
 * ascending orange signal/growth bars. Sizeable via className (e.g. "size-9"
 * in the header, "size-24" for a large standalone lockup).
 */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-[22%] bg-white shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <svg viewBox="0 0 36 36" className="h-[64%] w-[64%]" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="22" width="6" height="10" rx="1.6" fill="#F06104" />
        <rect x="11" y="15" width="6" height="17" rx="1.6" fill="#F06104" />
        <rect x="20" y="9" width="6" height="23" rx="1.6" fill="#F06104" />
        <rect x="29" y="4" width="6" height="28" rx="1.6" fill="#F06104" />
      </svg>
    </span>
  );
}
