"use client";

import { useFormStatus } from "react-dom";
import { clockInAction, clockOutAction } from "@/lib/staff/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-full bg-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

/**
 * The admin's own shift, in the sidebar: the same clock in / clock out as the
 * staff view, writing the same shift records the Staff Directory shows.
 */
export default function AdminClockControl({ since }: { since: string | null }) {
  const clockedIn = since !== null;
  return (
    <form action={clockedIn ? clockOutAction : clockInAction} className="rounded-lg bg-white/5 p-3">
      <p className="flex items-center gap-2 text-xs font-medium text-white/80">
        <span className={`size-2 rounded-full ${clockedIn ? "bg-green-500" : "bg-white/30"}`} aria-hidden />
        {clockedIn ? `Clocked in since ${since}` : "Not clocked in"}
      </p>
      <SubmitButton label={clockedIn ? "Clock out" : "Clock in"} />
    </form>
  );
}
