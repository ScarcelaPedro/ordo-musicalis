# Documento de Arquitetura de Software

## Sistema de Gerenciamento de Escala de Músicos Litúrgicos

**Versão**: 3.0 (atualizado para refletir a implementação real — substitui a v2.0, que descrevia um plano Laravel/Inertia nunca concluído; ver histórico no Git para a versão anterior)

## 1. Visão Geral

### 1.1 Objetivo

Este documento descreve a arquitetura do Sistema de Gerenciamento de Escala de Músicos Litúrgicos (Ordo Musicalis), desenvolvido para facilitar o planejamento, organização e comunicação entre coordenadores e músicos/servidores da paróquia.

O sistema permite o cadastro de usuários e servidores, gerenciamento de equipes, criação de escalas, coleta de disponibilidade, vínculos fixos recorrentes, repertório musical, liturgia diária, substituições, notificações automáticas e relatórios.

## 2. Objetivos de Negócio

- Reduzir o trabalho manual na criação de escalas.
- Centralizar informações em uma única plataforma.
- Melhorar a comunicação entre coordenadores e músicos/servidores.
- Diminuir faltas por esquecimento através de notificações (push, e-mail, WhatsApp).
- Disponibilizar repertórios, partituras (PDF) e a liturgia do dia digitalmente.

## 3. Arquitetura do Sistema

### Padrão arquitetural

- **SPA (Single Page Application)** consumindo uma **API HTTP** própria — não é um monolito server-rendered.
- Front-end e back-end são deployados juntos na Vercel, mas como processos logicamente separados (frontend estático + função serverless).

### Camadas

**Apresentação (Front-end)** — [`src/`](../src/AGENTS.md)
- Tecnologias: Vue 3 (Composition API), Vue Router 4, Pinia, Tailwind CSS, Vite.
- Responsabilidades: interface do usuário, roteamento client-side com guards de autenticação/papel (`admin`/`coordenador`/`musico`), estado de sessão e tema.

**Aplicação / API** — [`api/`](../api/AGENTS.md)
- Tecnologias: Node.js, Express, TypeScript.
- Responsabilidades: regras de negócio, autenticação (JWT + bcrypt), autorização por papel e por equipe (middlewares `auth`/`roles`/`teamScope`), integrações externas (liturgia diária, e-mail, push, WhatsApp), endpoints REST sob `/api/*`.

**Persistência** — PostgreSQL (Supabase)
- Tecnologias: PostgreSQL, Prisma ORM.
- Responsabilidades: armazenamento de dados, migrations versionadas ([`api/prisma/migrations/`](../api/prisma/migrations)), integridade referencial (constraints, `onDelete` cascades definidos no schema).

**Integrações externas**
- **Resend** — envio de e-mail (lembretes).
- **Web Push** (`web-push` + Service Worker em [`public/sw.js`](../public/sw.js)) — notificações no navegador.
- **Evolution API** (self-hosted via [`evolution/docker-compose.yml`](../evolution/docker-compose.yml)) — notificações via WhatsApp.
- **Vercel Blob** — armazenamento de PDFs de repertório.
- **API pública de liturgia diária** (`LITURGIA_API_URL`) — sincronização automática da liturgia do dia.

## 4. Diagrama de Arquitetura

```text
Usuário (navegador)
   ↓
SPA Vue 3 (src/), servida como estático pela Vercel
   ↓ HTTP (fetch/axios, JSON)
API Express (api/), função serverless na Vercel
   ↓
Prisma ORM
   ↓
PostgreSQL (Supabase)

Integrações a partir da API:
  → Resend (e-mail)
  → Web Push (navegador do usuário)
  → Evolution API (WhatsApp, self-hosted)
  → Vercel Blob (PDFs)
  → API pública de liturgia diária

Cron jobs da Vercel (vercel.json) chamam periodicamente:
  → POST /api/cron/lembretes (diário)
  → POST /api/cron/liturgia-sync (diário)
```

## 5. Estrutura de Diretórios

```text
ordo-musicalis/
├── src/                  # SPA Vue 3 — ver src/AGENTS.md
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   ├── stores/           # Pinia
│   ├── router/
│   ├── api/               # cliente axios
│   └── utils/
├── api/                   # API Express — ver api/AGENTS.md
│   ├── _routes/
│   ├── _middleware/
│   ├── _lib/
│   └── prisma/             # schema, migrations, seeds
├── evolution/              # infra Docker do WhatsApp (Evolution API)
├── public/                 # estáticos (Service Worker de push)
├── docs/                   # este documento, SCOPE.md, decisions/, tasks/
└── dist/                   # build gerado (npm run build)
```

## 6. Banco de dados

Modelo completo em [`api/prisma/schema.prisma`](../api/prisma/schema.prisma) (fonte de verdade). Principais entidades: `User`, `Servidor`, `Team`, `Comunidade`, `Celebrante`, `Instrument`, `CategoriaFuncao`, `Scale` (celebração/escala), `ScaleServidor` (escalação de um servidor numa escala), `Substituicao`, `Repertoire`/`RepertoireItem`, `Availability`, `ScaleTemplate`/`VinculoFixo` (recorrência), `AvailabilityWindow`, `Liturgia`, `PushSubscription`.

## 7. Segurança

- **Autenticação**: JWT (`jsonwebtoken`), assinado com `JWT_SECRET`; token enviado pelo front-end como `Authorization: Bearer <token>` (ver [`src/api/client.ts`](../src/api/client.ts)).
- **Senhas**: hash com `bcryptjs`.
- **Autorização**: por papel (`admin`/`coordenador`/`musico`), aplicada tanto no roteamento do front-end (`meta.roles`) quanto nos middlewares da API.
- **Validação de entrada**: `zod` nos endpoints da API.
- **CORS**: restrito à origem definida em `FRONTEND_URL`.
- **Segredos**: nunca commitados — `.env.example` documenta as variáveis necessárias com placeholders; `.env*` está no `.gitignore`.

## 8. Performance e disponibilidade

Sem SLA formal definido ainda. A aplicação roda inteiramente sobre a infraestrutura serverless da Vercel (frontend + API), o que dá escalonamento automático e alta disponibilidade por padrão da plataforma; a única infraestrutura self-hosted é a stack de WhatsApp (Evolution API + Postgres + Redis via Docker Compose), que roda fora da Vercel.

## 9. Escalabilidade / evolução futura

Ver [`docs/SCOPE.md`](SCOPE.md) para a direção atual do projeto e roadmap (a preencher pelo time). Decisões técnicas não triviais tomadas ao longo do desenvolvimento ficam registradas em [`docs/decisions/`](decisions/).

Um redesign de UX/UI está em andamento, formalizado em specs (`docs/specs/`) e tasks
(`docs/tasks/`). A Etapa 1 (arquitetura da interface e navegação) está documentada em
[`docs/arquitetura-interface.md`](arquitetura-interface.md); a Etapa 2 (UX e wireframes) em
[`docs/ux-wireframes-etapa2.md`](ux-wireframes-etapa2.md); a Etapa 3 (Design System) em
[`docs/design-system.md`](design-system.md); a Etapa 4 (Implementação Frontend) em
[`docs/relatorio-implementacao-etapa4.md`](relatorio-implementacao-etapa4.md).

## 10. Tecnologias utilizadas

**Front-end**: Vue 3, Vue Router, Pinia, Tailwind CSS, Vite, TypeScript.
**Back-end**: Node.js, Express, TypeScript, Prisma.
**Banco de dados**: PostgreSQL (Supabase).
**Integrações**: Resend, Vercel Blob, Web Push, Evolution API.
**Infra/deploy**: Vercel (hosting + serverless functions + cron), Docker Compose (Evolution API).
**Ferramentas**: Git, GitHub.

## 11. Conclusão

A arquitetura atual — SPA Vue 3 desacoplada de uma API Express própria, com Prisma/PostgreSQL — oferece simplicidade operacional (deploy único na Vercel), boa produtividade de desenvolvimento em TypeScript de ponta a ponta, e espaço para evolução incremental sem necessidade de reescrita, atendendo às necessidades atuais da paróquia.
