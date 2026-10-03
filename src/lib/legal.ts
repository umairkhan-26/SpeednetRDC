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

export const COMPANY = {
  legalName: "[LEGAL COMPANY NAME]",
  tradingName: "SpeedNetRDC",
  address: "[REGISTERED ADDRESS]",
  registrationNumber: "[COMPANY REGISTRATION NUMBER]",
  vatNumber: "[VAT NUMBER]",
  privacyEmail: "[PRIVACY CONTACT EMAIL]",
  supportEmail: "[SUPPORT EMAIL]",
  /** The country whose law governs the Terms, e.g. "France". */
  governingLaw: "[GOVERNING LAW COUNTRY]",
  /** Lead data protection authority, e.g. "the CNIL (France)". */
  supervisoryAuthority: "[DATA PROTECTION AUTHORITY]",
};

export const POLICY = {
  /** Days after purchase in which an unused, uninstalled eSIM can be refunded. */
  refundWindowDays: "[30]",
  /** How long order and invoice records are kept (usually set by tax law). */
  orderRecordYears: "[10]",
};

export const LEGAL_LAST_UPDATED = "3 October 2026";

export const isPlaceholder = (value: string) => value.startsWith("[") && value.endsWith("]");

export const hasLegalPlaceholders = () => [...Object.values(COMPANY), ...Object.values(POLICY)].some(isPlaceholder);

/** Whether the legal pages, their links and the checkout consent checkbox are shown to visitors. */
export const legalPagesLive = () => PUBLISH_LEGAL_PAGES && !hasLegalPlaceholders();

/** The pages themselves are also viewable in local development, for proofreading. */
export const legalPagesViewable = () => legalPagesLive() || process.env.NODE_ENV === "development";
