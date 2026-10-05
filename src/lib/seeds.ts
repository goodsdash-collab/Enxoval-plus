import casamento0 from "@/data/seeds/casamento.part0.json";
import casamento1 from "@/data/seeds/casamento.part1.json";
import casamento2 from "@/data/seeds/casamento.part2.json";
import bebe0 from "@/data/seeds/bebe.part0.json";
import bebe1 from "@/data/seeds/bebe.part1.json";
import bebe2 from "@/data/seeds/bebe.part2.json";
import bebe3 from "@/data/seeds/bebe.part3.json";

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

function mergeTemplate(parts: Array<{ id?: string; nome?: string; descricao?: string; categorias: SeedCategoria[] }>): SeedTemplate {
  const head = parts[0];
  return {
    id: head.id!,
    nome: head.nome!,
    descricao: head.descricao!,
    categorias: parts.flatMap((p) => p.categorias),
  };
}

export const templates: Record<TipoEnxoval, SeedTemplate> = {
  casamento: mergeTemplate([casamento0, casamento1, casamento2] as unknown as Parameters<typeof mergeTemplate>[0]),
  bebe: mergeTemplate([bebe0, bebe1, bebe2, bebe3] as unknown as Parameters<typeof mergeTemplate>[0]),
};

export function getTemplate(tipo: TipoEnxoval): SeedTemplate {
  const t = templates[tipo];
  if (!t) throw new Error(`Template não encontrado: ${tipo}`);
  return t;
}
