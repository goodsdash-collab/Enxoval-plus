"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ListSummary = {
  id: string;
  nome: string;
  tipo: string;
  progresso: number;
  totalItens: number;
  concluidos: number;
};

export default function HomePage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<"casamento" | "bebe" | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/lists");
    const data = await res.json();
    setLists(data.lists || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(tipo: "casamento" | "bebe") {
    if (lists.length >= 1) {
      setError(
        "Plano Free permite 1 enxoval. Faça upgrade para Pro (R$19,90/mês) para criar mais."
      );
      return;
    }
    setCreating(tipo);
    setError("");
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    const data = await res.json();
    setCreating(null);
    if (!res.ok) {
      setError(data.error || "Erro ao criar");
      return;
    }
    router.push(`/lista/${data.enxoval.id}`);
  }

  const atFreeLimit = lists.length >= 1;

  return (
    <div className="space-y-10">
      <section className="text-center pt-4 pb-2">
        <p className="text-sm uppercase tracking-widest text-rose-400 mb-2">Com carinho</p>
        <h1 className="font-display text-3xl sm:text-4xl text-rose-800 text-balance">
          Organize seu enxoval com leveza
        </h1>
        <p className="mt-3 text-stone-600 max-w-xl mx-auto text-balance">
          Escolha Casamento ou Bebê, marque o que já tem, acompanhe o progresso e
          compartilhe a lista com a família.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs text-rose-700">
          Plano <strong>Free</strong>: 1 enxoval ·{" "}
          <Link href="/precos" className="underline font-medium hover:text-rose-900">
            Ver Pro R$19,90/mês
          </Link>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => create("casamento")}
          disabled={!!creating || atFreeLimit}
          className={`card-soft group p-6 text-left transition ${
            atFreeLimit
              ? "opacity-60 cursor-not-allowed"
              : "hover:shadow-md hover:border-rose-200"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blush-soft text-3xl mb-4 group-hover:scale-105 transition">
            💍
          </div>
          <h2 className="font-display text-2xl text-rose-800">Casamento</h2>
          <p className="mt-2 text-sm text-stone-600">
            Checklist acolhedor para montar a casa a dois — cama, mesa, cozinha e mais.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-rose-600">
            {creating === "casamento"
              ? "Criando…"
              : atFreeLimit
                ? "Limite Free atingido"
                : "Criar lista →"}
          </span>
        </button>

        <button
          onClick={() => create("bebe")}
          disabled={!!creating || atFreeLimit}
          className={`card-soft group p-6 text-left transition ${
            atFreeLimit
              ? "opacity-60 cursor-not-allowed"
              : "hover:shadow-md hover:border-mint"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-soft text-3xl mb-4 group-hover:scale-105 transition">
            👶
          </div>
          <h2 className="font-display text-2xl text-rose-800">Bebê</h2>
          <p className="mt-2 text-sm text-stone-600">
            Lista guiada para a chegada do bebê — berço, roupinhas, higiene e passeio.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-emerald-700">
            {creating === "bebe"
              ? "Criando…"
              : atFreeLimit
                ? "Limite Free atingido"
                : "Criar lista →"}
          </span>
        </button>
      </section>

      {atFreeLimit && !error && (
        <div className="rounded-2xl border border-rose-100 bg-blush-soft/60 px-4 py-3 text-sm text-rose-900">
          Você já tem 1 enxoval no plano Free. Para criar outro (ex.: Casamento e Bebê), confira o{" "}
          <Link href="/precos" className="underline font-medium">
            plano Pro (R$19,90/mês)
          </Link>
          . Pagamentos reais ainda não estão ativos neste MVP.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
          {error}{" "}
          {(error.includes("Pro") || error.includes("Free")) && (
            <Link href="/precos" className="underline font-medium">
              Ver planos
            </Link>
          )}
        </div>
      )}

      <section>
        <h3 className="font-display text-xl text-rose-800 mb-3">Seus enxovais</h3>
        {loading ? (
          <p className="text-stone-500 text-sm">Carregando…</p>
        ) : lists.length === 0 ? (
          <div className="card-soft p-8 text-center space-y-2">
            <p className="text-3xl" aria-hidden>
              ✨
            </p>
            <p className="font-medium text-rose-800">Nenhuma lista ainda</p>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              Escolha <strong>Casamento</strong> ou <strong>Bebê</strong> acima para criar seu
              primeiro enxoval a partir do template. No Free você pode ter 1 lista.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {lists.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/lista/${l.id}`}
                  className="card-soft flex items-center gap-4 p-4 hover:shadow-md transition"
                >
                  <span className="text-2xl">{l.tipo === "casamento" ? "💍" : "👶"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-rose-900 truncate">{l.nome}</p>
                    <p className="text-xs text-stone-500">
                      {l.concluidos}/{l.totalItens} itens · {l.progresso}%
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-rose-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-300 to-sage transition-all"
                        style={{ width: `${l.progresso}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-rose-400">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-stone-400">
        Modo convidado (cookie <code className="text-[10px]">enxoval_guest</code>). Conta com
        email/senha é opcional — use Entrar no topo.
      </p>
    </div>
  );
}
