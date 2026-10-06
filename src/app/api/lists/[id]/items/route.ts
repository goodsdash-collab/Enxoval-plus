import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEditList } from "@/lib/access";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const shareToken = body.token || req.nextUrl.searchParams.get("token");
    if (!(await canEditList(params.id, shareToken))) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    let categoriaId = body.categoriaId as string | undefined;
    if (!categoriaId) {
      // create or find "Personalizados"
      let cat = await prisma.categoria.findFirst({
        where: { enxovalId: params.id, nome: "Personalizados" },
      });
      if (!cat) {
        const maxOrdem = await prisma.categoria.aggregate({
          where: { enxovalId: params.id },
          _max: { ordem: true },
        });
        cat = await prisma.categoria.create({
          data: {
            enxovalId: params.id,
            nome: "Personalizados",
            descricao: "Itens adicionados por você",
            ordem: (maxOrdem._max.ordem ?? 0) + 1,
          },
        });
      }
      categoriaId = cat.id;
    }

    // verify category belongs to list
    const cat = await prisma.categoria.findFirst({
      where: { id: categoriaId, enxovalId: params.id },
    });
    if (!cat) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        categoriaId,
        nome: body.nome || "Novo item",
        quantidade: body.quantidade || 1,
        prioridade: body.prioridade || "desejavel",
        status: "pendente",
        notas: body.notas || null,
        isCustom: true,
      },
    });
    return NextResponse.json({ item });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao adicionar item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const shareToken = body.token || req.nextUrl.searchParams.get("token");
    if (!(await canEditList(params.id, shareToken))) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    const itemId = body.itemId as string;
    if (!itemId) return NextResponse.json({ error: "itemId obrigatório" }, { status: 400 });

    const item = await prisma.item.findFirst({
      where: { id: itemId, categoria: { enxovalId: params.id } },
    });
    if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.prioridade !== undefined) data.prioridade = body.prioridade;
    if (body.quantidade !== undefined) data.quantidade = body.quantidade;
    if (body.nome !== undefined) data.nome = body.nome;
    if (body.notas !== undefined) data.notas = body.notas;

    const updated = await prisma.item.update({ where: { id: itemId }, data });
    return NextResponse.json({ item: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const shareToken = body.token || req.nextUrl.searchParams.get("token");
    const itemId = (body.itemId || req.nextUrl.searchParams.get("itemId")) as string;
    if (!(await canEditList(params.id, shareToken))) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    if (!itemId) return NextResponse.json({ error: "itemId obrigatório" }, { status: 400 });

    const item = await prisma.item.findFirst({
      where: { id: itemId, categoria: { enxovalId: params.id } },
    });
    if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

    await prisma.item.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao remover item" }, { status: 500 });
  }
}
