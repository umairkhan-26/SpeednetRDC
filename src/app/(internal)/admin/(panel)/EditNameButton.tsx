"use client";

import { useState, useTransition } from "react";
import { renameStaffAction } from "@/lib/staff/account-actions";

/** Inline "Edit name" for one admin or staff account (logged in the account activity). */
export default function EditNameButton({ staffId, name }: { staffId: number; name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(name);
          setError(null);
          setEditing(true);
        }}
        className="text-xs font-semibold text-orange hover:underline"
      >
        Edit name
      </button>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await renameStaffAction(staffId, value);
          if (result.ok) setEditing(false);
          else setError(result.message);
        });
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={100}
        required
        autoFocus
        aria-label="Display name"
        className="w-44 rounded-lg border border-line px-2.5 py-1.5 text-sm outline-none focus:border-orange"
      />
      <button type="submit" disabled={isPending} className="text-xs font-semibold text-orange hover:underline disabled:opacity-50">
        {isPending ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-xs font-medium text-muted hover:text-ink">
        Cancel
      </button>
      {error && <span className="w-full text-xs text-red-700">{error}</span>}
    </form>
  );
}
