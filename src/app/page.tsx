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

      <QuartoShowcase />

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

type Quarto = "bebe" | "casal";

const QUARTOS: Record<
  Quarto,
  { titulo: string; emoji: string; descricao: string; itens: string[]; href: string }
> = {
  bebe: {
    titulo: "Quarto do bebê",
    emoji: "🛏️",
    descricao: "Berço, mobile e cômoda prontos para a chegada — veja o quartinho montado em 3D.",
    itens: ["Berço", "Mobile", "Cômoda", "Luz noturna"],
    href: "/marketing/index.html?ambiente=bebe#ambientes",
  },
  casal: {
    titulo: "Quarto de casal",
    emoji: "🛌",
    descricao: "Cama, travesseiros e criado-mudo da casa nova — explore o quarto do casal em 3D.",
    itens: ["Cama", "Jogo de lençóis", "Travesseiros", "Criado-mudo"],
    href: "/marketing/index.html?ambiente=casal#ambientes",
  },
};

function QuartoArt({ quarto }: { quarto: Quarto }) {
  if (quarto === "bebe") {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-auto" role="img" aria-label="Ilustração do quarto do bebê">
        <rect width="160" height="100" rx="12" fill="#E8F6F2" />
        <rect x="0" y="80" width="160" height="20" fill="#d4efe8" />
        <line x1="80" y1="0" x2="80" y2="14" stroke="#C8B8A8" strokeWidth="1" />
        <circle cx="72" cy="18" r="4" fill="#F5C6B8" />
        <circle cx="80" cy="20" r="4" fill="#FFD8C2" />
        <circle cx="88" cy="18" r="4" fill="#E8DFF5" />
        <rect x="40" y="45" width="80" height="40" rx="6" fill="#A8D8CF" />
        <rect x="48" y="30" width="64" height="20" rx="4" fill="#7EC4B8" />
        <circle cx="55" cy="55" r="5" fill="#fff" />
        <circle cx="105" cy="55" r="5" fill="#fff" />
        <rect x="70" y="58" width="20" height="8" rx="3" fill="#F5C6B8" />
        <rect x="128" y="52" width="24" height="32" rx="3" fill="#E8D5B7" />
        <rect x="131" y="58" width="18" height="2" rx="1" fill="#fff" />
        <rect x="131" y="68" width="18" height="2" rx="1" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 100" className="w-full h-auto" role="img" aria-label="Ilustração do quarto de casal">
      <rect width="160" height="100" rx="12" fill="#FBF0EC" />
      <rect x="0" y="80" width="160" height="20" fill="#f8d9d0" />
      <rect x="30" y="48" width="100" height="36" rx="6" fill="#E8B4A8" />
      <rect x="36" y="38" width="88" height="18" rx="5" fill="#F5D0C8" />
      <circle cx="55" cy="42" r="8" fill="#fff" />
      <circle cx="105" cy="42" r="8" fill="#fff" />
      <rect x="6" y="60" width="18" height="22" rx="3" fill="#D4B07A" />
      <rect x="136" y="60" width="18" height="22" rx="3" fill="#D4B07A" />
      <circle cx="15" cy="54" r="5" fill="#FFD8C2" />
      <circle cx="145" cy="54" r="5" fill="#FFD8C2" />
    </svg>
  );
}

function QuartoShowcase() {
  const [quarto, setQuarto] = useState<Quarto>("bebe");
  const q = QUARTOS[quarto];
  return (
    <section
      id="quarto"
      aria-labelledby="quarto-title"
      className="card-soft overflow-hidden border-rose-100 bg-gradient-to-br from-blush-soft via-white to-mint-soft"
    >
      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-rose-400">Novidade · em 3D</p>
          <h2 id="quarto-title" className="font-display text-2xl sm:text-3xl text-rose-800">
            Veja o quarto montado
          </h2>
          <div className="inline-flex rounded-full bg-white/80 border border-rose-100 p-1" role="tablist" aria-label="Escolha o quarto">
            {(Object.keys(QUARTOS) as Quarto[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={quarto === key}
                onClick={() => setQuarto(key)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  quarto === key
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <span aria-hidden className="mr-1">{QUARTOS[key].emoji}</span>
                {QUARTOS[key].titulo}
              </button>
            ))}
          </div>
          <p className="text-sm text-stone-600">{q.descricao}</p>
          <ul className="flex flex-wrap gap-1.5">
            {q.itens.map((i) => (
              <li key={i} className="rounded-full bg-white/80 border border-rose-100 px-2.5 py-1 text-xs text-stone-600">
                {i}
              </li>
            ))}
          </ul>
          <a href={q.href} className="btn-primary inline-flex items-center gap-1 text-sm">
            Ver o {q.titulo.toLowerCase()} em 3D →
          </a>
        </div>
        <a
          href={q.href}
          className="block rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-rose-100 transition hover:shadow-md"
          aria-label={`Abrir ${q.titulo} em 3D`}
        >
          <QuartoArt quarto={quarto} />
        </a>
      </div>
    </section>
  );
}
