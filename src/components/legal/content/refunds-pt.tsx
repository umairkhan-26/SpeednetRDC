import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function RefundsPt() {
  return (
    <>
      <P>
        Queremos que cada eSIM funcione. Se não funcionar, escreva-nos para <V>{COMPANY.supportEmail}</V> com o número da sua encomenda
        (ORD-…) e ajudaremos ou reembolsaremos como descrito abaixo. Esta política faz parte dos nossos{" "}
        <Link href="/terms" className={linkClass}>
          Termos e condições
        </Link>{" "}
        e não afeta os seus direitos legais.
      </P>

      <H2>1. Quando é que a sua eSIM é «ativada»?</H2>
      <P>
        A sua eSIM é <strong>ativada</strong> no dia em que se liga pela primeira vez a uma rede móvel num país abrangido e o seu plano
        começa (é também nesse momento que começa o período de validade do plano). Comprar a eSIM, receber o e-mail ou instalar o código QR
        no telemóvel <strong>não</strong> a ativa. Se nunca instalou a sua eSIM, ou se a instalou mas nunca se ligou a uma rede, ela não
        foi ativada.
      </P>

      <H2>2. Reembolso total</H2>
      <P>É reembolsado na totalidade se:</P>
      <UL>
        <li>
          a sua eSIM <strong>nunca foi ativada</strong> (nunca instalada, ou instalada mas nunca ligada) e não expirou: peça-nos a qualquer
          momento antes de expirar e reembolsamos a totalidade; ou
        </li>
        <li>
          a sua eSIM foi ativada e faz o pedido nos <V>{POLICY.refundWindowDays}</V> dias seguintes à data de ativação, e não funciona no
          destino para o qual foi vendida devido a um problema nosso ou do nosso parceiro de rede que não conseguimos resolver num prazo
          razoável; ou
        </li>
        <li>não conseguimos entregar-lhe a sua eSIM; ou</li>
        <li>
          comprou um plano que não abrange os países de que precisa (por exemplo, um plano regional que exclui o seu destino), o plano não
          foi utilizado e avisa-nos nos <V>{POLICY.coverageSwitchDays}</V> dias seguintes à ativação (ou a qualquer momento se nunca foi
          ativado): reembolsamos a totalidade ou, se preferir, mudamos para um plano que abranja o seu destino (paga então apenas a
          diferença de preço); ou
        </li>
        <li>foi cobrado duas vezes pela mesma encomenda.</li>
      </UL>

      <H2>3. Quando não podemos reembolsar</H2>
      <UL>
        <li>
          A eSIM foi ativada há mais de <V>{POLICY.refundWindowDays}</V> dias, ou o plano foi utilizado, e a eSIM funciona como descrito.
        </li>
        <li>Os dados ou o período de validade esgotaram-se ou expiraram.</li>
        <li>
          O seu dispositivo não é compatível com eSIM ou está bloqueado por um operador — consulte a{" "}
          <Link href="/device-compatibility" className={linkClass}>
            lista de compatibilidade
          </Link>{" "}
          antes de comprar. Se a eSIM nunca foi ativada, continua a aplicar-se a regra de reembolso total acima.
        </li>
        <li>
          A eSIM foi eliminada do seu dispositivo depois de instalada, ou as suas definições foram alteradas (por exemplo, o roaming de
          dados foi desativado).
        </li>
      </UL>
      <P>
        Analisamos cada caso individualmente — se surgir um problema que não esteja previsto aqui, contacte-nos e seremos justos.
      </P>

      <H2>4. Como são pagos os reembolsos</H2>
      <P>
        Procuramos analisar cada pedido no prazo de 24 a 48 horas úteis. Os reembolsos são feitos para o cartão ou meio de pagamento que
        utilizou, através da Stripe, normalmente no prazo de 5 a 10 dias úteis após a nossa aprovação, consoante o seu banco. Depois de uma
        encomenda ser reembolsada, podemos desativar a respetiva eSIM.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>Cartões SIM</H2>
          <P>{pendingAnswer("returns", "pt")}</P>
          <P>Os planos de dados que adicionar a um cartão SIM seguem as regras acima para os planos.</P>
        </>
      )}

      <H2>5. O seu direito de livre resolução</H2>
      <P>
        Os consumidores da UE e do Reino Unido podem também ter um direito legal de livre resolução — veja o artigo 7 dos nossos{" "}
        <Link href="/terms" className={linkClass}>
          Termos e condições
        </Link>
        .
      </P>
    </>
  );
}
