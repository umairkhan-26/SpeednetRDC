import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

export default function PrivacyDe() {
  return (
    <>
      <P>
        Diese Erklärung beschreibt, welche personenbezogenen Daten {COMPANY.tradingName} erhebt, wenn Sie diese Website nutzen und eine eSIM
        oder SIM-Karte kaufen, warum, mit wem wir sie teilen, wie lange wir sie speichern und welche Rechte Sie haben. Wir erheben nur, was
        nötig ist, um Ihre eSIM oder SIM-Karte zu verkaufen und zu liefern.
      </P>

      <H2>1. Wer wir sind</H2>
      <P>
        Verantwortlicher ist <V>{COMPANY.legalNameDe}</V>, Sitz <V>{COMPANY.addressDe}</V> (Unternehmensnummer{" "}
        <V>{COMPANY.registrationNumber}</V>, USt-IdNr. <V>{COMPANY.vatNumber}</V>). Für Fragen oder Anliegen zum Datenschutz schreiben Sie an{" "}
        <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. Was wir erheben und warum</H2>
      <UL>
        <li>
          <strong>Ihre Bestellung:</strong> Name, E-Mail-Adresse, gewählter Tarif und Reiseziel, Preis und Bestelldatum – um Ihnen die eSIM
          oder SIM-Karte zu verkaufen, zuzustellen und die gesetzlich vorgeschriebenen Unterlagen zu führen. Rechtsgrundlage: Erfüllung des
          Vertrags mit Ihnen und unsere gesetzlichen Pflichten (Buchführung und Steuern).
        </li>
        <li>
          <strong>Rechnungsland:</strong> das Land der Rechnungsadresse Ihrer Karte, wie von unserem Zahlungsdienstleister gemeldet – für
          Steuerzwecke (MwSt.) und zur Betrugsprävention. Den Rest Ihrer Rechnungsadresse speichern wir nicht. Zur Lieferadresse einer
          SIM-Karte siehe &bdquo;Versand der SIM-Karte&ldquo;. Rechtsgrundlage: rechtliche Verpflichtung und berechtigte Interessen.
        </li>
        <li>
          <strong>Versand der SIM-Karte:</strong> Bei einer SIM-Karten-Bestellung verarbeiten wir den Namen und die Postanschrift, die Sie auf
          der Bezahlseite von Stripe für die Lieferung angeben: um die Karte zu versenden, Ihnen das Ziel anzuzeigen und gegebenenfalls eine
          Zollerklärung auszufüllen. Außerdem erfassen wir die Kartennummer, das Versanddatum, gegebenenfalls die Sendungsnummer und das
          Zustelldatum. Rechtsgrundlage: Vertragserfüllung und rechtliche Verpflichtungen (Zoll).
        </li>
        <li>
          <strong>Zahlung:</strong> Sie zahlen auf der sicheren Seite von Stripe. Stripe verarbeitet Ihre Kartendaten; Ihre Kartennummer sehen
          oder speichern wir nie. Wir erhalten eine Zahlungsreferenz und die Information, ob die Zahlung erfolgreich war.
        </li>
        <li>
          <strong>Ihre eSIM oder SIM-Karte und ihre Nutzung:</strong> die Ihrer Bestellung zugeordneten SIM-Kennungen (ICCID und
          Rufnummer/MSISDN) sowie von unserem Netzpartner den Status der SIM, Aktivierungs- und letzten Verbindungszeitpunkt, das Land der
          letzten Verbindung, Restdaten und Ablaufdatum – um den Dienst zu erbringen, Supportanfragen zu beantworten und Missbrauch zu
          verhindern. Rechtsgrundlage: Vertragserfüllung und berechtigte Interessen. Inhalte Ihres Surfens oder Ihrer Kommunikation sehen wir
          nicht.
        </li>
        <li>
          <strong>Anmeldung:</strong> Wenn Sie einen Anmeldelink anfordern, speichern wir einen Einmalcode zu Ihrer E-Mail-Adresse.
          Rechtsgrundlage: Vertragserfüllung.
        </li>
        <li>
          <strong>Sicherheit:</strong> Damit niemand Anmeldelinks und Passwörter erraten kann, zählen wir Fehlversuche anhand einer
          verschlüsselten (gehashten) Form Ihrer IP-Adresse, die wir nach 24 Stunden löschen. Ihre IP-Adresse speichern wir nicht mit Ihrer
          Bestellung. Rechtsgrundlage: berechtigte Interessen (Sicherheit der Konten und des Dienstes).
        </li>
        <li>
          <strong>Ihre Nachrichten an uns:</strong> Kontaktieren Sie den Support per E-Mail oder über &bdquo;Problem melden&ldquo; im Konto,
          verarbeiten wir den Inhalt, das gewählte Problem, die betroffene Bestellung und SIM sowie unsere Antworten, um Ihnen zu helfen. Dazu
          prüfen wir auch den Status dieser SIM bei unserem Netzpartner (siehe oben). Rechtsgrundlage: Vertragserfüllung und berechtigte
          Interessen.
        </li>
      </UL>
      <P>
        Wir verkaufen Ihre personenbezogenen Daten nicht. Nur wenn Sie Meta-Cookies akzeptieren, teilen wir begrenzte Informationen mit Meta,
        um unsere Anzeigen zu messen und zu verbessern (siehe Abschnitt 3).
      </P>

      <H2 id="cookies">3. Cookies</H2>
      <P>
        <strong>Für den Betrieb der Website erforderliche Cookies</strong> (immer aktiv):
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong> – merkt sich Ihre Sprache.
        </li>
        <li>
          <strong>customer_session</strong> – hält Sie bis zu 30 Tage bei &bdquo;Meine eSIMs&ldquo; angemeldet, nachdem Sie einen Anmeldelink
          genutzt haben. Wird beim Abmelden gelöscht.
        </li>
        <li>
          <strong>snrdc_consent</strong> – merkt sich 6 Monate lang, ob Sie Meta-Cookies akzeptiert oder abgelehnt haben.
        </li>
      </UL>
      <P>
        <strong>Werbe-Cookies von Meta (Facebook)</strong> (nur mit Ihrer Zustimmung): Beim ersten Besuch fragen wir, ob Sie sie akzeptieren.
        Von Meta wird nichts geladen, bevor Sie auf &bdquo;Akzeptieren&ldquo; klicken, und bei &bdquo;Ablehnen&ldquo; wird nichts an Meta
        gesendet. Akzeptieren Sie, setzt der Meta-Pixel das Cookie <strong>_fbp</strong> (und <strong>_fbc</strong>, wenn Sie über eine
        Meta-Anzeige kamen), bis zu 90 Tage gespeichert, und wir teilen Meta mit:
      </P>
      <UL>
        <li>welche Seiten Sie besuchen, welchen Tarif Sie ansehen, wann Sie einen Tarif wählen und wann Sie zur Kasse gehen;</li>
        <li>
          beim Kauf: Bestellwert, Währung und Tarif, Ihre E-Mail-Adresse und das Rechnungsland in verschlüsselter (gehashter) Form, die oben
          genannten Browserkennungen von Meta und Ihren Browsertyp. Wir übermitteln den Kauf sowohl von unserem Server (Conversions API von
          Meta) als auch aus Ihrem Browser mit derselben Referenz, damit Meta ihn nur einmal zählt. Ihren Namen, Ihre IP-Adresse von unserem
          Server oder Ihre Zahlungsdaten senden wir nie.
        </li>
      </UL>
      <P>
        Damit messen wir, ob unsere Anzeigen wirken, und zeigen sie Menschen, die voraussichtlich interessiert sind. Rechtsgrundlage: Ihre
        Einwilligung. Für die Erhebung dieser Informationen und die Übermittlung an Meta sind wir und Meta Platforms Ireland Ltd gemeinsam
        Verantwortliche; was Meta danach damit macht, regelt die Datenschutzrichtlinie von Meta (facebook.com/privacy/policy).
      </P>
      <P>
        Sie können Ihre Wahl jederzeit über &bdquo;Cookie-Einstellungen&ldquo; unten auf jeder Seite ändern. &bdquo;Ablehnen&ldquo; stoppt den
        Meta-Pixel und entfernt seine Cookies aus Ihrem Browser; bereits übermittelte Informationen bleiben bei Meta. Stripe setzt auf seiner
        Bezahlseite eigene Cookies zur Betrugsprävention.
      </P>

      <H2>4. Mit wem wir Daten teilen</H2>
      <P>Nur mit Dienstleistern, die sie für den Betrieb benötigen und vertraglich zu ihrem Schutz verpflichtet sind:</P>
      <UL>
        <li>Stripe (Zahlungsabwicklung und Betrugsprävention);</li>
        <li>unser Mobilfunk-Netzpartner, der die eSIM oder SIM-Karte und die Verbindung bereitstellt;</li>
        <li>bei SIM-Karten-Bestellungen: Post- und Zustelldienste und, wenn eine Zollerklärung nötig ist, die Zollbehörden;</li>
        <li>Resend (Versand von Bestell- und Anmelde-E-Mails von Servern in der EU);</li>
        <li>Hostinger (Hosting von Website und Datenbank);</li>
        <li>Meta Platforms Ireland Ltd (Werbemessung), nur wenn Sie Meta-Cookies akzeptieren;</li>
        <li>Behörden, wenn das Gesetz es verlangt.</li>
      </UL>
      <P>
        Einige Dienstleister verarbeiten Daten möglicherweise außerhalb des Europäischen Wirtschaftsraums. Dann ist die Übermittlung durch einen
        Angemessenheitsbeschluss oder die Standardvertragsklauseln der Europäischen Kommission abgesichert.
      </P>

      <H2>5. Wie lange wir speichern</H2>
      <UL>
        <li>
          Bestell-, Zahlungs- und Rechnungsunterlagen: <V>{POLICY.orderRecordYears}</V> Jahre, wie es Buchführungs- und Steuerrecht verlangen.
        </li>
        <li>SIM-Statusinformationen: solange wir die zugehörige Bestellung aufbewahren.</li>
        <li>
          Name und Straßenanschrift für die Lieferung einer SIM-Karte: aus unseren Daten gelöscht <V>{POLICY.shippingAddressMonths}</V> Monate
          nach der Zustellung (ohne erfasstes Zustelldatum: nach dem Versand; bei Erstattung vor dem Versand: nach dem Bestelldatum). Das
          Lieferland bleibt bei der Bestellung gespeichert.
        </li>
        <li>Anmeldelinks: gelöscht einen Tag nach Ablauf (sie laufen nach 15 Minuten ab).</li>
        <li>Gehashte IP-Adressen für die Sicherheit: 24 Stunden.</li>
        <li>Ihre Cookie-Wahl: 6 Monate, dann fragen wir erneut. Cookies von Meta: bis zu 90 Tage oder bis Sie sie ablehnen.</li>
        <li>
          Wenn Sie bei der Bestellung Meta-Cookies akzeptiert haben: Referenz und Browserdaten für das Kaufereignis, solange wir die Bestellung
          aufbewahren.
        </li>
        <li>Supportnachrichten: solange zur Bearbeitung nötig, danach bis zu 2 Jahre.</li>
      </UL>

      <H2>6. Ihre Rechte</H2>
      <P>
        Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen, die Verarbeitung einschränken oder ihr widersprechen und Ihre
        Daten in übertragbarem Format erhalten. Manche Daten (etwa Rechnungen) müssen wir gesetzlich aufbewahren, auch wenn Sie die Löschung
        verlangen. Schreiben Sie dazu an <V>{COMPANY.privacyEmail}</V>; wir antworten innerhalb eines Monats. Sie können sich auch bei Ihrer
        Datenschutzbehörde beschweren – unsere ist <V>{COMPANY.supervisoryAuthorityDe}</V>.
      </P>

      <H2>7. Sicherheit</H2>
      <P>
        Die Installationsdaten Ihrer eSIM erscheinen nur auf einer privaten Bestellseite mit nicht erratbarem Link und in Ihrem angemeldeten
        Konto. Bei SIM-Karten-Bestellungen zeigt diese Seite auch Ihre Lieferadresse. Behandeln Sie den Link wie ein Passwort. Zugriff auf
        unsere Systeme haben nur Mitarbeitende, die ihn benötigen, und jede Mitarbeiter-Anmeldung wird protokolliert.
      </P>

      <H2>8. Änderungen</H2>
      <P>
        Wenn wir diese Erklärung ändern, aktualisieren wir das Datum oben. Wesentliche Änderungen kündigen wir auf dieser Website an. Siehe auch
        unsere{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Allgemeinen Geschäftsbedingungen
        </Link>{" "}
        und{" "}
        <Link href="/refunds" className="font-semibold text-orange hover:underline">
          Erstattungsrichtlinie
        </Link>
        .
      </P>
    </>
  );
}
