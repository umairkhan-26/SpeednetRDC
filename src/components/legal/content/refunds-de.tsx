import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

export default function RefundsDe() {
  return (
    <>
      <P>
        Jede eSIM soll funktionieren. Falls nicht, schreiben Sie uns an <V>{COMPANY.supportEmail}</V> mit Ihrer Bestellnummer (ORD-…) – wir
        helfen Ihnen oder erstatten wie unten beschrieben. Diese Richtlinie ist Teil unserer{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Allgemeinen Geschäftsbedingungen
        </Link>{" "}
        und berührt Ihre gesetzlichen Rechte nicht.
      </P>

      <H2>1. Wann Ihre eSIM als &bdquo;aktiviert&ldquo; gilt</H2>
      <P>
        Ihre eSIM ist an dem Tag <strong>aktiviert</strong>, an dem sie sich zum ersten Mal mit einem Mobilfunknetz in einem abgedeckten Land
        verbindet und Ihr Tarif beginnt (dann beginnt auch die Laufzeit). Der Kauf der eSIM, der Empfang der E-Mail oder die Installation des
        QR-Codes auf dem Handy aktiviert sie <strong>nicht</strong>. Wurde Ihre eSIM nie installiert oder installiert, aber nie mit einem
        Netz verbunden, ist sie nicht aktiviert.
      </P>

      <H2>2. Vollständige Erstattung</H2>
      <P>Sie erhalten eine vollständige Erstattung, wenn:</P>
      <UL>
        <li>
          Ihre eSIM <strong>nie aktiviert</strong> wurde (nie installiert oder installiert, aber nie verbunden) und nicht abgelaufen ist:
          Fragen Sie uns jederzeit vor Ablauf, und wir erstatten den vollen Betrag; oder
        </li>
        <li>
          Ihre eSIM aktiviert wurde, Sie innerhalb von <V>{POLICY.refundWindowDays}</V> Tagen nach Aktivierung anfragen und sie am Reiseziel,
          für das sie verkauft wurde, wegen eines Problems auf unserer Seite oder bei unserem Netzpartner nicht funktioniert, das wir nicht in
          angemessener Zeit beheben können; oder
        </li>
        <li>wir Ihre eSIM nicht liefern konnten; oder
        </li>
        <li>
          Sie einen Tarif gekauft haben, der die benötigten Länder nicht abdeckt (zum Beispiel ein Regionaltarif ohne Ihr Reiseziel), der Tarif
          nicht genutzt wurde und Sie uns innerhalb von <V>{POLICY.coverageSwitchDays}</V> Tagen nach Aktivierung (oder jederzeit, wenn nie
          aktiviert) informieren: Wir erstatten vollständig oder stellen Sie auf Wunsch auf einen Tarif um, der Ihr Reiseziel abdeckt (Sie
          zahlen dann nur die Differenz); oder
        </li>
        <li>dieselbe Bestellung doppelt abgebucht wurde.</li>
      </UL>

      <H2>3. Wann wir nicht erstatten können</H2>
      <UL>
        <li>Die eSIM wurde vor mehr als <V>{POLICY.refundWindowDays}</V> Tagen aktiviert oder der Tarif wurde genutzt, und die eSIM funktioniert wie beschrieben.</li>
        <li>Datenvolumen oder Laufzeit sind aufgebraucht oder abgelaufen.</li>
        <li>
          Ihr Gerät ist nicht eSIM-fähig oder hat eine Anbietersperre – prüfen Sie vor dem Kauf die{" "}
          <Link href="/device-compatibility" className="font-semibold text-orange hover:underline">
            Kompatibilitätsliste
          </Link>
          . Wurde die eSIM nie aktiviert, gilt die obige Regel zur vollständigen Erstattung weiterhin.
        </li>
        <li>Die eSIM wurde nach der Installation vom Gerät gelöscht oder Einstellungen wurden geändert (zum Beispiel Datenroaming ausgeschaltet).</li>
      </UL>
      <P>Wir prüfen jeden Fall einzeln – ist etwas schiefgelaufen, das hier nicht aufgeführt ist, melden Sie sich, und wir finden eine faire Lösung.</P>

      <H2>4. Auszahlung von Erstattungen</H2>
      <P>
        Wir bemühen uns, jede Anfrage innerhalb von 24 bis 48 Arbeitsstunden zu prüfen. Erstattungen gehen über Stripe auf die verwendete
        Karte oder Zahlungsart zurück, je nach Bank meist innerhalb von 5 bis 10 Werktagen nach unserer Zustimmung. Nach einer Erstattung
        können wir die zugehörige eSIM deaktivieren.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>SIM-Karten</H2>
          <P>{pendingAnswer("returns", "de")}</P>
          <P>Für Datentarife, die Sie auf eine SIM-Karte buchen, gelten die obigen Regeln für Tarife.</P>
        </>
      )}

      <H2>5. Ihr Widerrufsrecht</H2>
      <P>
        Verbraucher in der EU und im Vereinigten Königreich haben möglicherweise zusätzlich ein gesetzliches Widerrufsrecht – siehe Abschnitt 7
        unserer{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Allgemeinen Geschäftsbedingungen
        </Link>
        .
      </P>
    </>
  );
}
