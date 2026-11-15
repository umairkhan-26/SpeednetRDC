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
export const PUBLISH_LEGAL_PAGES = false;

// Known (owner, 2026-11-12/15): trading name, address, contact email. The
// governing law and the authority are the usual choices for a company in
// Brussels: a lawyer must confirm them. Still to be given by the owner: the
// exact registered name with its legal form, the BCE (company) number and
// the VAT number.
export const COMPANY = {
  legalName: "[LEGAL COMPANY NAME]",
  tradingName: "SpeedNetRDC",
  address: "Avenue Louise 163, 1050 Brussels, Belgium",
  registrationNumber: "[COMPANY REGISTRATION NUMBER]",
  vatNumber: "[VAT NUMBER]",
  privacyEmail: "contact@speednetrdc.com",
  supportEmail: "contact@speednetrdc.com",
  /** The country whose law governs the Terms, e.g. "France". */
  governingLaw: "Belgium",
  /** Lead data protection authority, e.g. "the CNIL (France)". */
  supervisoryAuthority: "the Belgian Data Protection Authority (APD-GBA)",
};

export const POLICY = {
  /** Days after purchase in which an unused, uninstalled eSIM can be refunded. */
  refundWindowDays: "[30]",
  /** How long order and invoice records are kept (usually set by tax law; Belgian accounting records are normally kept 7 years: the accountant confirms). */
  orderRecordYears: "[7]",
  /**
   * Days after purchase in which a customer who bought a plan that does not
   * cover the countries they need can have it refunded or switched, if the
   * plan has not been used. A business decision for the owner.
   */
  coverageSwitchDays: "[30]",
};

export const LEGAL_LAST_UPDATED = "15 November 2026";

export const isPlaceholder = (value: string) => value.startsWith("[") && value.endsWith("]");

export const hasLegalPlaceholders = () => [...Object.values(COMPANY), ...Object.values(POLICY)].some(isPlaceholder);

/** Whether the legal pages, their links and the checkout consent checkbox are shown to visitors. */
export const legalPagesLive = () => PUBLISH_LEGAL_PAGES && !hasLegalPlaceholders();

/** The pages themselves are also viewable in local development, for proofreading. */
export const legalPagesViewable = () => legalPagesLive() || process.env.NODE_ENV === "development";
