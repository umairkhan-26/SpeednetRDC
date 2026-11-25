// Physical SIM cards and top-ups ("Add to my SIM"): one switch, prices,
// shipping countries, tax mode and the answers still pending from Transatel
// and the client's accountant.
//
// Both features stay OFF unless PHYSICAL_SIM_ENABLED is exactly "true" (set
// it in Hostinger and redeploy). While off, /physical-sim shows the card to
// order by email, plan pages offer only "New eSIM", and the checkout APIs
// refuse physical-SIM and top-up orders.
//
// The offer (confirmed by the client, 2026-11-11): €15 all-in — the card
// with 1 GB of international data included, worldwide shipping and VAT —
// delivered in 3–5 working days anywhere in the world.

import { getPlanById } from "@/data/plans";

export function isPhysicalSimEnabled(): boolean {
  return process.env.PHYSICAL_SIM_ENABLED === "true";
}

/**
 * What one blank SIM card costs us (EUR), from SIM_CARD_COST_EUR. null when
 * unset or not a valid number: profit then shows "cost unknown" instead of a
 * made-up figure.
 */
export function getSimCardCostEur(): number | null {
  const raw = process.env.SIM_CARD_COST_EUR?.trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// --- Prices -------------------------------------------------------------------

/** The card, with the included data plan. */
export const SIM_CARD_PRICE_EUR = 10;
/** Shipping, the same price everywhere in the world. */
export const SHIPPING_PRICE_EUR = 5;

/**
 * How tax applies to the card and its shipping — one setting,
 * PHYSICAL_SIM_TAX_MODE, no code change needed:
 *   final     (default) prices include VAT: €10 + €5 = €15.00 (incl. 21% VAT)
 *   vat       21% Belgian VAT added on top: €12.10 + €6.05 = €18.15
 *   surcharge the 5% "taxes & fees" line eSIM checkout uses: €15.75
 * "final" is what the client asked for: €15 all-in, VAT included.
 */
export type PhysicalSimTaxMode = "final" | "surcharge" | "vat";

export function getPhysicalSimTaxMode(): PhysicalSimTaxMode {
  const mode = process.env.PHYSICAL_SIM_TAX_MODE;
  return mode === "surcharge" || mode === "vat" ? mode : "final";
}

// --- Included data plan --------------------------------------------------------

/**
 * The data plan that comes with every card, put on it when it's shipped so
 * it works on arrival. The client asked for 1 GB of international data for
 * 7 days; Transatel has no 1 GB / 7-day international plan, so the default
 * is Global 1 GB / 30 days (184 countries, €3.38 wholesale). Override with
 * PHYSICAL_SIM_INCLUDED_PLAN (a plan id from the catalogue).
 */
const DEFAULT_INCLUDED_PLAN = "WW_901O_STACK_ONEOFF_BEST_WORLD_1GB_30D";

export function getIncludedPlan() {
  const id = process.env.PHYSICAL_SIM_INCLUDED_PLAN || DEFAULT_INCLUDED_PLAN;
  return getPlanById(id) ?? getPlanById(DEFAULT_INCLUDED_PLAN)!;
}

/** For texts: "1 GB", "30" days, "184" countries. */
export function includedPlanFacts(): { gb: string; days: number; countries: number } {
  const plan = getIncludedPlan();
  return { gb: `${plan.dataAmountGb} GB`, days: plan.validityDays, countries: plan.countriesIncluded?.length ?? 0 };
}

export interface PhysicalSimPriceLine {
  key: "sim" | "shipping" | "fees";
  label: string;
  amountEur: number;
}

export interface PhysicalSimPricing {
  mode: PhysicalSimTaxMode;
  lines: PhysicalSimPriceLine[];
  totalEur: number;
  /** Shipping's share of the total (for revenue reporting). */
  shippingEur: number;
  /** VAT inside the total: added on top in vat mode, included (21%) in final mode, 0 for surcharge. */
  vatEur: number;
}

const VAT_RATE = 0.21;
const SURCHARGE_RATE = 0.05;
const round = (n: number) => Math.round(n * 100) / 100;

export function physicalSimPricing(mode: PhysicalSimTaxMode): PhysicalSimPricing {
  if (mode === "vat") {
    const sim = round(SIM_CARD_PRICE_EUR * (1 + VAT_RATE));
    const shipping = round(SHIPPING_PRICE_EUR * (1 + VAT_RATE));
    return {
      mode,
      lines: [
        { key: "sim", label: "SIM card", amountEur: sim },
        { key: "shipping", label: "Shipping", amountEur: shipping },
      ],
      totalEur: round(sim + shipping),
      shippingEur: shipping,
      vatEur: round(sim + shipping - SIM_CARD_PRICE_EUR - SHIPPING_PRICE_EUR),
    };
  }
  const lines: PhysicalSimPriceLine[] = [
    { key: "sim", label: "SIM card", amountEur: SIM_CARD_PRICE_EUR },
    { key: "shipping", label: "Shipping", amountEur: SHIPPING_PRICE_EUR },
  ];
  if (mode === "surcharge") {
    lines.push({ key: "fees", label: "Taxes & fees", amountEur: round((SIM_CARD_PRICE_EUR + SHIPPING_PRICE_EUR) * SURCHARGE_RATE) });
  }
  const totalEur = round(lines.reduce((sum, l) => sum + l.amountEur, 0));
  return { mode, lines, totalEur, shippingEur: SHIPPING_PRICE_EUR, vatEur: mode === "final" ? round(totalEur - totalEur / (1 + VAT_RATE)) : 0 };
}

// --- Shipping -------------------------------------------------------------------

export const SHIPS_FROM = "Belgium";

/**
 * Worldwide: every country Stripe can collect a shipping address for, except
 * Russia and Belarus (EU sanctions; Belgian post doesn't deliver there) and
 * uninhabited territories (AQ, BV, GS, TF) and Stripe's "unknown" (ZZ).
 */
export const SHIPPING_COUNTRIES = [
  "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF",
  "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BW", "BZ", "CA", "CD", "CF", "CG", "CH", "CI",
  "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH",
  "ER", "ES", "ET", "FI", "FJ", "FK", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP",
  "GQ", "GR", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT",
  "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR",
  "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT",
  "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE",
  "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY", "QA", "RE", "RO", "RS", "RW", "SA", "SB", "SC", "SD",
  "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TG",
  "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE",
  "VG", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

/** The EU customs union (EU 27). Everything else needs a customs declaration. */
const EU_CUSTOMS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

/**
 * Whether a parcel leaves the EU customs territory and needs a customs
 * declaration: every country outside the EU 27 (Stripe lists French overseas
 * departments and Åland under their own codes, so they count too) and,
 * though Stripe files them under Spain, the Canary Islands (postcodes 35xxx,
 * 38xxx) and Ceuta/Melilla (51xxx, 52xxx).
 */
export function needsCustomsDeclaration(country: string | null, postalCode: string | null): boolean {
  if (!country) return false;
  if (!EU_CUSTOMS.has(country)) return true;
  return country === "ES" && /^(35|38|51|52)/.test((postalCode ?? "").trim());
}

// --- Answers still pending -------------------------------------------------------

/**
 * Answers still waiting on Transatel. Until they arrive the pages use neutral
 * wording (never bracketed placeholders): "a long time" for the inactivity
 * period, nothing for the plan order, and "within 6 months of purchase" for
 * the start window (Transatel's own data shows unused plans expire 6 months
 * after purchase). Replace with the confirmed wording in all four languages
 * and set confirmed: true.
 */
export const PENDING_ANSWERS = {
  /** Transatel "dormancy": how long a SIM can go unused before it's deactivated. */
  inactivityPeriod: {
    confirmed: false,
    en: "a long time",
    fr: "une longue période",
    es: "mucho tiempo",
    pt: "muito tempo",
    nl: "lange tijd",
    de: "lange Zeit",
    it: "molto tempo",
  },
  /** Which plan is used first when two plans cover the same country. */
  planPriority: {
    confirmed: false,
    en: "",
    fr: "",
    es: "",
    pt: "",
    nl: "",
    de: "",
    it: "",
  },
  /** Plans have a 6-month deferred-activation period at Transatel; what happens at its end. */
  startWindow: {
    confirmed: false,
    en: "within 6 months of purchase",
    fr: "dans les 6 mois suivant l'achat",
    es: "en los 6 meses siguientes a la compra",
    pt: "nos 6 meses seguintes à compra",
    nl: "binnen 6 maanden na aankoop",
    de: "innerhalb von 6 Monaten nach dem Kauf",
    it: "entro 6 mesi dall'acquisto",
  },
  /** Returns for the card: 14 days from delivery, unused, customer pays return postage (confirmed by the client). */
  returns: {
    confirmed: true,
    en: "You can return the SIM card unused within 14 days of delivery for a full refund of the card and the original shipping; return postage is at your expense. To return it, email contact@speednetrdc.com.",
    fr: "Vous pouvez retourner la carte SIM inutilisée dans les 14 jours suivant la livraison pour un remboursement complet de la carte et des frais d’envoi initiaux ; les frais de retour sont à votre charge. Pour la retourner, écrivez à contact@speednetrdc.com.",
    es: "Puedes devolver la tarjeta SIM sin usar en los 14 días siguientes a la entrega y te reembolsamos la tarjeta y el envío original; los gastos de devolución corren de tu cuenta. Para devolverla, escribe a contact@speednetrdc.com.",
    pt: "Pode devolver o cartão SIM sem utilização no prazo de 14 dias após a entrega e reembolsamos o cartão e o envio original; os portes de devolução ficam a seu cargo. Para o devolver, envie um e-mail para contact@speednetrdc.com.",
    nl: "Je kunt de ongebruikte simkaart binnen 14 dagen na levering terugsturen voor een volledige terugbetaling van de kaart en de oorspronkelijke verzending; de retourkosten zijn voor jou. Mail om terug te sturen naar contact@speednetrdc.com.",
    de: "Sie können die ungenutzte SIM-Karte innerhalb von 14 Tagen nach Zustellung zurücksenden und erhalten Karte und ursprünglichen Versand vollständig erstattet; die Rücksendekosten tragen Sie. Schreiben Sie dazu an contact@speednetrdc.com.",
    it: "Puoi restituire la SIM non usata entro 14 giorni dalla consegna con rimborso completo della scheda e della spedizione originale; le spese di reso sono a tuo carico. Per restituirla scrivi a contact@speednetrdc.com.",
  },
} as const;

type Locale = "en" | "fr" | "es" | "pt" | "nl" | "de" | "it";

export function pendingAnswer(key: keyof typeof PENDING_ANSWERS, locale: string): string {
  const answer = PENDING_ANSWERS[key];
  return answer[(["en", "fr", "es", "pt", "nl", "de", "it"].includes(locale) ? locale : "en") as Locale];
}
