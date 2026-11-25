import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function TermsDe() {
  return (
    <>
      <P>
        Diese Bedingungen gelten, wenn Sie auf dieser Website einen eSIM-Datentarif kaufen. Mit Ihrer Bestellung stimmen Sie ihnen zu. Bitte
        lesen Sie auch unsere{" "}
        <Link href="/privacy" className={linkClass}>
          Datenschutzerklärung
        </Link>{" "}
        und{" "}
        <Link href="/refunds" className={linkClass}>
          Erstattungsrichtlinie
        </Link>
        .
      </P>

      <H2>1. Über uns</H2>
      <P>
        Diese Website wird betrieben von <V>{COMPANY.legalNameDe}</V>, Sitz <V>{COMPANY.addressDe}</V>, Unternehmensnummer{" "}
        <V>{COMPANY.registrationNumber}</V>, USt-IdNr. <V>{COMPANY.vatNumber}</V>. Kontakt: <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. Was Sie kaufen</H2>
      <UL>
        <li>Einen vorausbezahlten, reinen eSIM-Datentarif für das Reiseziel, das Datenvolumen und die Laufzeit, die bei der Bestellung angezeigt wurden. Er enthält keine Rufnummer für Anrufe oder SMS, sofern der Tarif nichts anderes angibt.</li>
        <li>Die Verbindung stellen unser Netzpartner und dessen Partnernetze am jeweiligen Reiseziel bereit. Geschwindigkeit und Abdeckung hängen von den örtlichen Netzen ab und werden nicht garantiert.</li>
        <li>
          <strong>Wo er funktioniert:</strong> Ein Tarif funktioniert nur in den Ländern, die auf der Tarifseite und Ihrer Bestellseite
          aufgeführt sind. Tarifnamen wie &bdquo;Karibik&ldquo; oder &bdquo;Europa&ldquo; können nur einige Orte abdecken, prüfen Sie daher vor
          dem Kauf die Liste. Außerhalb dieser Länder liefert Ihre eSIM kein Internet, auch wenn Ihr Handy Empfang anzeigt. Haben Sie einen
          Tarif gekauft, der Ihr Reiseziel nicht abdeckt, informieren Sie uns vor der Nutzung: siehe unsere{" "}
          <Link href="/refunds" className={linkClass}>
            Erstattungsrichtlinie
          </Link>
          .
        </li>
        <li>
          Sie benötigen ein eSIM-fähiges Gerät ohne Anbietersperre. Prüfen Sie vor dem Kauf die{" "}
          <Link href="/device-compatibility" className={linkClass}>
            Liste kompatibler Geräte
          </Link>
          .
        </li>
      </UL>

      <H2>3. Bestellung und Zahlung</H2>
      <UL>
        <li>
          Preise werden in Euro angegeben. Tarifpreis und die Zeile &bdquo;Steuern &amp; Gebühren&ldquo; an der Kasse ergeben den Gesamtbetrag;
          der Betrag auf der Bezahlseite ist endgültig und enthält gegebenenfalls die MwSt. Sie zahlen den vollen Betrag an der Kasse über
          unseren Zahlungsdienstleister Stripe.
        </li>
        <li>Der Vertrag kommt mit Bestätigung Ihrer Zahlung zustande. Wir dürfen eine Bestellung stornieren und vollständig erstatten, wenn wir sie nicht erfüllen können (zum Beispiel bei einem Preisfehler oder einem nicht mehr verfügbaren Tarif).</li>
        <li>Sie müssen eine gültige E-Mail-Adresse angeben: Dorthin wird Ihre eSIM geliefert, und damit melden Sie sich bei &bdquo;Meine eSIMs&ldquo; an.</li>
      </UL>

      <H2>4. Lieferung und Installation</H2>
      <UL>
        <li>Wir senden Ihnen per E-Mail einen privaten Link zu Ihrer Bestellseite mit dem eSIM-QR-Code und der Installationsanleitung, meist wenige Minuten nach der Zahlung.</li>
        <li>Funktioniert etwas nicht, nutzen Sie &bdquo;Problem melden&ldquo; in Ihrem Konto (oder schreiben Sie an <V>{COMPANY.supportEmail}</V>) mit Ihrer Bestellnummer: Unser Team sieht, um welche SIM es geht, und antwortet im selben Verlauf.</li>
        <li>Halten Sie den Link privat: Wer ihn hat, kann Ihre eSIM installieren. Eine eSIM lässt sich in der Regel nur einmal installieren; nach dem Löschen vom Gerät ist eine erneute Installation möglicherweise nicht möglich.</li>
        <li>Installieren Sie die eSIM mit bestehender Internetverbindung, am besten vor der Reise. Für Installation und Geräteeinstellungen (zum Beispiel Datenroaming für die eSIM-Leitung) sind Sie verantwortlich.</li>
      </UL>

      <H2>5. Laufzeit des Tarifs</H2>
      <UL>
        <li>Ihr Tarif beginnt, wenn sich Ihr Gerät erstmals mit einem Netz in einem abgedeckten Land verbindet (nicht bei Kauf oder Installation), sofern die Tarifbeschreibung nichts anderes angibt.</li>
        <li>Er endet mit Ablauf der Laufzeit oder wenn das Datenvolumen verbraucht ist, je nachdem, was zuerst eintritt. Ungenutzte Daten und Laufzeit werden nicht erstattet oder übertragen.</li>
      </UL>

      <H2>6. Faire und rechtmäßige Nutzung</H2>
      <P>
        Sie dürfen den Dienst nur rechtmäßig und zum persönlichen Gebrauch nutzen. Sie dürfen ihn nicht weiterverkaufen, nicht in Geräten
        einsetzen, die automatisch andere Geräte oder Maschinen verbinden (sofern der Tarif dies nicht erlaubt), und nicht in einer Weise
        nutzen, die dem Netz oder anderen Nutzern schadet. Wir können einen Dienst sperren, der gegen diese Regeln genutzt wird.
      </P>

      <H2>7. Widerrufsrecht</H2>
      <P>
        Als Verbraucher in der EU oder im Vereinigten Königreich haben Sie in der Regel 14 Tage Zeit, einen Fernabsatzvertrag zu widerrufen.
        Eine eSIM ist ein digitaler Inhalt, den wir direkt nach der Zahlung liefern. Daher bitten wir Sie an der Kasse, der sofortigen Lieferung
        zuzustimmen und zu bestätigen, dass Sie dieses Recht mit Lieferung der eSIM verlieren; dies bestätigen wir in Ihrer Bestell-E-Mail.
        Überlegen Sie es sich vor der Lieferung anders, erstatten wir den vollen Betrag. Wie Erstattungen in der Praxis ablaufen, beschreibt
        unsere{" "}
        <Link href="/refunds" className={linkClass}>
          Erstattungsrichtlinie
        </Link>
        . Ihre gesetzlichen Rechte bleiben unberührt.
      </P>

      <H2>8. Unsere Haftung</H2>
      <P>
        Funktioniert der Dienst nicht wie beschrieben und können wir das nicht beheben, erstatten wir gemäß der Erstattungsrichtlinie. Wir
        haften nicht für unvorhersehbare Schäden, geschäftliche Verluste oder Probleme durch Ihr Gerät, dessen Einstellungen oder Ereignisse
        außerhalb unserer zumutbaren Kontrolle (etwa ein örtlicher Netzausfall). Nichts in diesen Bedingungen beschränkt eine Haftung, die
        gesetzlich nicht beschränkt werden darf, einschließlich bei Tod oder Körperverletzung durch Fahrlässigkeit oder bei Betrug.
      </P>

      <H2>9. Änderungen dieser Bedingungen</H2>
      <P>Wir können diese Bedingungen aktualisieren. Für Ihre Bestellung gilt die Fassung, die zum Bestellzeitpunkt auf dieser Website stand.</P>

      <H2>10. Recht und Streitigkeiten</H2>
      <P>
        Für diese Bedingungen gilt das Recht von <V>{COMPANY.governingLawDe}</V>. Als Verbraucher behalten Sie zudem den Schutz der zwingenden
        Vorschriften Ihres Wohnsitzlandes und können dort klagen. Bei einer Beschwerde wenden Sie sich bitte zuerst an{" "}
        <V>{COMPANY.supportEmail}</V> – wir bemühen uns um eine Lösung. Verbraucherschlichtungsstelle: <V>{COMPANY.mediationBodyDe}</V>.
      </P>

      <H2 id="legal-notice">11. Impressum</H2>
      <UL>
        <li>
          <strong>Unternehmen:</strong> <V>{COMPANY.legalNameDe}</V>
        </li>
        <li>
          <strong>Sitz:</strong> <V>{COMPANY.addressDe}</V>
        </li>
        <li>
          <strong>Unternehmensnummer (BCE/KBO):</strong> <V>{COMPANY.registrationNumber}</V>
        </li>
        <li>
          <strong>USt-IdNr.:</strong> <V>{COMPANY.vatNumber}</V>
        </li>
        <li>
          <strong>E-Mail:</strong> <V>{COMPANY.supportEmail}</V>
        </li>
      </UL>
    </>
  );
}
