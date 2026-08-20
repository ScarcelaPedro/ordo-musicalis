# Ordo Musicalis

Sistema de gerenciamento de escalas de músicos e servidores litúrgicos para uma paróquia: cadastro de servidores/equipes/comunidades/celebrantes, montagem e confirmação de escalas de celebração, coleta de disponibilidade, vínculos fixos (recorrência automática), repertório musical (com PDFs), liturgia diária integrada, substituições, notificações (push/e-mail/WhatsApp) e relatórios.

Ver [`AGENTS.md`](AGENTS.md) para a documentação completa voltada a desenvolvimento (com agentes de IA ou não) — este README cobre apenas a visão geral e o setup local.

## Stack

- **Frontend**: Vue 3 (Composition API) + Vite + Vue Router + Pinia + Tailwind CSS — SPA, sem SSR.
- **Backend**: API HTTP em Express (TypeScript), autenticação via JWT.
- **Banco de dados**: PostgreSQL (hospedado no Supabase) via Prisma ORM.
- **Integrações**: Resend (e-mail), Vercel Blob (upload de PDFs de repertório), Web Push (notificações no navegador), Evolution API (WhatsApp, self-hosted via Docker).
- **Deploy**: Vercel (frontend estático + API como função serverless + cron jobs).

Detalhes por módulo em [`src/AGENTS.md`](src/AGENTS.md) (frontend) e [`api/AGENTS.md`](api/AGENTS.md) (backend).

## Rodando localmente

Pré-requisitos: Node.js e uma instância PostgreSQL acessível (local ou Supabase).

```bash
npm install                # instala dependências e já roda `prisma generate`
cp .env.example .env       # preencha DATABASE_URL, JWT_SECRET etc.
npm run db:migrate          # aplica as migrations no banco
npm run db:seed             # (opcional) popula dados de exemplo

npm run dev:full            # sobe API (porta 3001) e SPA (porta 5173) juntos
```

Outros comandos úteis:

```bash
npm run dev          # só a SPA (Vite)
npm run api:dev      # só a API (Express via ts-node)
npm run build        # type-check + build de produção (dist/)
npm run db:studio    # abre o Prisma Studio
```

Notificações via WhatsApp dependem da Evolution API rodando localmente:

```bash
docker compose -f evolution/docker-compose.yml up -d
```

## Licença

Este projeto está licenciado sob a [licença MIT](LICENSE).
