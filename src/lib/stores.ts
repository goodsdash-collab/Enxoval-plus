export type StoreLink = {
  id: "amazon" | "mercadolivre" | "shopee";
  label: string;
  url: string;
};

/** Normaliza o nome do item para busca (remove espaços extras). */
function cleanName(nome: string): string {
  return nome.replace(/\s+/g, " ").trim();
}

export function amazonSearchUrl(nome: string): string {
  return `https://www.amazon.com.br/s?k=${encodeURIComponent(cleanName(nome))}`;
}

export function mercadoLivreSearchUrl(nome: string): string {
  const slug = cleanName(nome).split(" ").map(encodeURIComponent).join("-");
  return `https://lista.mercadolivre.com.br/${slug}`;
}

export function shopeeSearchUrl(nome: string): string {
  return `https://shopee.com.br/search?keyword=${encodeURIComponent(cleanName(nome))}`;
}

/** Links de busca do item nas lojas (Amazon, Mercado Livre e Shopee). */
export function storeSearchLinks(nome: string): StoreLink[] {
  return [
    { id: "amazon", label: "Amazon", url: amazonSearchUrl(nome) },
    { id: "mercadolivre", label: "Mercado Livre", url: mercadoLivreSearchUrl(nome) },
    { id: "shopee", label: "Shopee", url: shopeeSearchUrl(nome) },
  ];
}
