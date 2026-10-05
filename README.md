# Enxoval+ (MVP)

App B2C em português para organizar checklists de enxoval de **casamento** e **bebê**.

## Como rodar (local)

```bash
cd /workspace/enxo/app
cp .env.example .env
# Ajuste DATABASE_URL e DIRECT_URL (Neon Postgres) ou use um Postgres local
npm install
npx prisma db push
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Scripts úteis:

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server na porta **3000** |
| `npm run build` / `npm start` | Build de produção (`prisma generate && next build`) |
| `npm run db:push` | Aplica o schema Prisma no banco |
| `npm run db:generate` | Regenera o client Prisma |

Se a porta 3000 estiver ocupada:

```bash
npx next dev -p 3001
```

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- **PostgreSQL via Prisma** (produção: **Neon**; use `DATABASE_URL` pooled + `DIRECT_URL` para migrations)
- Auth opcional: email/senha (cookie `enxoval_session`) **ou** modo convidado (cookie `enxoval_guest`)
- Seeds: `src/data/seeds/casamento.json` e `bebe.json` (origem em `/workspace/enxo/templates/`)

## Deploy (Vercel + Neon)

1. Crie um projeto Postgres no **Neon** e copie as connection strings.
2. No projeto **Vercel**, defina:
   - `DATABASE_URL` — connection string pooled (runtime / serverless)
   - `DIRECT_URL` — connection string direta (migrations / `prisma db push`)
3. Conecte o repositório GitHub e faça o deploy (build: `prisma generate && next build`).
4. Após o primeiro deploy (ou via CLI), rode `npx prisma db push` apontando para o Neon.

Não commite `.env` — use apenas `.env.example` como modelo.

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
- Sem integrações de lojas

## Auth / persistência

- Email/senha opcional (Entrar no header) ou cookie de convidado
- Plano Free: no máximo **1 enxoval** por usuário/convidado

## Marketing (landing)

Fonte original: `/workspace/enxo/landing` (HTML + CSS + Three.js).

Servida também pelo app em:

- [http://localhost:3000/marketing/index.html](http://localhost:3000/marketing/index.html)

Link **Sobre** no rodapé do app aponta para essa página.

## Repositório

`https://github.com/goodsdash-collab/Enxoval-plus.git`
