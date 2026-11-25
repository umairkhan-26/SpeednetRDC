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
// proprietorship), subject to VAT. The owner's personal name is deliberately NOT shown anywhere on the site (owner's choice, 2026-11-21). In Belgium the VAT
// number is "BE" + the company number. The governing law and the authority are
// the usual choices for a business in Brussels: a lawyer must confirm them.
export const COMPANY = {
  legalName: "SpeedNetRDC, a telecommunications company based in Belgium",
  /** French wording of legalName (keep in step with it). */
  legalNameFr: "SpeedNetRDC, société de télécommunications établie en Belgique",
  /** Spanish wording of legalName (keep in step with it). */
  legalNameEs: "SpeedNetRDC, empresa de telecomunicaciones con sede en Bélgica",
  /** Portuguese wording of legalName (keep in step with it). */
  legalNamePt: "SpeedNetRDC, empresa de telecomunicações sediada na Bélgica",
  /** Dutch / German / Italian wording of legalName (keep in step with it). */
  legalNameNl: "SpeedNetRDC, een telecommunicatiebedrijf gevestigd in België",
  legalNameDe: "SpeedNetRDC, ein Telekommunikationsunternehmen mit Sitz in Belgien",
  legalNameIt: "SpeedNetRDC, società di telecomunicazioni con sede in Belgio",
  legalNameAr: "SpeedNetRDC، شركة اتصالات مقرها بلجيكا",
  tradingName: "SpeedNetRDC",
  address: "Avenue Louise 163, 1050 Brussels, Belgium",
  /** French wording of address (keep in step with it). */
  addressFr: "Avenue Louise 163, 1050 Bruxelles, Belgique",
  /** Spanish / Portuguese wording of address (keep in step with it). */
  addressEs: "Avenue Louise 163, 1050 Bruselas, Bélgica",
  addressPt: "Avenue Louise 163, 1050 Bruxelas, Bélgica",
  /** Dutch / German / Italian wording of address (keep in step with it). */
  addressNl: "Louizalaan 163, 1050 Brussel, België",
  addressDe: "Avenue Louise 163, 1050 Brüssel, Belgien",
  addressIt: "Avenue Louise 163, 1050 Bruxelles, Belgio",
  addressAr: "Avenue Louise 163, 1050 بروكسل، بلجيكا",
  registrationNumber: "BE0676820270",
  vatNumber: "BE0676820270",
  privacyEmail: "contact@speednetrdc.com",
  supportEmail: "contact@speednetrdc.com",
  /** The country whose law governs the Terms, e.g. "France". */
  governingLaw: "Belgium",
  /** French wording of governingLaw (keep in step with it). */
  governingLawFr: "la Belgique",
  /** Spanish / Portuguese wording of governingLaw (the texts add "derecho de" / "lei da"). */
  governingLawEs: "Bélgica",
  governingLawPt: "Bélgica",
  governingLawNl: "België",
  governingLawDe: "Belgien",
  governingLawIt: "Belgio",
  governingLawAr: "بلجيكا",
  /** Lead data protection authority, e.g. "the CNIL (France)". */
  supervisoryAuthority: "the Belgian Data Protection Authority (APD-GBA)",
  /** French wording of supervisoryAuthority (keep in step with it). */
  supervisoryAuthorityFr: "l’Autorité de protection des données belge (APD-GBA)",
  /** Spanish / Portuguese wording of supervisoryAuthority (keep in step with it). */
  supervisoryAuthorityEs: "la Autoridad belga de Protección de Datos (APD-GBA)",
  supervisoryAuthorityPt: "a Autoridade belga de Proteção de Dados (APD-GBA)",
  supervisoryAuthorityNl: "de Belgische Gegevensbeschermingsautoriteit (GBA)",
  supervisoryAuthorityDe: "die belgische Datenschutzbehörde (APD-GBA)",
  supervisoryAuthorityIt: "l’Autorità belga per la protezione dei dati (APD-GBA)",
  supervisoryAuthorityAr: "هيئة حماية البيانات البلجيكية (APD-GBA)",
  /** Consumer mediation / ADR body named in the Terms. Owner, 2026-11-21: none for now; the lawyer must confirm. */
  mediationBody:
    "the Belgian Consumer Mediation Service (Service de médiation pour le consommateur), Boulevard du Roi Albert II 8, box 1, 1000 Brussels, www.mediationconsommateur.be (free of charge)",
  /** French wording of mediationBody (keep in step with it). */
  mediationBodyFr:
    "le Service de médiation pour le consommateur, Boulevard du Roi Albert II 8, boîte 1, 1000 Bruxelles, www.mediationconsommateur.be (gratuit)",
  /** Spanish / Portuguese wording of mediationBody (keep in step with it). */
  mediationBodyEs:
    "el Servicio belga de Mediación del Consumidor (Service de médiation pour le consommateur), Boulevard du Roi Albert II 8, caja 1, 1000 Bruselas, www.mediationconsommateur.be (gratuito)",
  mediationBodyPt:
    "o Serviço belga de Mediação do Consumidor (Service de médiation pour le consommateur), Boulevard du Roi Albert II 8, caixa 1, 1000 Bruxelas, www.mediationconsommateur.be (gratuito)",
  /** Dutch / German / Italian wording of mediationBody (keep in step with it). */
  mediationBodyNl:
    "de Consumentenombudsdienst, Koning Albert II-laan 8, bus 1, 1000 Brussel, www.consumentenombudsdienst.be (gratis)",
  mediationBodyDe:
    "der belgische Ombudsdienst für Verbraucher (Service de médiation pour le consommateur), Boulevard du Roi Albert II 8, Postfach 1, 1000 Brüssel, www.mediationconsommateur.be (kostenlos)",
  mediationBodyIt:
    "il Servizio belga di mediazione per i consumatori (Service de médiation pour le consommateur), Boulevard du Roi Albert II 8, casella 1, 1000 Bruxelles, www.mediationconsommateur.be (gratuito)",
  mediationBodyAr:
    "الخدمة البلجيكية لوساطة المستهلك (Service de médiation pour le consommateur)، Boulevard du Roi Albert II 8، صندوق 1، 1000 بروكسل، www.mediationconsommateur.be (مجانية)",
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
  /**
   * Months after delivery after which a SIM card's delivery name and street
   * address are deleted (owner, 2026-11-25: 6). The site deletes them itself:
   * src/lib/checkout/shipping-retention.ts.
   */
  shippingAddressMonths: "6",
};

export const LEGAL_LAST_UPDATED = "25 November 2026";
/** The same date written out per language (keep in step with LEGAL_LAST_UPDATED). */
export const LEGAL_LAST_UPDATED_BY_LOCALE: Record<string, string> = {
  en: "25 November 2026",
  fr: "25 novembre 2026",
  es: "25 de noviembre de 2026",
  pt: "25 de novembro de 2026",
  nl: "25 november 2026",
  de: "25. November 2026",
  it: "25 novembre 2026",
  ar: "25 نوفمبر 2026",
};

export const isPlaceholder = (value: string) => value.startsWith("[") && value.endsWith("]");

export const hasLegalPlaceholders = () => [...Object.values(COMPANY), ...Object.values(POLICY)].some(isPlaceholder);

/** Whether the legal pages, their links and the checkout consent checkbox are shown to visitors. */
export const legalPagesLive = () => PUBLISH_LEGAL_PAGES && !hasLegalPlaceholders();

/** The pages themselves are also viewable in local development, for proofreading. */
export const legalPagesViewable = () => legalPagesLive() || process.env.NODE_ENV === "development";
