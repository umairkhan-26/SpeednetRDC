import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/** A translated page title ("<title> — SpeedNetRDC") from the "meta" namespace. */
export async function pageMetadata(locale: string, key: string, values?: Record<string, string | number>): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: `${t(key, values)} — SpeedNetRDC` };
}
