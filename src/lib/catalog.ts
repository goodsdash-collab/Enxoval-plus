import { templates, type Prioridade, type TipoEnxoval } from "@/lib/seeds";
import { extraCatalog, extraCategorias } from "@/data/catalog";
import { normalizeName } from "@/lib/normalize";

export { normalizeName };

export interface CatalogItem {
  /** chave estável: "<categoriaId>:<nome normalizado>" */
  key: string;
  nome: string;
  categoriaId: string;
  quantidade: number;
  prioridade: Prioridade;
  notas?: string;
  /** id do item no template, se veio dos seeds */
  templateItemId?: string;
}

export interface CatalogCategoria {
  id: string;
  nome: string;
  descricao?: string;
  itens: CatalogItem[];
}

function slug(s: string) {
  return normalizeName(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const cache = new Map<TipoEnxoval, CatalogCategoria[]>();

/** Catálogo completo (template + extras) agrupado por categoria, sem nomes duplicados. */
export function getCatalog(tipo: TipoEnxoval): CatalogCategoria[] {
  const hit = cache.get(tipo);
  if (hit) return hit;
  const template = templates[tipo];
  const cats: CatalogCategoria[] = [];
  const byId = new Map<string, CatalogCategoria>();
  const seen = new Set<string>();

  for (const c of template.categorias) {
    const cat: CatalogCategoria = { id: c.id, nome: c.nome, descricao: c.descricao, itens: [] };
    cats.push(cat);
    byId.set(c.id, cat);
    for (const it of c.itens) {
      const n = normalizeName(it.nome);
      if (seen.has(n)) continue;
      seen.add(n);
      cat.itens.push({
        key: `${c.id}:${slug(it.nome)}`,
        nome: it.nome,
        categoriaId: c.id,
        quantidade: it.quantidade_sugerida || 1,
        prioridade: it.prioridade || "desejavel",
        notas: it.notas,
        templateItemId: it.id,
      });
    }
  }
  for (const c of extraCategorias[tipo]) {
    if (byId.has(c.id)) continue;
    const cat: CatalogCategoria = { id: c.id, nome: c.nome, descricao: c.descricao, itens: [] };
    cats.push(cat);
    byId.set(c.id, cat);
  }
  for (const it of extraCatalog[tipo]) {
    const cat = byId.get(it.categoria);
    if (!cat) continue;
    const n = normalizeName(it.nome);
    if (seen.has(n)) continue;
    seen.add(n);
    cat.itens.push({
      key: `${cat.id}:${slug(it.nome)}`,
      nome: it.nome,
      categoriaId: cat.id,
      quantidade: it.quantidade || 1,
      prioridade: it.prioridade || "desejavel",
    });
  }
  const result = cats.filter((c) => c.itens.length > 0);
  cache.set(tipo, result);
  return result;
}

export function catalogSize(tipo: TipoEnxoval) {
  return getCatalog(tipo).reduce((n, c) => n + c.itens.length, 0);
}
