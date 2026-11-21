import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function PrivacyFr() {
  return (
    <>
      <P>
        Cette politique explique quelles données personnelles {COMPANY.tradingName} collecte lorsque vous utilisez ce site et achetez une
        eSIM, pourquoi, avec qui nous les partageons, combien de temps nous les conservons et quels sont vos droits. Nous collectons le strict
        nécessaire pour vous vendre et vous livrer votre eSIM.
      </P>

      <H2>1. Qui sommes-nous</H2>
      <P>
        Le responsable du traitement est <V>{COMPANY.legalName}</V>, sous le nom commercial {COMPANY.tradingName}, dont le siège est situé{" "}
        <V>{COMPANY.address}</V> (numéro d’entreprise <V>{COMPANY.registrationNumber}</V>, numéro de TVA <V>{COMPANY.vatNumber}</V>). Pour
        toute question ou demande relative à la vie privée, écrivez à <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. Ce que nous collectons et pourquoi</H2>
      <UL>
        <li>
          <strong>Votre commande :</strong> votre nom, votre adresse e-mail, le forfait et la destination choisis, le prix et la date de la
          commande — pour vous vendre l’eSIM, vous l’envoyer et conserver les documents exigés par la loi. Base légale : exécution de notre
          contrat avec vous et nos obligations légales (comptabilité et fiscalité).
        </li>
        <li>
          <strong>Pays de facturation :</strong> le pays de l’adresse de facturation de votre carte, tel que communiqué par notre prestataire
          de paiement — à des fins de TVA et de prévention de la fraude. Nous ne conservons pas le reste de votre adresse. Base légale :
          obligation légale et intérêts légitimes.
        </li>
        <li>
          <strong>Paiement :</strong> vous payez sur la page sécurisée de Stripe. Stripe traite les données de votre carte ; nous ne voyons ni
          ne conservons jamais votre numéro de carte. Nous recevons une référence de paiement et l’indication de la réussite du paiement.
        </li>
        <li>
          <strong>Votre eSIM et son utilisation :</strong> les identifiants SIM attribués à votre commande (ICCID et numéro de
          téléphone/MSISDN) et, de la part de notre partenaire réseau, l’état de la SIM, la date de son activation et de sa dernière
          connexion, le pays depuis lequel elle s’est connectée en dernier, ainsi que vos données restantes et l’expiration du forfait — pour
          fournir le service, répondre aux demandes d’assistance et prévenir les abus. Base légale : exécution de notre contrat et intérêts
          légitimes. Nous ne voyons pas le contenu de votre navigation ni de vos communications.
        </li>
        <li>
          <strong>Connexion :</strong> lorsque vous demandez un lien de connexion, nous conservons un code à usage unique associé à votre
          adresse e-mail. Base légale : exécution de notre contrat.
        </li>
        <li>
          <strong>Sécurité :</strong> pour empêcher que l’on devine des liens de connexion et des mots de passe, nous comptons les
          tentatives échouées à l’aide d’une forme brouillée (hachée) de votre adresse IP, que nous supprimons après 24 heures. Nous ne
          conservons pas votre adresse IP avec votre commande. Base légale : intérêts légitimes (sécurité des comptes et du service).
        </li>
        <li>
          <strong>Messages que vous nous envoyez :</strong> si vous contactez l’assistance par e-mail ou avec « Signaler un problème » dans
          votre compte, le contenu de votre message, le problème choisi, la commande et la SIM concernées, ainsi que nos réponses — pour vous
          aider. Pour répondre, nous consultons aussi l’état de cette SIM auprès de notre partenaire réseau (voir ci-dessus). Base légale :
          exécution de notre contrat et intérêts légitimes.
        </li>
      </UL>
      <P>
        Nous ne vendons pas vos données personnelles. Nous ne partageons des informations limitées avec Meta, pour mesurer et améliorer nos
        publicités, que si vous acceptez les cookies Meta (voir l’article 3).
      </P>

      <H2>3. Cookies</H2>
      <P>
        <strong>Cookies nécessaires au fonctionnement du site</strong> (toujours actifs) :
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong> — mémorise la langue choisie.
        </li>
        <li>
          <strong>customer_session</strong> — vous garde connecté à « Mes eSIM » pendant 30 jours au maximum après l’utilisation d’un lien
          de connexion. Supprimé lorsque vous vous déconnectez.
        </li>
        <li>
          <strong>snrdc_consent</strong> — mémorise si vous avez accepté ou refusé les cookies Meta, pendant 6 mois.
        </li>
      </UL>
      <P>
        <strong>Cookies publicitaires Meta (Facebook)</strong> (uniquement si vous les acceptez) : lors de votre première visite, nous vous
        demandons si vous les acceptez. Rien de Meta n’est chargé tant que vous n’avez pas cliqué sur « Accepter », et rien n’est envoyé à
        Meta si vous cliquez sur « Refuser ». Si vous acceptez, le Pixel Meta dépose le cookie <strong>_fbp</strong> (et{" "}
        <strong>_fbc</strong> si vous arrivez depuis une publicité Meta), conservé jusqu’à 90 jours, et nous indiquons à Meta :
      </P>
      <UL>
        <li>les pages que vous visitez, le forfait que vous consultez, le moment où vous choisissez un forfait et celui où vous commencez le paiement ;</li>
        <li>
          lors d’un achat : la valeur de la commande, la devise et le forfait, votre adresse e-mail et votre pays de facturation sous forme
          brouillée (hachée), les identifiants de navigateur de Meta mentionnés ci-dessus et votre type de navigateur. Nous envoyons l’achat
          depuis notre serveur (API de conversions de Meta) ainsi que depuis votre navigateur, avec la même référence, afin que Meta ne le
          compte qu’une fois. Nous n’envoyons jamais votre nom, l’adresse IP depuis notre serveur, ni vos données de paiement.
        </li>
      </UL>
      <P>
        Nous utilisons ces informations pour mesurer l’efficacité de nos publicités et les montrer à des personnes susceptibles d’être
        intéressées. Base légale : votre consentement. Pour la collecte de ces informations et leur transmission à Meta, nous et Meta
        Platforms Ireland Ltd sommes responsables conjoints du traitement ; l’usage que Meta en fait ensuite relève de la propre politique de
        confidentialité de Meta (facebook.com/privacy/policy).
      </P>
      <P>
        Vous pouvez modifier votre choix à tout moment avec « Paramètres des cookies » en bas de chaque page. Choisir « Refuser » arrête le
        Pixel Meta et supprime ses cookies de votre navigateur ; les informations déjà envoyées à Meta restent chez Meta. Stripe dépose ses
        propres cookies sur sa page de paiement pour prévenir la fraude.
      </P>

      <H2>4. Avec qui nous partageons les données</H2>
      <P>
        Uniquement avec les prestataires qui en ont besoin pour faire fonctionner le service, dans le cadre de contrats qui les obligent à
        les protéger :
      </P>
      <UL>
        <li>Stripe (traitement des paiements et prévention de la fraude) ;</li>
        <li>notre partenaire réseau mobile, qui fournit l’eSIM et la connectivité ;</li>
        <li>Resend (envoi des e-mails de commande et de connexion, depuis des serveurs situés dans l’UE) ;</li>
        <li>Hostinger (hébergement du site et de la base de données) ;</li>
        <li>Meta Platforms Ireland Ltd (mesure publicitaire), uniquement si vous acceptez les cookies Meta ;</li>
        <li>les autorités, lorsque la loi l’exige.</li>
      </UL>
      <P>
        Certains prestataires peuvent traiter des données en dehors de l’Espace économique européen. Dans ce cas, le transfert est protégé
        par une décision d’adéquation ou par les clauses contractuelles types de la Commission européenne.
      </P>

      <H2>5. Combien de temps nous les conservons</H2>
      <UL>
        <li>
          Commandes, paiements et factures : <V>{POLICY.orderRecordYears}</V> ans, comme l’exigent la comptabilité et la fiscalité.
        </li>
        <li>Informations sur l’état de la SIM : aussi longtemps que nous conservons la commande à laquelle elles se rapportent.</li>
        <li>Liens de connexion : supprimés un jour après leur expiration (ils expirent après 15 minutes).</li>
        <li>Adresses IP hachées utilisées pour la sécurité : 24 heures.</li>
        <li>
          Votre choix de cookies : 6 mois, après quoi nous vous le redemandons. Cookies de Meta : jusqu’à 90 jours, ou jusqu’à ce que vous
          les refusiez.
        </li>
        <li>
          Si vous avez accepté les cookies Meta lors de votre commande : la référence et les informations de navigateur utilisées pour
          l’événement d’achat, aussi longtemps que nous conservons la commande.
        </li>
        <li>Messages d’assistance : aussi longtemps que nécessaire pour traiter votre demande, puis jusqu’à 2 ans.</li>
      </UL>

      <H2>6. Vos droits</H2>
      <P>
        Vous pouvez nous demander d’accéder à vos données personnelles, de les rectifier ou de les supprimer, de limiter leur utilisation ou
        de vous y opposer, et de les recevoir dans un format portable. Certaines données doivent être conservées par la loi (par exemple
        les factures), même si vous demandez leur suppression. Pour faire une demande, écrivez à <V>{COMPANY.privacyEmail}</V> ; nous
        répondons dans un délai d’un mois. Vous pouvez aussi déposer une plainte auprès de votre autorité de protection des données — la
        nôtre est <V>{COMPANY.supervisoryAuthorityFr}</V>.
      </P>

      <H2>7. Sécurité</H2>
      <P>
        Les détails d’installation de votre eSIM ne sont affichés que sur une page de commande privée accessible par un lien impossible à
        deviner, et dans votre compte connecté. Traitez ce lien comme un mot de passe. L’accès à nos systèmes est limité au personnel qui en
        a besoin, et chaque connexion du personnel est enregistrée.
      </P>

      <H2>8. Modifications</H2>
      <P>
        Si nous modifions cette politique, nous mettrons à jour la date en haut de la page. Les changements importants seront annoncés sur
        ce site. Voir aussi nos{" "}
        <Link href="/terms" className={linkClass}>
          Conditions générales
        </Link>{" "}
        et notre{" "}
        <Link href="/refunds" className={linkClass}>
          Politique de remboursement
        </Link>
        .
      </P>
    </>
  );
}
