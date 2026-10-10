"use client";

import { useEffect, useState } from "react";

export function DeleteAccountForm() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setEmail(d.user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) return setMsg({ ok: false, text: "Marque a confirmação para continuar." });
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível excluir agora.");
      setMsg({ ok: true, text: data.message || "Pronto! Seus dados foram excluídos." });
      setEmail(null);
      setPassword("");
      setConfirm(false);
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (email === undefined) return <p className="text-sm text-stone-500">Carregando…</p>;

  return (
    <form onSubmit={submit} className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-3">
      {email ? (
        <>
          <p className="text-sm">
            Conectado como <strong>{email}</strong>.
          </p>
          <label className="block text-sm">
            Senha
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-2"
            />
          </label>
        </>
      ) : (
        <p className="text-sm">
          Você não está conectado. Para excluir uma conta, <strong>entre primeiro</strong> pelo botão “Entrar” no topo. Sem conta, o botão
          abaixo apaga apenas as listas do modo convidado deste aparelho.
        </p>
      )}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1" />
        <span>Entendo que a exclusão é definitiva e não pode ser desfeita.</span>
      </label>
      <button disabled={busy} className="btn-primary bg-rose-600 hover:bg-rose-700">
        {busy ? "Excluindo…" : email ? "Excluir minha conta e meus dados" : "Apagar listas do modo convidado"}
      </button>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>}
    </form>
  );
}
