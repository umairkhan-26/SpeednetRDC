"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createStaffAction, type CreateStaffActionState } from "@/lib/staff/actions";
import { Button } from "@/components/ui/Button";
import { Plus, X } from "lucide-react";

const initialState: CreateStaffActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create account"}
    </Button>
  );
}

export default function NewStaffForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createStaffAction, initialState);

  if (state.success && open) {
    setOpen(false);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> Add New Staff
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Add new staff account</p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Temporary password</label>
          <input
            type="text"
            name="password"
            required
            minLength={8}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Role</label>
          <select
            name="role"
            defaultValue="staff"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-orange"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {state.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
        <div className="sm:col-span-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
