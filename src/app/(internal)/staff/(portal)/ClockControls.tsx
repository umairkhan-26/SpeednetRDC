"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { clockInAction, clockOutAction } from "@/lib/staff/actions";
import { Button } from "@/components/ui/Button";

function ActionButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("admin.common");
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? t("saving") : label}
    </Button>
  );
}

export default function ClockControls({ isClockedIn }: { isClockedIn: boolean }) {
  const t = useTranslations("admin.clock");
  return (
    <form action={isClockedIn ? clockOutAction : clockInAction}>
      <ActionButton label={isClockedIn ? t("clockOut") : t("clockIn")} />
    </form>
  );
}
