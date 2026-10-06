"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_OPTIONS, PRIORIDADES, type StatusItem } from "@/lib/types";
import { storeSearchLinks } from "@/lib/stores";
type Item = {
  id: string;
  nome: string;
  quantidade: number;
  prioridade: string;
  status: string;
  notas: string | null;
  isCustom: boolean;
  categoriaId: string;
};
type Categoria = {
  id: string;
  nome: string;
  descricao: string | null;
  itens: Item[];
};
type EnxovalData = {
  id: string;
  nome: string;
  tipo: string;
  categorias: Categoria[];
  progresso: number;
  totalItens: number;
  concluidos: number;
  urgentes: Item[];
};
export function ListView({
  listId,
  shareToken,
  initialCanEdit,
}: {
  listId?: string;
  shareToken?: string;
  initialCanEdit?: boolean;
}) {
  const [data, setData] = useState<EnxovalData | null>(null);
  const [canEdit, setCanEdit] = useState(initialCanEdit ?? true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nome: "", quantidade: 1, prioridade: "desejavel", categoriaId: "" });
  const [shareMsg, setShareMsg] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url: string;
      if (shareToken) {
        url = `/api/share/${shareToken}`;
      } else {
        url = `/api/lists/${listId}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar");
        setData(null);
      } else {
        setData(json.enxoval);
        setCanEdit(json.canEdit ?? false);
      }
    } catch {
      setError("Falha de rede");
    }
    setLoading(false);
  }, [listId, shareToken]);
  useEffect(() => {
    load();
  }, [load]);
  async function updateStatus(itemId: string, status: StatusItem) {
    if (!canEdit || !data) return;
    // optimistic
    setData((prev) => {
      if (!prev) return prev;
      const categorias = prev.categorias.map((c) => ({
        ...c,
        itens: c.itens.map((i) => (i.id === itemId ? { ...i, status } : i)),
      }));
      const itens = categorias.flatMap((c) => c.itens);
      const done = itens.filter((i) => i.status === "comprado" || i.status === "ganho").length;
      const urgentes = itens.filter((i) => i.prioridade === "essencial" && i.status === "pendente");
      return {
        ...prev,
        categorias,
        concluidos: done,
        progresso: itens.length ? Math.round((done / itens.length) * 100) : 0,
        urgentes,
      };
    });
    await fetch(`/api/lists/${data.id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, status, token: shareToken }),
    });
  }
  async function removeItem(itemId: string) {
    if (!canEdit || !data) return;
    if (!confirm("Remover este item?")) return;
    await fetch(`/api/lists/${data.id}/items?itemId=${itemId}${shareToken ? `&token=${shareToken}` : ""}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, token: shareToken }),
    });
    load();
  }
  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !data) return;
    const res = await fetch(`/api/lists/${data.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addForm, token: shareToken }),
    });
    if (res.ok) {
      setShowAdd(false);
      setAddForm({ nome: "", quantidade: 1, prioridade: "desejavel", categoriaId: "" });
      load();
    }
  }
  async function deleteList() {
    if (!data || shareToken) return;
    if (!confirm("Apagar este enxoval permanentemente?")) return;
    const res = await fetch(`/api/lists/${data.id}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/";
  }
  async function createShare(canEditShare: boolean) {
    if (!data) return;
    setShareMsg("");
    const res = await fetch(`/api/lists/${data.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canEdit: canEditShare }),
    });
    const json = await res.json();
    if (!res.ok) {
      setShareMsg(json.error || "Erro");
      return;
    }
    const full = `${window.location.origin}${json.share.url}`;
    setShareUrl(full);
    try {
      await navigator.clipboard.writeText(full);
      setShareMsg(`Link ${canEditShare ? "com edição" : "somente leitura"} copiado!`);
    } catch {
      setShareMsg(`Link gerado: ${full}`);
    }
  }
  if (loading) {
    return <p className="text-stone-500 text-center py-12">Carregando lista…</p>;
  }
  if (error || !data) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-rose-700">{error || "Lista não encontrada"}</p>
        <Link href="/" className="btn-secondary">
          Voltar ao início
        </Link>
      </div>
    );
  }
  const categories = data.categorias;
  const visibleCats =
    filterCat === "all" ? categories : categories.filter((c) => c.id === filterCat);
  const prioridadeBadge = (p: string) => {
    if (p === "essencial") return "bg-rose-100 text-rose-700";
    if (p === "desejavel") return "bg-lavender text-purple-800";
    return "bg-stone-100 text-stone-600";
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-rose-500 hover:underline">
            ← Início
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl text-rose-800 mt-1 flex items-center gap-2">
            <span>{data.tipo === "casamento" ? "💍" : "👶"}</span>
            {data.nome}
          </h1>
          {!canEdit && (
            <span className="inline-block mt-1 text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">
              Somente leitura
            </span>
          )}
        </div>
        {canEdit && !shareToken && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => createShare(false)} className="btn-secondary text-sm">
              Compartilhar (ler)
            </button>
            <button onClick={() => createShare(true)} className="btn-secondary text-sm">
              Compartilhar (editar)
            </button>
            <button onClick={deleteList} className="text-sm text-stone-400 hover:text-rose-600 px-2">
              Apagar
            </button>
          </div>
        )}
      </div>
      {(shareMsg || shareUrl) && (
        <div className="rounded-xl bg-mint-soft border border-mint px-4 py-3 text-sm text-emerald-900">
          {shareMsg}
          {shareUrl && (
            <p className="mt-1 break-all font-mono text-xs">{shareUrl}</p>
          )}
        </div>
      )}
      {/* Progress */}
      <div className="card-soft p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-rose-800">Progresso</span>
          <span className="text-stone-600">
            {data.concluidos}/{data.totalItens} · <strong>{data.progresso}%</strong>
          </span>
        </div>
        <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-300 via-peach to-sage transition-all duration-500"
            style={{ width: `${data.progresso}%` }}
          />
        </div>
      </div>
      {/* Urgente */}
      {data.urgentes.length > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-blush-soft/80 p-4">
          <h2 className="font-display text-lg text-rose-800 mb-3 flex items-center gap-2">
            ⚡ Urgente
            <span className="text-xs font-sans font-normal text-rose-600">
              essenciais ainda pendentes
            </span>
          </h2>
          <ul className="space-y-2">
            {data.urgentes.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm"
              >
                <span className="font-medium flex-1 min-w-[8rem]">{item.nome}</span>
                <span className="text-stone-500">×{item.quantidade}</span>
                {canEdit && (
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as StatusItem)}
                    className="rounded-lg border border-rose-100 text-xs px-2 py-1"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border border-mint bg-mint-soft/70 p-4 text-sm text-emerald-900">
          🎉 Nenhum item essencial pendente — ótimo progresso!
        </section>
      )}
      {/* Filters + add */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-sm"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {canEdit && (
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm py-1.5">
            + Item
          </button>
        )}
      </div>
      {showAdd && canEdit && (
        <form onSubmit={addItem} className="card-soft p-4 space-y-3">
          <h3 className="font-medium text-rose-800">Adicionar item</h3>
          <input
            required
            placeholder="Nome do item"
            className="w-full rounded-xl border border-rose-100 px-3 py-2 text-sm"
            value={addForm.nome}
            onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={1}
              className="w-20 rounded-xl border border-rose-100 px-3 py-2 text-sm"
              value={addForm.quantidade}
              onChange={(e) => setAddForm({ ...addForm, quantidade: Number(e.target.value) })}
            />
            <select
              className="rounded-xl border border-rose-100 px-3 py-2 text-sm"
              value={addForm.prioridade}
              onChange={(e) => setAddForm({ ...addForm, prioridade: e.target.value })}
            >
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-rose-100 px-3 py-2 text-sm flex-1"
              value={addForm.categoriaId}
              onChange={(e) => setAddForm({ ...addForm, categoriaId: e.target.value })}
            >
              <option value="">Personalizados</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary text-sm">
            Salvar
          </button>
        </form>
      )}
      {/* Categories */}
      <div className="space-y-5">
        {visibleCats.length === 0 && (
          <div className="card-soft p-8 text-center text-sm text-stone-500">
            Nenhuma categoria para exibir com este filtro.
          </div>
        )}
        {visibleCats.map((cat) => (
          <section key={cat.id} className="card-soft overflow-hidden">
            <div className="bg-gradient-to-r from-blush-soft to-lavender/40 px-4 py-3 border-b border-rose-50">
              <h3 className="font-display text-lg text-rose-800">{cat.nome}</h3>
              {cat.descricao && <p className="text-xs text-stone-500 mt-0.5">{cat.descricao}</p>}
            </div>
            <ul className="divide-y divide-rose-50">
              {cat.itens.map((item) => {
                const st = STATUS_OPTIONS.find((s) => s.value === item.status);
                return (
                  <li key={item.id} className="px-4 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex-1 min-w-[10rem]">
                      <p className="font-medium text-stone-800 text-sm">{item.nome}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-xs text-stone-500">qtd {item.quantidade}</span>
                        <span className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 ${prioridadeBadge(item.prioridade)}`}>
                          {item.prioridade}
                        </span>
                        {item.isCustom && (
                          <span className="text-[10px] rounded-full bg-peach-soft text-orange-800 px-2 py-0.5">
                            custom
                          </span>
                        )}
                      </div>
                      {item.notas && (
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2">{item.notas}</p>
                      )}
                      <StoreButtons nome={item.nome} />
                    </div>
                    {canEdit ? (
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as StatusItem)}
                        className={`rounded-lg border-0 text-xs px-2 py-1.5 font-medium ${st?.color || ""}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`rounded-lg text-xs px-2 py-1.5 font-medium ${st?.color || ""}`}>
                        {st?.label}
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-rose-500 text-sm px-1"
                        title="Remover"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                );
              })}
              {cat.itens.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-stone-400 space-y-1">
                  <p>Nenhum item nesta categoria.</p>
                  {canEdit && (
                    <p className="text-xs">Use <strong>+ Item</strong> para adicionar algo personalizado.</p>
                  )}
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
const STORE_STYLES: Record<string, string> = {
  amazon: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  mercadolivre: "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  shopee: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
};
function StoreButtons({ nome }: { nome: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label={`Buscar "${nome}" nas lojas`}>
      <span className="text-[11px] text-stone-400">Buscar em:</span>
      {storeSearchLinks(nome).map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Buscar "${nome}" na ${s.label}`}
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none transition ${STORE_STYLES[s.id]}`}
        >
          {s.label}
          <span aria-hidden className="ml-1 opacity-60">↗</span>
        </a>
      ))}
    </div>
  );
}
