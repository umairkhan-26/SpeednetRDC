"use client";

import { useFormStatus } from "react-dom";
import { clockInAction, clockOutAction } from "@/lib/staff/actions";
import { Button } from "@/components/ui/Button";

function ActionButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export default function ClockControls({ isClockedIn }: { isClockedIn: boolean }) {
  return (
    <form action={isClockedIn ? clockOutAction : clockInAction}>
      <ActionButton label={isClockedIn ? "Clock out" : "Clock in"} />
    </form>
  );
}
