"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/Button";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import Logo from "@/components/layout/Logo";

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const nameValid = isValidFullName(fullName);
  const emailValid = isValidEmail(email);
  const passwordValid = password.length >= 6;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!nameValid || !emailValid || !passwordValid) return;
    login(email, fullName);
    router.push("/account");
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-center text-sm text-muted">Get connected in 190+ destinations.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
            />
            {touched && !nameValid && <p className="mt-1 text-xs text-red-600">Enter your full name.</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
            />
            {touched && !emailValid && <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
            />
            {touched && !passwordValid && <p className="mt-1 text-xs text-red-600">At least 6 characters.</p>}
          </div>
          <Button type="submit" size="lg" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
