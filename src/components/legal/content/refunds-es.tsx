import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function RefundsEs() {
  return (
    <>
      <P>
        Queremos que cada eSIM funcione. Si no es así, escríbenos a <V>{COMPANY.supportEmail}</V> con tu número de pedido (ORD-…) y te
        ayudaremos o te reembolsaremos como se describe a continuación. Esta política forma parte de nuestros{" "}
        <Link href="/terms" className={linkClass}>
          Términos y condiciones
        </Link>{" "}
        y no afecta a tus derechos legales.
      </P>

      <H2>1. ¿Cuándo se «activa» tu eSIM?</H2>
      <P>
        Tu eSIM se <strong>activa</strong> el día en que se conecta por primera vez a una red móvil en un país cubierto y empieza tu plan
        (en ese momento también comienza el periodo de validez del plan). Comprar la eSIM, recibir el correo o instalar el código QR en tu
        teléfono <strong>no</strong> la activa. Si nunca instalaste tu eSIM, o la instalaste pero nunca se conectó a una red, no se ha
        activado.
      </P>

      <H2>2. Reembolso completo</H2>
      <P>Se te reembolsa el importe íntegro si:</P>
      <UL>
        <li>
          tu eSIM <strong>nunca se ha activado</strong> (nunca se instaló, o se instaló pero nunca se conectó) y no ha caducado: pídenoslo en
          cualquier momento antes de que caduque y te reembolsaremos el importe íntegro; o
        </li>
        <li>
          tu eSIM se activó y lo solicitas dentro de los <V>{POLICY.refundWindowDays}</V> días siguientes a la fecha de activación, y no
          funciona en el destino para el que se vendió por un problema nuestro o de nuestro socio de red que no podemos resolver en un plazo
          razonable; o
        </li>
        <li>no hemos podido entregarte tu eSIM; o</li>
        <li>
          compraste un plan que no cubre los países que necesitas (por ejemplo, un plan regional que excluye tu destino), el plan no se ha
          usado y nos avisas dentro de los <V>{POLICY.coverageSwitchDays}</V> días siguientes a la activación (o en cualquier momento si
          nunca se activó): te reembolsamos el importe íntegro o, si lo prefieres, te cambiamos a un plan que cubra tu destino (entonces solo
          pagas la diferencia de precio); o
        </li>
        <li>se te cobró dos veces por el mismo pedido.</li>
      </UL>

      <H2>3. Cuándo no podemos reembolsar</H2>
      <UL>
        <li>
          La eSIM se activó hace más de <V>{POLICY.refundWindowDays}</V> días, o el plan se ha usado, y la eSIM funciona como se describe.
        </li>
        <li>Los datos o el periodo de validez se han agotado o han caducado.</li>
        <li>
          Tu dispositivo no es compatible con eSIM o está bloqueado por un operador: consulta la{" "}
          <Link href="/device-compatibility" className={linkClass}>
            lista de compatibilidad
          </Link>{" "}
          antes de comprar. Si la eSIM nunca se activó, sigue aplicándose la norma de reembolso completo anterior.
        </li>
        <li>
          La eSIM se eliminó de tu dispositivo después de instalarla, o se cambiaron sus ajustes (por ejemplo, se desactivó el roaming de
          datos).
        </li>
      </UL>
      <P>
        Revisamos cada caso de forma individual: si surge un problema que no se contempla aquí, contáctanos y seremos justos.
      </P>

      <H2>4. Cómo se pagan los reembolsos</H2>
      <P>
        Nuestro objetivo es revisar cada solicitud en un plazo de 24 a 48 horas laborables. Los reembolsos se hacen a la tarjeta o al medio
        de pago que usaste, a través de Stripe, normalmente en un plazo de 5 a 10 días laborables desde que lo aprobamos, según tu banco.
        Una vez reembolsado un pedido, podemos desactivar su eSIM.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>Tarjetas SIM</H2>
          <P>{pendingAnswer("returns", "es")}</P>
          <P>Los planes de datos que añadas a una tarjeta SIM siguen las normas anteriores para los planes.</P>
        </>
      )}

      <H2>5. Tu derecho de desistimiento</H2>
      <P>
        Los consumidores de la UE y del Reino Unido también pueden tener un derecho legal de desistimiento: consulta el artículo 7 de
        nuestros{" "}
        <Link href="/terms" className={linkClass}>
          Términos y condiciones
        </Link>
        .
      </P>
    </>
  );
}
