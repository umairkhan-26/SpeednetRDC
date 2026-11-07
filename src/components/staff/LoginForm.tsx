"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import type { LoginActionState } from "@/lib/staff/actions";
import { Button } from "@/components/ui/Button";

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("admin.auth");
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? t("signingIn") : t("signIn")}
    </Button>
  );
}

export default function LoginForm({
  action,
  emailPlaceholder = "you@speednetrdc.com",
}: {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
  emailPlaceholder?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const t = useTranslations("admin.auth");

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{t("email")}</label>
        <input
          type="email"
          name="email"
          required
          placeholder={emailPlaceholder}
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{t("password")}</label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
