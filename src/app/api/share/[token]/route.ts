import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const share = await prisma.shareLink.findUnique({
    where: { token: params.token },
    include: {
      enxoval: {
        include: {
          categorias: { include: { itens: true }, orderBy: { ordem: "asc" } },
        },
      },
    },
  });
  if (!share) {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 404 });
  }

  const enxoval = share.enxoval;
  const itens = enxoval.categorias.flatMap((c) => c.itens);
  const done = itens.filter((i) => i.status === "comprado" || i.status === "ganho").length;
  const urgentes = itens.filter((i) => i.prioridade === "essencial" && i.status === "pendente");

  return NextResponse.json({
    canEdit: share.canEdit,
    token: share.token,
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
  });
}
