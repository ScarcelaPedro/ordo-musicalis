---
status: em-andamento
modulo: api
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0130 — Coordenação por comunidade: endpoint só de servidores da escala

**Task ID**: `TASK-0130`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Extrair o diff de servidores do `PATCH /scales/:id` para `api/_lib/scaleServidoresSync.ts` (função pura `diffScaleServidores` + aplicação + notificações), sem mudar o comportamento do PATCH. Criar `PUT /scales/:id/servidores` (só `servidores`) autorizado por `canManageScaleServers` (admin OU dono de ministério OU coordenador da comunidade gravada da escala). Liberar `GET /scales/sugestoes` para coordenador de comunidade.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0129`.

## Critérios de conclusão

- [ ] Testes: `canManageScaleServers` e `diffScaleServidores`.
- [ ] Coordenador de A edita a equipe de A; 403 em B; 403 no `PATCH` completo.
- [ ] Sem regressão no `PATCH /scales/:id` (staff).
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
