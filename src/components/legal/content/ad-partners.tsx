// The Privacy Policy's wording about Google and TikTok. It appears only when
// their IDs are set (src/lib/tracking/vendors.ts); with Meta alone the policy
// reads exactly as written in the privacy-*.tsx files. Plain statements of what
// the site's code sends (src/lib/tracking): keep the two in step.

import type { ReactNode } from "react";
import { P, UL } from "@/components/legal/LegalPage";
import { languageTag, type AppLocale } from "@/i18n/routing";
import { enabledVendors, GA_ID, GOOGLE_ADS_ID, VENDOR_NAMES } from "@/lib/tracking/vendors";

interface Texts {
  noSale: (partners: string) => string;
  consentCookie: string;
  /** `cookies`: how long each tool's cookies last. */
  retention: (cookies: string) => string;
  lasts: (company: string, duration: string) => string;
  durations: { meta: string; google: string; tiktok: string };
  googleTitle: string;
  tiktokTitle: string;
  onlyIfAccept: string;
  nothingLoaded: (company: string) => string;
  sets: (tool: string, cookies: string) => string;
  receives: (company: string) => string;
  items: [string, string, string];
  technical: (company: string) => string;
  basis: (company: string, address: string) => string;
  together: string;
  shareGoogle: string;
  shareTiktok: string;
  googleTool: string;
  tiktokTool: string;
  upTo: { twoYears: string; ninetyDays: string; thirteenMonths: string };
}

const TEXTS: Record<AppLocale, Texts> = {
  en: {
    noSale: (p) => `We do not sell your personal data. Only if you accept advertising and analytics cookies do we share limited information with ${p} to measure and improve our ads (see section 3).`,
    consentCookie: "remembers whether you accepted or rejected advertising and analytics cookies, for 6 months.",
    retention: (c) => `Your cookie choice: 6 months, then we ask again. Advertising and analytics cookies, until they expire or you reject them: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "up to 90 days", google: "up to 2 years", tiktok: "up to 13 months" },
    googleTitle: "Google advertising and analytics cookies",
    tiktokTitle: "TikTok advertising cookies",
    onlyIfAccept: "(only if you accept).",
    nothingLoaded: (c) => `Nothing from ${c} is loaded until you click “Accept”.`,
    sets: (tool, cookies) => `If you accept, ${tool} sets cookies such as ${cookies}.`,
    receives: (c) => `${c} then receives:`,
    items: ["the pages you visit and basic actions on them, such as scrolling or clicking links;", "when you start checking out;", "when you buy: the order value, currency, plan and order number."],
    technical: (c) => `As with any request from your browser, ${c} also receives your IP address and browser details. We do not send ${c} your name or email address.`,
    basis: (c, address) => `Legal basis: your consent. What ${c} does with this information is covered by its own privacy policy (${address}).`,
    together: "“Accept” and “Reject” cover all of these tools together. Choosing “Reject” later also removes their cookies from your browser; information already sent stays with these companies.",
    shareGoogle: "Google Ireland Limited (advertising and analytics measurement), only if you accept these cookies;",
    shareTiktok: "TikTok Technology Limited (advertising measurement), only if you accept these cookies;",
    googleTool: "the Google tag",
    tiktokTool: "the TikTok Pixel",
    upTo: { twoYears: "up to 2 years", ninetyDays: "90 days", thirteenMonths: "up to 13 months" },
  },
  fr: {
    noSale: (p) => `Nous ne vendons pas vos données personnelles. Nous ne partageons des informations limitées avec ${p}, pour mesurer et améliorer nos publicités, que si vous acceptez les cookies publicitaires et de mesure d’audience (voir l’article 3).`,
    consentCookie: "mémorise si vous avez accepté ou refusé les cookies publicitaires et de mesure d’audience, pendant 6 mois.",
    retention: (c) => `Votre choix de cookies : 6 mois, après quoi nous vous le redemandons. Cookies publicitaires et de mesure d’audience, jusqu’à leur expiration ou à votre refus : ${c}.`,
    lasts: (company, d) => `${company} : ${d}`,
    durations: { meta: "jusqu’à 90 jours", google: "jusqu’à 2 ans", tiktok: "jusqu’à 13 mois" },
    googleTitle: "Cookies publicitaires et de mesure d’audience Google",
    tiktokTitle: "Cookies publicitaires TikTok",
    onlyIfAccept: "(uniquement si vous les acceptez).",
    nothingLoaded: (c) => `Rien de ${c} n’est chargé tant que vous n’avez pas cliqué sur « Accepter ».`,
    sets: (tool, cookies) => `Si vous acceptez, ${tool} dépose des cookies tels que ${cookies}.`,
    receives: (c) => `${c} reçoit alors :`,
    items: ["les pages que vous visitez et vos actions de base sur celles-ci, comme le défilement ou les clics sur des liens ;", "le moment où vous commencez le paiement ;", "lors d’un achat : la valeur de la commande, la devise, le forfait et le numéro de commande."],
    technical: (c) => `Comme pour toute requête de votre navigateur, ${c} reçoit aussi votre adresse IP et des informations sur votre navigateur. Nous n’envoyons à ${c} ni votre nom ni votre adresse e-mail.`,
    basis: (c, address) => `Base légale : votre consentement. L’usage que ${c} fait de ces informations relève de sa propre politique de confidentialité (${address}).`,
    together: "« Accepter » et « Refuser » portent sur tous ces outils ensemble. Si vous choisissez « Refuser » par la suite, leurs cookies sont aussi supprimés de votre navigateur ; les informations déjà envoyées restent chez ces entreprises.",
    shareGoogle: "Google Ireland Limited (mesure publicitaire et d’audience), uniquement si vous acceptez ces cookies ;",
    shareTiktok: "TikTok Technology Limited (mesure publicitaire), uniquement si vous acceptez ces cookies ;",
    googleTool: "la balise Google",
    tiktokTool: "le Pixel TikTok",
    upTo: { twoYears: "2 ans au maximum", ninetyDays: "90 jours", thirteenMonths: "13 mois au maximum" },
  },
  es: {
    noSale: (p) => `No vendemos tus datos personales. Solo si aceptas las cookies publicitarias y de análisis compartimos información limitada con ${p} para medir y mejorar nuestros anuncios (consulta el apartado 3).`,
    consentCookie: "recuerda si aceptaste o rechazaste las cookies publicitarias y de análisis, durante 6 meses.",
    retention: (c) => `Tu elección de cookies: 6 meses; después volvemos a preguntarte. Cookies publicitarias y de análisis, hasta que caduquen o las rechaces: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "hasta 90 días", google: "hasta 2 años", tiktok: "hasta 13 meses" },
    googleTitle: "Cookies publicitarias y de análisis de Google",
    tiktokTitle: "Cookies publicitarias de TikTok",
    onlyIfAccept: "(solo si las aceptas).",
    nothingLoaded: (c) => `No se carga nada de ${c} hasta que pulsas «Aceptar».`,
    sets: (tool, cookies) => `Si aceptas, ${tool} instala cookies como ${cookies}.`,
    receives: (c) => `${c} recibe entonces:`,
    items: ["las páginas que visitas y acciones básicas en ellas, como desplazarte o pulsar enlaces;", "cuándo empiezas el pago;", "cuando compras: el importe del pedido, la moneda, el plan y el número de pedido."],
    technical: (c) => `Como en cualquier petición de tu navegador, ${c} recibe además tu dirección IP y datos del navegador. No enviamos a ${c} tu nombre ni tu correo electrónico.`,
    basis: (c, address) => `Base legal: tu consentimiento. Lo que ${c} haga con esta información se rige por su propia política de privacidad (${address}).`,
    together: "«Aceptar» y «Rechazar» se aplican a todas estas herramientas a la vez. Si más adelante eliges «Rechazar», sus cookies también se borran de tu navegador; la información ya enviada permanece en esas empresas.",
    shareGoogle: "Google Ireland Limited (medición publicitaria y de audiencia), solo si aceptas estas cookies;",
    shareTiktok: "TikTok Technology Limited (medición publicitaria), solo si aceptas estas cookies;",
    googleTool: "la etiqueta de Google",
    tiktokTool: "el píxel de TikTok",
    upTo: { twoYears: "hasta 2 años", ninetyDays: "90 días", thirteenMonths: "hasta 13 meses" },
  },
  pt: {
    noSale: (p) => `Não vendemos os seus dados pessoais. Só se aceitar os cookies de publicidade e de análise partilhamos informações limitadas com ${p} para medir e melhorar os nossos anúncios (ver secção 3).`,
    consentCookie: "memoriza se aceitou ou recusou os cookies de publicidade e de análise, durante 6 meses.",
    retention: (c) => `A sua escolha de cookies: 6 meses; depois voltamos a perguntar. Cookies de publicidade e de análise, até expirarem ou até os rejeitar: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "até 90 dias", google: "até 2 anos", tiktok: "até 13 meses" },
    googleTitle: "Cookies de publicidade e de análise da Google",
    tiktokTitle: "Cookies de publicidade do TikTok",
    onlyIfAccept: "(apenas se aceitar).",
    nothingLoaded: (c) => `Nada de ${c} é carregado até clicar em «Aceitar».`,
    sets: (tool, cookies) => `Se aceitar, ${tool} instala cookies como ${cookies}.`,
    receives: (c) => `${c} recebe então:`,
    items: ["as páginas que visita e ações básicas nelas, como deslocar-se ou clicar em ligações;", "quando começa o pagamento;", "quando compra: o valor da encomenda, a moeda, o plano e o número da encomenda."],
    technical: (c) => `Como em qualquer pedido do seu navegador, ${c} recebe também o seu endereço IP e dados do navegador. Não enviamos a ${c} o seu nome nem o seu e-mail.`,
    basis: (c, address) => `Fundamento jurídico: o seu consentimento. O que ${c} faz com estas informações é regido pela sua própria política de privacidade (${address}).`,
    together: "«Aceitar» e «Rejeitar» aplicam-se a todas estas ferramentas em conjunto. Se mais tarde escolher «Rejeitar», os respetivos cookies são também removidos do seu navegador; as informações já enviadas permanecem nessas empresas.",
    shareGoogle: "Google Ireland Limited (medição publicitária e de audiências), apenas se aceitar estes cookies;",
    shareTiktok: "TikTok Technology Limited (medição publicitária), apenas se aceitar estes cookies;",
    googleTool: "a etiqueta Google",
    tiktokTool: "o Pixel do TikTok",
    upTo: { twoYears: "até 2 anos", ninetyDays: "90 dias", thirteenMonths: "até 13 meses" },
  },
  nl: {
    noSale: (p) => `We verkopen je persoonsgegevens niet. Alleen als je advertentie- en analysecookies accepteert, delen we beperkte informatie met ${p} om onze advertenties te meten en te verbeteren (zie onderdeel 3).`,
    consentCookie: "onthoudt 6 maanden of je advertentie- en analysecookies hebt aanvaard of geweigerd.",
    retention: (c) => `Je cookiekeuze: 6 maanden, daarna vragen we het opnieuw. Advertentie- en analysecookies, tot ze verlopen of tot je ze weigert: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "maximaal 90 dagen", google: "maximaal 2 jaar", tiktok: "maximaal 13 maanden" },
    googleTitle: "Advertentie- en analysecookies van Google",
    tiktokTitle: "Advertentiecookies van TikTok",
    onlyIfAccept: "(alleen als je accepteert).",
    nothingLoaded: (c) => `Er wordt niets van ${c} geladen totdat je op “Accepteren” klikt.`,
    sets: (tool, cookies) => `Als je accepteert, plaatst ${tool} cookies zoals ${cookies}.`,
    receives: (c) => `${c} ontvangt dan:`,
    items: ["de pagina’s die je bezoekt en eenvoudige handelingen daarop, zoals scrollen of op links klikken;", "wanneer je begint met afrekenen;", "wanneer je koopt: het orderbedrag, de valuta, het pakket en het ordernummer."],
    technical: (c) => `Zoals bij elk verzoek van je browser ontvangt ${c} ook je IP-adres en browsergegevens. We sturen ${c} niet je naam of e-mailadres.`,
    basis: (c, address) => `Rechtsgrond: je toestemming. Wat ${c} met deze informatie doet, valt onder het eigen privacybeleid van dat bedrijf (${address}).`,
    together: "“Accepteren” en “Weigeren” gelden voor al deze hulpmiddelen samen. Kies je later “Weigeren”, dan worden hun cookies ook uit je browser verwijderd; reeds verzonden informatie blijft bij deze bedrijven.",
    shareGoogle: "Google Ireland Limited (meting van advertenties en bezoek), alleen als je deze cookies accepteert;",
    shareTiktok: "TikTok Technology Limited (advertentiemeting), alleen als je deze cookies accepteert;",
    googleTool: "de Google-tag",
    tiktokTool: "de TikTok-pixel",
    upTo: { twoYears: "maximaal 2 jaar", ninetyDays: "90 dagen", thirteenMonths: "maximaal 13 maanden" },
  },
  de: {
    noSale: (p) => `Wir verkaufen Ihre personenbezogenen Daten nicht. Nur wenn Sie Werbe- und Analyse-Cookies akzeptieren, teilen wir begrenzte Informationen mit ${p}, um unsere Anzeigen zu messen und zu verbessern (siehe Abschnitt 3).`,
    consentCookie: "merkt sich 6 Monate lang, ob Sie Werbe- und Analyse-Cookies akzeptiert oder abgelehnt haben.",
    retention: (c) => `Ihre Cookie-Wahl: 6 Monate, danach fragen wir erneut. Werbe- und Analyse-Cookies, bis sie ablaufen oder Sie sie ablehnen: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "bis zu 90 Tage", google: "bis zu 2 Jahre", tiktok: "bis zu 13 Monate" },
    googleTitle: "Werbe- und Analyse-Cookies von Google",
    tiktokTitle: "Werbe-Cookies von TikTok",
    onlyIfAccept: "(nur wenn Sie akzeptieren).",
    nothingLoaded: (c) => `Von ${c} wird nichts geladen, bevor Sie auf „Akzeptieren“ klicken.`,
    sets: (tool, cookies) => `Wenn Sie akzeptieren, setzt ${tool} Cookies wie ${cookies}.`,
    receives: (c) => `${c} erhält dann:`,
    items: ["die Seiten, die Sie besuchen, und einfache Aktionen darauf, etwa Scrollen oder Klicks auf Links;", "den Beginn Ihres Bezahlvorgangs;", "bei einem Kauf: Bestellwert, Währung, Tarif und Bestellnummer."],
    technical: (c) => `Wie bei jeder Anfrage Ihres Browsers erhält ${c} auch Ihre IP-Adresse und Angaben zu Ihrem Browser. Wir senden ${c} weder Ihren Namen noch Ihre E-Mail-Adresse.`,
    basis: (c, address) => `Rechtsgrundlage: Ihre Einwilligung. Was ${c} mit diesen Informationen tut, richtet sich nach der eigenen Datenschutzerklärung des Unternehmens (${address}).`,
    together: "„Akzeptieren“ und „Ablehnen“ gelten für alle diese Werkzeuge zusammen. Wählen Sie später „Ablehnen“, werden auch deren Cookies aus Ihrem Browser entfernt; bereits gesendete Informationen verbleiben bei diesen Unternehmen.",
    shareGoogle: "Google Ireland Limited (Werbe- und Reichweitenmessung), nur wenn Sie diese Cookies akzeptieren;",
    shareTiktok: "TikTok Technology Limited (Werbemessung), nur wenn Sie diese Cookies akzeptieren;",
    googleTool: "das Google-Tag",
    tiktokTool: "das TikTok-Pixel",
    upTo: { twoYears: "bis zu 2 Jahre", ninetyDays: "90 Tage", thirteenMonths: "bis zu 13 Monate" },
  },
  it: {
    noSale: (p) => `Non vendiamo i tuoi dati personali. Solo se accetti i cookie pubblicitari e di analisi condividiamo informazioni limitate con ${p} per misurare e migliorare le nostre pubblicità (vedi la sezione 3).`,
    consentCookie: "ricorda per 6 mesi se hai accettato o rifiutato i cookie pubblicitari e di analisi.",
    retention: (c) => `La tua scelta sui cookie: 6 mesi, poi te la chiediamo di nuovo. Cookie pubblicitari e di analisi, fino alla scadenza o al tuo rifiuto: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "fino a 90 giorni", google: "fino a 2 anni", tiktok: "fino a 13 mesi" },
    googleTitle: "Cookie pubblicitari e di analisi di Google",
    tiktokTitle: "Cookie pubblicitari di TikTok",
    onlyIfAccept: "(solo se li accetti).",
    nothingLoaded: (c) => `Nulla di ${c} viene caricato finché non clicchi su “Accetta”.`,
    sets: (tool, cookies) => `Se accetti, ${tool} installa cookie come ${cookies}.`,
    receives: (c) => `${c} riceve quindi:`,
    items: ["le pagine che visiti e le azioni di base su di esse, come lo scorrimento o i clic sui link;", "quando inizi il pagamento;", "quando acquisti: il valore dell’ordine, la valuta, il piano e il numero dell’ordine."],
    technical: (c) => `Come per ogni richiesta del tuo browser, ${c} riceve anche il tuo indirizzo IP e i dati del browser. Non inviamo a ${c} il tuo nome né la tua e-mail.`,
    basis: (c, address) => `Base giuridica: il tuo consenso. L’uso che ${c} fa di queste informazioni è disciplinato dalla sua informativa sulla privacy (${address}).`,
    together: "“Accetta” e “Rifiuta” valgono per tutti questi strumenti insieme. Se in seguito scegli “Rifiuta”, anche i loro cookie vengono rimossi dal tuo browser; le informazioni già inviate restano a queste aziende.",
    shareGoogle: "Google Ireland Limited (misurazione pubblicitaria e delle visite), solo se accetti questi cookie;",
    shareTiktok: "TikTok Technology Limited (misurazione pubblicitaria), solo se accetti questi cookie;",
    googleTool: "il tag Google",
    tiktokTool: "il Pixel di TikTok",
    upTo: { twoYears: "fino a 2 anni", ninetyDays: "90 giorni", thirteenMonths: "fino a 13 mesi" },
  },
  ar: {
    noSale: (p) => `نحن لا نبيع بياناتك الشخصية. ولا نشارك معلومات محدودة مع ${p} لقياس إعلاناتنا وتحسينها إلا إذا قبلت ملفات تعريف ارتباط الإعلانات والتحليلات (انظر القسم 3).`,
    consentCookie: "يتذكر لمدة 6 أشهر قبولك أو رفضك ملفات تعريف ارتباط الإعلانات والتحليلات.",
    retention: (c) => `اختيارك لملفات تعريف الارتباط: 6 أشهر، ثم نسألك من جديد. ملفات تعريف ارتباط الإعلانات والتحليلات، حتى انتهاء صلاحيتها أو رفضك لها: ${c}.`,
    lasts: (company, d) => `${company}: ${d}`,
    durations: { meta: "حتى 90 يومًا", google: "حتى سنتين", tiktok: "حتى 13 شهرًا" },
    googleTitle: "ملفات تعريف ارتباط الإعلانات والتحليلات من Google",
    tiktokTitle: "ملفات تعريف ارتباط الإعلانات من TikTok",
    onlyIfAccept: "(فقط إذا قبلت).",
    nothingLoaded: (c) => `لا يُحمَّل أي شيء من ${c} قبل أن تنقر «قبول».`,
    sets: (tool, cookies) => `إذا قبلت، تضع ${tool} ملفات تعريف ارتباط مثل ${cookies}.`,
    receives: (c) => `وتتلقى ${c} عندئذ:`,
    items: ["الصفحات التي تزورها وتصرفاتك الأساسية فيها، مثل التمرير أو النقر على الروابط؛", "وقت بدئك الدفع؛", "عند الشراء: قيمة الطلب والعملة والباقة ورقم الطلب."],
    technical: (c) => `كما في أي طلب من متصفحك، تتلقى ${c} أيضًا عنوان IP الخاص بك وبيانات المتصفح. ولا نرسل إلى ${c} اسمك أو بريدك الإلكتروني.`,
    basis: (c, address) => `الأساس القانوني: موافقتك. ويخضع ما تفعله ${c} بهذه المعلومات لسياسة الخصوصية الخاصة بها (${address}).`,
    together: "ينطبق «قبول» و«رفض» على جميع هذه الأدوات معًا. وإذا اخترت «رفض» لاحقًا فستُحذف أيضًا ملفات تعريف الارتباط الخاصة بها من متصفحك؛ أما المعلومات التي أُرسلت بالفعل فتبقى لدى هذه الشركات.",
    shareGoogle: "Google Ireland Limited (قياس الإعلانات والزيارات)، فقط إذا قبلت هذه الملفات؛",
    shareTiktok: "TikTok Technology Limited (قياس الإعلانات)، فقط إذا قبلت هذه الملفات؛",
    googleTool: "علامة Google",
    tiktokTool: "بكسل TikTok",
    upTo: { twoYears: "حتى سنتين", ninetyDays: "90 يومًا", thirteenMonths: "حتى 13 شهرًا" },
  },
};

const textsFor = (locale: string) => TEXTS[locale as AppLocale] ?? TEXTS.en;
const list = (locale: string, items: string[]) => new Intl.ListFormat(languageTag(locale), { type: "conjunction" }).format(items);
const hasMoreThanMeta = () => enabledVendors().some((vendor) => vendor !== "meta");

/** A sentence that names Meta alone, swapped for one covering every tool once Google or TikTok is on. */
export function AdSentence({ locale, name, children }: { locale: string; name: "noSale" | "consentCookie" | "retention"; children: ReactNode }) {
  if (!hasMoreThanMeta()) return <>{children}</>;
  const t = textsFor(locale);
  const vendors = enabledVendors();
  if (name === "noSale") return <>{t.noSale(list(locale, vendors.map((vendor) => VENDOR_NAMES[vendor])))}</>;
  if (name === "retention") {
    return <>{t.retention(vendors.map((vendor) => t.lasts(VENDOR_NAMES[vendor], t.durations[vendor])).join("; "))}</>;
  }
  return (
    <>
      <strong dir="ltr">snrdc_consent</strong> — {t.consentCookie}
    </>
  );
}

/** The cookie section's paragraphs about Google and TikTok. */
export function ExtraAdCookies({ locale }: { locale: string }) {
  if (!hasMoreThanMeta()) return null;
  const t = textsFor(locale);
  const vendors = enabledVendors();

  const googleProducts = [GA_ID ? "Google Analytics" : "", GOOGLE_ADS_ID ? "Google Ads" : ""].filter(Boolean);
  const googleCookies = [
    GA_ID ? `_ga (${t.upTo.twoYears})` : "",
    GOOGLE_ADS_ID ? `_gcl_au (${t.upTo.ninetyDays})` : "",
  ].filter(Boolean);

  const sections = [
    vendors.includes("google") && {
      company: "Google",
      title: t.googleTitle,
      tool: `${t.googleTool} (${list(locale, googleProducts)})`,
      cookies: list(locale, googleCookies),
      address: "policies.google.com/privacy",
    },
    vendors.includes("tiktok") && {
      company: "TikTok",
      title: t.tiktokTitle,
      tool: t.tiktokTool,
      cookies: `_ttp (${t.upTo.thirteenMonths})`,
      address: "tiktok.com/legal/privacy-policy",
    },
  ].filter((section) => section !== false);

  return (
    <>
      {sections.map((s) => (
        <div key={s.company} className="contents">
          <P>
            <strong>{s.title}</strong> {t.onlyIfAccept} {t.nothingLoaded(s.company)} {t.sets(s.tool, s.cookies)} {t.receives(s.company)}
          </P>
          <UL>
            {t.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </UL>
          <P>
            {t.technical(s.company)} {t.basis(s.company, s.address)}
          </P>
        </div>
      ))}
      <P>{t.together}</P>
    </>
  );
}

/** The extra entries in "Who we share data with". */
export function ExtraAdSharing({ locale }: { locale: string }) {
  const t = textsFor(locale);
  const vendors = enabledVendors();
  return (
    <>
      {vendors.includes("google") && <li>{t.shareGoogle}</li>}
      {vendors.includes("tiktok") && <li>{t.shareTiktok}</li>}
    </>
  );
}
