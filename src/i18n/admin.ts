import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { createTranslator, hasLocale, type AbstractIntlMessages } from "next-intl";
import en from "../../messages/admin/en.json";
import { mergeOver, type Messages } from "./messages";
import { routing, type AppLocale } from "./routing";
import { ADMIN_LOCALE_COOKIE } from "./admin-locale";

// Server-side helpers for the admin panel and staff portal languages. Their
// texts are kept out of the public site's message files so visitors never
// download them.

const english = en as unknown as Messages;

export async function getAdminLocale(): Promise<AppLocale> {
  const value = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

/** Admin texts for a language, on top of English so a missing key shows in English. */
export async function loadAdminMessages(locale: AppLocale): Promise<AbstractIntlMessages> {
  if (locale === "en") return { admin: english } as unknown as AbstractIntlMessages;
  try {
    const own = (await import(`../../messages/admin/${locale}.json`)).default as Messages;
    return { admin: mergeOver(english, own) } as unknown as AbstractIntlMessages;
  } catch {
    return { admin: english } as unknown as AbstractIntlMessages;
  }
}

type Values = Record<string, string | number | Date>;
type RichValues = Record<string, string | number | Date | ((chunks: ReactNode) => ReactNode)>;

/** next-intl's translator, typed loosely: admin keys are often built at runtime (statuses, codes). */
export interface AdminTranslator {
  (key: string, values?: Values): string;
  rich(key: string, values?: RichValues): ReactNode;
  has(key: string): boolean;
  locale: AppLocale;
}

/**
 * A translator for server components and server actions, in the language
 * from the admin language cookie. Keys are relative to "admin".
 */
export async function getAdminT(): Promise<AdminTranslator> {
  const locale = await getAdminLocale();
  const messages = await loadAdminMessages(locale);
  const t = createTranslator({ locale, messages, namespace: "admin" });
  return Object.assign(t, { locale }) as unknown as AdminTranslator;
}
