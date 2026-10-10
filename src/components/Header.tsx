"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  async function refresh() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Erro");
      return;
    }
    setOpen(false);
    setForm({ email: "", password: "" });
    refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-peach text-lg">
            💕
          </span>
          <span className="font-display text-xl font-semibold text-rose-700">
            Enxoval<span className="text-sage">+</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/precos" className="twa-hide text-rose-600 hover:text-rose-800">
            Preços
          </Link>
          {email ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-stone-500">{email}</span>
              <button onClick={logout} className="btn-secondary text-xs py-1.5">
                Sair
              </button>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="btn-secondary text-xs py-1.5">
              Entrar
            </button>
          )}
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 p-4" onClick={() => setOpen(false)}>
          <div className="card-soft w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-rose-800 mb-1">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              Opcional — você também pode usar como convidado.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-rose-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                required
                minLength={4}
                placeholder="Senha (mín. 4)"
                className="w-full rounded-xl border border-rose-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {msg && <p className="text-sm text-red-600">{msg}</p>}
              <button type="submit" className="btn-primary w-full">
                {mode === "login" ? "Entrar" : "Registrar"}
              </button>
            </form>
            <button
              className="mt-3 text-sm text-rose-600 underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Criar conta" : "Já tenho conta"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
