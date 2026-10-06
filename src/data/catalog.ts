/**
 * Catálogo extra de itens comuns de enxoval, além dos templates (src/lib/seeds.ts).
 * `categoria` usa o id da categoria do template quando existe (ex.: "cozinha", "vestir").
 * Categorias novas (ex.: "sala") são descritas em `extraCategorias` e criadas na lista
 * quando o primeiro item delas é adicionado.
 */
import type { Prioridade, TipoEnxoval } from "@/lib/seeds";

export interface CatalogExtraItem {
  nome: string;
  categoria: string;
  quantidade: number;
  prioridade: Prioridade;
}

export interface CatalogExtraCategoria {
  id: string;
  nome: string;
  descricao?: string;
}

type Row = [nome: string, quantidade: number, prioridade: Prioridade];

function group(categoria: string, rows: Row[]): CatalogExtraItem[] {
  return rows.map(([nome, quantidade, prioridade]) => ({ nome, categoria, quantidade, prioridade }));
}

export const extraCategorias: Record<TipoEnxoval, CatalogExtraCategoria[]> = {
  casamento: [{ id: "sala", nome: "Sala", descricao: "Móveis, conforto e decoração da sala" }],
  bebe: [],
};

export const extraCatalog: Record<TipoEnxoval, CatalogExtraItem[]> = {
  casamento: [
    ...group("cozinha", [
      ["Frigideira antiaderente", 2, "essencial"],
      ["Chaleira", 1, "desejavel"],
      ["Leiteira", 1, "desejavel"],
      ["Abridor de latas", 1, "essencial"],
      ["Saca-rolhas", 1, "desejavel"],
      ["Ralador", 1, "essencial"],
      ["Peneira", 1, "desejavel"],
      ["Descascador de legumes", 1, "desejavel"],
      ["Fouet / batedor manual", 1, "opcional"],
      ["Luvas térmicas", 2, "essencial"],
      ["Panos de prato", 6, "essencial"],
      ["Porta-temperos", 1, "desejavel"],
      ["Lixeira de cozinha", 1, "essencial"],
      ["Garrafa térmica", 1, "desejavel"],
      ["Escorredor de macarrão", 1, "desejavel"],
      ["Tigelas de vidro (bowls)", 4, "desejavel"],
      ["Copo medidor", 1, "opcional"],
      ["Tesoura de cozinha", 1, "desejavel"],
      ["Porta-mantimentos", 4, "desejavel"],
      ["Rolo de massa", 1, "opcional"],
    ]),
    ...group("mesa", [
      ["Travessas de servir", 3, "desejavel"],
      ["Saladeira", 1, "desejavel"],
      ["Bandeja", 1, "opcional"],
      ["Petisqueira", 1, "opcional"],
      ["Açucareiro", 1, "desejavel"],
      ["Manteigueira", 1, "opcional"],
      ["Taças de champanhe", 6, "opcional"],
      ["Faqueiro para churrasco", 1, "opcional"],
    ]),
    ...group("banho", [
      ["Tapete de banheiro", 2, "essencial"],
      ["Roupão de banho", 2, "opcional"],
      ["Toalha de lavabo", 2, "desejavel"],
      ["Porta-papel higiênico", 1, "essencial"],
      ["Escova sanitária", 1, "essencial"],
      ["Espelho de banheiro", 1, "desejavel"],
      ["Toalhas de praia / piscina", 2, "opcional"],
    ]),
    ...group("cama", [
      ["Lençol com elástico avulso", 2, "desejavel"],
      ["Fronhas extras", 4, "desejavel"],
      ["Manta para cama", 1, "desejavel"],
      ["Colcha / cobre-leito", 1, "desejavel"],
      ["Protetor de travesseiro", 2, "desejavel"],
      ["Cabides", 30, "essencial"],
      ["Organizadores de guarda-roupa", 4, "opcional"],
      ["Abajur de cabeceira", 2, "opcional"],
      ["Cortina blackout para quarto", 1, "desejavel"],
      ["Tapete para quarto", 1, "opcional"],
    ]),
    ...group("sala", [
      ["Sofá", 1, "essencial"],
      ["Mesa de centro", 1, "desejavel"],
      ["Rack ou painel para TV", 1, "desejavel"],
      ["Smart TV", 1, "desejavel"],
      ["Tapete para sala", 1, "desejavel"],
      ["Almofadas para sofá", 4, "opcional"],
      ["Manta para sofá", 1, "opcional"],
      ["Cortina para sala", 1, "desejavel"],
      ["Luminária de piso", 1, "opcional"],
      ["Quadros decorativos", 3, "opcional"],
      ["Vasos e plantas", 3, "opcional"],
      ["Mesa de jantar com cadeiras", 1, "essencial"],
      ["Aparador", 1, "opcional"],
      ["Porta-retratos", 3, "opcional"],
      ["Estante / nichos", 1, "opcional"],
    ]),
    ...group("lavanderia-limpeza", [
      ["Prendedores de roupa", 1, "essencial"],
      ["Pá de lixo", 1, "essencial"],
      ["Mop / esfregão", 1, "desejavel"],
      ["Escova de lavar roupa", 1, "desejavel"],
      ["Lixeira para recicláveis", 1, "desejavel"],
      ["Kit produtos de limpeza", 1, "essencial"],
      ["Luvas de limpeza", 2, "desejavel"],
      ["Escada doméstica", 1, "desejavel"],
      ["Esponjas e palha de aço", 1, "essencial"],
    ]),
    ...group("eletros", [
      ["Torradeira", 1, "opcional"],
      ["Chaleira elétrica", 1, "desejavel"],
      ["Mixer de mão", 1, "desejavel"],
      ["Purificador de água", 1, "essencial"],
      ["Ventilador", 1, "desejavel"],
      ["Ar-condicionado", 1, "opcional"],
      ["Coifa / depurador", 1, "opcional"],
      ["Forno elétrico", 1, "opcional"],
      ["Panela elétrica de arroz", 1, "opcional"],
      ["Robô aspirador", 1, "opcional"],
      ["Cooktop", 1, "opcional"],
      ["Secador de cabelo", 1, "desejavel"],
    ]),
  ],
  bebe: [
    ...group("vestir", [
      ["Calça com pezinho", 6, "essencial"],
      ["Conjunto pagão", 3, "desejavel"],
      ["Macacão sem pé", 4, "desejavel"],
      ["Body regata", 4, "desejavel"],
      ["Manta / cueiro", 3, "essencial"],
      ["Sapatinho / pantufa", 2, "opcional"],
      ["Jardineira", 2, "opcional"],
      ["Gorro de lã", 2, "desejavel"],
      ["Cabides infantis", 30, "desejavel"],
      ["Roupa de festa / passeio", 2, "opcional"],
    ]),
    ...group("higiene", [
      ["Fraldas descartáveis M", 6, "essencial"],
      ["Trocadores descartáveis", 1, "desejavel"],
      ["Escova de cabelo macia", 1, "desejavel"],
      ["Necessaire organizadora de higiene", 1, "opcional"],
      ["Saquinhos para fraldas sujas", 1, "desejavel"],
      ["Lixa de unha infantil", 1, "opcional"],
    ]),
    ...group("banho", [
      ["Balde ofurô", 1, "opcional"],
      ["Toalhas fralda", 4, "essencial"],
      ["Caneca para enxágue", 1, "opcional"],
      ["Sabonete em barra glicerinado", 2, "opcional"],
    ]),
    ...group("quarto", [
      ["Poltrona de amamentação", 1, "desejavel"],
      ["Lençol com elástico para berço", 4, "essencial"],
      ["Cobertor / manta para berço", 2, "essencial"],
      ["Cortina blackout para quarto do bebê", 1, "desejavel"],
      ["Umidificador de ar", 1, "desejavel"],
      ["Guarda-roupa infantil", 1, "desejavel"],
      ["Organizador de porta / cabideiro", 1, "opcional"],
      ["Tapete EVA", 1, "opcional"],
      ["Saco de dormir para bebê", 2, "opcional"],
      ["Aparelho de ruído branco", 1, "opcional"],
      ["Porta-fraldas", 1, "opcional"],
      ["Prateleiras / nichos", 2, "opcional"],
    ]),
    ...group("passeio", [
      ["Mochila maternidade", 1, "desejavel"],
      ["Base para bebê-conforto (Isofix)", 1, "opcional"],
      ["Espelho retrovisor para bebê", 1, "opcional"],
      ["Protetor solar para janela do carro", 2, "opcional"],
      ["Manta para carrinho", 1, "desejavel"],
      ["Mosquiteiro para carrinho", 1, "desejavel"],
      ["Organizador para carrinho", 1, "opcional"],
      ["Prendedor de chupeta", 2, "opcional"],
    ]),
    ...group("alimentacao", [
      ["Cadeira de alimentação", 1, "desejavel"],
      ["Copo de transição", 2, "desejavel"],
      ["Escova para mamadeira", 1, "essencial"],
      ["Absorventes para seios", 2, "essencial"],
      ["Concha protetora de mamilo", 1, "opcional"],
      ["Pomada para mamilos (lanolina)", 1, "desejavel"],
      ["Dosador de leite em pó", 1, "opcional"],
      ["Saquinhos para leite materno", 1, "desejavel"],
      ["Escorredor de mamadeiras", 1, "desejavel"],
      ["Kit talheres infantil", 1, "opcional"],
      ["Garrafa térmica para água", 1, "desejavel"],
    ]),
    ...group("seguranca-saude", [
      ["Soro fisiológico", 3, "essencial"],
      ["Inalador / nebulizador", 1, "desejavel"],
      ["Protetores de quina", 4, "opcional"],
      ["Travas para gavetas e armários", 6, "opcional"],
      ["Mordedor refrigerado", 2, "desejavel"],
      ["Repelente infantil (a partir de 6 meses)", 1, "opcional"],
      ["Bolsa térmica de gel para cólicas", 1, "desejavel"],
      ["Porta-documentos do bebê", 1, "opcional"],
    ]),
  ],
};
