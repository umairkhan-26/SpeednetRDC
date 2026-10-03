import { getTranslations } from "next-intl/server";
import { createNames, type Names } from "./names";

/** Localized country/region/plan names, data amounts, durations and prices for server components. */
export async function getNames(locale: string): Promise<Names> {
  const tFormat = await getTranslations({ locale, namespace: "format" });
  const tRegions = await getTranslations({ locale, namespace: "regions" });
  return createNames(locale, (k, v) => tFormat(k, v), (k) => tRegions(k));
}
