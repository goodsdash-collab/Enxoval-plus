import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";

export const metadata: Metadata = {
  title: "Excluir conta e dados — Enxoval+",
  description: "Como excluir sua conta do Enxoval+ e todos os seus dados.",
};

const CONTATO = "goodsdash@gmail.com";

export default function ExcluirContaPage() {
  return (
    <article className="card-soft max-w-3xl mx-auto p-6 sm:p-8 text-stone-700 leading-relaxed text-[15px]">
      <h1 className="font-display text-3xl text-rose-800">Excluir conta e dados</h1>
      <p className="mt-2">
        Esta página explica como excluir sua conta do <strong>Enxoval+</strong> (app Android <code>br.com.enxovalplus.app</code> e site{" "}
        <code>enxoval-plus.vercel.app</code>) e todos os dados ligados a ela.
      </p>

      <h2 className="font-display text-xl text-rose-800 mt-6 mb-2">O que é apagado</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>sua conta: e-mail e senha (hash);</li>
        <li>todos os seus enxovais, com categorias, itens, quantidades, status e observações;</li>
        <li>todos os links de compartilhamento dessas listas (quem tinha o link perde o acesso);</li>
        <li>as listas do modo convidado deste aparelho/navegador e os cookies de sessão.</li>
      </ul>
      <p className="mt-2">
        A exclusão é <strong>imediata e definitiva</strong> no nosso banco de dados. Cópias de segurança automáticas dos provedores podem
        guardar os dados por um período limitado (em geral até 30 dias) até serem sobrescritas. Não guardamos mais nenhum dado seu
        depois disso, exceto registros técnicos de acesso exigidos por lei.
      </p>

      <h2 className="font-display text-xl text-rose-800 mt-6 mb-2">Opção 1 — Excluir agora (pelo app ou site)</h2>
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>Abra o Enxoval+ e entre na sua conta (botão “Entrar” no topo).</li>
        <li>
          Abra esta página: no rodapé, toque em <strong>“Excluir conta”</strong> (ou acesse <code>enxoval-plus.vercel.app/excluir-conta</code>).
        </li>
        <li>Digite sua senha para confirmar e toque em <strong>“Excluir minha conta e meus dados”</strong>.</li>
      </ol>
      <p className="mt-2 text-sm text-stone-500">
        Usa o modo convidado (sem conta)? O botão abaixo apaga as listas de convidado guardadas neste aparelho.
      </p>

      <div className="mt-4">
        <DeleteAccountForm />
      </div>

      <h2 className="font-display text-xl text-rose-800 mt-8 mb-2">Opção 2 — Pedir por e-mail</h2>
      <p>
        Se não conseguir entrar (por exemplo, esqueceu a senha), envie um e-mail para{" "}
        <a className="text-rose-600 underline" href={`mailto:${CONTATO}?subject=Excluir%20minha%20conta%20Enxoval%2B`}>{CONTATO}</a> com o
        assunto <strong>“Excluir minha conta Enxoval+”</strong>, a partir do mesmo e-mail cadastrado. Confirmamos que o e-mail é seu e
        apagamos a conta e todos os dados em até 15 dias, avisando por e-mail quando terminar.
      </p>

      <h2 className="font-display text-xl text-rose-800 mt-8 mb-2">Quer apagar só algumas listas?</h2>
      <p>
        Dentro do app, abra a lista e use a opção de excluir a lista. Isso apaga a lista, seus itens e seus links de compartilhamento,
        sem excluir a conta.
      </p>

      <p className="mt-8 text-sm text-stone-500">
        Veja também a{" "}
        <Link href="/privacidade" className="text-rose-600 underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </article>
  );
}
