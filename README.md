# Enxoval+ (MVP)

App B2C em português para organizar checklists de enxoval de **casamento** e **bebê**.

## Como rodar

```bash
cd /workspace/enxo/app
npm install
npx prisma db push
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Scripts úteis:

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server na porta **3000** |
| `npm run build` / `npm start` | Build de produção |
| `npm run db:push` | Aplica o schema Prisma no SQLite |
| `npm run db:generate` | Regenera o client Prisma |

Se a porta 3000 estiver ocupada:

```bash
npx next dev -p 3001
```

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- SQLite via **Prisma** — arquivo em `data/enxoval.db`
- `DATABASE_URL=file:../data/enxoval.db` (definido em `.env`; caminho relativo ao diretório `prisma/`)
- Auth opcional: email/senha (cookie `enxoval_session`) **ou** modo convidado (cookie `enxoval_guest`)
- Seeds: `src/data/seeds/casamento.json` e `bebe.json` (origem em `/workspace/enxo/templates/`)

## Funcionalidades

1. Home: escolher Casamento ou Bebê → cria lista a partir do template
2. Página da lista (`/lista/[id]`): categorias, qtd, prioridade (essencial/desejável/opcional), status (pendente/comprado/ganho/adiado)
3. Progresso % + seção **Urgente** (essenciais pendentes)
4. Adicionar / remover itens customizados
5. Compartilhar link `/s/[token]` (somente leitura ou com edição)
6. UI de preços em `/precos`: **Free** (1 enxoval) / **Pro R$19,90/mês** (sem pagamento real)
7. Landing de marketing estática em `/marketing/index.html` (cópia de `/workspace/enxo/landing`)

## Limitações do MVP

- **Sem pagamentos reais** — o botão Pro fica “Em breve”; o limite Free (1 lista) já é aplicado na API
- **Modo convidado**: listas ligadas ao cookie `enxoval_guest` no navegador (somem se limpar cookies)
- **SQLite local**: banco em `data/enxoval.db` (ignorado no git via `data/*.db`)
- Sem integrações de lojas

## Auth / persistência

- Preferido neste MVP: SQLite + email/senha opcional (Entrar no header)
- Sem login: cookie de convidado
- Plano Free: no máximo **1 enxoval** por usuário/convidado

## Marketing (landing)

Fonte original: `/workspace/enxo/landing` (HTML + CSS + Three.js).

Servida também pelo app em:

- [http://localhost:3000/marketing/index.html](http://localhost:3000/marketing/index.html)

Link **Sobre** no rodapé do app aponta para essa página. Para servir a pasta original à parte:

```bash
cd /workspace/enxo/landing && python3 -m http.server 8080
```

## Repositório

Remote sugerido (ainda não autenticado neste ambiente):

`https://github.com/goodsdash-collab/Enxoval-plus.git`
