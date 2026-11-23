import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLegalPlaceholders, isPlaceholder, LEGAL_LAST_UPDATED_BY_LOCALE, legalPagesLive, legalPagesViewable } from "@/lib/legal";

/** A company detail or policy value; placeholders are highlighted until filled in (src/lib/legal.ts). */
export function V({ children }: { children: string }) {
  return isPlaceholder(children) ? <mark className="rounded bg-yellow-200 px-1 text-ink">{children}</mark> : <>{children}</>;
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-24 text-xl font-bold text-ink">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 leading-relaxed text-ink/80">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed text-ink/80">{children}</ul>;
}

const LAST_UPDATED_LABEL: Record<string, string> = {
  en: "Last updated:",
  fr: "Dernière mise à jour :",
  es: "Última actualización:",
  pt: "Última atualização:",
};

const OPERATED_BY: Record<string, string> = {
  en: "SpeedNetRDC is operated by a telecommunications company based in Belgium.",
  fr: "SpeedNetRDC est exploité par une société de télécommunications établie en Belgique.",
  es: "SpeedNetRDC está operado por una empresa de telecomunicaciones con sede en Bélgica.",
  pt: "A SpeedNetRDC é explorada por uma empresa de telecomunicações sediada na Bélgica.",
};

/** Shared frame for the Privacy Policy, Terms and Refund Policy (English, French, Spanish and Portuguese; other languages show the English text with a note). */
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
      <p className="mt-2 text-sm text-muted">
        {LAST_UPDATED_LABEL[locale] ?? LAST_UPDATED_LABEL.en} {LEGAL_LAST_UPDATED_BY_LOCALE[locale] ?? LEGAL_LAST_UPDATED_BY_LOCALE.en}
      </p>
      <p className="mt-4 font-medium text-ink">
        {OPERATED_BY[locale] ?? OPERATED_BY.en}
      </p>
      {!(locale in LEGAL_LAST_UPDATED_BY_LOCALE) && <p className="mt-2 text-sm text-muted">This page is currently available in English only.</p>}
      {children}
    </article>
  );
}
