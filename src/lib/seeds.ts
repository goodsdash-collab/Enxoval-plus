import casamento from "@/data/seeds/casamento.json";
import bebe from "@/data/seeds/bebe.json";

export type Prioridade = "essencial" | "desejavel" | "opcional";
export type StatusItem = "pendente" | "comprado" | "ganho" | "adiado";
export type TipoEnxoval = "casamento" | "bebe";

export interface SeedItem {
  id: string;
  nome: string;
  quantidade_sugerida: number;
  prioridade: Prioridade;
  status_inicial?: StatusItem;
  notas?: string;
}

export interface SeedCategoria {
  id: string;
  nome: string;
  descricao?: string;
  itens: SeedItem[];
}

export interface SeedTemplate {
  id: string;
  nome: string;
  descricao: string;
  categorias: SeedCategoria[];
}

export const templates: Record<TipoEnxoval, SeedTemplate> = {
  casamento: casamento as SeedTemplate,
  bebe: bebe as SeedTemplate,
};

export function getTemplate(tipo: TipoEnxoval): SeedTemplate {
  const t = templates[tipo];
  if (!t) throw new Error(`Template não encontrado: ${tipo}`);
  return t;
}
