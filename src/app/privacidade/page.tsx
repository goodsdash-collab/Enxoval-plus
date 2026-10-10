import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Enxoval+",
  description: "Como o Enxoval+ coleta, usa, guarda e exclui seus dados.",
};

const ATUALIZADA = "9 de outubro de 2026";
const CONTATO = "goodsdash@gmail.com";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl text-rose-800 mt-8 mb-2">{children}</h2>;
}

export default function PrivacidadePage() {
  return (
    <article className="card-soft max-w-3xl mx-auto p-6 sm:p-8 text-stone-700 leading-relaxed text-[15px]">
      <h1 className="font-display text-3xl text-rose-800">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-stone-500">Última atualização: {ATUALIZADA}</p>

      <p className="mt-4">
        Esta política explica como o <strong>Enxoval+</strong> (site <code>enxoval-plus.vercel.app</code> e app Android{" "}
        <code>br.com.enxovalplus.app</code>) trata os seus dados pessoais, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei
        nº 13.709/2018). O app Android apenas abre este mesmo site; as regras são as mesmas nos dois.
      </p>
      <p className="mt-2">
        Responsável pelo tratamento (controlador): <strong>dash goods</strong>, desenvolvedor do Enxoval+. Contato e encarregado de
        dados: <a className="text-rose-600 underline" href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>

      <H>1. Quais dados coletamos</H>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Conta (opcional):</strong> se você criar uma conta, guardamos o seu <strong>e-mail</strong> e a sua{" "}
          <strong>senha</strong> — a senha nunca é guardada em texto, só como um código irreversível (hash bcrypt). Não pedimos nome,
          telefone, CPF, endereço, data de nascimento nem foto.
        </li>
        <li>
          <strong>Suas listas:</strong> o nome que você der ao enxoval, o tipo (casamento ou bebê), as categorias, os itens, as
          quantidades, a prioridade, o status (pendente, comprado, ganho, adiado) e as observações que você escrever. Evite colocar
          dados sensíveis nas observações.
        </li>
        <li>
          <strong>Links de compartilhamento:</strong> quando você compartilha uma lista, criamos um código aleatório no link. Quem
          tiver o link pode ver a lista (ou editar, se você escolher essa opção).
        </li>
        <li>
          <strong>Cookies essenciais:</strong> <code>enxoval_session</code> (mantém você conectado por até 30 dias) e{" "}
          <code>enxoval_guest</code> (identifica as listas do modo convidado, sem conta, por até 1 ano). São cookies técnicos,
          necessários para o app funcionar. <strong>Não usamos cookies de publicidade nem de análise/estatística.</strong>
        </li>
        <li>
          <strong>Registros técnicos:</strong> como em qualquer site, a hospedagem registra automaticamente dados de acesso (endereço
          IP, data e hora, página acessada, navegador/aparelho) para segurança e funcionamento. Esses registros são temporários.
        </li>
      </ul>
      <p className="mt-2">
        Não coletamos sua localização, contatos, fotos, arquivos, microfone, câmera nem dados de pagamento. O app não tem anúncios.
      </p>

      <H>2. Para que usamos</H>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Criar e manter sua conta e permitir o login (base legal: execução do serviço que você pediu).</li>
        <li>Guardar, mostrar e sincronizar suas listas e os links que você compartilhar (execução do serviço).</li>
        <li>Proteger o serviço contra abusos e corrigir erros (legítimo interesse).</li>
        <li>Responder às suas mensagens de suporte e pedidos sobre seus dados.</li>
      </ul>
      <p className="mt-2">
        <strong>Não vendemos, não alugamos e não compartilhamos seus dados para publicidade.</strong> Não fazemos perfis de marketing.
      </p>

      <H>3. Com quem os dados são compartilhados</H>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Vercel Inc.</strong> — hospedagem do site e das funções do servidor (servidores nos Estados Unidos).
        </li>
        <li>
          <strong>Neon (Databricks)</strong> — banco de dados PostgreSQL onde ficam a conta e as listas.
        </li>
        <li>
          <strong>Lojas (Amazon, Mercado Livre, Shopee):</strong> os botões “buscar na loja” só abrem o site da loja com o nome do item
          na busca. Nada da sua conta é enviado. Ao abrir a loja, vale a política de privacidade dela.
        </li>
        <li>
          <strong>Página “Sobre” (/marketing):</strong> carrega fontes do Google Fonts e uma biblioteca do cdnjs (Cloudflare), que
          recebem o seu endereço IP ao baixar esses arquivos.
        </li>
        <li>Autoridades, somente quando exigido por lei ou ordem judicial.</li>
      </ul>
      <p className="mt-2">
        Como esses provedores ficam fora do Brasil, pode haver transferência internacional de dados, feita com provedores que adotam
        medidas de segurança adequadas (LGPD, art. 33).
      </p>

      <H>4. Segurança</H>
      <p>
        Toda a comunicação entre o seu aparelho e o Enxoval+ é criptografada (HTTPS/TLS). As senhas são guardadas com hash bcrypt e os
        provedores de hospedagem e banco de dados criptografam os dados armazenados. Nenhum sistema é 100% seguro; se houver um
        incidente relevante, avisaremos você e a ANPD conforme a lei.
      </p>

      <H>5. Por quanto tempo guardamos</H>
      <p>
        Guardamos a conta e as listas enquanto você usar o serviço ou até você excluí-las. Ao excluir, os dados são apagados do banco
        de dados na hora; cópias de segurança automáticas dos provedores podem manter os dados por um período limitado (em geral até
        30 dias) antes de serem sobrescritas. Registros técnicos de acesso são mantidos pelo tempo necessário à segurança e ao
        cumprimento da lei.
      </p>

      <H>6. Seus direitos e como excluir seus dados</H>
      <p>
        Pela LGPD, você pode pedir confirmação e acesso aos seus dados, correção, portabilidade, exclusão, informação sobre
        compartilhamento e revogar consentimentos. Você pode:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mt-2">
        <li>editar ou apagar itens e listas a qualquer momento, dentro do próprio app;</li>
        <li>
          <strong>excluir sua conta e todos os dados</strong> na página{" "}
          <Link href="/excluir-conta" className="text-rose-600 underline">
            enxoval-plus.vercel.app/excluir-conta
          </Link>
          ;
        </li>
        <li>
          ou escrever para <a className="text-rose-600 underline" href={`mailto:${CONTATO}`}>{CONTATO}</a> — respondemos em até 15 dias.
        </li>
      </ul>
      <p className="mt-2">Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>

      <H>7. Crianças</H>
      <p>
        O Enxoval+ é feito para adultos (18+) que estão organizando casamento ou a chegada de um bebê. Não é direcionado a crianças e
        não coletamos dados de crianças de propósito. Se acreditar que uma criança nos enviou dados, fale com a gente para apagarmos.
      </p>

      <H>8. Mudanças nesta política</H>
      <p>
        Podemos atualizar esta política. A data no topo mostra a versão atual; mudanças importantes serão avisadas no app ou no site.
      </p>

      <p className="mt-8 text-sm text-stone-500">
        Dúvidas? <a className="text-rose-600 underline" href={`mailto:${CONTATO}`}>{CONTATO}</a>
      </p>
    </article>
  );
}
