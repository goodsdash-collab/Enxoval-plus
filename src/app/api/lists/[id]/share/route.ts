import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getGuestKey } from "@/lib/auth";

async function isOwner(enxovalId: string) {
  const enxoval = await prisma.enxoval.findUnique({ where: { id: enxovalId } });
  if (!enxoval) return false;
  const user = await getCurrentUser();
  const guestKey = getGuestKey();
  if (user && enxoval.userId === user.id) return true;
  if (guestKey && enxoval.guestKey === guestKey) return true;
  return false;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isOwner(params.id))) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    const body = await req.json();
    const canEdit = Boolean(body.canEdit);
    const token = nanoid(12);

    const share = await prisma.shareLink.create({
      data: {
        enxovalId: params.id,
        token,
        canEdit,
      },
    });

    return NextResponse.json({
      share: {
        id: share.id,
        token: share.token,
        canEdit: share.canEdit,
        url: `/s/${share.token}`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao gerar link" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isOwner(params.id))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const shares = await prisma.shareLink.findMany({
    where: { enxovalId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    shares: shares.map((s) => ({
      id: s.id,
      token: s.token,
      canEdit: s.canEdit,
      url: `/s/${s.token}`,
      createdAt: s.createdAt,
    })),
  });
}
