// Company details and policy choices shown on the Privacy Policy, Terms &
// Conditions and Refund Policy pages (/[locale]/privacy, /terms, /refunds).
//
// EVERY VALUE IN [SQUARE BRACKETS] IS A PLACEHOLDER. Fill them in, have the
// three pages reviewed, then set PUBLISH_LEGAL_PAGES to true.
//
// Until then (flag false, or any placeholder left) the pages answer 404 and
// their footer links, the checkout links and the checkout's withdrawal-right
// consent checkbox are all hidden. In local development (npm run dev) the
// pages can still be previewed, with each placeholder highlighted.

/** Set to true once every placeholder below is filled in. */
export const PUBLISH_LEGAL_PAGES = true;

// Known (owner, 2026-11-12/21): trading name, address, contact email, BCE
// number, legal form and VAT number. The register entry (KBO, seen by the owner
// on 2026-11-21) shows BE0676.820.270 as an "Entreprise individuelle" (sole
// proprietorship) in the name of Mayenda Guy, subject to VAT. In Belgium the VAT
// number is "BE" + the company number. The governing law and the authority are
// the usual choices for a business in Brussels: a lawyer must confirm them.
export const COMPANY = {
  legalName: "Mayenda Guy, sole proprietorship (entreprise individuelle)",
  /** French wording of legalName (keep in step with it). */
  legalNameFr: "Mayenda Guy, entreprise individuelle",
  tradingName: "SpeedNetRDC",
  address: "Avenue Louise 163, 1050 Brussels, Belgium",
  /** French wording of address (keep in step with it). */
  addressFr: "Avenue Louise 163, 1050 Bruxelles, Belgique",
  registrationNumber: "BE0676820270",
  vatNumber: "BE0676820270",
  privacyEmail: "contact@speednetrdc.com",
  supportEmail: "contact@speednetrdc.com",
  /** The country whose law governs the Terms, e.g. "France". */
  governingLaw: "Belgium",
  /** French wording of governingLaw (keep in step with it). */
  governingLawFr: "la Belgique",
  /** Lead data protection authority, e.g. "the CNIL (France)". */
  supervisoryAuthority: "the Belgian Data Protection Authority (APD-GBA)",
  /** French wording of supervisoryAuthority (keep in step with it). */
  supervisoryAuthorityFr: "l’Autorité de protection des données belge (APD-GBA)",
  /** Consumer mediation / ADR body named in the Terms. Owner, 2026-11-21: none for now; the lawyer must confirm. */
  mediationBody:
    "the Belgian Consumer Mediation Service (Service de médiation pour le consommateur), Boulevard du Roi Albert II 8, box 1, 1000 Brussels, www.mediationconsommateur.be (free of charge)",
  /** French wording of mediationBody (keep in step with it). */
  mediationBodyFr:
    "le Service de médiation pour le consommateur, Boulevard du Roi Albert II 8, boîte 1, 1000 Bruxelles, www.mediationconsommateur.be (gratuit)",
};

export const POLICY = {
  /** Days after ACTIVATION (the eSIM first connecting to a network) in which a refund can be asked (owner, 2026-11-21: 10). */
  refundWindowDays: "10",
  /** How long order and invoice records are kept (usually set by tax law; Belgian accounting records are normally kept 7 years: the accountant confirms). */
  orderRecordYears: "10",
  /**
   * Days after activation (owner, 2026-11-21: 10) in which a customer who bought a plan that does not
   * cover the countries they need can have it refunded or switched, if the
   * plan has not been used. A business decision for the owner.
   */
  coverageSwitchDays: "10",
};

export const LEGAL_LAST_UPDATED = "21 November 2026";
/** The same date written out per language (keep in step with LEGAL_LAST_UPDATED). */
export const LEGAL_LAST_UPDATED_BY_LOCALE: Record<string, string> = { en: "21 November 2026", fr: "21 novembre 2026" };

export const isPlaceholder = (value: string) => value.startsWith("[") && value.endsWith("]");

export const hasLegalPlaceholders = () => [...Object.values(COMPANY), ...Object.values(POLICY)].some(isPlaceholder);

/** Whether the legal pages, their links and the checkout consent checkbox are shown to visitors. */
export const legalPagesLive = () => PUBLISH_LEGAL_PAGES && !hasLegalPlaceholders();

/** The pages themselves are also viewable in local development, for proofreading. */
export const legalPagesViewable = () => legalPagesLive() || process.env.NODE_ENV === "development";
