---
status: backlog
modulo: api
owner:
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

- [ ] Model + migration aplicável com `prisma migrate deploy`.
- [ ] Endpoints de vínculo só para admin (403 para os demais); rejeitam servidor sem login.
- [ ] `/auth/login` e `/auth/me` devolvem `comunidadesCoordenadas`.
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
