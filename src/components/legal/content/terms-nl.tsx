import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function TermsNl() {
  return (
    <>
      <P>
        Deze voorwaarden gelden wanneer je op deze website een eSIM-datapakket koopt. Door te bestellen ga je ermee akkoord. Lees ook ons{" "}
        <Link href="/privacy" className={linkClass}>
          privacybeleid
        </Link>{" "}
        en ons{" "}
        <Link href="/refunds" className={linkClass}>
          terugbetalingsbeleid
        </Link>
        .
      </P>

      <H2>1. Over ons</H2>
      <P>
        Deze website wordt uitgebaat door <V>{COMPANY.legalNameNl}</V>, gevestigd te <V>{COMPANY.addressNl}</V>, ondernemingsnummer{" "}
        <V>{COMPANY.registrationNumber}</V>, btw-nummer <V>{COMPANY.vatNumber}</V>. Contacteer ons via <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. Wat je koopt</H2>
      <UL>
        <li>Een prepaid, data-only eSIM-pakket voor de bestemming, hoeveelheid data en geldigheid die bij je bestelling zijn getoond. Het heeft geen telefoonnummer voor bellen of sms, tenzij het pakket anders vermeldt.</li>
        <li>De verbinding wordt geleverd door onze netwerkpartner en diens partnernetwerken op elke bestemming. Snelheid en dekking hangen af van lokale netwerken en zijn niet gegarandeerd.</li>
        <li>
          <strong>Waar het werkt:</strong> een pakket werkt alleen in de landen die op de pakketpagina en je bestelpagina staan. Pakketnamen
          zoals &ldquo;Caraïben&rdquo; of &ldquo;Europa&rdquo; kunnen slechts enkele plaatsen dekken, dus controleer de lijst vóór je koopt.
          Buiten die landen geeft je eSIM geen internet, ook al toont je telefoon signaal. Kocht je een pakket dat je bestemming niet dekt,
          verwittig ons dan vóór gebruik: zie ons{" "}
          <Link href="/refunds" className={linkClass}>
            terugbetalingsbeleid
          </Link>
          .
        </li>
        <li>
          Je hebt een eSIM-compatibel toestel zonder simlock nodig. Controleer vóór aankoop de{" "}
          <Link href="/device-compatibility" className={linkClass}>
            lijst met compatibele toestellen
          </Link>
          .
        </li>
      </UL>

      <H2>3. Bestellingen en betaling</H2>
      <UL>
        <li>
          Prijzen zijn in euro. De pakketprijs en de regel &ldquo;Belastingen en kosten&rdquo; bij het afrekenen vormen samen het totaal dat je
          betaalt; het totaal op de betaalpagina is definitief en omvat btw waar die geldt. Je betaalt het volledige bedrag bij het afrekenen
          via onze betaaldienst Stripe.
        </li>
        <li>De overeenkomst komt tot stand wanneer je betaling is bevestigd. We mogen een bestelling annuleren en volledig terugbetalen als we ze niet kunnen leveren (bijvoorbeeld bij een prijsfout of een pakket dat niet meer beschikbaar is).</li>
        <li>Je moet een geldig e-mailadres opgeven: daar wordt je eSIM geleverd en daarmee log je in bij &ldquo;Mijn eSIM&rsquo;s&rdquo;.</li>
      </UL>

      <H2>4. Levering en installatie</H2>
      <UL>
        <li>We mailen je een privélink naar je bestelpagina met de QR-code van je eSIM en de installatie-instructies, meestal binnen enkele minuten na betaling.</li>
        <li>Werkt iets niet, gebruik dan &ldquo;Probleem melden&rdquo; in je account (of mail <V>{COMPANY.supportEmail}</V>) met je bestelnummer: ons team ziet om welke simkaart het gaat en antwoordt in hetzelfde gesprek.</li>
        <li>Houd die link privé: iedereen die hem heeft, kan je eSIM installeren. Een eSIM kan normaal maar één keer worden geïnstalleerd; verwijder je ze van je toestel, dan is opnieuw installeren mogelijk niet meer mogelijk.</li>
        <li>Installeer de eSIM terwijl je internet hebt, liefst vóór je reis. Jij bent verantwoordelijk voor de installatie en de instellingen van je toestel (bijvoorbeeld dataroaming aanzetten voor de eSIM-lijn).</li>
      </UL>

      <H2>5. Geldigheid van het pakket</H2>
      <UL>
        <li>Je pakket start wanneer je toestel voor het eerst verbinding maakt met een netwerk in een gedekt land (niet bij aankoop of installatie), tenzij de pakketbeschrijving anders vermeldt.</li>
        <li>Het eindigt wanneer de geldigheidsperiode verstrijkt of de data op is, wat het eerst komt. Ongebruikte data en geldigheid worden niet terugbetaald of overgedragen.</li>
      </UL>

      <H2>6. Eerlijk en wettig gebruik</H2>
      <P>
        Je mag de dienst alleen wettig en voor persoonlijk gebruik benutten. Je mag ze niet doorverkopen, niet gebruiken in apparatuur die
        automatisch andere toestellen of machines verbindt (tenzij het pakket dat toelaat) en niet op een manier die het netwerk of andere
        gebruikers schaadt. We kunnen een dienst opschorten die in strijd met deze regels wordt gebruikt.
      </P>

      <H2>7. Herroepingsrecht</H2>
      <P>
        Als consument in de EU of het VK heb je normaal 14 dagen om een overeenkomst op afstand te herroepen. Een eSIM is digitale inhoud die we
        meteen na betaling leveren; daarom vragen we bij het afrekenen je akkoord met onmiddellijke levering en je erkenning dat je dit recht
        verliest zodra de eSIM is geleverd. Dat bevestigen we in je bestelmail. Verander je van gedachten vóór je eSIM is geleverd, dan betalen
        we volledig terug. Hoe terugbetalingen in de praktijk werken, staat in ons{" "}
        <Link href="/refunds" className={linkClass}>
          terugbetalingsbeleid
        </Link>
        . Niets in deze voorwaarden doet afbreuk aan je wettelijke rechten.
      </P>

      <H2>8. Onze aansprakelijkheid</H2>
      <P>
        Werkt de dienst niet zoals beschreven en kunnen we het niet oplossen, dan betalen we terug volgens het terugbetalingsbeleid. We zijn
        niet aansprakelijk voor onvoorzienbare schade, bedrijfsschade, of problemen veroorzaakt door je toestel, de instellingen ervan of
        omstandigheden buiten onze redelijke controle (zoals een lokale netwerkstoring). Niets in deze voorwaarden beperkt aansprakelijkheid die
        wettelijk niet beperkt mag worden, onder meer bij overlijden of letsel door nalatigheid, of bij fraude.
      </P>

      <H2>9. Wijzigingen van deze voorwaarden</H2>
      <P>We kunnen deze voorwaarden aanpassen. Op je bestelling geldt de versie die op deze site stond toen je bestelde.</P>

      <H2>10. Recht en geschillen</H2>
      <P>
        Op deze voorwaarden is het recht van <V>{COMPANY.governingLawNl}</V> van toepassing. Als consument behoud je ook de bescherming van de
        dwingende wetten van het land waar je woont en kun je daar een vordering instellen. Heb je een klacht, contacteer ons dan eerst via{" "}
        <V>{COMPANY.supportEmail}</V>: we doen ons best om ze op te lossen. Bemiddelingsorgaan voor consumenten:{" "}
        <V>{COMPANY.mediationBodyNl}</V>.
      </P>

      <H2 id="legal-notice">11. Juridische informatie</H2>
      <UL>
        <li>
          <strong>Onderneming:</strong> <V>{COMPANY.legalNameNl}</V>
        </li>
        <li>
          <strong>Maatschappelijke zetel:</strong> <V>{COMPANY.addressNl}</V>
        </li>
        <li>
          <strong>Ondernemingsnummer (BCE/KBO):</strong> <V>{COMPANY.registrationNumber}</V>
        </li>
        <li>
          <strong>Btw-nummer:</strong> <V>{COMPANY.vatNumber}</V>
        </li>
        <li>
          <strong>E-mail:</strong> <V>{COMPANY.supportEmail}</V>
        </li>
      </UL>
    </>
  );
}
