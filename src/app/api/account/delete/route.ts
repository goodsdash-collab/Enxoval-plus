import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearGuestCookie, clearSession, getCurrentUser, getGuestKey, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Exclui a conta logada (confirmando a senha) e todos os enxovais dela e do convidado deste aparelho.
 * Sem conta: exclui só os enxovais do modo convidado. Categorias, itens e links caem em cascata.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const user = await getCurrentUser();
  const guestKey = getGuestKey();

  if (user) {
    if (!body?.password || !(await verifyPassword(String(body.password), user.passwordHash))) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }
  } else if (!guestKey) {
    return NextResponse.json({ error: "Nenhuma conta conectada nem lista de convidado neste aparelho." }, { status: 400 });
  }

  const or = [...(user ? [{ userId: user.id }] : []), ...(guestKey ? [{ guestKey }] : [])];
  const [lists] = await prisma.$transaction([
    prisma.enxoval.deleteMany({ where: { OR: or } }),
    ...(user ? [prisma.user.delete({ where: { id: user.id } })] : []),
  ]);

  await clearSession();
  clearGuestCookie();
  return NextResponse.json({
    ok: true,
    deletedLists: lists.count,
    message: user
      ? `Conta excluída. Apagamos sua conta e ${lists.count} enxoval(is), com todos os itens e links.`
      : `Apagamos ${lists.count} enxoval(is) do modo convidado deste aparelho.`,
  });
}
