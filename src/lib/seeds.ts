import casamento0 from "@/data/seeds/casamento.part0.json";
import casamento1 from "@/data/seeds/casamento.part1.json";
import casamento2 from "@/data/seeds/casamento.part2.json";
import casamento3 from "@/data/seeds/casamento.part3.json";
import casamento4 from "@/data/seeds/casamento.part4.json";
import casamento5 from "@/data/seeds/casamento.part5.json";
import casamento6 from "@/data/seeds/casamento.part6.json";
import casamento7 from "@/data/seeds/casamento.part7.json";
import casamento8 from "@/data/seeds/casamento.part8.json";
import casamento9 from "@/data/seeds/casamento.part9.json";
import casamento10 from "@/data/seeds/casamento.part10.json";
import casamento11 from "@/data/seeds/casamento.part11.json";
import bebe0 from "@/data/seeds/bebe.part0.json";
import bebe1 from "@/data/seeds/bebe.part1.json";
import bebe2 from "@/data/seeds/bebe.part2.json";
import bebe3 from "@/data/seeds/bebe.part3.json";
import bebe4 from "@/data/seeds/bebe.part4.json";
import bebe5 from "@/data/seeds/bebe.part5.json";
import bebe6 from "@/data/seeds/bebe.part6.json";
import bebe7 from "@/data/seeds/bebe.part7.json";
import bebe8 from "@/data/seeds/bebe.part8.json";
import bebe9 from "@/data/seeds/bebe.part9.json";
import bebe10 from "@/data/seeds/bebe.part10.json";
import bebe11 from "@/data/seeds/bebe.part11.json";
import bebe12 from "@/data/seeds/bebe.part12.json";

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
  const byId = new Map<string, SeedCategoria>();
  const order: string[] = [];
  for (const part of parts) {
    for (const cat of part.categorias) {
      const existing = byId.get(cat.id);
      if (existing) {
        existing.itens.push(...cat.itens);
      } else {
        const copy = { ...cat, itens: [...cat.itens] };
        byId.set(cat.id, copy);
        order.push(cat.id);
      }
    }
  }
  return {
    id: head.id!,
    nome: head.nome!,
    descricao: head.descricao!,
    categorias: order.map((id) => byId.get(id)!),
  };
}

export const templates: Record<TipoEnxoval, SeedTemplate> = {
  casamento: mergeTemplate([casamento0, casamento1, casamento2, casamento3, casamento4, casamento5, casamento6, casamento7, casamento8, casamento9, casamento10, casamento11] as unknown as Parameters<typeof mergeTemplate>[0]),
  bebe: mergeTemplate([bebe0, bebe1, bebe2, bebe3, bebe4, bebe5, bebe6, bebe7, bebe8, bebe9, bebe10, bebe11, bebe12] as unknown as Parameters<typeof mergeTemplate>[0]),
};

export function getTemplate(tipo: TipoEnxoval): SeedTemplate {
  const t = templates[tipo];
  if (!t) throw new Error(`Template não encontrado: ${tipo}`);
  return t;
}
