/** Normaliza para comparação: minúsculas, sem acentos, espaços colapsados. */
export function normalizeName(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
