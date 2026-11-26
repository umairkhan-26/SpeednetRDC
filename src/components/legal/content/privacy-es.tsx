import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";
import { AdSentence, ExtraAdCookies, ExtraAdSharing } from "./ad-partners";
import { SocialSignInCookies, SocialSignInData, SocialSignInRetention } from "./social-sign-in";

const linkClass = "font-semibold text-orange hover:underline";

export default function PrivacyEs() {
  return (
    <>
      <P>
        Esta política explica qué datos personales recoge {COMPANY.tradingName} cuando usas este sitio y compras una eSIM o una tarjeta SIM, por qué los
        recoge, con quién los comparte, cuánto tiempo los conserva y cuáles son tus derechos. Recogemos solo lo necesario para venderte y
        entregarte tu eSIM o tarjeta SIM.
      </P>

      <H2>1. Quiénes somos</H2>
      <P>
        El responsable del tratamiento es <V>{COMPANY.legalNameEs}</V>, con domicilio en <V>{COMPANY.addressEs}</V> (número de empresa{" "}
        <V>{COMPANY.registrationNumber}</V>, número de IVA <V>{COMPANY.vatNumber}</V>). Para cualquier pregunta o solicitud sobre
        privacidad, escribe a <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. Qué recogemos y por qué</H2>
      <UL>
        <li>
          <strong>Tu pedido:</strong> tu nombre, tu correo electrónico, el plan y el destino elegidos, el precio y la fecha del pedido, para
          venderte la eSIM o la tarjeta SIM, enviártela y conservar los registros que exige la ley. Base jurídica: ejecución de nuestro contrato contigo y
          obligaciones legales (contabilidad e impuestos).
        </li>
        <li>
          <strong>País de facturación:</strong> el país de la dirección de facturación de tu tarjeta, según nos lo comunica nuestro proveedor
          de pagos, para fines de IVA y prevención del fraude. No conservamos el resto de tu dirección de facturación. Sobre la dirección de entrega de una tarjeta SIM, véase «Entrega de la tarjeta SIM». Base jurídica: obligación legal e
          interés legítimo.
        </li>
        <li>
          <strong>Entrega de la tarjeta SIM:</strong> si pides una tarjeta SIM, el nombre y la dirección postal que indicas para la entrega en la página de pago de Stripe, para enviarte la tarjeta, mostrarte adónde se envía y cumplimentar una declaración de aduana cuando sea necesaria. También registramos el número de la tarjeta, la fecha de envío, el número de seguimiento si lo hay y la fecha de entrega. Base jurídica: ejecución de nuestro contrato contigo y obligaciones legales (aduanas).
        </li>
        <li>
          <strong>Pago:</strong> pagas en la página segura de Stripe. Stripe trata los datos de tu tarjeta; nosotros nunca vemos ni
          conservamos tu número de tarjeta. Recibimos una referencia de pago y la confirmación de que el pago se realizó.
        </li>
        <li>
          <strong>Tu eSIM o tarjeta SIM y su uso:</strong> los identificadores SIM asignados a tu pedido (ICCID y número de teléfono/MSISDN) y, de nuestro
          socio de red, el estado de la SIM, la fecha de su activación y de su última conexión, el país desde el que se conectó por última
          vez, los datos que te quedan y la caducidad del plan, para prestar el servicio, atender solicitudes de asistencia y prevenir
          abusos. Base jurídica: ejecución de nuestro contrato e interés legítimo. No vemos el contenido de tu navegación ni de tus
          comunicaciones.
        </li>
        <li>
          <strong>Inicio de sesión:</strong> cuando pides un enlace de acceso, conservamos un código de un solo uso asociado a tu correo
          electrónico. Base jurídica: ejecución de nuestro contrato.
        </li>
        <SocialSignInData locale="es" />
        <li>
          <strong>Seguridad:</strong> para impedir que se adivinen enlaces de acceso y contraseñas, contamos los intentos fallidos usando una
          forma codificada (hash) de tu dirección IP, que eliminamos tras 24 horas. No conservamos tu dirección IP junto con tu pedido. Base
          jurídica: interés legítimo (seguridad de las cuentas y del servicio).
        </li>
        <li>
          <strong>Mensajes que nos envías:</strong> si contactas con la asistencia por correo o con «Informar de un problema» en tu cuenta,
          el contenido de tu mensaje, el problema elegido, el pedido y la SIM afectados y nuestras respuestas, para ayudarte. Para responder,
          también consultamos el estado de esa SIM con nuestro socio de red (véase más arriba). Base jurídica: ejecución de nuestro contrato
          e interés legítimo.
        </li>
      </UL>
      <P>
        <AdSentence locale="es" name="noSale">
          No vendemos tus datos personales. Solo compartimos información limitada con Meta, para medir y mejorar nuestros anuncios, si aceptas
          las cookies de Meta (véase el apartado 3).
        </AdSentence>
      </P>

      <H2 id="cookies">3. Cookies</H2>
      <P>
        <strong>Cookies necesarias para el funcionamiento del sitio</strong> (siempre activas):
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong>: recuerda el idioma elegido.
        </li>
        <li>
          <strong>customer_session</strong>: mantiene tu sesión iniciada en «Mis eSIM» hasta 30 días después de usar un enlace de acceso. Se
          elimina al cerrar sesión.
        </li>
        <li>
          <AdSentence locale="es" name="consentCookie">
            <strong>snrdc_consent</strong>: recuerda si aceptaste o rechazaste las cookies de Meta, durante 6 meses.
          </AdSentence>
        </li>
        <SocialSignInCookies locale="es" />
      </UL>
      <P>
        <strong>Cookies publicitarias de Meta (Facebook)</strong> (solo si las aceptas): en tu primera visita te preguntamos si las aceptas.
        No se carga nada de Meta hasta que pulsas «Aceptar», y no se envía nada a Meta si pulsas «Rechazar». Si aceptas, el Píxel de Meta
        instala la cookie <strong>_fbp</strong> (y <strong>_fbc</strong> si llegas desde un anuncio de Meta), que se conserva hasta 90 días,
        y le comunicamos a Meta:
      </P>
      <UL>
        <li>las páginas que visitas, el plan que estás viendo, cuándo eliges un plan y cuándo empiezas el pago;</li>
        <li>
          en una compra: el valor del pedido, la moneda y el plan, tu correo electrónico y tu país de facturación de forma codificada
          (hash), los identificadores de navegador de Meta mencionados antes y el tipo de navegador. Enviamos la compra desde nuestro
          servidor (API de Conversiones de Meta) y también desde tu navegador, con la misma referencia, para que Meta la cuente una sola
          vez. Nunca enviamos tu nombre, la dirección IP desde nuestro servidor ni tus datos de pago.
        </li>
      </UL>
      <P>
        Usamos esta información para medir la eficacia de nuestros anuncios y mostrarlos a personas que puedan estar interesadas. Base
        jurídica: tu consentimiento. Respecto a la recogida de esta información y su transmisión a Meta, nosotros y Meta Platforms Ireland
        Ltd somos corresponsables del tratamiento; el uso posterior que Meta haga de ella se rige por la propia política de privacidad de
        Meta (facebook.com/privacy/policy).
      </P>
      <ExtraAdCookies locale="es" />
      <P>
        Puedes cambiar tu decisión en cualquier momento con «Configuración de cookies» al pie de cada página. Elegir «Rechazar» detiene el Píxel
        de Meta y elimina sus cookies de tu navegador; la información ya enviada a Meta permanece en Meta. Stripe instala sus propias
        cookies en su página de pago para prevenir el fraude.
      </P>

      <H2>4. Con quién compartimos los datos</H2>
      <P>
        Solo con los proveedores que los necesitan para que el servicio funcione, en virtud de contratos que les obligan a protegerlos:
      </P>
      <UL>
        <li>Stripe (procesamiento de pagos y prevención del fraude);</li>
        <li>nuestro socio de red móvil, que proporciona la eSIM o la tarjeta SIM y la conectividad;</li>
        <li>si pides una tarjeta SIM: los servicios postales y de mensajería y, cuando se necesite una declaración de aduana, las autoridades aduaneras;</li>
        <li>Resend (envío de los correos de pedido y de acceso, desde servidores situados en la UE);</li>
        <li>Hostinger (alojamiento del sitio y de la base de datos);</li>
        <li>Meta Platforms Ireland Ltd (medición publicitaria), solo si aceptas las cookies de Meta;</li>
        <ExtraAdSharing locale="es" />
        <li>las autoridades, cuando la ley lo exija.</li>
      </UL>
      <P>
        Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso, la transferencia está protegida por una
        decisión de adecuación o por las cláusulas contractuales tipo de la Comisión Europea.
      </P>

      <H2>5. Cuánto tiempo los conservamos</H2>
      <UL>
        <li>
          Pedidos, pagos y facturas: <V>{POLICY.orderRecordYears}</V> años, como exigen la contabilidad y la normativa fiscal.
        </li>
        <li>Información sobre el estado de la SIM: mientras conservemos el pedido al que se refiere.</li>
        <li>
          Nombre y dirección de entrega de un pedido de tarjeta SIM: los eliminamos de nuestros registros <V>{POLICY.shippingAddressMonths}</V> meses después de la entrega (si no consta la fecha de entrega, después del envío de la tarjeta; si el pedido se reembolsa antes del envío, después de la fecha del pedido). El país de entrega se conserva con el pedido.
        </li>
        <li>Enlaces de acceso: se eliminan un día después de que caduquen (caducan a los 15 minutos).</li>
        <SocialSignInRetention locale="es" />
        <li>Direcciones IP codificadas usadas para la seguridad: 24 horas.</li>
        <li>
          <AdSentence locale="es" name="retention">
            Tu decisión sobre las cookies: 6 meses, tras los cuales te la volvemos a preguntar. Cookies de Meta: hasta 90 días, o hasta que
            las rechaces.
          </AdSentence>
        </li>
        <li>
          Si aceptaste las cookies de Meta al hacer tu pedido: la referencia y la información del navegador usadas para el evento de
          compra, mientras conservemos el pedido.
        </li>
        <li>Mensajes de asistencia: el tiempo necesario para tramitar tu solicitud y después hasta 2 años.</li>
      </UL>

      <H2>6. Tus derechos</H2>
      <P>
        Puedes pedirnos que te demos acceso a tus datos personales, que los rectifiquemos o los eliminemos, que limitemos su uso o te
        opongas a él, y recibirlos en un formato portable. La ley obliga a conservar algunos datos (por ejemplo, las facturas) aunque pidas
        su eliminación. Para presentar una solicitud, escribe a <V>{COMPANY.privacyEmail}</V>; respondemos en el plazo de un mes. También
        puedes presentar una reclamación ante tu autoridad de protección de datos; la nuestra es <V>{COMPANY.supervisoryAuthorityEs}</V>.
      </P>

      <H2>7. Seguridad</H2>
      <P>
        Los datos de instalación de tu eSIM solo se muestran en una página de pedido privada, a la que se accede mediante un enlace
        imposible de adivinar, y en tu cuenta con sesión iniciada. En un pedido de tarjeta SIM, esa página muestra también tu dirección de entrega. Trata ese enlace como una contraseña. El acceso a nuestros sistemas se
        limita al personal que lo necesita y se registra cada inicio de sesión del personal.
      </P>

      <H2>8. Cambios</H2>
      <P>
        Si cambiamos esta política, actualizaremos la fecha que figura al principio de la página. Los cambios importantes se anunciarán en
        este sitio. Consulta también nuestros{" "}
        <Link href="/terms" className={linkClass}>
          Términos y condiciones
        </Link>{" "}
        y nuestra{" "}
        <Link href="/refunds" className={linkClass}>
          Política de reembolsos
        </Link>
        .
      </P>
    </>
  );
}
