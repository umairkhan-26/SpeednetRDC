"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginActionState } from "@/lib/staff/actions";
import { Button } from "@/components/ui/Button";

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@speednetrdc.com"
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
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
