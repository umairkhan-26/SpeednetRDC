import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";
import { AdSentence, ExtraAdCookies, ExtraAdSharing } from "./ad-partners";
import { SocialSignInCookies, SocialSignInData, SocialSignInRetention } from "./social-sign-in";

export default function PrivacyNl() {
  return (
    <>
      <P>
        Dit beleid legt uit welke persoonsgegevens {COMPANY.tradingName} verzamelt wanneer je deze website gebruikt en een eSIM of simkaart
        koopt, waarom, met wie we ze delen, hoe lang we ze bewaren en welke rechten je hebt. We verzamelen zo weinig als nodig is om je eSIM of
        simkaart te verkopen en te leveren.
      </P>

      <H2>1. Wie we zijn</H2>
      <P>
        De verwerkingsverantwoordelijke is <V>{COMPANY.legalNameNl}</V>, gevestigd te <V>{COMPANY.addressNl}</V> (ondernemingsnummer{" "}
        <V>{COMPANY.registrationNumber}</V>, btw-nummer <V>{COMPANY.vatNumber}</V>). Voor privacyvragen of -verzoeken mail je naar{" "}
        <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. Wat we verzamelen en waarom</H2>
      <UL>
        <li>
          <strong>Je bestelling:</strong> je naam, e-mailadres, het gekozen pakket en de bestemming, de prijs en de besteldatum: om je de eSIM
          of simkaart te verkopen, te bezorgen en de wettelijk verplichte administratie bij te houden. Rechtsgrond: uitvoering van onze
          overeenkomst met jou en onze wettelijke verplichtingen (boekhouding en belastingen).
        </li>
        <li>
          <strong>Factuurland:</strong> het land van het factuuradres van je kaart, zoals gemeld door onze betaaldienst: voor belasting (btw) en
          fraudepreventie. De rest van je factuuradres bewaren we niet. Voor het leveradres van een simkaart, zie &ldquo;Levering van de
          simkaart&rdquo;. Rechtsgrond: wettelijke verplichting en gerechtvaardigd belang.
        </li>
        <li>
          <strong>Levering van de simkaart:</strong> bestel je een simkaart, dan verwerken we de naam en het postadres die je voor levering
          opgeeft op de betaalpagina van Stripe: om de kaart te versturen, je te tonen waar ze naartoe gaat en zo nodig een douaneaangifte in
          te vullen. We registreren ook het kaartnummer, de verzenddatum, het eventuele trackingnummer en de leverdatum. Rechtsgrond:
          uitvoering van onze overeenkomst met jou en wettelijke verplichtingen (douane).
        </li>
        <li>
          <strong>Betaling:</strong> je betaalt op de beveiligde pagina van Stripe. Stripe verwerkt je kaartgegevens; wij zien of bewaren je
          kaartnummer nooit. We ontvangen een betaalreferentie en of de betaling gelukt is.
        </li>
        <li>
          <strong>Je eSIM of simkaart en het gebruik ervan:</strong> de simkenmerken die aan je bestelling zijn toegewezen (ICCID en
          telefoonnummer/MSISDN) en, van onze netwerkpartner, de status van de sim, wanneer ze is geactiveerd en laatst verbonden, het land van
          de laatste verbinding en je resterende data en vervaldatum: om de dienst te leveren, ondersteuningsvragen te beantwoorden en misbruik
          te voorkomen. Rechtsgrond: uitvoering van de overeenkomst en gerechtvaardigd belang. We zien de inhoud van je surfgedrag of
          communicatie niet.
        </li>
        <li>
          <strong>Inloggen:</strong> vraag je een inloglink, dan bewaren we een eenmalige code gekoppeld aan je e-mailadres. Rechtsgrond:
          uitvoering van de overeenkomst.
        </li>
        <SocialSignInData locale="nl" />
        <li>
          <strong>Beveiliging:</strong> om te voorkomen dat iemand inloglinks en wachtwoorden raadt, tellen we mislukte pogingen met een
          versleutelde (gehashte) vorm van je IP-adres, die we na 24 uur wissen. We bewaren je IP-adres niet bij je bestelling. Rechtsgrond:
          gerechtvaardigd belang (beveiliging van accounts en dienst).
        </li>
        <li>
          <strong>Berichten die je ons stuurt:</strong> neem je contact op via e-mail of &ldquo;Probleem melden&rdquo; in je account, dan
          verwerken we de inhoud van je bericht, het gekozen probleem, de betrokken bestelling en sim en onze antwoorden, om je te helpen. Om
          te antwoorden bekijken we ook de status van die sim bij onze netwerkpartner (zie hierboven). Rechtsgrond: uitvoering van de
          overeenkomst en gerechtvaardigd belang.
        </li>
      </UL>
      <P>
        <AdSentence locale="nl" name="noSale">
          We verkopen je persoonsgegevens niet. Alleen als je Meta-cookies aanvaardt, delen we beperkte informatie met Meta om onze advertenties
          te meten en te verbeteren (zie punt 3).
        </AdSentence>
      </P>

      <H2 id="cookies">3. Cookies</H2>
      <P>
        <strong>Cookies die nodig zijn om de site te laten werken</strong> (altijd actief):
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong>: onthoudt je gekozen taal.
        </li>
        <li>
          <strong>customer_session</strong>: houdt je tot 30 dagen ingelogd bij &ldquo;Mijn eSIM&rsquo;s&rdquo; nadat je een inloglink
          gebruikte. Wordt verwijderd bij uitloggen.
        </li>
        <li>
          <AdSentence locale="nl" name="consentCookie">
            <strong>snrdc_consent</strong>: onthoudt 6 maanden of je Meta-cookies hebt aanvaard of geweigerd.
          </AdSentence>
        </li>
        <SocialSignInCookies locale="nl" />
      </UL>
      <P>
        <strong>Advertentiecookies van Meta (Facebook)</strong> (alleen als je aanvaardt): bij je eerste bezoek vragen we of je ze aanvaardt.
        Er wordt niets van Meta geladen voor je op &ldquo;Accepteren&rdquo; klikt, en er wordt niets naar Meta gestuurd als je op
        &ldquo;Weigeren&rdquo; klikt. Aanvaard je, dan plaatst de Meta Pixel de cookie <strong>_fbp</strong> (en <strong>_fbc</strong> als je
        via een Meta-advertentie kwam), maximaal 90 dagen bewaard, en melden we Meta:
      </P>
      <UL>
        <li>welke pagina&rsquo;s je bezoekt, welk pakket je bekijkt, wanneer je een pakket kiest en wanneer je gaat afrekenen;</li>
        <li>
          bij aankoop: de orderwaarde, munt en pakket, je e-mailadres en factuurland in versleutelde (gehashte) vorm, de bovenstaande
          browserkenmerken van Meta en je browsertype. We sturen de aankoop zowel vanaf onze server (Conversions API van Meta) als vanuit je
          browser, met dezelfde referentie, zodat Meta ze één keer telt. We sturen nooit je naam, je IP-adres vanaf onze server of je
          betaalgegevens.
        </li>
      </UL>
      <P>
        We gebruiken dit om te meten of onze advertenties werken en om ze te tonen aan mensen die waarschijnlijk interesse hebben. Rechtsgrond:
        je toestemming. Voor het verzamelen van deze informatie en de doorgifte aan Meta zijn wij en Meta Platforms Ireland Ltd gezamenlijke
        verwerkingsverantwoordelijken; wat Meta er daarna mee doet, valt onder het privacybeleid van Meta (facebook.com/privacy/policy).
      </P>
      <ExtraAdCookies locale="nl" />
      <P>
        Je kunt je keuze altijd wijzigen via &ldquo;Cookie-instellingen&rdquo; onderaan elke pagina. &ldquo;Weigeren&rdquo; stopt de Meta Pixel
        en verwijdert zijn cookies uit je browser; reeds verzonden informatie blijft bij Meta. Stripe plaatst eigen cookies op zijn
        betaalpagina om fraude te voorkomen.
      </P>

      <H2>4. Met wie we gegevens delen</H2>
      <P>Alleen met dienstverleners die ze nodig hebben om de dienst te leveren, onder contracten die hen verplichten ze te beschermen:</P>
      <UL>
        <li>Stripe (betalingsverwerking en fraudepreventie);</li>
        <li>onze mobiele netwerkpartner, die de eSIM of simkaart en de verbinding levert;</li>
        <li>als je een simkaart bestelt: post- en bezorgdiensten en, waar een douaneaangifte nodig is, de douane;</li>
        <li>Resend (verzenden van bestel- en inlogmails, vanaf servers in de EU);</li>
        <li>Hostinger (hosting van website en database);</li>
        <li>Meta Platforms Ireland Ltd (advertentiemeting), alleen als je Meta-cookies aanvaardt;</li>
        <ExtraAdSharing locale="nl" />
        <li>overheden, wanneer de wet dat vereist.</li>
      </UL>
      <P>
        Sommige dienstverleners kunnen gegevens buiten de Europese Economische Ruimte verwerken. Dan wordt de doorgifte beschermd door een
        adequaatheidsbesluit of de modelcontractbepalingen van de Europese Commissie.
      </P>

      <H2>5. Hoe lang we ze bewaren</H2>
      <UL>
        <li>
          Bestel-, betaal- en factuurgegevens: <V>{POLICY.orderRecordYears}</V> jaar, zoals de boekhoud- en belastingwetgeving vereist.
        </li>
        <li>Statusinformatie van de sim: zolang we de bijbehorende bestelling bewaren.</li>
        <li>
          Naam en straatadres voor de levering van een simkaart: uit onze gegevens gewist <V>{POLICY.shippingAddressMonths}</V> maanden na
          levering (als geen leverdatum is geregistreerd: na verzending; als de bestelling vóór verzending is terugbetaald: na de besteldatum).
          Het leveringsland blijft bij de bestelling.
        </li>
        <li>Inloglinks: gewist een dag nadat ze verlopen (ze verlopen na 15 minuten).</li>
        <SocialSignInRetention locale="nl" />
        <li>Gehashte IP-adressen voor beveiliging: 24 uur.</li>
        <li>
          <AdSentence locale="nl" name="retention">
            Je cookiekeuze: 6 maanden, dan vragen we opnieuw. Cookies van Meta: maximaal 90 dagen, of tot je ze weigert.
          </AdSentence>
        </li>
        <li>
          Als je bij je bestelling Meta-cookies aanvaardde: de referentie en browsergegevens voor de aankoopmelding, zolang we de bestelling
          bewaren.
        </li>
        <li>Ondersteuningsberichten: zolang nodig om je vraag te behandelen, daarna maximaal 2 jaar.</li>
      </UL>

      <H2>6. Je rechten</H2>
      <P>
        Je kunt vragen om inzage, verbetering of wissing van je persoonsgegevens, het gebruik beperken of er bezwaar tegen maken, en ze in een
        overdraagbaar formaat ontvangen. Sommige gegevens moeten we wettelijk bewaren (zoals facturen), ook als je om wissing vraagt. Mail voor
        een verzoek naar <V>{COMPANY.privacyEmail}</V>; we antwoorden binnen een maand. Je kunt ook klacht indienen bij je
        gegevensbeschermingsautoriteit: die van ons is <V>{COMPANY.supervisoryAuthorityNl}</V>.
      </P>

      <H2>7. Beveiliging</H2>
      <P>
        De installatiegegevens van je eSIM staan alleen op een privébestelpagina met een niet te raden link en in je ingelogde account. Bij een
        simkaartbestelling toont die pagina ook je leveradres. Behandel die link als een wachtwoord. Toegang tot onze systemen is beperkt tot
        personeel dat die nodig heeft, en elke personeelslogin wordt geregistreerd.
      </P>

      <H2>8. Wijzigingen</H2>
      <P>
        Wijzigen we dit beleid, dan passen we de datum bovenaan aan. Belangrijke wijzigingen kondigen we op deze site aan. Zie ook onze{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          algemene voorwaarden
        </Link>{" "}
        en ons{" "}
        <Link href="/refunds" className="font-semibold text-orange hover:underline">
          terugbetalingsbeleid
        </Link>
        .
      </P>
    </>
  );
}
