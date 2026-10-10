import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password || password.length < 4) {
      return NextResponse.json({ error: "Email e senha (mín. 4) obrigatórios" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash },
    });
    await createSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao registrar" }, { status: 500 });
  }
}
