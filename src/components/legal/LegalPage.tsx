import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLegalPlaceholders, isPlaceholder, LEGAL_LAST_UPDATED, legalPagesLive, legalPagesViewable } from "@/lib/legal";

/** A company detail or policy value; placeholders are highlighted until filled in (src/lib/legal.ts). */
export function V({ children }: { children: string }) {
  return isPlaceholder(children) ? <mark className="rounded bg-yellow-200 px-1 text-ink">{children}</mark> : <>{children}</>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 text-xl font-bold text-ink">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 leading-relaxed text-ink/80">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed text-ink/80">{children}</ul>;
}

/** Shared frame for the Privacy Policy, Terms and Refund Policy (English only for now). */
export default function LegalPage({ title, locale, children }: { title: string; locale: string; children: ReactNode }) {
  if (!legalPagesViewable()) notFound();
  return (
    <article className="container-page max-w-3xl py-14">
      {!legalPagesLive() && (
        <p className="mb-8 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-ink">
          <strong>Preview (local development only).</strong> This page is hidden on the live site until every highlighted placeholder in
          src/lib/legal.ts is filled in and PUBLISH_LEGAL_PAGES is set to true.
          {!hasLegalPlaceholders() && " All placeholders are filled in — only the flag is left."}
        </p>
      )}
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LEGAL_LAST_UPDATED}</p>
      {locale !== "en" && <p className="mt-2 text-sm text-muted">This page is currently available in English only.</p>}
      {children}
    </article>
  );
}
