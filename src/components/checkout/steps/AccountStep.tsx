"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { isValidEmail, isValidFullName } from "@/lib/validation";

export default function AccountStep({
  fullName,
  email,
  onBack,
  onContinue,
}: {
  fullName: string;
  email: string;
  onBack: () => void;
  onContinue: (fullName: string, email: string) => void;
}) {
  const [name, setName] = useState(fullName);
  const [emailValue, setEmailValue] = useState(email);
  const [touched, setTouched] = useState(false);

  const nameValid = isValidFullName(name);
  const emailValid = isValidEmail(emailValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!nameValid || !emailValid) return;
    onContinue(name, emailValue);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Your account</h2>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll send your eSIM and receipt to this email.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Johnson"
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
        {touched && !nameValid && <p className="mt-1 text-xs text-red-600">Enter your full name.</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Email address</label>
        <input
          type="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
        {touched && !emailValid && <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p>}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg">
          Continue to payment
        </Button>
      </div>
    </form>
  );
}
