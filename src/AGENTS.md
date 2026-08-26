Ver também o [AGENTS.md raiz](../AGENTS.md).

## Propósito

SPA (Single Page Application) em Vue 3 — a interface web do Ordo Musicalis, o sistema de escalas de músicos/servidores litúrgicos. Consome exclusivamente a API em [`api/`](../api/AGENTS.md) via HTTP (`fetch`/`axios`), sem SSR.

## Tech stack / Estrutura

- **Vue 3** (Composition API), **Vue Router 4** (`createWebHistory`), **Pinia** (state management), **Tailwind CSS** (+ `@tailwindcss/forms`), **Vite** como bundler/dev server.
- Alias `@` → `src/` (configurado em [`vite.config.ts`](../vite.config.ts) e [`tsconfig.json`](../tsconfig.json)).

Diretórios:

- `src/pages/` — uma pasta por domínio (`servidores`, `teams`, `scales`, `comunidades`, `categorias`, `celebrantes`, `repertoire`, `liturgia`, `availability`, `substitutions`, `reports`, `scaleTemplates`, `profile`, `auth`, `public`, `dashboard`), cada uma tipicamente com `Index.vue`/`Create.vue`/`Edit.vue`/`Show.vue`. Roteadas em [`src/router/index.ts`](router/index.ts).
- `src/components/` — componentes de UI reutilizáveis e genéricos (`Badge`, `PrimaryButton`, `SecondaryButton`, `DangerButton`, `TextInput`, `InputLabel`, `InputError`, `Toast`, `ThemeToggle`).
- `src/layouts/` — `AuthenticatedLayout.vue` e `GuestLayout.vue`.
- `src/stores/` — Pinia stores: `auth.ts` (sessão/token JWT), `flash.ts` (mensagens flash), `theme.ts` (tema claro/escuro, lido de `localStorage`/`prefers-color-scheme` já no `index.html` para evitar flash).
- `src/router/index.ts` — todas as rotas da aplicação; usa `meta.auth`, `meta.guest` e `meta.roles` (`admin`/`coordenador`/`musico`) com um guard global (`router.beforeEach`) que consulta a store `auth`.
- `src/api/client.ts` — instância única do `axios` (`baseURL: '/api'`), injeta `Authorization: Bearer <token>` de `localStorage.auth_token` e redireciona para `/login` em resposta `401`.
- `src/utils/` — `date.ts`, `push.ts` (Web Push/Service Worker), `recurrence.ts` (regras de recorrência de escalas/vínculos fixos), `status.ts`.
- `src/assets/app.css` — entrypoint do Tailwind.

## Configuração

- Em dev, o proxy do Vite (`vite.config.ts`) encaminha `/api/*` para `http://localhost:3001` (a API Express local).
- Em produção (Vercel), `vercel.json` reescreve `/api/*` para a função serverless e todo o resto para `index.html` (SPA fallback).
- Tema inicial (claro/escuro) é decidido por um script inline em [`index.html`](../index.html) antes do Vue montar, para não haver flash de tema errado.

## Testes

> Regra 3 do [AGENTS.md raiz](../AGENTS.md).

Não há framework de teste configurado para o frontend hoje (sem Vitest/Jest, sem `test` script no `package.json`). Antes de escrever testes de componente/store, configure **Vitest** (nativo do ecossistema Vite) e registre a escolha em `docs/decisions/` caso haja alternativa relevante em avaliação.

## Build/deploy

- `npm run dev` — Vite dev server (porta padrão 5173).
- `npm run build` — roda `vue-tsc` (type-check) e depois `vite build`; saída em `dist/`.
- `npm run dev:full` — sobe API e frontend juntos (`concurrently`).
- Deploy é via Vercel (ver `vercel.json` e [`api/AGENTS.md`](../api/AGENTS.md) para a função serverless).

⚠️ **Diretório `resources/` (raiz do repo) é código morto**: é o scaffold de um Laravel Breeze + Inertia + Vue abandonado no início do projeto (ver commits `87a5bb6`/`343ace4`), substituído pela SPA Vue+Vite atual em `src/`. Nada em `index.html`, `vite.config.ts` ou nos scripts do `package.json` referencia `resources/`. Não editar/estender `resources/` — se for confirmado que não há mais uso, é candidato a remoção (fica registrado aqui em vez de removido silenciosamente, ver regra 2 do AGENTS.md raiz).

## Convenções

Código existente usa nomes de domínio em português (`servidores`, `escalas`, `celebrantes`, `disponibilidade`) porque são termos do negócio (paróquia/liturgia) — não traduzir esses termos de domínio. Código novo/editado segue a regra 1 do [AGENTS.md raiz](../AGENTS.md): identificadores técnicos genéricos em inglês, texto voltado ao usuário (labels, mensagens, toasts) permanece em português.
