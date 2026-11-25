import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

export default function RefundsIt() {
  return (
    <>
      <P>
        Vogliamo che ogni eSIM funzioni. Se non funziona, scrivici a <V>{COMPANY.supportEmail}</V> con il numero d&apos;ordine (ORD-…): ti
        aiuteremo o ti rimborseremo come descritto di seguito. Questa politica fa parte dei nostri{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Termini e condizioni
        </Link>{" "}
        e non pregiudica i tuoi diritti di legge.
      </P>

      <H2>1. Quando la tua eSIM è considerata &ldquo;attivata&rdquo;</H2>
      <P>
        La tua eSIM è <strong>attivata</strong> il giorno in cui si connette per la prima volta a una rete mobile in un paese coperto e il
        piano inizia (da quel momento decorre anche la validità). Acquistare l&apos;eSIM, ricevere l&apos;e-mail o installare il codice QR sul
        telefono <strong>non</strong> la attiva. Se non hai mai installato l&apos;eSIM, o l&apos;hai installata ma non si è mai connessa a una
        rete, non è stata attivata.
      </P>

      <H2>2. Rimborso completo</H2>
      <P>Hai diritto a un rimborso completo se:</P>
      <UL>
        <li>
          la tua eSIM <strong>non è mai stata attivata</strong> (mai installata, o installata ma mai connessa) e non è scaduta: chiedilo in
          qualsiasi momento prima della scadenza e ti rimborsiamo per intero; oppure
        </li>
        <li>
          la tua eSIM è stata attivata, lo chiedi entro <V>{POLICY.refundWindowDays}</V> giorni dalla data di attivazione e non funziona nella
          destinazione per cui è stata venduta a causa di un problema nostro o del nostro partner di rete che non riusciamo a risolvere in
          tempi ragionevoli; oppure
        </li>
        <li>non siamo riusciti a consegnare la tua eSIM; oppure</li>
        <li>
          hai acquistato un piano che non copre i paesi che ti servono (ad esempio un piano regionale che esclude la tua destinazione), il piano
          non è stato usato e ci avvisi entro <V>{POLICY.coverageSwitchDays}</V> giorni dall&apos;attivazione (o in qualsiasi momento se non è
          mai stata attivata): ti rimborsiamo per intero oppure, se preferisci, ti passiamo a un piano che copre la destinazione (paghi solo la
          differenza); oppure
        </li>
        <li>ti è stato addebitato due volte lo stesso ordine.</li>
      </UL>

      <H2>3. Quando non possiamo rimborsare</H2>
      <UL>
        <li>L&apos;eSIM è stata attivata da più di <V>{POLICY.refundWindowDays}</V> giorni, o il piano è stato usato, e l&apos;eSIM funziona come descritto.</li>
        <li>I dati o il periodo di validità sono esauriti o scaduti.</li>
        <li>
          Il dispositivo non è compatibile con eSIM o è bloccato dall&apos;operatore: controlla l&apos;
          <Link href="/device-compatibility" className="font-semibold text-orange hover:underline">
            elenco di compatibilità
          </Link>{" "}
          prima di acquistare. Se l&apos;eSIM non è mai stata attivata, vale comunque la regola del rimborso completo.
        </li>
        <li>L&apos;eSIM è stata eliminata dal dispositivo dopo l&apos;installazione, o le impostazioni sono state modificate (ad esempio roaming dati disattivato).</li>
      </UL>
      <P>Valutiamo ogni caso singolarmente: se è successo qualcosa non previsto qui, contattaci e troveremo una soluzione equa.</P>

      <H2>4. Come vengono pagati i rimborsi</H2>
      <P>
        Ci impegniamo a esaminare ogni richiesta entro 24-48 ore lavorative. I rimborsi tornano, tramite Stripe, sulla carta o sul metodo di
        pagamento usato, di solito entro 5-10 giorni lavorativi dalla nostra approvazione, a seconda della banca. Dopo il rimborso possiamo
        disattivare l&apos;eSIM dell&apos;ordine.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>Schede SIM</H2>
          <P>{pendingAnswer("returns", "it")}</P>
          <P>Ai piani dati aggiunti a una SIM si applicano le regole sui piani indicate sopra.</P>
        </>
      )}

      <H2>5. Il tuo diritto di recesso</H2>
      <P>
        I consumatori nell&apos;UE e nel Regno Unito possono avere anche un diritto di recesso previsto dalla legge: vedi il punto 7 dei nostri{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Termini e condizioni
        </Link>
        .
      </P>
    </>
  );
}
