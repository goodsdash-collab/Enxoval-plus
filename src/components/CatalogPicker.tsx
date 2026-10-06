"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogCategoria, CatalogItem } from "@/lib/catalog";
import { normalizeName } from "@/lib/normalize";
import { storeSearchLinks, type StoreLink } from "@/lib/stores";

const PRIORIDADE_LABEL: Record<string, string> = {
  essencial: "Essencial",
  desejavel: "Desejável",
  opcional: "Opcional",
};

const PRIORIDADE_BADGE: Record<string, string> = {
  essencial: "bg-rose-100 text-rose-700",
  desejavel: "bg-lavender text-purple-800",
  opcional: "bg-stone-100 text-stone-600",
};

const STORE_PILL: Record<StoreLink["id"], string> = {
  amazon: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  mercadolivre: "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  shopee: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
};

export function CatalogPicker({
  listId,
  tipo,
  existingNames,
  shareToken,
  onClose,
  onAdded,
}: {
  listId: string;
  tipo: string;
  /** nomes já na lista, normalizados com normalizeName */
  existingNames: Set<string>;
  shareToken?: string;
  onClose: () => void;
  /** chamado após adicionar; `count` = itens criados, `closing` = se o modal vai fechar */
  onAdded: (count: number, msg: string, closing: boolean) => void;
}) {
  const [categorias, setCategorias] = useState<CatalogCategoria[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addedNow, setAddedNow] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/catalog?tipo=${encodeURIComponent(tipo)}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!alive) return;
        if (!ok) setLoadError(j.error || "Erro ao carregar o catálogo");
        else setCategorias(j.categorias);
      })
      .catch(() => alive && setLoadError("Falha de rede ao carregar o catálogo"));
    return () => {
      alive = false;
    };
  }, [tipo]);

  // Esc fecha; trava o scroll da página por trás
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  const inList = (it: CatalogItem) => existingNames.has(normalizeName(it.nome)) || addedNow.has(it.key);

  const filtered = useMemo(() => {
    if (!categorias) return [];
    const q = normalizeName(query);
    if (!q) return categorias;
    return categorias
      .map((c) => ({
        ...c,
        itens: normalizeName(c.nome).includes(q) ? c.itens : c.itens.filter((i) => normalizeName(i.nome).includes(q)),
      }))
      .filter((c) => c.itens.length > 0);
  }, [categorias, query]);

  const totalShown = filtered.reduce((n, c) => n + c.itens.length, 0);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCategory(cat: CatalogCategoria) {
    const avail = cat.itens.filter((i) => !inList(i)).map((i) => i.key);
    const allOn = avail.length > 0 && avail.every((k) => selected.has(k));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of avail) {
        if (allOn) next.delete(k);
        else next.add(k);
      }
      return next;
    });
  }

  async function addSelected() {
    if (selected.size === 0 || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/lists/${listId}/items/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: Array.from(selected), token: shareToken }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível adicionar os itens");
        setSaving(false);
        return;
      }
      const n = json.added?.length ?? 0;
      const msg =
        n === 0
          ? "Esses itens já estavam na sua lista."
          : `${n} ${n === 1 ? "item adicionado" : "itens adicionados"} à sua lista.`;
      onAdded(n, msg, true);
      onClose();
    } catch {
      setError("Falha de rede. Tente de novo.");
      setSaving(false);
    }
  }

  /** Clique num link de loja: abre a loja (nova aba, pelo próprio <a>) e adiciona o item à lista. */
  function onStoreClick(item: CatalogItem, loja: StoreLink) {
    if (inList(item)) return;
    setAddedNow((prev) => new Set(prev).add(item.key));
    setSelected((prev) => {
      if (!prev.has(item.key)) return prev;
      const next = new Set(prev);
      next.delete(item.key);
      return next;
    });
    fetch(`/api/lists/${listId}/items/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ key: item.key, loja: loja.id }], token: shareToken }),
      keepalive: true,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (json.added?.length) {
          const msg = `"${item.nome}" foi adicionado à sua lista (aberto na ${loja.label}).`;
          setNotice(msg);
          onAdded(json.added.length, msg, false);
        }
      })
      .catch(() => {
        setAddedNow((prev) => {
          const next = new Set(prev);
          next.delete(item.key);
          return next;
        });
        setError(`Não foi possível adicionar "${item.nome}". Tente de novo.`);
      });
  }

  const count = selected.size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-title"
    >
      <div className="flex w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-xl">
        {/* Cabeçalho */}
        <div className="border-b border-rose-50 px-4 sm:px-6 pt-4 pb-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="catalog-title" className="font-display text-xl text-rose-800">
                Escolher do catálogo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Marque os itens e toque em <strong>Adicionar</strong>. Ao abrir um item numa loja, ele também entra na
                sua lista.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-full p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar no catálogo (ex.: toalha, panela, body)"
            className="w-full rounded-full border border-rose-100 bg-rose-50/40 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          {notice && (
            <p className="rounded-xl bg-mint-soft border border-mint px-3 py-2 text-xs text-emerald-900">{notice}</p>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
          {loadError && <p className="py-10 text-center text-sm text-rose-700">{loadError}</p>}
          {!categorias && !loadError && (
            <p className="py-10 text-center text-sm text-stone-500">Carregando catálogo…</p>
          )}
          {categorias && totalShown === 0 && (
            <p className="py-10 text-center text-sm text-stone-500">
              Nenhum item encontrado para “{query}”. Você pode digitar o item manualmente na lista.
            </p>
          )}
          <div className="space-y-5">
            {filtered.map((cat) => {
              const avail = cat.itens.filter((i) => !inList(i));
              const allOn = avail.length > 0 && avail.every((i) => selected.has(i.key));
              return (
                <section key={cat.id}>
                  <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between gap-2 bg-white/95 px-1 py-1.5 backdrop-blur">
                    <h3 className="font-display text-base text-rose-800">
                      {cat.nome}{" "}
                      <span className="font-sans text-xs text-stone-400">
                        {cat.itens.length - avail.length}/{cat.itens.length} na lista
                      </span>
                    </h3>
                    {avail.length > 0 && (
                      <button onClick={() => toggleCategory(cat)} className="text-xs text-rose-600 hover:underline">
                        {allOn ? "Desmarcar todos" : "Marcar todos"}
                      </button>
                    )}
                  </div>
                  <ul className="divide-y divide-rose-50 rounded-2xl border border-rose-100/70">
                    {cat.itens.map((item) => {
                      const already = inList(item);
                      const checked = already || selected.has(item.key);
                      return (
                        <li key={item.key} className={`px-3 py-2.5 ${already ? "bg-stone-50/70" : ""}`}>
                          <label
                            className={`flex items-start gap-3 ${already ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 accent-rose-400"
                              checked={checked}
                              disabled={already}
                              onChange={() => toggle(item.key)}
                            />
                            <span className="flex-1 min-w-0">
                              <span className={`block text-sm ${already ? "text-stone-400" : "text-stone-800"}`}>
                                {item.nome}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-stone-400">qtd {item.quantidade}</span>
                                <span
                                  className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 ${PRIORIDADE_BADGE[item.prioridade] || ""}`}
                                >
                                  {PRIORIDADE_LABEL[item.prioridade] || item.prioridade}
                                </span>
                                {already && (
                                  <span className="text-[10px] rounded-full bg-mint-soft text-emerald-800 px-2 py-0.5">
                                    ✓ já na lista
                                  </span>
                                )}
                              </span>
                            </span>
                          </label>
                          <div className="mt-1.5 ml-7 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-stone-400">
                              {already ? "Buscar em:" : "Comprar em:"}
                            </span>
                            {storeSearchLinks(item.nome).map((s) => (
                              <a
                                key={s.id}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => onStoreClick(item, s)}
                                title={
                                  already
                                    ? `Buscar "${item.nome}" na ${s.label}`
                                    : `Abrir "${item.nome}" na ${s.label} e adicionar à lista`
                                }
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 transition ${STORE_PILL[s.id]}`}
                              >
                                {s.label}
                                <span aria-hidden className="ml-1 opacity-60">
                                  ↗
                                </span>
                              </a>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-rose-50 px-4 sm:px-6 py-3 space-y-2">
          {error && <p className="text-xs text-rose-700">{error}</p>}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-stone-500">
              {count === 0 ? (
                "Nenhum item marcado"
              ) : (
                <>
                  {count} {count === 1 ? "marcado" : "marcados"} ·{" "}
                  <button onClick={() => setSelected(new Set())} className="text-rose-600 hover:underline">
                    limpar
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} disabled={saving} className="btn-secondary text-sm py-1.5">
                Cancelar
              </button>
              <button
                onClick={addSelected}
                disabled={count === 0 || saving}
                className="btn-primary text-sm py-1.5"
              >
                {saving ? "Adicionando…" : `Adicionar (${count})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
