---
status: concluida
modulo: api
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0129 — Coordenação por comunidade: dados, vínculos (admin) e auth/me

**Task ID**: `TASK-0129`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Criar o vínculo pessoa ↔ comunidade (`ComunidadeCoordenador`, migration). Criar `GET/PUT /comunidades/:id/coordenadores`, só para admin e só com servidores que têm login. Incluir `comunidadesCoordenadas` em `/auth/login` e `/auth/me`. Criar o helper `coordinatedCommunityIds` em `api/_lib/communityScope.ts`.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] Model + migration aplicável com `prisma migrate deploy`.
- [x] Endpoints de vínculo só para admin (403 para os demais); rejeitam servidor sem login.
- [x] `/auth/login` e `/auth/me` devolvem `comunidadesCoordenadas`.
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
- 2026-10-08 — Executada. Commit: `049ac7e`.

  **Dados**: model `ComunidadeCoordenador` (`comunidade_coordenador`; único em
  `[comunidadeId, servidorId]`; cascade nos dois lados) com relações em `Servidor` e
  `Comunidade`. Migration `20261008120000_comunidade_coordenador` gerada por
  `prisma migrate diff` contra o schema do `HEAD` (sem banco). Aplicada sem erro com
  `prisma migrate deploy` num Postgres limpo. ⚠️ Em produção, rodar `prisma migrate deploy` antes
  do deploy (a Vercel não roda migrations).

  **Ajuste em relação ao plano**: em vez de um helper separado `coordinatedCommunityIds`, as
  comunidades coordenadas são carregadas **na mesma consulta** que o middleware `authenticate` já
  fazia (`userScopeInclude`), e ficam em `req.user.coordinatedCommunityIds`. Isso evita uma query
  extra por rota protegida. `/auth/login` e `/auth/me` usam o mesmo include e devolvem
  `comunidadesCoordenadas`; `/auth/register` devolve `[]`.

  **Vínculos (só admin)**: `GET/PUT /comunidades/:id/coordenadores`. O PUT recebe
  `{ servidorIds }` e substitui o conjunto inteiro numa transação; recusa com 422 quem não tem
  login. A validação fica em `partitionCoordinatorIds` (`api/_lib/communityScope.ts`), com 3
  testes.

  **Verificação** (banco temporário + API local, curl): não-admin → 403 no GET e no PUT; servidor
  sem login → 422 `invalid:[3]`; admin adiciona a Xênia → `/auth/me` e o login passam a ter
  `comunidadesCoordenadas:[1]`; lista vazia remove → `[]`; comunidade inexistente → 404.
  `tsc` da API, `npm run build` e `npm test` (74, incluindo os 3 novos) passam.
