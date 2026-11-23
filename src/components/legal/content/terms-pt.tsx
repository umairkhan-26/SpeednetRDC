import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function TermsPt() {
  return (
    <>
      <P>
        Estes termos aplicam-se quando compra um plano de dados eSIM neste site. Ao fazer uma encomenda, aceita-os. Leia também a nossa{" "}
        <Link href="/privacy" className={linkClass}>
          Política de privacidade
        </Link>{" "}
        e a nossa{" "}
        <Link href="/refunds" className={linkClass}>
          Política de reembolsos
        </Link>
        .
      </P>

      <H2>1. Quem somos</H2>
      <P>
        Este site é explorado por <V>{COMPANY.legalNamePt}</V>, com sede em <V>{COMPANY.addressPt}</V>, número de empresa{" "}
        <V>{COMPANY.registrationNumber}</V>, número de IVA <V>{COMPANY.vatNumber}</V>. Contacto: <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. O que compra</H2>
      <UL>
        <li>
          Um plano eSIM pré-pago, apenas de dados, para o destino, a quantidade de dados e o período de validade indicados na sua encomenda.
          Não inclui número de telefone para chamadas ou SMS, salvo indicação em contrário no plano.
        </li>
        <li>
          A conectividade é fornecida pelo nosso parceiro de rede e pelas respetivas redes parceiras em cada destino. As velocidades e a
          cobertura dependem das redes locais e não são garantidas.
        </li>
        <li>
          <strong>Onde funciona:</strong> um plano só funciona nos países indicados na sua página de plano e na página da sua encomenda.
          Nomes de planos como «Caraíbas» ou «Europa» podem abranger apenas parte dos países, pelo que deve verificar a lista antes de
          comprar. Fora desses países, a sua eSIM não lhe dará acesso à internet, mesmo que o telemóvel mostre sinal de rede. Se comprou um
          plano que não abrange o seu destino, avise-nos antes de o utilizar: veja a nossa{" "}
          <Link href="/refunds" className={linkClass}>
            Política de reembolsos
          </Link>
          .
        </li>
        <li>
          Precisa de um dispositivo compatível com eSIM e não bloqueado por um operador. Consulte a{" "}
          <Link href="/device-compatibility" className={linkClass}>
            lista de compatibilidade
          </Link>{" "}
          antes de comprar.
        </li>
      </UL>

      <H2>3. Encomendas e pagamento</H2>
      <UL>
        <li>
          Os preços são indicados em euros. O preço do plano e a linha «Impostos e taxas» apresentados no pagamento formam o total que
          paga; o total da página de pagamento é definitivo e inclui o IVA quando aplicável. Paga a totalidade no momento da encomenda,
          através do nosso prestador de pagamentos, a Stripe.
        </li>
        <li>
          O contrato é celebrado quando o seu pagamento é confirmado. Podemos cancelar e reembolsar integralmente uma encomenda se não a
          conseguirmos cumprir (por exemplo, por um erro de preço ou porque o plano já não está disponível).
        </li>
        <li>
          Deve indicar um endereço de e-mail válido: é aí que a sua eSIM é entregue e é com ele que inicia sessão em «As minhas eSIM».
        </li>
      </UL>

      <H2>4. Entrega e instalação</H2>
      <UL>
        <li>
          Enviamos-lhe por e-mail uma ligação privada para a página da sua encomenda com o código QR da sua eSIM e as instruções de
          instalação, normalmente alguns minutos após o pagamento.
        </li>
        <li>
          Se tiver um problema, use «Comunicar um problema» na sua conta (ou escreva para <V>{COMPANY.supportEmail}</V>) indicando o número
          da sua encomenda: a nossa equipa vê de que SIM se trata e responde-lhe na mesma conversa.
        </li>
        <li>
          Mantenha essa ligação privada: qualquer pessoa que a tenha pode instalar a sua eSIM. Normalmente, uma eSIM só pode ser instalada
          uma vez; se a eliminar do dispositivo, pode não ser possível reinstalá-la.
        </li>
        <li>
          Instale a eSIM enquanto tiver ligação à internet, idealmente antes de viajar. É responsável pela instalação e pelas definições do
          seu dispositivo (por exemplo, ativar o roaming de dados para a linha eSIM).
        </li>
      </UL>

      <H2>5. Validade do plano</H2>
      <UL>
        <li>
          O seu plano começa na primeira vez que o dispositivo se liga a uma rede de um país abrangido pelo plano (e não na compra nem na
          instalação), salvo indicação em contrário na descrição do plano.
        </li>
        <li>
          Termina quando o período de validade ou os dados se esgotam, o que ocorrer primeiro. Os dados e a validade não utilizados não são
          reembolsados nem transitados.
        </li>
      </UL>

      <H2>6. Utilização justa e lícita</H2>
      <P>
        Só pode utilizar o serviço de forma lícita e para uso pessoal. Não o pode revender, utilizá-lo em equipamento que ligue
        automaticamente outros dispositivos ou máquinas (salvo se o plano o permitir), nem utilizá-lo de forma que prejudique a rede ou
        outros utilizadores. Podemos suspender um serviço utilizado em violação destas regras.
      </P>

      <H2>7. Direito de livre resolução</H2>
      <P>
        Se é consumidor na UE ou no Reino Unido, normalmente dispõe de 14 dias para resolver um contrato celebrado à distância. Uma eSIM é
        conteúdo digital que entregamos imediatamente após o pagamento: por isso, no momento do pagamento pedimos-lhe que aceite a entrega
        imediata e reconheça que perde esse direito depois de a eSIM ser entregue; confirmamo-lo no seu e-mail de encomenda. Se mudar de
        ideias antes de a sua eSIM ser entregue, reembolsamos a totalidade.{" "}
        O funcionamento prático dos reembolsos está descrito na nossa{" "}
        <Link href="/refunds" className={linkClass}>
          Política de reembolsos
        </Link>
        . Nada nestes termos afeta os seus direitos legais.
      </P>

      <H2>8. A nossa responsabilidade</H2>
      <P>
        Se o serviço não funcionar como descrito e não o conseguirmos reparar, reembolsamos conforme a Política de reembolsos. Não somos
        responsáveis por perdas que não fossem previsíveis, por perdas empresariais, nem por problemas causados pelo seu dispositivo, pelas
        respetivas definições ou por acontecimentos fora do nosso controlo razoável (como uma falha de rede local). Nada nestes termos
        limita uma responsabilidade que não possa ser limitada por lei, incluindo a decorrente de morte ou danos pessoais causados por
        negligência, ou de fraude.
      </P>

      <H2>9. Alterações a estes termos</H2>
      <P>
        Podemos atualizar estes termos. Aplica-se à sua encomenda a versão que estava neste site quando a fez.
      </P>

      <H2>10. Lei aplicável e reclamações</H2>
      <P>
        Estes termos são regidos pela lei da <V>{COMPANY.governingLawPt}</V>. Se é consumidor, mantém também a proteção das normas
        imperativas do país onde reside e pode recorrer aos respetivos tribunais. Se tiver uma reclamação, contacte-nos primeiro através de{" "}
        <V>{COMPANY.supportEmail}</V>: faremos o possível para a resolver. Entidade de mediação de consumo:{" "}
        <V>{COMPANY.mediationBodyPt}</V>.
      </P>

      <H2 id="legal-notice">11. Aviso legal</H2>
      <UL>
        <li>
          <strong>Empresa:</strong> <V>{COMPANY.legalNamePt}</V>
        </li>
        <li>
          <strong>Sede:</strong> <V>{COMPANY.addressPt}</V>
        </li>
        <li>
          <strong>Número de empresa (BCE/KBO):</strong> <V>{COMPANY.registrationNumber}</V>
        </li>
        <li>
          <strong>Número de IVA:</strong> <V>{COMPANY.vatNumber}</V>
        </li>
        <li>
          <strong>E-mail:</strong> <V>{COMPANY.supportEmail}</V>
        </li>
      </UL>
    </>
  );
}
