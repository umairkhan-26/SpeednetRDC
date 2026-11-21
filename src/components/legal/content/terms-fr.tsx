import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function TermsFr() {
  return (
    <>
      <P>
        Ces conditions s’appliquent lorsque vous achetez un forfait de données eSIM sur ce site. En passant commande, vous les acceptez.
        Veuillez également lire notre{" "}
        <Link href="/privacy" className={linkClass}>
          Politique de confidentialité
        </Link>{" "}
        et notre{" "}
        <Link href="/refunds" className={linkClass}>
          Politique de remboursement
        </Link>
        .
      </P>

      <H2>1. Qui sommes-nous</H2>
      <P>
        {COMPANY.tradingName} est exploité par <V>{COMPANY.legalNameFr}</V>, dont le siège est situé <V>{COMPANY.addressFr}</V>, numéro
        d’entreprise <V>{COMPANY.registrationNumber}</V>, numéro de TVA <V>{COMPANY.vatNumber}</V>. Contact : <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. Ce que vous achetez</H2>
      <UL>
        <li>
          Un forfait eSIM prépayé, data uniquement, pour la destination, le volume de données et la durée de validité indiqués lors de votre
          commande. Il ne comporte pas de numéro de téléphone pour les appels ou les SMS, sauf indication contraire du forfait.
        </li>
        <li>
          La connectivité est fournie par notre partenaire réseau et ses réseaux partenaires dans chaque destination. Les débits et la
          couverture dépendent des réseaux locaux et ne sont pas garantis.
        </li>
        <li>
          <strong>Où il fonctionne :</strong> un forfait ne fonctionne que dans les pays indiqués sur sa page de forfait et sur votre page de
          commande. Des noms de forfaits comme « Caraïbes » ou « Europe » peuvent ne couvrir qu’une partie des pays : vérifiez donc la liste
          avant d’acheter. En dehors de ces pays, votre eSIM ne vous donnera pas accès à Internet, même si votre téléphone affiche du réseau.
          Si vous avez acheté un forfait qui ne couvre pas votre destination, prévenez-nous avant de l’utiliser : voir notre{" "}
          <Link href="/refunds" className={linkClass}>
            Politique de remboursement
          </Link>
          .
        </li>
        <li>
          Il vous faut un appareil compatible eSIM et non verrouillé par un opérateur. Consultez la{" "}
          <Link href="/device-compatibility" className={linkClass}>
            liste de compatibilité
          </Link>{" "}
          avant d’acheter.
        </li>
      </UL>

      <H2>3. Commandes et paiement</H2>
      <UL>
        <li>
          Les prix sont indiqués en euros. Le prix du forfait et la ligne « Taxes et frais » affichés au paiement forment le total que vous
          payez ; le total de la page de paiement est définitif et inclut la TVA lorsqu’elle s’applique. Vous payez la totalité au moment de
          la commande, via notre prestataire de paiement, Stripe.
        </li>
        <li>
          Le contrat est conclu lorsque votre paiement est confirmé. Nous pouvons annuler et rembourser intégralement une commande si nous
          ne pouvons pas la fournir (par exemple en cas d’erreur de prix ou de forfait qui n’est plus disponible).
        </li>
        <li>
          Vous devez fournir une adresse e-mail valide : c’est là que votre eSIM est livrée et c’est avec elle que vous vous connectez à « Mes
          eSIM ».
        </li>
      </UL>

      <H2>4. Livraison et installation</H2>
      <UL>
        <li>
          Nous vous envoyons par e-mail un lien privé vers votre page de commande avec le QR code de votre eSIM et les instructions
          d’installation, en général quelques minutes après le paiement.
        </li>
        <li>
          En cas de problème, utilisez « Signaler un problème » dans votre compte (ou écrivez à <V>{COMPANY.supportEmail}</V>) en indiquant
          votre numéro de commande : notre équipe voit de quelle SIM il s’agit et vous répond dans la même conversation.
        </li>
        <li>
          Gardez ce lien privé : toute personne qui l’a peut installer votre eSIM. Une eSIM ne peut normalement être installée qu’une seule
          fois ; si vous la supprimez de votre appareil, il peut être impossible de la réinstaller.
        </li>
        <li>
          Installez l’eSIM tant que vous avez une connexion Internet, idéalement avant de voyager. Vous êtes responsable de l’installation et
          des réglages de votre appareil (par exemple, activer l’itinérance des données pour la ligne eSIM).
        </li>
      </UL>

      <H2>5. Validité du forfait</H2>
      <UL>
        <li>
          Votre forfait démarre la première fois que votre appareil se connecte à un réseau d’un pays couvert par le forfait (et non lors de
          l’achat ou de l’installation), sauf indication contraire dans la description du forfait.
        </li>
        <li>
          Il prend fin lorsque sa durée de validité est écoulée ou que ses données sont épuisées, selon l’événement qui survient en premier.
          Les données et la validité non utilisées ne sont ni remboursées ni reportées.
        </li>
      </UL>

      <H2>6. Utilisation loyale et licite</H2>
      <P>
        Vous ne pouvez utiliser le service que de manière licite et à titre personnel. Vous ne pouvez pas le revendre, l’utiliser dans un
        équipement qui connecte automatiquement d’autres appareils ou machines (sauf si le forfait l’autorise), ni l’utiliser d’une manière
        qui nuit au réseau ou aux autres utilisateurs. Nous pouvons suspendre un service utilisé en violation de ces règles.
      </P>

      <H2>7. Droit de rétractation</H2>
      <P>
        Si vous êtes un consommateur dans l’UE ou au Royaume-Uni, vous disposez normalement de 14 jours pour vous rétracter d’un contrat à
        distance. Une eSIM est un contenu numérique que nous livrons immédiatement après le paiement : au moment du paiement, nous vous
        demandons donc d’accepter la livraison immédiate et de reconnaître que vous perdez ce droit une fois l’eSIM livrée ; nous le
        confirmons dans votre e-mail de commande. Si vous changez d’avis avant que votre eSIM ne soit livrée, nous vous remboursons
        intégralement.{" "}
        Le fonctionnement concret des remboursements est décrit dans notre{" "}
        <Link href="/refunds" className={linkClass}>
          Politique de remboursement
        </Link>
        . Rien dans ces conditions n’affecte vos droits légaux.
      </P>

      <H2>8. Notre responsabilité</H2>
      <P>
        Si le service ne fonctionne pas comme décrit et que nous ne pouvons pas le réparer, nous vous remboursons comme prévu dans la
        Politique de remboursement. Nous ne sommes pas responsables des pertes qui n’étaient pas prévisibles, des pertes professionnelles,
        ni des problèmes causés par votre appareil, ses réglages ou des événements échappant à notre contrôle raisonnable (comme une panne
        de réseau locale). Rien dans ces conditions ne limite une responsabilité qui ne peut pas être limitée par la loi, notamment en cas
        de décès ou de dommage corporel causé par une négligence, ou en cas de fraude.
      </P>

      <H2>9. Modification des conditions</H2>
      <P>
        Nous pouvons mettre à jour ces conditions. La version applicable à votre commande est celle affichée sur ce site au moment où vous
        l’avez passée.
      </P>

      <H2>10. Droit applicable et litiges</H2>
      <P>
        Ces conditions sont régies par le droit de <V>{COMPANY.governingLawFr}</V>. Si vous êtes un consommateur, vous conservez aussi la
        protection des lois impératives du pays où vous vivez et vous pouvez saisir ses tribunaux. Si vous avez une réclamation,
        veuillez d’abord nous contacter à <V>{COMPANY.supportEmail}</V> : nous ferons de notre mieux pour la résoudre. Organisme de médiation
        de la consommation : <V>{COMPANY.mediationBodyFr}</V>.
      </P>

      <H2>11. Mentions légales</H2>
      <UL>
        <li>
          <strong>Société :</strong> <V>{COMPANY.legalNameFr}</V>, sous le nom commercial {COMPANY.tradingName}
        </li>
        <li>
          <strong>Siège :</strong> <V>{COMPANY.addressFr}</V>
        </li>
        <li>
          <strong>Numéro d’entreprise (BCE/KBO) :</strong> <V>{COMPANY.registrationNumber}</V>
        </li>
        <li>
          <strong>Numéro de TVA :</strong> <V>{COMPANY.vatNumber}</V>
        </li>
        <li>
          <strong>E-mail :</strong> <V>{COMPANY.supportEmail}</V>
        </li>
      </UL>
    </>
  );
}
