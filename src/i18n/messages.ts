import type { AbstractIntlMessages } from "next-intl";
import en from "../../messages/en.json";

// Every language's messages sit on top of English: a key a language doesn't
// have (yet) shows in English instead of breaking the page. French and
// Spanish rely on this for the pages that are still English-only there.

type Messages = { [key: string]: string | Messages | unknown[] };

function mergeOver(base: Messages, overlay: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const baseValue = base[key];
    out[key] =
      value && typeof value === "object" && !Array.isArray(value) && baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)
        ? mergeOver(baseValue as Messages, value as Messages)
        : (value as Messages[string]);
  }
  return out;
}

// FAQ lists are arrays (read with t.raw), which next-intl's message type
// doesn't describe, hence the casts.
const english = en as unknown as Messages;

export async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  if (locale === "en") return english as unknown as AbstractIntlMessages;
  try {
    const own = (await import(`../../messages/${locale}.json`)).default as Messages;
    return mergeOver(english, own) as unknown as AbstractIntlMessages;
  } catch {
    return english as unknown as AbstractIntlMessages;
  }
}
