import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOrCreateGuestKey } from "@/lib/auth";
import { getTemplate, TipoEnxoval } from "@/lib/seeds";

export async function GET() {
  const user = await getCurrentUser();
  const guestKey = getOrCreateGuestKey();

  const lists = await prisma.enxoval.findMany({
    where: user
      ? { OR: [{ userId: user.id }, { guestKey }] }
      : { guestKey },
    include: {
      categorias: { include: { itens: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const summarized = lists.map((l) => {
    const itens = l.categorias.flatMap((c) => c.itens);
    const done = itens.filter((i) => i.status === "comprado" || i.status === "ganho").length;
    return {
      id: l.id,
      nome: l.nome,
      tipo: l.tipo,
      createdAt: l.createdAt,
      totalItens: itens.length,
      concluidos: done,
      progresso: itens.length ? Math.round((done / itens.length) * 100) : 0,
    };
  });

  return NextResponse.json({ lists: summarized, user: user ? { id: user.id, email: user.email } : null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tipo = body.tipo as TipoEnxoval;
    if (tipo !== "casamento" && tipo !== "bebe") {
      return NextResponse.json({ error: "tipo deve ser casamento ou bebe" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const guestKey = getOrCreateGuestKey();
    const template = getTemplate(tipo);

    // Free plan: max 1 enxoval per user/guest
    const existingCount = await prisma.enxoval.count({
      where: user ? { OR: [{ userId: user.id }, { guestKey }] } : { guestKey },
    });
    if (existingCount >= 1 && !body.forcePro) {
      // Soft limit for Free UI — still allow create for MVP demo but warn
      // Actually enforce free: 1 list. Allow creating if they have 0.
    }
    // Enforce free tier: 1 list
    if (existingCount >= 1) {
      return NextResponse.json(
        { error: "Plano Free permite 1 enxoval. Faça upgrade para Pro (R$19,90/mês) para criar mais.", code: "FREE_LIMIT" },
        { status: 403 }
      );
    }

    const enxoval = await prisma.enxoval.create({
      data: {
        nome: body.nome || template.nome,
        tipo,
        userId: user?.id,
        guestKey: user ? null : guestKey,
        categorias: {
          create: template.categorias.map((cat, ci) => ({
            nome: cat.nome,
            descricao: cat.descricao || null,
            ordem: ci,
            templateId: cat.id,
            itens: {
              create: cat.itens.map((item, ii) => ({
                nome: item.nome,
                quantidade: item.quantidade_sugerida || 1,
                prioridade: item.prioridade || "desejavel",
                status: item.status_inicial || "pendente",
                notas: item.notas || null,
                templateId: item.id,
                ordem: ii,
                isCustom: false,
              })),
            },
          })),
        },
      },
      include: {
        categorias: { include: { itens: true }, orderBy: { ordem: "asc" } },
      },
    });

    return NextResponse.json({ enxoval });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar enxoval" }, { status: 500 });
  }
}
