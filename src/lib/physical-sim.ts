// Physical SIM cards and top-ups ("Add to my SIM"): one switch, prices,
// shipping countries, tax mode and the answers still pending from Transatel
// and the client's accountant.
//
// Both features stay OFF unless PHYSICAL_SIM_ENABLED is exactly "true" (set
// it in Hostinger and redeploy). While off: no menu item, no homepage
// section, /physical-sim answers 404, plan pages offer only "New eSIM", and
// the checkout APIs refuse physical-SIM and top-up orders.

export function isPhysicalSimEnabled(): boolean {
  return process.env.PHYSICAL_SIM_ENABLED === "true";
}

// --- Prices -------------------------------------------------------------------

export const SIM_CARD_PRICE_EUR = 5;
export const SHIPPING_PRICE_EUR = 5;

/**
 * How tax applies to the card and its shipping — one setting,
 * PHYSICAL_SIM_TAX_MODE, no code change needed:
 *   vat       (default) 21% Belgian VAT added to both lines: €6.05 + €6.05 = €12.10
 *   final     prices are final: €5 + €5 = €10.00
 *   surcharge the 5% "taxes & fees" line eSIM checkout uses: €10.50
 * VAT is the default: the card is a physical good sold to consumers from
 * Belgium, and EU consumer prices must include VAT. The client's
 * accountant should still confirm it (e.g. OSS once EU sales pass €10,000).
 */
export type PhysicalSimTaxMode = "final" | "surcharge" | "vat";

export function getPhysicalSimTaxMode(): PhysicalSimTaxMode {
  const mode = process.env.PHYSICAL_SIM_TAX_MODE;
  return mode === "surcharge" || mode === "final" ? mode : "vat";
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
  /** VAT included in the total (vat mode only). */
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
  return { mode, lines, totalEur: round(lines.reduce((sum, l) => sum + l.amountEur, 0)), shippingEur: SHIPPING_PRICE_EUR, vatEur: 0 };
}

// --- Shipping -------------------------------------------------------------------

export const SHIPS_FROM = "Belgium";

/** EU 27 + United Kingdom, Switzerland, Norway, Iceland (no microstates for now). */
export const SHIPPING_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH", "NO", "IS",
] as const;

const NON_EU = new Set(["GB", "CH", "NO", "IS"]);

/**
 * Whether a parcel leaves the EU customs territory and needs a customs
 * declaration: the UK, Switzerland, Norway, Iceland — and, though Stripe
 * files them under Spain, the Canary Islands (postcodes 35xxx, 38xxx) and
 * Ceuta/Melilla (51xxx, 52xxx).
 */
export function needsCustomsDeclaration(country: string | null, postalCode: string | null): boolean {
  if (!country) return false;
  if (NON_EU.has(country)) return true;
  return country === "ES" && /^(35|38|51|52)/.test((postalCode ?? "").trim());
}

// --- Answers still pending -------------------------------------------------------

/**
 * PLACEHOLDERS — waiting on Transatel and the client. Shown in brackets on the
 * pages (only visible once the feature is switched on). Replace each value
 * with the confirmed wording, in all four languages, and set confirmed: true.
 */
export const PENDING_ANSWERS = {
  /** Transatel "dormancy": how long a SIM can go unused before it's deactivated. */
  inactivityPeriod: {
    confirmed: false,
    en: "[X months — to be confirmed with Transatel]",
    fr: "[X mois — à confirmer avec Transatel]",
    es: "[X meses — por confirmar con Transatel]",
    pt: "[X meses — a confirmar com a Transatel]",
  },
  /** Which plan is used first when two plans cover the same country. */
  planPriority: {
    confirmed: false,
    en: "[To be confirmed with Transatel: which plan is used first when two plans cover the same country.]",
    fr: "[À confirmer avec Transatel : quel forfait est utilisé en premier lorsque deux forfaits couvrent le même pays.]",
    es: "[Por confirmar con Transatel: qué plan se usa primero cuando dos planes cubren el mismo país.]",
    pt: "[A confirmar com a Transatel: que tarifário é usado primeiro quando dois tarifários abrangem o mesmo país.]",
  },
  /** Plans have a 6-month deferred-activation period at Transatel; what happens at its end. */
  startWindow: {
    confirmed: false,
    en: "[within 6 months of purchase — to be confirmed with Transatel]",
    fr: "[dans les 6 mois suivant l'achat — à confirmer avec Transatel]",
    es: "[en los 6 meses siguientes a la compra — por confirmar con Transatel]",
    pt: "[nos 6 meses seguintes à compra — a confirmar com a Transatel]",
  },
  /** Returns for the card: 14 days from delivery, unused, customer pays return postage (confirmed by the client). */
  returns: {
    confirmed: true,
    en: "You can return the SIM card unused within 14 days of delivery for a full refund of the card and the original shipping; return postage is at your expense. To return it, email contact@speednetrdc.com.",
    fr: "Vous pouvez retourner la carte SIM inutilisée dans les 14 jours suivant la livraison pour un remboursement complet de la carte et des frais d’envoi initiaux ; les frais de retour sont à votre charge. Pour la retourner, écrivez à contact@speednetrdc.com.",
    es: "Puedes devolver la tarjeta SIM sin usar en los 14 días siguientes a la entrega y te reembolsamos la tarjeta y el envío original; los gastos de devolución corren de tu cuenta. Para devolverla, escribe a contact@speednetrdc.com.",
    pt: "Pode devolver o cartão SIM sem utilização no prazo de 14 dias após a entrega e reembolsamos o cartão e o envio original; os portes de devolução ficam a seu cargo. Para o devolver, envie um e-mail para contact@speednetrdc.com.",
  },
} as const;

type Locale = "en" | "fr" | "es" | "pt";

export function pendingAnswer(key: keyof typeof PENDING_ANSWERS, locale: string): string {
  const answer = PENDING_ANSWERS[key];
  return answer[(["en", "fr", "es", "pt"].includes(locale) ? locale : "en") as Locale];
}
