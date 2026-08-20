Ver também o [AGENTS.md raiz](../AGENTS.md).

## Propósito

API HTTP em Express que serve a SPA em [`src/`](../src/AGENTS.md). Concentra toda a lógica de negócio do Ordo Musicalis (escalas de músicos/servidores litúrgicos): cadastro de servidores/equipes/comunidades, montagem de escalas, disponibilidade, vínculos fixos, repertório, liturgia diária, substituições, notificações (e-mail/push/WhatsApp) e relatórios.

## Tech stack / Estrutura

- **Express 4** + `express-async-errors` (permite `async` handlers sem `try/catch` manual — erros caem no error handler central).
- **Prisma 5** como ORM, contra **PostgreSQL** (hospedado no Supabase, ver `DATABASE_URL`/`DIRECT_URL` em `.env.example` — `DIRECT_URL` é usado para migrations, `DATABASE_URL` para a conexão pooled via pgbouncer em runtime).
- Autenticação via **JWT** (`jsonwebtoken`) + `bcryptjs` para hashing de senha — não é Laravel/Sanctum, apesar do que `docs/arquitetura.md` descreve (ver ⚠️ na raiz).
- `zod` para validação de payloads.
- `web-push` para notificações push (Service Worker registrado em [`public/sw.js`](../public/sw.js), assinaturas persistidas em `PushSubscription`).
- `resend` para envio de e-mail (lembretes).
- `@vercel/blob` para upload/armazenamento de PDFs de repertório.

Diretórios:

- `api/index.ts` — monta o app Express, registra todas as rotas sob `/api/*` e o error handler central (mapeia códigos de erro do Prisma — `P2025`/`P2002`/`P2003` — para respostas HTTP apropriadas).
- `api/server.ts` — entrypoint para rodar localmente (`npm run api:dev`), chama `app.listen`. Em produção (Vercel), `api/index.ts` é consumido diretamente como função serverless (ver `vercel.json`).
- `api/_routes/` — um arquivo por recurso (`auth`, `servidores`, `teams`, `comunidades`, `categorias`, `celebrantes`, `scales`, `scaleTemplates`, `repertoire`, `repertoireItems`, `liturgia`, `availability`, `availabilityWindows`, `vinculosFixos`, `profile`, `instruments`, `substituicoes`, `public`, `reports`, `push`, `cron`).
- `api/_middleware/` — `auth.ts` (valida JWT, popula `req.user`), `roles.ts` (autorização por papel — `admin`/`coordenador`/`musico`), `teamScope.ts` (escopo por equipe).
- `api/_lib/` — utilitários: `date.ts`, `fetchLiturgia.ts` (integração com API pública de liturgia diária, ver `LITURGIA_API_URL`), `sendPush.ts`, `sendWhatsapp.ts` (integração com Evolution API, ver `evolution/docker-compose.yml`), `suggestServidores.ts` (sugestão de escalação).
- `api/prisma/schema.prisma` — schema completo do banco (fonte de verdade do modelo de dados). `api/prisma/migrations/` — histórico de migrations. `api/prisma/seed.ts`/`seedJuly.ts` — scripts de seed.

## APIs / superfícies principais

Todas as rotas são montadas sob `/api/` em `api/index.ts` — ver esse arquivo para o mapeamento completo de prefixos (`/api/servidores`, `/api/scales`, `/api/liturgia`, etc.) e a ordem de registro (relevante para rotas aninhadas, ex. `/api/scales/:scaleId/repertoire`). `GET /api/health` é um healthcheck simples.

`vercel.json` define dois crons que batem em rotas desta API: `POST /api/cron/lembretes` (diário, 12:00 UTC) e `/api/cron/liturgia-sync` (diário, 06:00 UTC) — ambas roteadas por `api/_routes/cron.ts`.

## Configuração

Variáveis relevantes (ver `.env.example` na raiz — nenhum valor real está commitado):

- `DATABASE_URL` / `DIRECT_URL` — conexão Postgres (Supabase, pooled vs. direta).
- `JWT_SECRET`, `JWT_EXPIRES_IN` — autenticação.
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (upload de PDFs).
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — envio de e-mail.
- `FRONTEND_URL` — origem permitida no CORS (`api/index.ts`).
- `PORT` — porta do servidor local (`api/server.ts`, default `3001`).
- `LITURGIA_API_URL` — API pública de liturgia diária (tem default, opcional sobrescrever).
- WhatsApp: `EVOLUTION_API_KEY` é consumido pelo container em [`evolution/docker-compose.yml`](../evolution/docker-compose.yml) (infra separada, self-hosted, não faz parte do deploy Vercel).

## Testes

> Regra 3 do [AGENTS.md raiz](../AGENTS.md).

Não há framework de teste configurado para a API hoje. Antes de escrever testes de rota/integração, configure **Vitest** ou **Jest** (ambos compatíveis com `ts-node`/ESM do projeto) e registre a escolha em `docs/decisions/` se houver dúvida razoável entre os dois.

## Build/deploy

- `npm run api:dev` — roda a API localmente via `ts-node` (usa [`tsconfig.api.json`](../tsconfig.api.json), `module: CommonJS`, saída em `dist/api` se compilado).
- `npm run dev:full` — API + SPA juntos.
- `npm run db:generate` / `db:migrate` / `db:seed` / `db:studio` — comandos Prisma, todos com `--schema=api/prisma/schema.prisma`.
- `postinstall` já roda `prisma generate` automaticamente após `npm install`.
- Deploy: Vercel serve `api/index.ts` como função serverless (rewrites em `vercel.json`); os crons do Vercel chamam as rotas `/api/cron/*` diretamente, não há scheduler separado rodando em produção.

## Convenções

Nomes de rotas/modelos de domínio em português (`servidores`, `celebrantes`, `vinculosFixos`, `substituicoes`) refletem termos do negócio — preservar. Código novo/editado segue a regra 1 do [AGENTS.md raiz](../AGENTS.md).
