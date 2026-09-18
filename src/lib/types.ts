export type Prioridade = "essencial" | "desejavel" | "opcional";
export type StatusItem = "pendente" | "comprado" | "ganho" | "adiado";

export const PRIORIDADES: { value: Prioridade; label: string }[] = [
  { value: "essencial", label: "Essencial" },
  { value: "desejavel", label: "Desejável" },
  { value: "opcional", label: "Opcional" },
];

export const STATUS_OPTIONS: { value: StatusItem; label: string; color: string }[] = [
  { value: "pendente", label: "Pendente", color: "bg-amber-100 text-amber-800" },
  { value: "comprado", label: "Comprado", color: "bg-emerald-100 text-emerald-800" },
  { value: "ganho", label: "Ganho", color: "bg-sky-100 text-sky-800" },
  { value: "adiado", label: "Adiado", color: "bg-stone-100 text-stone-600" },
];

export function calcProgress(itens: { status: string }[]) {
  if (itens.length === 0) return 0;
  const done = itens.filter((i) => i.status === "comprado" || i.status === "ganho").length;
  return Math.round((done / itens.length) * 100);
}
