import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEditList } from "@/lib/access";
import { getCatalog, normalizeName, type CatalogItem } from "@/lib/catalog";
import { storeSearchLinks, type StoreLink } from "@/lib/stores";
import type { TipoEnxoval } from "@/lib/seeds";

type InputItem = string | { key: string; loja?: StoreLink["id"] };

/**
 * Adiciona vários itens do catálogo de uma vez.
 * Body: { items: Array<string | { key, loja? }>, token? }
 * `loja` (amazon | mercadolivre | shopee) marca o item com a nota "Aberto na <loja>".
 * Itens cujo nome já existe na lista (sem diferenciar maiúsculas/acentos) são ignorados.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const shareToken = body.token || req.nextUrl.searchParams.get("token");
    if (!(await canEditList(params.id, shareToken))) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    const raw: InputItem[] = Array.isArray(body.items) ? body.items : Array.isArray(body.keys) ? body.keys : [];
    if (raw.length === 0) {
      return NextResponse.json({ error: "Nenhum item selecionado" }, { status: 400 });
    }
    if (raw.length > 300) {
      return NextResponse.json({ error: "Muitos itens de uma vez" }, { status: 400 });
    }

    const enxoval = await prisma.enxoval.findUnique({
      where: { id: params.id },
      include: { categorias: { include: { itens: { select: { nome: true, ordem: true } } } } },
    });
    if (!enxoval) return NextResponse.json({ error: "Enxoval não encontrado" }, { status: 404 });
    const tipo = enxoval.tipo as TipoEnxoval;
    if (tipo !== "casamento" && tipo !== "bebe") {
      return NextResponse.json({ error: "Tipo de lista inválido" }, { status: 400 });
    }

    const catalog = getCatalog(tipo);
    const byKey = new Map<string, CatalogItem>();
    for (const c of catalog) for (const it of c.itens) byKey.set(it.key, it);

    const existingNames = new Set(
      enxoval.categorias.flatMap((c) => c.itens.map((i) => normalizeName(i.nome)))
    );
    const storeLabel = (id?: string) =>
      id ? storeSearchLinks("x").find((s) => s.id === id)?.label : undefined;

    const toAdd: { item: CatalogItem; loja?: string }[] = [];
    const skipped: string[] = [];
    for (const r of raw) {
      const key = typeof r === "string" ? r : r?.key;
      const item = key ? byKey.get(key) : undefined;
      if (!item) continue;
      const n = normalizeName(item.nome);
      if (existingNames.has(n)) {
        skipped.push(item.nome);
        continue;
      }
      existingNames.add(n);
      toAdd.push({ item, loja: typeof r === "string" ? undefined : storeLabel(r.loja) });
    }
    if (toAdd.length === 0) {
      return NextResponse.json({ added: [], skipped });
    }

    // Resolve (ou cria) a categoria da lista para cada categoria do catálogo
    const catMap = new Map<string, { id: string; nextOrdem: number }>();
    let maxCatOrdem = Math.max(-1, ...enxoval.categorias.map((c) => c.ordem));
    for (const { item } of toAdd) {
      if (catMap.has(item.categoriaId)) continue;
      const catalogCat = catalog.find((c) => c.id === item.categoriaId)!;
      const listCat =
        enxoval.categorias.find((c) => c.templateId === catalogCat.id) ||
        enxoval.categorias.find((c) => normalizeName(c.nome) === normalizeName(catalogCat.nome));
      if (listCat) {
        const maxItemOrdem = Math.max(-1, ...listCat.itens.map((i) => i.ordem));
        catMap.set(item.categoriaId, { id: listCat.id, nextOrdem: maxItemOrdem + 1 });
      } else {
        maxCatOrdem += 1;
        const created = await prisma.categoria.create({
          data: {
            enxovalId: enxoval.id,
            nome: catalogCat.nome,
            descricao: catalogCat.descricao || null,
            ordem: maxCatOrdem,
            templateId: catalogCat.id,
          },
        });
        catMap.set(item.categoriaId, { id: created.id, nextOrdem: 0 });
      }
    }

    const added = await prisma.$transaction(
      toAdd.map(({ item, loja }) => {
        const cat = catMap.get(item.categoriaId)!;
        const ordem = cat.nextOrdem++;
        const notaLoja = loja ? `Aberto na ${loja}` : null;
        const notas = [item.notas, notaLoja].filter(Boolean).join(" · ") || null;
        return prisma.item.create({
          data: {
            categoriaId: cat.id,
            nome: item.nome,
            quantidade: item.quantidade || 1,
            prioridade: item.prioridade || "desejavel",
            status: "pendente",
            notas,
            isCustom: false,
            templateId: item.templateItemId || item.key,
            ordem,
          },
        });
      })
    );
    await prisma.enxoval.update({ where: { id: enxoval.id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ added, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao adicionar itens" }, { status: 500 });
  }
}
