"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { setupAdminAction, type SetupAdminActionState } from "@/lib/staff/actions";
import { Button } from "@/components/ui/Button";

const initialState: SetupAdminActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Creating..." : "Create admin account"}
    </Button>
  );
}

export default function SetupAdminForm() {
  const [state, formAction] = useActionState(setupAdminAction, initialState);

  if (state.success) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
        Admin account created. You can now sign in at{" "}
        <Link href="/admin/login" className="font-semibold underline">
          /admin/login
        </Link>
        .
        <p className="mt-2 font-semibold">Please delete the /setup-admin route now for security.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Setup secret</label>
        <input
          type="password"
          name="secret"
          required
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
        <p className="mt-1 text-xs text-muted">The SETUP_ADMIN_SECRET value you set on the server.</p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Your name</label>
        <input
          type="text"
          name="name"
          required
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
