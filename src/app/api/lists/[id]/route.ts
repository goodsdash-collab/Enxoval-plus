import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getGuestKey } from "@/lib/auth";

async function canAccess(enxovalId: string, shareToken?: string | null) {
  const enxoval = await prisma.enxoval.findUnique({
    where: { id: enxovalId },
    include: {
      categorias: { include: { itens: true }, orderBy: { ordem: "asc" } },
      shares: true,
    },
  });
  if (!enxoval) return { allowed: false as const, enxoval: null, canEdit: false };

  if (shareToken) {
    const share = enxoval.shares.find((s) => s.token === shareToken);
    if (share) return { allowed: true as const, enxoval, canEdit: share.canEdit };
  }

  const user = await getCurrentUser();
  const guestKey = getGuestKey();
  if (user && enxoval.userId === user.id) return { allowed: true as const, enxoval, canEdit: true };
  if (guestKey && enxoval.guestKey === guestKey) return { allowed: true as const, enxoval, canEdit: true };

  return { allowed: false as const, enxoval: null, canEdit: false };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const shareToken = req.nextUrl.searchParams.get("token");
  const { allowed, enxoval, canEdit } = await canAccess(params.id, shareToken);
  if (!allowed || !enxoval) {
    return NextResponse.json({ error: "Enxoval não encontrado" }, { status: 404 });
  }
  const itens = enxoval.categorias.flatMap((c) => c.itens);
  const done = itens.filter((i) => i.status === "comprado" || i.status === "ganho").length;
  const urgentes = itens.filter((i) => i.prioridade === "essencial" && i.status === "pendente");

  return NextResponse.json({
    enxoval: {
      id: enxoval.id,
      nome: enxoval.nome,
      tipo: enxoval.tipo,
      categorias: enxoval.categorias.map((c) => ({
        ...c,
        itens: c.itens.sort((a, b) => a.ordem - b.ordem),
      })),
      progresso: itens.length ? Math.round((done / itens.length) * 100) : 0,
      totalItens: itens.length,
      concluidos: done,
      urgentes,
    },
    canEdit,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, canEdit } = await canAccess(params.id);
  if (!allowed || !canEdit) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  await prisma.enxoval.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, canEdit } = await canAccess(params.id);
  if (!allowed || !canEdit) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const body = await req.json();
  const enxoval = await prisma.enxoval.update({
    where: { id: params.id },
    data: { nome: body.nome },
  });
  return NextResponse.json({ enxoval });
}
