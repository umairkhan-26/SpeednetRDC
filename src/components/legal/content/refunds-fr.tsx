import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function RefundsFr() {
  return (
    <>
      <P>
        Nous voulons que chaque eSIM fonctionne. Si ce n’est pas le cas, écrivez-nous à <V>{COMPANY.supportEmail}</V> avec votre numéro de
        commande (ORD-…) et nous vous aiderons, ou nous vous rembourserons comme décrit ci-dessous. Cette politique fait partie de nos{" "}
        <Link href="/terms" className={linkClass}>
          Conditions générales
        </Link>{" "}
        et n’affecte pas vos droits légaux.
      </P>

      <H2>1. Quand votre eSIM est-elle « activée » ?</H2>
      <P>
        Votre eSIM est <strong>activée</strong> le jour où elle se connecte pour la première fois à un réseau mobile dans un pays couvert et
        où votre forfait démarre (c’est aussi à ce moment que commence la durée de validité du forfait). L’achat de l’eSIM, la réception de
        l’e-mail ou l’installation du QR code sur votre téléphone ne l’active <strong>pas</strong>. Si vous n’avez jamais installé votre
        eSIM, ou si vous l’avez installée mais qu’elle ne s’est jamais connectée à un réseau, elle n’a pas été activée.
      </P>

      <H2>2. Remboursement intégral</H2>
      <P>Vous êtes intégralement remboursé si :</P>
      <UL>
        <li>
          votre eSIM n’a <strong>jamais été activée</strong> (jamais installée, ou installée mais jamais connectée) et n’a pas expiré :
          demandez-nous à tout moment avant son expiration et nous vous rembourserons intégralement ; ou
        </li>
        <li>
          votre eSIM a été activée et vous en faites la demande dans les <V>{POLICY.refundWindowDays}</V> jours suivant la date d’activation,
          et elle ne fonctionne pas dans la destination pour laquelle elle a été vendue à cause d’un problème de notre côté ou de celui de
          notre partenaire réseau que nous ne pouvons pas résoudre dans un délai raisonnable ; ou
        </li>
        <li>nous n’avons pas pu vous livrer votre eSIM ; ou</li>
        <li>
          vous avez acheté un forfait qui ne couvre pas les pays dont vous avez besoin (par exemple un forfait régional qui exclut votre
          destination), le forfait n’a pas été utilisé, et vous nous prévenez dans les <V>{POLICY.coverageSwitchDays}</V> jours suivant
          l’activation (ou à tout moment s’il n’a jamais été activé) : nous vous remboursons intégralement ou, si vous préférez, nous vous
          faisons passer à un forfait qui couvre votre destination (vous ne payez alors que la différence de prix) ; ou
        </li>
        <li>vous avez été débité deux fois pour la même commande.</li>
      </UL>

      <H2>3. Quand nous ne pouvons pas rembourser</H2>
      <UL>
        <li>
          L’eSIM a été activée il y a plus de <V>{POLICY.refundWindowDays}</V> jours, ou le forfait a été utilisé, et l’eSIM fonctionne comme
          décrit.
        </li>
        <li>Les données ou la durée de validité sont épuisées ou ont expiré.</li>
        <li>
          Votre appareil n’est pas compatible eSIM ou est verrouillé par un opérateur — veuillez consulter la{" "}
          <Link href="/device-compatibility" className={linkClass}>
            liste de compatibilité
          </Link>{" "}
          avant d’acheter. Si l’eSIM n’a jamais été activée, la règle du remboursement intégral ci-dessus s’applique toujours.
        </li>
        <li>
          L’eSIM a été supprimée de votre appareil après son installation, ou ses réglages ont été modifiés (par exemple, l’itinérance des
          données a été désactivée).
        </li>
      </UL>
      <P>
        Nous examinons chaque cas individuellement — si un problème survient qui n’est pas prévu ici, contactez-nous et nous resterons
        équitables.
      </P>

      <H2>4. Comment les remboursements sont versés</H2>
      <P>
        Nous visons à examiner chaque demande dans un délai de 24 à 48 heures ouvrables. Les remboursements sont effectués sur la carte ou
        le moyen de paiement que vous avez utilisé, via Stripe, généralement dans les 5 à 10 jours ouvrables suivant notre accord, selon
        votre banque. Une fois une commande remboursée, nous pouvons désactiver son eSIM.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>Cartes SIM</H2>
          <P>{pendingAnswer("returns", "fr")}</P>
          <P>Les forfaits de données que vous ajoutez à une carte SIM suivent les règles ci-dessus pour les forfaits.</P>
        </>
      )}

      <H2>5. Votre droit de rétractation</H2>
      <P>
        Les consommateurs de l’UE et du Royaume-Uni peuvent aussi bénéficier d’un droit légal de rétractation — voir l’article 7 de nos{" "}
        <Link href="/terms" className={linkClass}>
          Conditions générales
        </Link>
        .
      </P>
    </>
  );
}
