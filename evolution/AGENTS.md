Ver também o [AGENTS.md raiz](../AGENTS.md).

## Propósito

Infraestrutura self-hosted (Docker Compose) da [Evolution API](https://github.com/EvolutionAPI/evolution-api), usada para enviar notificações via WhatsApp. É a única parte do sistema que **não** roda na Vercel — sobe separadamente (localmente ou em algum host próprio) e é consumida pela API principal via HTTP.

Consumidor: [`api/_lib/sendWhatsapp.ts`](../api/AGENTS.md) faz as chamadas HTTP para esta instância.

## Estrutura

Um único arquivo, [`docker-compose.yml`](docker-compose.yml), com três serviços:

- **`evolution-api`** — a própria Evolution API (imagem `evoapicloud/evolution-api:latest`), exposta na porta `8080`. Autenticada via `AUTHENTICATION_API_KEY` (variável `EVOLUTION_API_KEY`). Persiste instâncias de WhatsApp no volume `evolution_instances`.
- **`postgres`** — banco de dados próprio da Evolution API (Postgres 15, usuário/senha/db `evolution`/`evolution`/`evolution`, fixos no compose — **não** é o mesmo banco da aplicação principal, que usa Supabase). Volume `postgres_data`.
- **`redis`** — cache da Evolution API (Redis 7). Volume `redis_data`.

Os três serviços têm healthcheck configurado e `depends_on: condition: service_healthy`, então `evolution-api` só sobe depois que `postgres` e `redis` estiverem prontos.

## Configuração

- `EVOLUTION_API_KEY` (variável de ambiente no host onde o `docker compose` roda) — chave de autenticação da API; a mesma chave deve ser configurada como `EVOLUTION_API_KEY` no `.env` da API principal (ver [`api/AGENTS.md`](../api/AGENTS.md) e `.env.example` na raiz) para que `api/_lib/sendWhatsapp.ts` consiga autenticar.
- Credenciais do Postgres/Redis internos são fixas no `docker-compose.yml` (não parametrizadas por env var) — aceitável porque esse banco não é exposto fora da rede interna do Compose nem acessado por mais nada além do próprio `evolution-api`.

## Build/deploy

```bash
docker compose -f evolution/docker-compose.yml up -d
```

Não há pipeline de deploy automatizado para esta stack — é levantada manualmente onde for necessário (dev local ou um host dedicado). Não faz parte do `vercel.json` nem do build do `npm run build`.

## Convenções

Nenhum código de aplicação vive aqui — apenas configuração de infraestrutura. Mudanças na integração de WhatsApp em si (payloads, endpoints chamados) ficam em [`api/_lib/sendWhatsapp.ts`](../api/AGENTS.md), não neste diretório.
