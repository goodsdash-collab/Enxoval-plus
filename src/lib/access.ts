import { prisma } from "@/lib/prisma";
import { getCurrentUser, getGuestKey } from "@/lib/auth";

/** Dono (usuário logado ou convidado) ou link compartilhado com edição. */
export async function canEditList(enxovalId: string, shareToken?: string | null) {
  const enxoval = await prisma.enxoval.findUnique({
    where: { id: enxovalId },
    include: { shares: true },
  });
  if (!enxoval) return false;
  if (shareToken) {
    const share = enxoval.shares.find((s) => s.token === shareToken);
    if (share?.canEdit) return true;
  }
  const user = await getCurrentUser();
  const guestKey = getGuestKey();
  if (user && enxoval.userId === user.id) return true;
  if (guestKey && enxoval.guestKey === guestKey) return true;
  return false;
}
