"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export interface AccountFormResult {
  error?: string;
  success?: string;
  signInPath?: string;
}

function SubmitButton({ label, pendingLabel, fullWidth }: { label: string; pendingLabel: string; fullWidth?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={fullWidth ? "lg" : "md"} className={fullWidth ? "w-full" : undefined} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

/**
 * A form wired to an account server action that returns { error } or
 * { success }. With hideOnSuccess the fields are replaced by the success
 * message (e.g. a one-time link that can't be used twice).
 */
export default function AccountForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  hideOnSuccess = false,
  fullWidth = false,
}: {
  action: (state: AccountFormResult, formData: FormData) => Promise<AccountFormResult>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  hideOnSuccess?: boolean;
  fullWidth?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});

  if (state.success && hideOnSuccess) {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{state.success}</p>
        {state.signInPath && (
          <a href={state.signInPath} className="block text-center text-sm font-semibold text-orange hover:underline">
            Go to sign in
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {children}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{state.success}</p>}
      <SubmitButton label={submitLabel} pendingLabel={pendingLabel} fullWidth={fullWidth} />
    </form>
  );
}

export function Field({ label, hint, ...input }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">
        {label}
        <input
          {...input}
          className="mt-1.5 block w-full rounded-lg border border-line px-4 py-3 text-sm font-normal outline-none focus:border-orange"
        />
      </label>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
