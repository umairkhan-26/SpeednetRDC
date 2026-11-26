import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";
import { AdSentence, ExtraAdCookies, ExtraAdSharing } from "./ad-partners";
import { SocialSignInCookies, SocialSignInData, SocialSignInRetention } from "./social-sign-in";

export default function PrivacyIt() {
  return (
    <>
      <P>
        Questa informativa spiega quali dati personali {COMPANY.tradingName} raccoglie quando usi questo sito e acquisti un&apos;eSIM o una
        scheda SIM, perché, con chi li condividiamo, per quanto tempo li conserviamo e quali diritti hai. Raccogliamo solo quanto serve per
        vendere e consegnare la tua eSIM o SIM.
      </P>

      <H2>1. Chi siamo</H2>
      <P>
        Il titolare del trattamento è <V>{COMPANY.legalNameIt}</V>, con sede in <V>{COMPANY.addressIt}</V> (numero d&apos;impresa{" "}
        <V>{COMPANY.registrationNumber}</V>, partita IVA <V>{COMPANY.vatNumber}</V>). Per domande o richieste sulla privacy scrivi a{" "}
        <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. Cosa raccogliamo e perché</H2>
      <UL>
        <li>
          <strong>Il tuo ordine:</strong> nome, indirizzo e-mail, piano e destinazione scelti, prezzo e data dell&apos;ordine, per venderti
          l&apos;eSIM o la SIM, consegnartela e conservare le registrazioni richieste dalla legge. Base giuridica: esecuzione del contratto con
          te e obblighi di legge (contabilità e fisco).
        </li>
        <li>
          <strong>Paese di fatturazione:</strong> il paese dell&apos;indirizzo di fatturazione della carta, comunicato dal fornitore di
          pagamenti, per fini fiscali (IVA) e di prevenzione delle frodi. Non conserviamo il resto dell&apos;indirizzo di fatturazione. Per
          l&apos;indirizzo di consegna di una SIM, vedi &ldquo;Consegna della SIM&rdquo;. Base giuridica: obbligo di legge e legittimo
          interesse.
        </li>
        <li>
          <strong>Consegna della SIM:</strong> se ordini una scheda SIM, il nome e l&apos;indirizzo postale indicati per la consegna nella
          pagina di pagamento di Stripe: per spedirti la scheda, mostrarti dove viene inviata e compilare la dichiarazione doganale quando
          necessaria. Registriamo anche il numero della scheda, la data di spedizione, l&apos;eventuale numero di tracciamento e la data di
          consegna. Base giuridica: esecuzione del contratto e obblighi di legge (dogane).
        </li>
        <li>
          <strong>Pagamento:</strong> paghi nella pagina sicura di Stripe. Stripe elabora i dati della carta; noi non vediamo né conserviamo
          mai il numero. Riceviamo un riferimento di pagamento e l&apos;esito.
        </li>
        <li>
          <strong>La tua eSIM o SIM e il suo uso:</strong> gli identificativi SIM assegnati all&apos;ordine (ICCID e numero/MSISDN) e, dal
          nostro partner di rete, lo stato della SIM, quando è stata attivata e connessa l&apos;ultima volta, il paese dell&apos;ultima
          connessione, i dati residui e la scadenza del piano, per erogare il servizio, rispondere alle richieste di assistenza e prevenire
          abusi. Base giuridica: esecuzione del contratto e legittimo interesse. Non vediamo il contenuto della navigazione o delle
          comunicazioni.
        </li>
        <li>
          <strong>Accesso:</strong> quando chiedi un link di accesso conserviamo un codice monouso collegato alla tua e-mail. Base giuridica:
          esecuzione del contratto.
        </li>
        <SocialSignInData locale="it" />
        <li>
          <strong>Sicurezza:</strong> per impedire che qualcuno indovini link di accesso e password, contiamo i tentativi falliti usando una
          forma cifrata (hash) del tuo indirizzo IP, che cancelliamo dopo 24 ore. Non conserviamo l&apos;IP insieme all&apos;ordine. Base
          giuridica: legittimo interesse (sicurezza degli account e del servizio).
        </li>
        <li>
          <strong>I messaggi che ci invii:</strong> se contatti l&apos;assistenza via e-mail o con &ldquo;Segnala un problema&rdquo; nel tuo
          account, trattiamo il contenuto del messaggio, il problema scelto, l&apos;ordine e la SIM interessati e le nostre risposte, per
          aiutarti. Per rispondere consultiamo anche lo stato della SIM presso il partner di rete (vedi sopra). Base giuridica: esecuzione del
          contratto e legittimo interesse.
        </li>
      </UL>
      <P>
        <AdSentence locale="it" name="noSale">
          Non vendiamo i tuoi dati personali. Solo se accetti i cookie di Meta condividiamo con Meta informazioni limitate per misurare e
          migliorare le nostre pubblicità (vedi punto 3).
        </AdSentence>
      </P>

      <H2 id="cookies">3. Cookie</H2>
      <P>
        <strong>Cookie necessari al funzionamento del sito</strong> (sempre attivi):
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong>: ricorda la lingua scelta.
        </li>
        <li>
          <strong>customer_session</strong>: ti mantiene connesso a &ldquo;Le mie eSIM&rdquo; fino a 30 giorni dopo l&apos;uso di un link di
          accesso. Viene rimosso quando esci.
        </li>
        <li>
          <AdSentence locale="it" name="consentCookie">
            <strong>snrdc_consent</strong>: ricorda per 6 mesi se hai accettato o rifiutato i cookie di Meta.
          </AdSentence>
        </li>
        <SocialSignInCookies locale="it" />
      </UL>
      <P>
        <strong>Cookie pubblicitari di Meta (Facebook)</strong> (solo se accetti): alla prima visita ti chiediamo se li accetti. Nulla di Meta
        viene caricato prima che tu clicchi &ldquo;Accetta&rdquo; e nulla viene inviato a Meta se clicchi &ldquo;Rifiuta&rdquo;. Se accetti, il
        Meta Pixel imposta il cookie <strong>_fbp</strong> (e <strong>_fbc</strong> se arrivi da un annuncio Meta), conservato fino a 90
        giorni, e comunichiamo a Meta:
      </P>
      <UL>
        <li>quali pagine visiti, quale piano guardi, quando scegli un piano e quando inizi il pagamento;</li>
        <li>
          quando acquisti: valore, valuta e piano dell&apos;ordine, la tua e-mail e il paese di fatturazione in forma cifrata (hash), gli
          identificativi del browser di Meta indicati sopra e il tipo di browser. Inviamo l&apos;acquisto sia dal nostro server (Conversions API
          di Meta) sia dal tuo browser, con lo stesso riferimento, così Meta lo conta una sola volta. Non inviamo mai il tuo nome, il tuo
          indirizzo IP dal nostro server o i dati di pagamento.
        </li>
      </UL>
      <P>
        Usiamo queste informazioni per misurare l&apos;efficacia delle pubblicità e mostrarle a persone probabilmente interessate. Base
        giuridica: il tuo consenso. Per la raccolta di queste informazioni e la loro trasmissione a Meta, noi e Meta Platforms Ireland Ltd siamo
        contitolari; ciò che Meta ne fa dopo è disciplinato dall&apos;informativa di Meta (facebook.com/privacy/policy).
      </P>
      <ExtraAdCookies locale="it" />
      <P>
        Puoi cambiare scelta in qualsiasi momento da &ldquo;Impostazioni cookie&rdquo; in fondo a ogni pagina. &ldquo;Rifiuta&rdquo; ferma il
        Meta Pixel e rimuove i suoi cookie dal browser; le informazioni già inviate restano a Meta. Stripe imposta propri cookie nella pagina di
        pagamento per prevenire le frodi.
      </P>

      <H2>4. Con chi condividiamo i dati</H2>
      <P>Solo con fornitori che ne hanno bisogno per il servizio, in base a contratti che li obbligano a proteggerli:</P>
      <UL>
        <li>Stripe (elaborazione dei pagamenti e prevenzione delle frodi);</li>
        <li>il nostro partner di rete mobile, che fornisce l&apos;eSIM o la SIM e la connettività;</li>
        <li>se ordini una SIM: servizi postali e di consegna e, quando serve una dichiarazione doganale, le autorità doganali;</li>
        <li>Resend (invio delle e-mail di ordine e accesso, da server nell&apos;UE);</li>
        <li>Hostinger (hosting del sito e del database);</li>
        <li>Meta Platforms Ireland Ltd (misurazione pubblicitaria), solo se accetti i cookie di Meta;</li>
        <ExtraAdSharing locale="it" />
        <li>le autorità, quando la legge lo richiede.</li>
      </UL>
      <P>
        Alcuni fornitori possono trattare dati fuori dallo Spazio economico europeo. In tal caso il trasferimento è protetto da una decisione di
        adeguatezza o dalle clausole contrattuali tipo della Commissione europea.
      </P>

      <H2>5. Per quanto tempo li conserviamo</H2>
      <UL>
        <li>
          Registrazioni di ordini, pagamenti e fatture: <V>{POLICY.orderRecordYears}</V> anni, come richiesto dalla normativa contabile e
          fiscale.
        </li>
        <li>Informazioni sullo stato della SIM: finché conserviamo l&apos;ordine a cui si riferiscono.</li>
        <li>
          Nome e indirizzo di consegna di un ordine SIM: cancellati dalle nostre registrazioni <V>{POLICY.shippingAddressMonths}</V> mesi dopo
          la consegna (se la data di consegna non è registrata, dopo la spedizione; se l&apos;ordine è rimborsato prima della spedizione, dopo
          la data dell&apos;ordine). Il paese di consegna resta nell&apos;ordine.
        </li>
        <li>Link di accesso: cancellati un giorno dopo la scadenza (scadono dopo 15 minuti).</li>
        <SocialSignInRetention locale="it" />
        <li>Indirizzi IP cifrati usati per la sicurezza: 24 ore.</li>
        <li>
          <AdSentence locale="it" name="retention">
            La tua scelta sui cookie: 6 mesi, poi lo richiediamo. Cookie di Meta: fino a 90 giorni, o finché non li rifiuti.
          </AdSentence>
        </li>
        <li>
          Se hai accettato i cookie di Meta al momento dell&apos;ordine: il riferimento e i dati del browser usati per l&apos;evento di
          acquisto, finché conserviamo l&apos;ordine.
        </li>
        <li>Messaggi di assistenza: per il tempo necessario a gestire la richiesta, poi fino a 2 anni.</li>
      </UL>

      <H2>6. I tuoi diritti</H2>
      <P>
        Puoi chiederci di accedere ai tuoi dati, correggerli o cancellarli, limitarne l&apos;uso o opporti, e riceverli in un formato
        portabile. Alcuni dati (ad esempio le fatture) dobbiamo conservarli per legge anche se ne chiedi la cancellazione. Per una richiesta
        scrivi a <V>{COMPANY.privacyEmail}</V>; rispondiamo entro un mese. Puoi anche presentare reclamo all&apos;autorità di protezione dei
        dati: la nostra è <V>{COMPANY.supervisoryAuthorityIt}</V>.
      </P>

      <H2>7. Sicurezza</H2>
      <P>
        I dati di installazione della tua eSIM compaiono solo in una pagina privata dell&apos;ordine con un link non indovinabile e nel tuo
        account dopo l&apos;accesso. Per un ordine SIM, la pagina mostra anche l&apos;indirizzo di consegna. Tratta il link come una password.
        L&apos;accesso ai nostri sistemi è limitato al personale che ne ha bisogno e ogni accesso del personale viene registrato.
      </P>

      <H2>8. Modifiche</H2>
      <P>
        Se modifichiamo questa informativa, aggiorniamo la data in alto. Le modifiche importanti saranno annunciate sul sito. Vedi anche i
        nostri{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Termini e condizioni
        </Link>{" "}
        e la{" "}
        <Link href="/refunds" className="font-semibold text-orange hover:underline">
          Politica di rimborso
        </Link>
        .
      </P>
    </>
  );
}
