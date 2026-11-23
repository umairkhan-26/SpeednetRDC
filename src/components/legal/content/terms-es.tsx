import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function TermsEs() {
  return (
    <>
      <P>
        Estos términos se aplican cuando compras un plan de datos eSIM en este sitio. Al hacer un pedido, los aceptas. Lee también nuestra{" "}
        <Link href="/privacy" className={linkClass}>
          Política de privacidad
        </Link>{" "}
        y nuestra{" "}
        <Link href="/refunds" className={linkClass}>
          Política de reembolsos
        </Link>
        .
      </P>

      <H2>1. Quiénes somos</H2>
      <P>
        Este sitio está operado por <V>{COMPANY.legalNameEs}</V>, con domicilio en <V>{COMPANY.addressEs}</V>, número de empresa{" "}
        <V>{COMPANY.registrationNumber}</V>, número de IVA <V>{COMPANY.vatNumber}</V>. Contacto: <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. Qué compras</H2>
      <UL>
        <li>
          Un plan eSIM de prepago, solo de datos, para el destino, la cantidad de datos y el periodo de validez que se indican en tu pedido.
          No incluye número de teléfono para llamadas ni SMS, salvo que el plan indique lo contrario.
        </li>
        <li>
          La conectividad la proporciona nuestro socio de red y sus redes asociadas en cada destino. Las velocidades y la cobertura dependen
          de las redes locales y no están garantizadas.
        </li>
        <li>
          <strong>Dónde funciona:</strong> un plan solo funciona en los países que figuran en su página de plan y en la página de tu
          pedido. Nombres de planes como «Caribe» o «Europa» pueden cubrir solo parte de los países, así que comprueba la lista antes de
          comprar. Fuera de esos países, tu eSIM no te dará acceso a internet, aunque tu teléfono muestre señal de red. Si compraste un
          plan que no cubre tu destino, avísanos antes de usarlo: consulta nuestra{" "}
          <Link href="/refunds" className={linkClass}>
            Política de reembolsos
          </Link>
          .
        </li>
        <li>
          Necesitas un dispositivo compatible con eSIM y no bloqueado por un operador. Consulta la{" "}
          <Link href="/device-compatibility" className={linkClass}>
            lista de compatibilidad
          </Link>{" "}
          antes de comprar.
        </li>
      </UL>

      <H2>3. Pedidos y pago</H2>
      <UL>
        <li>
          Los precios se indican en euros. El precio del plan y la línea «Impuestos y tasas» que se muestran al pagar forman el total que
          pagas; el total de la página de pago es definitivo e incluye el IVA cuando corresponde. Pagas el importe completo al hacer el
          pedido, a través de nuestro proveedor de pagos, Stripe.
        </li>
        <li>
          El contrato se celebra cuando se confirma tu pago. Podemos cancelar y reembolsar íntegramente un pedido si no podemos cumplirlo
          (por ejemplo, por un error de precio o porque el plan ya no está disponible).
        </li>
        <li>
          Debes facilitar una dirección de correo electrónico válida: ahí se entrega tu eSIM y con ella inicias sesión en «Mis eSIM».
        </li>
      </UL>

      <H2>4. Entrega e instalación</H2>
      <UL>
        <li>
          Te enviamos por correo un enlace privado a la página de tu pedido con el código QR de tu eSIM y las instrucciones de instalación,
          normalmente unos minutos después del pago.
        </li>
        <li>
          Si tienes un problema, usa «Informar de un problema» en tu cuenta (o escribe a <V>{COMPANY.supportEmail}</V>) indicando tu número
          de pedido: nuestro equipo ve de qué SIM se trata y te responde en la misma conversación.
        </li>
        <li>
          Mantén ese enlace en privado: cualquiera que lo tenga puede instalar tu eSIM. Normalmente una eSIM solo se puede instalar una
          vez; si la eliminas de tu dispositivo, puede que no se pueda volver a instalar.
        </li>
        <li>
          Instala la eSIM mientras tengas conexión a internet, idealmente antes de viajar. Eres responsable de la instalación y de los
          ajustes de tu dispositivo (por ejemplo, activar el roaming de datos para la línea eSIM).
        </li>
      </UL>

      <H2>5. Validez del plan</H2>
      <UL>
        <li>
          Tu plan empieza la primera vez que tu dispositivo se conecta a una red de un país cubierto por el plan (no al comprarlo ni al
          instalarlo), salvo que la descripción del plan indique otra cosa.
        </li>
        <li>
          Termina cuando se agota su periodo de validez o sus datos, lo que ocurra primero. Los datos y la validez no utilizados no se
          reembolsan ni se trasladan.
        </li>
      </UL>

      <H2>6. Uso justo y legal</H2>
      <P>
        Solo puedes usar el servicio de forma legal y para uso personal. No puedes revenderlo, usarlo en equipos que conecten automáticamente
        otros dispositivos o máquinas (salvo que el plan lo permita), ni usarlo de forma que perjudique a la red o a otros usuarios.
        Podemos suspender un servicio que se utilice incumpliendo estas normas.
      </P>

      <H2>7. Derecho de desistimiento</H2>
      <P>
        Si eres consumidor en la UE o en el Reino Unido, normalmente dispones de 14 días para desistir de un contrato a distancia. Una eSIM
        es contenido digital que entregamos inmediatamente después del pago: por eso, al pagar te pedimos que aceptes la entrega inmediata y
        que reconozcas que pierdes ese derecho una vez entregada la eSIM; lo confirmamos en tu correo de pedido. Si cambias de opinión antes
        de que se entregue tu eSIM, te reembolsamos el importe íntegro.{" "}
        El funcionamiento práctico de los reembolsos se describe en nuestra{" "}
        <Link href="/refunds" className={linkClass}>
          Política de reembolsos
        </Link>
        . Nada de lo dispuesto en estos términos afecta a tus derechos legales.
      </P>

      <H2>8. Nuestra responsabilidad</H2>
      <P>
        Si el servicio no funciona como se describe y no podemos solucionarlo, te reembolsamos conforme a la Política de reembolsos. No
        somos responsables de las pérdidas que no fueran previsibles, de las pérdidas empresariales ni de los problemas causados por tu
        dispositivo, sus ajustes o hechos ajenos a nuestro control razonable (como una caída de la red local). Nada de lo dispuesto en estos
        términos limita una responsabilidad que no pueda limitarse por ley, incluida la derivada de muerte o lesiones personales causadas
        por negligencia, o de fraude.
      </P>

      <H2>9. Cambios en estos términos</H2>
      <P>
        Podemos actualizar estos términos. Se aplica a tu pedido la versión que aparecía en este sitio cuando lo hiciste.
      </P>

      <H2>10. Derecho aplicable y reclamaciones</H2>
      <P>
        Estos términos se rigen por el derecho de <V>{COMPANY.governingLawEs}</V>. Si eres consumidor, conservas además la protección de las
        normas imperativas del país en el que resides y puedes acudir a sus tribunales. Si tienes una reclamación, contáctanos primero en{" "}
        <V>{COMPANY.supportEmail}</V>: haremos todo lo posible por resolverla. Organismo de mediación de consumo:{" "}
        <V>{COMPANY.mediationBodyEs}</V>.
      </P>

      <H2 id="legal-notice">11. Aviso legal</H2>
      <UL>
        <li>
          <strong>Empresa:</strong> <V>{COMPANY.legalNameEs}</V>
        </li>
        <li>
          <strong>Domicilio:</strong> <V>{COMPANY.addressEs}</V>
        </li>
        <li>
          <strong>Número de empresa (BCE/KBO):</strong> <V>{COMPANY.registrationNumber}</V>
        </li>
        <li>
          <strong>Número de IVA:</strong> <V>{COMPANY.vatNumber}</V>
        </li>
        <li>
          <strong>Correo electrónico:</strong> <V>{COMPANY.supportEmail}</V>
        </li>
      </UL>
    </>
  );
}
