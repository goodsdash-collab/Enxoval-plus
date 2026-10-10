import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Cookie novo e assinado (o antigo "enxoval_session" guardava o ID do usuário em texto puro e deixou de valer).
const SESSION_COOKIE = "enxoval_sid";
const LEGACY_SESSION_COOKIE = "enxoval_session";
const GUEST_COOKIE = "enxoval_guest";
const SESSION_DAYS = 30;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curto demais");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/**
 * Token de sessão: "v1.<userId>.<expira em ms>.<nonce>.<HMAC-SHA256>" assinado com SESSION_SECRET.
 * Sem o segredo não dá para criar nem alterar um token válido.
 */
export function createSessionToken(userId: string, now = Date.now()) {
  const exp = now + SESSION_DAYS * 24 * 3600 * 1000;
  const payload = `v1.${userId}.${exp}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token || token.length > 300) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v1") return null;
  const payload = parts.slice(0, 4).join(".");
  let expected: Buffer, got: Buffer;
  try {
    expected = Buffer.from(sign(payload));
    got = Buffer.from(parts[4]);
  } catch {
    return null;
  }
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  const exp = Number(parts[2]);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return parts[1] || null;
}

export async function createSession(userId: string) {
  const store = cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), { ...baseCookie, maxAge: SESSION_DAYS * 24 * 3600 });
  store.delete(LEGACY_SESSION_COOKIE);
}

export async function clearSession() {
  const store = cookies();
  store.delete(SESSION_COOKIE);
  store.delete(LEGACY_SESSION_COOKIE);
}

export async function getCurrentUser() {
  const raw = cookies().get(SESSION_COOKIE)?.value; // fora do try: o Next precisa ver o uso de cookies()
  let userId: string | null = null;
  try {
    userId = verifySessionToken(raw);
  } catch (e) {
    console.error("sessão:", (e as Error).message); // sem segredo = ninguém logado (falha fechada)
  }
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

/**
 * Chave do modo convidado: identificador aleatório (192 bits, crypto) que só o próprio aparelho conhece.
 * Chaves antigas continuam valendo para ninguém perder as listas de convidado.
 */
export function getOrCreateGuestKey(): string {
  const store = cookies();
  let key = store.get(GUEST_COOKIE)?.value;
  if (!key || !/^guest_[A-Za-z0-9_-]{8,80}$/.test(key)) {
    key = `guest_${randomBytes(24).toString("base64url")}`;
  }
  // (re)grava sempre com secure/httpOnly/sameSite=lax
  store.set(GUEST_COOKIE, key, { ...baseCookie, maxAge: 60 * 60 * 24 * 365 });
  return key;
}

export function getGuestKey(): string | null {
  const key = cookies().get(GUEST_COOKIE)?.value ?? null;
  return key && /^guest_[A-Za-z0-9_-]{8,80}$/.test(key) ? key : null;
}

export function clearGuestCookie() {
  cookies().delete(GUEST_COOKIE);
}
