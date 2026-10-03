// Company details and policy choices shown on the Privacy Policy, Terms &
// Conditions and Refund Policy pages (/[locale]/privacy, /terms, /refunds).
//
// EVERY VALUE IN [SQUARE BRACKETS] IS A PLACEHOLDER. Fill them in — and have
// the three pages reviewed by a lawyer — before taking real orders. While any
// placeholder remains, the pages show a yellow "draft" banner and highlight
// each placeholder.

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
