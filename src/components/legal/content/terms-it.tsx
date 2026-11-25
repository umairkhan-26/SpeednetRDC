import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function TermsIt() {
  return (
    <>
      <P>
        Questi termini si applicano quando acquisti un piano dati eSIM su questo sito. Effettuando un ordine li accetti. Leggi anche la nostra{" "}
        <Link href="/privacy" className={linkClass}>
          Informativa sulla privacy
        </Link>{" "}
        e la{" "}
        <Link href="/refunds" className={linkClass}>
          Politica di rimborso
        </Link>
        .
      </P>

      <H2>1. Chi siamo</H2>
      <P>
        Questo sito è gestito da <V>{COMPANY.legalNameIt}</V>, con sede in <V>{COMPANY.addressIt}</V>, numero d&apos;impresa{" "}
        <V>{COMPANY.registrationNumber}</V>, partita IVA <V>{COMPANY.vatNumber}</V>. Contattaci a <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. Cosa acquisti</H2>
      <UL>
        <li>Un piano eSIM prepagato solo dati per la destinazione, la quantità di dati e la validità mostrate al momento dell&apos;ordine. Non include un numero di telefono per chiamate o SMS, salvo diversa indicazione del piano.</li>
        <li>La connettività è fornita dal nostro partner di rete e dalle sue reti partner in ogni destinazione. Velocità e copertura dipendono dalle reti locali e non sono garantite.</li>
        <li>
          <strong>Dove funziona:</strong> un piano funziona solo nei paesi elencati nella pagina del piano e nella pagina del tuo ordine. Nomi
          come &ldquo;Caraibi&rdquo; o &ldquo;Europa&rdquo; possono coprire solo alcune località: controlla l&apos;elenco prima di acquistare.
          Fuori da quei paesi la tua eSIM non fornisce internet, anche se il telefono mostra segnale. Se hai acquistato un piano che non copre
          la tua destinazione, avvisaci prima di usarlo: vedi la{" "}
          <Link href="/refunds" className={linkClass}>
            Politica di rimborso
          </Link>
          .
        </li>
        <li>
          Serve un dispositivo compatibile con eSIM e non bloccato dall&apos;operatore. Controlla l&apos;
          <Link href="/device-compatibility" className={linkClass}>
            elenco dei dispositivi compatibili
          </Link>{" "}
          prima di acquistare.
        </li>
      </UL>

      <H2>3. Ordini e pagamento</H2>
      <UL>
        <li>
          I prezzi sono in euro. Il prezzo del piano e la voce &ldquo;Tasse e commissioni&rdquo; mostrata al pagamento compongono il totale;
          il totale nella pagina di pagamento è definitivo e include l&apos;IVA dove applicabile. Paghi l&apos;intero importo al checkout tramite
          il nostro fornitore di pagamenti, Stripe.
        </li>
        <li>Il contratto si conclude quando il pagamento è confermato. Possiamo annullare e rimborsare per intero un ordine che non siamo in grado di evadere (ad esempio per un errore di prezzo o un piano non più disponibile).</li>
        <li>Devi indicare un indirizzo e-mail valido: lì viene consegnata la tua eSIM e con esso accedi a &ldquo;Le mie eSIM&rdquo;.</li>
      </UL>

      <H2>4. Consegna e installazione</H2>
      <UL>
        <li>Ti inviamo via e-mail un link privato alla pagina del tuo ordine con il codice QR dell&apos;eSIM e le istruzioni di installazione, di solito entro pochi minuti dal pagamento.</li>
        <li>Se qualcosa non funziona, usa &ldquo;Segnala un problema&rdquo; nel tuo account (oppure scrivi a <V>{COMPANY.supportEmail}</V>) con il numero d&apos;ordine: il nostro team vede di quale SIM si tratta e risponde nella stessa conversazione.</li>
        <li>Mantieni privato il link: chiunque lo abbia può installare la tua eSIM. Di norma un&apos;eSIM si installa una sola volta; se la elimini dal dispositivo potresti non poterla reinstallare.</li>
        <li>Installa l&apos;eSIM quando hai una connessione internet, meglio prima di partire. Sei responsabile dell&apos;installazione e delle impostazioni del dispositivo (ad esempio attivare il roaming dati per la linea eSIM).</li>
      </UL>

      <H2>5. Validità del piano</H2>
      <UL>
        <li>Il piano inizia la prima volta che il dispositivo si connette a una rete in un paese coperto (non all&apos;acquisto o all&apos;installazione), salvo diversa indicazione nella descrizione del piano.</li>
        <li>Termina alla scadenza della validità o all&apos;esaurimento dei dati, a seconda di cosa avviene prima. Dati e validità non usati non vengono rimborsati né trasferiti.</li>
      </UL>

      <H2>6. Uso corretto e lecito</H2>
      <P>
        Puoi usare il servizio solo per scopi leciti e personali. Non puoi rivenderlo, usarlo in apparecchiature che connettono automaticamente
        altri dispositivi o macchine (salvo che il piano lo consenta), né usarlo in modo da danneggiare la rete o altri utenti. Possiamo
        sospendere un servizio usato in violazione di queste regole.
      </P>

      <H2>7. Diritto di recesso</H2>
      <P>
        Se sei un consumatore nell&apos;UE o nel Regno Unito, di norma hai 14 giorni per recedere da un contratto a distanza. L&apos;eSIM è un
        contenuto digitale che consegniamo subito dopo il pagamento: per questo al checkout ti chiediamo di acconsentire alla consegna immediata
        e di riconoscere che perdi questo diritto una volta consegnata l&apos;eSIM; lo confermiamo nell&apos;e-mail dell&apos;ordine. Se cambi
        idea prima della consegna, ti rimborsiamo per intero. Il funzionamento dei rimborsi è descritto nella{" "}
        <Link href="/refunds" className={linkClass}>
          Politica di rimborso
        </Link>
        . Nulla in questi termini pregiudica i tuoi diritti di legge.
      </P>

      <H2>8. La nostra responsabilità</H2>
      <P>
        Se il servizio non funziona come descritto e non riusciamo a risolvere, ti rimborsiamo secondo la Politica di rimborso. Non rispondiamo
        di danni non prevedibili, di perdite commerciali o di problemi causati dal tuo dispositivo, dalle sue impostazioni o da eventi fuori dal
        nostro ragionevole controllo (come un&apos;interruzione di rete locale). Nulla in questi termini limita responsabilità che per legge non
        possono essere limitate, incluse quelle per morte o lesioni causate da negligenza, o per frode.
      </P>

      <H2>9. Modifiche ai termini</H2>
      <P>Possiamo aggiornare questi termini. Al tuo ordine si applica la versione pubblicata sul sito al momento dell&apos;ordine.</P>

      <H2>10. Legge e controversie</H2>
      <P>
        Questi termini sono regolati dalla legge di <V>{COMPANY.governingLawIt}</V>. Se sei un consumatore, mantieni anche la tutela delle norme
        inderogabili del paese in cui vivi e puoi agire davanti ai suoi tribunali. In caso di reclamo, contattaci prima a{" "}
        <V>{COMPANY.supportEmail}</V>: faremo il possibile per risolverlo. Organismo di mediazione per i consumatori:{" "}
        <V>{COMPANY.mediationBodyIt}</V>.
      </P>

      <H2 id="legal-notice">11. Note legali</H2>
      <UL>
        <li>
          <strong>Impresa:</strong> <V>{COMPANY.legalNameIt}</V>
        </li>
        <li>
          <strong>Sede legale:</strong> <V>{COMPANY.addressIt}</V>
        </li>
        <li>
          <strong>Numero d&apos;impresa (BCE/KBO):</strong> <V>{COMPANY.registrationNumber}</V>
        </li>
        <li>
          <strong>Partita IVA:</strong> <V>{COMPANY.vatNumber}</V>
        </li>
        <li>
          <strong>E-mail:</strong> <V>{COMPANY.supportEmail}</V>
        </li>
      </UL>
    </>
  );
}
