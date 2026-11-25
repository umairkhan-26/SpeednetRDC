import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

export default function RefundsNl() {
  return (
    <>
      <P>
        We willen dat elke eSIM werkt. Doet ze dat niet, contacteer ons dan op <V>{COMPANY.supportEmail}</V> met je bestelnummer (ORD-…) en
        we helpen je, of betalen terug zoals hieronder beschreven. Dit beleid maakt deel uit van onze{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          algemene voorwaarden
        </Link>{" "}
        en doet niets af aan je wettelijke rechten.
      </P>

      <H2>1. Wanneer je eSIM als &ldquo;geactiveerd&rdquo; geldt</H2>
      <P>
        Je eSIM is <strong>geactiveerd</strong> op de dag dat ze voor het eerst verbinding maakt met een mobiel netwerk in een gedekt land en
        je pakket start (dan begint ook de geldigheidsperiode). De eSIM kopen, de e-mail ontvangen of de QR-code op je telefoon installeren
        activeert ze <strong>niet</strong>. Heb je je eSIM nooit geïnstalleerd, of wel geïnstalleerd maar heeft ze nooit met een netwerk
        verbonden, dan is ze niet geactiveerd.
      </P>

      <H2>2. Volledige terugbetaling</H2>
      <P>Je krijgt een volledige terugbetaling als:</P>
      <UL>
        <li>
          je eSIM <strong>nooit geactiveerd</strong> is (nooit geïnstalleerd, of geïnstalleerd maar nooit verbonden) en niet verlopen is:
          vraag het ons op elk moment vóór ze verloopt en we betalen volledig terug; of
        </li>
        <li>
          je eSIM geactiveerd is en je het binnen <V>{POLICY.refundWindowDays}</V> dagen na de activeringsdatum vraagt, en ze niet werkt op
          de bestemming waarvoor ze is verkocht door een probleem aan onze kant of die van onze netwerkpartner dat we niet binnen een
          redelijke termijn kunnen oplossen; of
        </li>
        <li>we je eSIM niet konden leveren; of</li>
        <li>
          je een pakket kocht dat de landen die je nodig hebt niet dekt (bijvoorbeeld een regionaal pakket zonder jouw bestemming), het pakket
          niet gebruikt is en je ons binnen <V>{POLICY.coverageSwitchDays}</V> dagen na activering (of op elk moment als ze nooit is
          geactiveerd) verwittigt: we betalen volledig terug, of zetten je desgewenst over op een pakket dat je bestemming dekt (je betaalt
          dan enkel het prijsverschil); of
        </li>
        <li>je twee keer voor dezelfde bestelling bent aangerekend.</li>
      </UL>

      <H2>3. Wanneer we niet kunnen terugbetalen</H2>
      <UL>
        <li>De eSIM is meer dan <V>{POLICY.refundWindowDays}</V> dagen geleden geactiveerd, of het pakket is gebruikt, en de eSIM werkt zoals beschreven.</li>
        <li>De data of geldigheidsperiode is opgebruikt of verlopen.</li>
        <li>
          Je toestel is niet eSIM-compatibel of heeft een simlock: controleer vóór aankoop de{" "}
          <Link href="/device-compatibility" className="font-semibold text-orange hover:underline">
            compatibiliteitslijst
          </Link>
          . Is de eSIM nooit geactiveerd, dan geldt de regel voor volledige terugbetaling hierboven nog steeds.
        </li>
        <li>De eSIM is na installatie van je toestel verwijderd, of de instellingen zijn gewijzigd (bijvoorbeeld dataroaming uitgeschakeld).</li>
      </UL>
      <P>We bekijken elk geval apart: ging er iets mis dat hier niet staat, contacteer ons en we zoeken een eerlijke oplossing.</P>

      <H2>4. Hoe terugbetalingen gebeuren</H2>
      <P>
        We streven ernaar elk verzoek binnen 24 tot 48 werkuren te bekijken. Terugbetalingen gaan via Stripe terug naar de kaart of
        betaalmethode die je gebruikte, meestal binnen 5 tot 10 werkdagen na onze goedkeuring, afhankelijk van je bank. Na terugbetaling
        kunnen we de eSIM van de bestelling deactiveren.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>Simkaarten</H2>
          <P>{pendingAnswer("returns", "nl")}</P>
          <P>Datapakketten die je aan een simkaart toevoegt, volgen de bovenstaande regels voor pakketten.</P>
        </>
      )}

      <H2>5. Je herroepingsrecht</H2>
      <P>
        Consumenten in de EU en het VK kunnen ook een wettelijk herroepingsrecht hebben: zie punt 7 van onze{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          algemene voorwaarden
        </Link>
        .
      </P>
    </>
  );
}
