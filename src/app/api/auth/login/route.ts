import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: (email || "").toLowerCase() } });
    if (!user || !(await verifyPassword(password || "", user.passwordHash))) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao entrar" }, { status: 500 });
  }
}
