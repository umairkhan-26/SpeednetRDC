import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { H2, P, UL, V } from "@/components/legal/LegalPage";

const linkClass = "font-semibold text-orange hover:underline";

export default function PrivacyPt() {
  return (
    <>
      <P>
        Esta política explica que dados pessoais a {COMPANY.tradingName} recolhe quando utiliza este site e compra uma eSIM, porquê, com
        quem os partilhamos, durante quanto tempo os conservamos e quais são os seus direitos. Recolhemos apenas o necessário para lhe
        vender e entregar a sua eSIM.
      </P>

      <H2>1. Quem somos</H2>
      <P>
        O responsável pelo tratamento é <V>{COMPANY.legalNamePt}</V>, com sede em <V>{COMPANY.addressPt}</V> (número de empresa{" "}
        <V>{COMPANY.registrationNumber}</V>, número de IVA <V>{COMPANY.vatNumber}</V>). Para qualquer questão ou pedido sobre privacidade,
        escreva para <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. O que recolhemos e porquê</H2>
      <UL>
        <li>
          <strong>A sua encomenda:</strong> o seu nome, o seu e-mail, o plano e o destino escolhidos, o preço e a data da encomenda, para lhe
          vender a eSIM, enviá-la e conservar os registos exigidos por lei. Fundamento jurídico: execução do nosso contrato consigo e
          obrigações legais (contabilidade e impostos).
        </li>
        <li>
          <strong>País de faturação:</strong> o país da morada de faturação do seu cartão, tal como comunicado pelo nosso prestador de
          pagamentos, para efeitos de IVA e prevenção de fraude. Não conservamos o resto da sua morada. Fundamento jurídico: obrigação legal
          e interesse legítimo.
        </li>
        <li>
          <strong>Pagamento:</strong> paga na página segura da Stripe. A Stripe trata os dados do seu cartão; nós nunca vemos nem
          conservamos o número do seu cartão. Recebemos uma referência de pagamento e a indicação de que o pagamento foi bem-sucedido.
        </li>
        <li>
          <strong>A sua eSIM e a sua utilização:</strong> os identificadores SIM atribuídos à sua encomenda (ICCID e número de
          telefone/MSISDN) e, do nosso parceiro de rede, o estado da SIM, a data da sua ativação e da última ligação, o país a partir do
          qual se ligou pela última vez, os dados restantes e a expiração do plano, para prestar o serviço, responder a pedidos de
          assistência e prevenir abusos. Fundamento jurídico: execução do nosso contrato e interesse legítimo. Não vemos o conteúdo da sua
          navegação nem das suas comunicações.
        </li>
        <li>
          <strong>Início de sessão:</strong> quando pede uma ligação de acesso, conservamos um código de utilização única associado ao seu
          e-mail. Fundamento jurídico: execução do nosso contrato.
        </li>
        <li>
          <strong>Segurança:</strong> para impedir que sejam adivinhadas ligações de acesso e palavras-passe, contamos as tentativas
          falhadas usando uma forma codificada (hash) do seu endereço IP, que eliminamos após 24 horas. Não conservamos o seu endereço IP
          com a sua encomenda. Fundamento jurídico: interesse legítimo (segurança das contas e do serviço).
        </li>
        <li>
          <strong>Mensagens que nos envia:</strong> se contactar a assistência por e-mail ou com «Comunicar um problema» na sua conta, o
          conteúdo da sua mensagem, o problema escolhido, a encomenda e a SIM em causa e as nossas respostas, para o ajudar. Para responder,
          consultamos também o estado dessa SIM junto do nosso parceiro de rede (ver acima). Fundamento jurídico: execução do nosso
          contrato e interesse legítimo.
        </li>
      </UL>
      <P>
        Não vendemos os seus dados pessoais. Só partilhamos informação limitada com a Meta, para medir e melhorar os nossos anúncios, se
        aceitar os cookies da Meta (ver o ponto 3).
      </P>

      <H2 id="cookies">3. Cookies</H2>
      <P>
        <strong>Cookies necessários ao funcionamento do site</strong> (sempre ativos):
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong> — memoriza o idioma escolhido.
        </li>
        <li>
          <strong>customer_session</strong> — mantém a sua sessão iniciada em «As minhas eSIM» até 30 dias depois de usar uma ligação de
          acesso. É eliminado quando termina a sessão.
        </li>
        <li>
          <strong>snrdc_consent</strong> — memoriza se aceitou ou recusou os cookies da Meta, durante 6 meses.
        </li>
      </UL>
      <P>
        <strong>Cookies publicitários da Meta (Facebook)</strong> (apenas se os aceitar): na sua primeira visita perguntamos-lhe se os
        aceita. Nada da Meta é carregado até clicar em «Aceitar», e nada é enviado à Meta se clicar em «Rejeitar». Se aceitar, o Pixel da
        Meta coloca o cookie <strong>_fbp</strong> (e <strong>_fbc</strong> se chegar a partir de um anúncio da Meta), conservado até 90
        dias, e informamos a Meta de:
      </P>
      <UL>
        <li>as páginas que visita, o plano que está a ver, quando escolhe um plano e quando inicia o pagamento;</li>
        <li>
          numa compra: o valor da encomenda, a moeda e o plano, o seu e-mail e o seu país de faturação de forma codificada (hash), os
          identificadores de navegador da Meta mencionados acima e o tipo de navegador. Enviamos a compra a partir do nosso servidor (API
          de Conversões da Meta) e também a partir do seu navegador, com a mesma referência, para que a Meta a conte apenas uma vez. Nunca
          enviamos o seu nome, o endereço IP a partir do nosso servidor nem os seus dados de pagamento.
        </li>
      </UL>
      <P>
        Usamos esta informação para medir a eficácia dos nossos anúncios e mostrá-los a pessoas que possam estar interessadas. Fundamento
        jurídico: o seu consentimento. Quanto à recolha desta informação e à sua transmissão à Meta, nós e a Meta Platforms Ireland Ltd
        somos responsáveis conjuntos pelo tratamento; a utilização posterior que a Meta lhe der rege-se pela própria política de
        privacidade da Meta (facebook.com/privacy/policy).
      </P>
      <P>
        Pode alterar a sua escolha a qualquer momento em «Definições de cookies», no fundo de cada página. Escolher «Rejeitar» pára o Pixel
        da Meta e elimina os respetivos cookies do seu navegador; a informação já enviada à Meta permanece na Meta. A Stripe coloca os
        seus próprios cookies na sua página de pagamento para prevenir fraude.
      </P>

      <H2>4. Com quem partilhamos os dados</H2>
      <P>
        Apenas com os prestadores que deles precisam para o serviço funcionar, ao abrigo de contratos que os obrigam a protegê-los:
      </P>
      <UL>
        <li>Stripe (processamento de pagamentos e prevenção de fraude);</li>
        <li>o nosso parceiro de rede móvel, que fornece a eSIM e a conectividade;</li>
        <li>Resend (envio dos e-mails de encomenda e de acesso, a partir de servidores situados na UE);</li>
        <li>Hostinger (alojamento do site e da base de dados);</li>
        <li>Meta Platforms Ireland Ltd (medição publicitária), apenas se aceitar os cookies da Meta;</li>
        <li>as autoridades, quando a lei o exigir.</li>
      </UL>
      <P>
        Alguns prestadores podem tratar dados fora do Espaço Económico Europeu. Nesse caso, a transferência é protegida por uma decisão de
        adequação ou pelas cláusulas contratuais-tipo da Comissão Europeia.
      </P>

      <H2>5. Durante quanto tempo os conservamos</H2>
      <UL>
        <li>
          Encomendas, pagamentos e faturas: <V>{POLICY.orderRecordYears}</V> anos, como exigem a contabilidade e a fiscalidade.
        </li>
        <li>Informação sobre o estado da SIM: enquanto conservarmos a encomenda a que diz respeito.</li>
        <li>Ligações de acesso: eliminadas um dia depois de expirarem (expiram ao fim de 15 minutos).</li>
        <li>Endereços IP codificados usados para a segurança: 24 horas.</li>
        <li>
          A sua escolha sobre cookies: 6 meses, após os quais voltamos a perguntar. Cookies da Meta: até 90 dias, ou até os recusar.
        </li>
        <li>
          Se aceitou os cookies da Meta ao fazer a encomenda: a referência e a informação do navegador usadas para o evento de compra,
          enquanto conservarmos a encomenda.
        </li>
        <li>Mensagens de assistência: o tempo necessário para tratar o seu pedido e, depois, até 2 anos.</li>
      </UL>

      <H2>6. Os seus direitos</H2>
      <P>
        Pode pedir-nos que lhe demos acesso aos seus dados pessoais, que os retifiquemos ou eliminemos, que limitemos a sua utilização ou
        se oponha a ela, e recebê-los num formato portátil. A lei obriga a conservar alguns dados (por exemplo, as faturas) mesmo que peça
        a sua eliminação. Para fazer um pedido, escreva para <V>{COMPANY.privacyEmail}</V>; respondemos no prazo de um mês. Pode também
        apresentar uma reclamação junto da sua autoridade de proteção de dados — a nossa é <V>{COMPANY.supervisoryAuthorityPt}</V>.
      </P>

      <H2>7. Segurança</H2>
      <P>
        Os dados de instalação da sua eSIM só são mostrados numa página de encomenda privada, acessível por uma ligação impossível de
        adivinhar, e na sua conta com sessão iniciada. Trate essa ligação como uma palavra-passe. O acesso aos nossos sistemas está
        limitado ao pessoal que dele precisa e cada início de sessão do pessoal é registado.
      </P>

      <H2>8. Alterações</H2>
      <P>
        Se alterarmos esta política, atualizaremos a data no topo da página. As alterações importantes serão anunciadas neste site. Veja
        também os nossos{" "}
        <Link href="/terms" className={linkClass}>
          Termos e condições
        </Link>{" "}
        e a nossa{" "}
        <Link href="/refunds" className={linkClass}>
          Política de reembolsos
        </Link>
        .
      </P>
    </>
  );
}
