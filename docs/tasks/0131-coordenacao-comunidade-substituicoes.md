---
status: em-andamento
modulo: api
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0131 — Coordenação por comunidade: substituições com escopo de comunidade

**Task ID**: `TASK-0131`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Substituições (listar, sugestões, aprovar, rejeitar) passam a aceitar o coordenador da comunidade da escala, além de admin e dono do ministério (regra OR). Recusas também notificam os coordenadores da comunidade.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0129`.

## Critérios de conclusão

- [ ] Teste de `substitutionScopeWhere`.
- [ ] Coordenador de A lista e aprova substituições de A e não vê as de B; regra de ministério inalterada.
- [ ] Recusa notifica os coordenadores da comunidade (push/WhatsApp).
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
