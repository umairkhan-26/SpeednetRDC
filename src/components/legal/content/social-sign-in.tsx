// The Privacy Policy's wording about "Continue with Google / Apple". It
// appears only for the buttons that are switched on
// (src/lib/customer/social/providers.ts). Plain statements of what the code
// does (src/lib/customer/social): keep the two in step.

import type { AppLocale } from "@/i18n/routing";
import { enabledProviders, PROVIDER_NAMES } from "@/lib/customer/social/providers";

interface Texts {
  or: string;
  title: (providers: string) => string;
  data: (providers: string) => string;
  oauthCookie: string;
  linkCookie: string;
  retention: (providers: string) => string;
}

const TEXTS: Record<AppLocale, Texts> = {
  en: {
    or: "or",
    title: (p) => `Signing in with ${p}:`,
    data: (p) => `if you choose this, ${p} gives us your email address, whether it is verified and an identifier for your account, and learns that you are signing in to our site. We do not receive your password, your contacts or your name. If you confirm which email your orders use, we store that connection (the account identifier and the email). Legal basis: performance of our contract. What ${p} does with this is covered by its own privacy policy.`,
    oauthCookie: "protects a Google or Apple sign-in while it is in progress, for up to 10 minutes.",
    linkCookie: "remembers a Google or Apple sign-in that still needs your email confirmed, for up to 30 minutes.",
    retention: (p) => `The connection between your ${p} account and your email address: until you ask us to delete it.`,
  },
  fr: {
    or: "ou",
    title: (p) => `Connexion avec ${p} :`,
    data: (p) => `si vous choisissez cette option, ${p} nous communique votre adresse e-mail, indique si elle est vérifiée et un identifiant de votre compte, et apprend que vous vous connectez à notre site. Nous ne recevons ni votre mot de passe, ni vos contacts, ni votre nom. Si vous confirmez l'adresse e-mail utilisée pour vos commandes, nous enregistrons ce rattachement (l'identifiant du compte et l'adresse). Base légale : exécution de notre contrat. L'usage que ${p} en fait relève de sa propre politique de confidentialité.`,
    oauthCookie: "protège une connexion Google ou Apple en cours, pendant 10 minutes au maximum.",
    linkCookie: "mémorise une connexion Google ou Apple qui attend la confirmation de votre e-mail, pendant 30 minutes au maximum.",
    retention: (p) => `Le rattachement entre votre compte ${p} et votre adresse e-mail : jusqu'à ce que vous demandiez sa suppression.`,
  },
  es: {
    or: "o",
    title: (p) => `Inicio de sesión con ${p}:`,
    data: (p) => `si eliges esta opción, ${p} nos facilita tu correo electrónico, si está verificado y un identificador de tu cuenta, y sabe que estás iniciando sesión en nuestro sitio. No recibimos tu contraseña, tus contactos ni tu nombre. Si confirmas con qué correo haces tus pedidos, guardamos esa vinculación (el identificador de la cuenta y el correo). Base jurídica: ejecución de nuestro contrato. Lo que ${p} haga con ello se rige por su propia política de privacidad.`,
    oauthCookie: "protege un inicio de sesión con Google o Apple mientras está en curso, durante un máximo de 10 minutos.",
    linkCookie: "recuerda un inicio de sesión con Google o Apple pendiente de confirmar tu correo, durante un máximo de 30 minutos.",
    retention: (p) => `La vinculación entre tu cuenta de ${p} y tu correo: hasta que pidas que la eliminemos.`,
  },
  pt: {
    or: "ou",
    title: (p) => `Início de sessão com ${p}:`,
    data: (p) => `se escolher esta opção, ${p} fornece-nos o seu endereço de e-mail, se está verificado e um identificador da sua conta, e fica a saber que está a iniciar sessão no nosso site. Não recebemos a sua palavra-passe, os seus contactos nem o seu nome. Se confirmar o e-mail que usa nas suas encomendas, guardamos essa associação (o identificador da conta e o e-mail). Base legal: execução do nosso contrato. O que ${p} fizer com esses dados está sujeito à sua própria política de privacidade.`,
    oauthCookie: "protege um início de sessão com a Google ou a Apple enquanto decorre, durante 10 minutos no máximo.",
    linkCookie: "memoriza um início de sessão com a Google ou a Apple que aguarda a confirmação do seu e-mail, durante 30 minutos no máximo.",
    retention: (p) => `A associação entre a sua conta ${p} e o seu e-mail: até nos pedir que a eliminemos.`,
  },
  nl: {
    or: "of",
    title: (p) => `Inloggen met ${p}:`,
    data: (p) => `als je hiervoor kiest, geeft ${p} ons je e-mailadres, of dat geverifieerd is en een kenmerk van je account, en verneemt dat je op onze site inlogt. We ontvangen niet je wachtwoord, je contacten of je naam. Als je bevestigt welk e-mailadres je bij je bestellingen gebruikt, bewaren we die koppeling (het accountkenmerk en het e-mailadres). Rechtsgrond: uitvoering van onze overeenkomst. Wat ${p} hiermee doet, valt onder het eigen privacybeleid van ${p}.`,
    oauthCookie: "beschermt een lopende aanmelding met Google of Apple, maximaal 10 minuten.",
    linkCookie: "onthoudt een aanmelding met Google of Apple waarvoor je e-mailadres nog moet worden bevestigd, maximaal 30 minuten.",
    retention: (p) => `De koppeling tussen je ${p}-account en je e-mailadres: totdat je ons vraagt die te verwijderen.`,
  },
  de: {
    or: "oder",
    title: (p) => `Anmeldung mit ${p}:`,
    data: (p) => `Wenn Sie diese Möglichkeit wählen, übermittelt uns ${p} Ihre E-Mail-Adresse, ob sie bestätigt ist, und eine Kennung Ihres Kontos und erfährt, dass Sie sich auf unserer Website anmelden. Wir erhalten weder Ihr Passwort noch Ihre Kontakte oder Ihren Namen. Wenn Sie bestätigen, welche E-Mail-Adresse Sie für Ihre Bestellungen verwenden, speichern wir diese Verknüpfung (Kontokennung und E-Mail-Adresse). Rechtsgrundlage: Erfüllung unseres Vertrags. Was ${p} mit diesen Daten macht, richtet sich nach der eigenen Datenschutzerklärung des Anbieters.`,
    oauthCookie: "schützt eine laufende Anmeldung mit Google oder Apple, höchstens 10 Minuten lang.",
    linkCookie: "merkt sich eine Anmeldung mit Google oder Apple, bei der Ihre E-Mail-Adresse noch bestätigt werden muss, höchstens 30 Minuten lang.",
    retention: (p) => `Die Verknüpfung zwischen Ihrem ${p}-Konto und Ihrer E-Mail-Adresse: bis Sie uns bitten, sie zu löschen.`,
  },
  it: {
    or: "o",
    title: (p) => `Accesso con ${p}:`,
    data: (p) => `se scegli questa opzione, ${p} ci comunica il tuo indirizzo email, se è verificato e un identificativo del tuo account, e viene a sapere che stai accedendo al nostro sito. Non riceviamo la tua password, i tuoi contatti né il tuo nome. Se confermi quale email usi per i tuoi ordini, conserviamo questo collegamento (l'identificativo dell'account e l'email). Base giuridica: esecuzione del contratto. L'uso che ${p} fa di questi dati è disciplinato dalla sua informativa sulla privacy.`,
    oauthCookie: "protegge un accesso con Google o Apple mentre è in corso, per un massimo di 10 minuti.",
    linkCookie: "ricorda un accesso con Google o Apple in attesa della conferma della tua email, per un massimo di 30 minuti.",
    retention: (p) => `Il collegamento tra il tuo account ${p} e il tuo indirizzo email: finché non ci chiedi di eliminarlo.`,
  },
  ar: {
    or: "أو",
    title: (p) => `تسجيل الدخول باستخدام ${p}:`,
    data: (p) => `إذا اخترت ذلك، تزوّدنا ${p} بعنوان بريدك الإلكتروني وما إذا كان موثّقاً ومعرّف لحسابك، وتعلم أنك تسجّل الدخول إلى موقعنا. لا نستلم كلمة مرورك ولا جهات اتصالك ولا اسمك. وإذا أكّدت البريد الذي تستخدمه في طلباتك، نحفظ هذا الربط (معرّف الحساب والبريد). الأساس القانوني: تنفيذ العقد معك. وما تفعله ${p} بذلك تحكمه سياسة خصوصيتها.`,
    oauthCookie: "يحمي عملية تسجيل دخول باستخدام Google أو Apple أثناء إجرائها، لمدة لا تتجاوز 10 دقائق.",
    linkCookie: "يتذكر تسجيل دخول باستخدام Google أو Apple ما زال بحاجة إلى تأكيد بريدك، لمدة لا تتجاوز 30 دقيقة.",
    retention: (p) => `الربط بين حسابك لدى ${p} وبريدك الإلكتروني: إلى أن تطلب منا حذفه.`,
  },
};

function enabled(locale: AppLocale): { texts: Texts; providers: string } | null {
  const names = enabledProviders().map((provider) => PROVIDER_NAMES[provider]);
  const texts = TEXTS[locale];
  return names.length ? { texts, providers: names.join(` ${texts.or} `) } : null;
}

/** Section 2, "What we collect". */
export function SocialSignInData({ locale }: { locale: AppLocale }) {
  const on = enabled(locale);
  return on ? (
    <li>
      <strong>{on.texts.title(on.providers)}</strong> {on.texts.data(on.providers)}
    </li>
  ) : null;
}

/** Section 3, the cookies the site needs. */
export function SocialSignInCookies({ locale }: { locale: AppLocale }) {
  const on = enabled(locale);
  return on ? (
    <>
      <li>
        <strong>snrdc_oauth</strong> — {on.texts.oauthCookie}
      </li>
      <li>
        <strong>snrdc_link</strong> — {on.texts.linkCookie}
      </li>
    </>
  ) : null;
}

/** Section 5, "How long we keep it". */
export function SocialSignInRetention({ locale }: { locale: AppLocale }) {
  const on = enabled(locale);
  return on ? <li>{on.texts.retention(on.providers)}</li> : null;
}
