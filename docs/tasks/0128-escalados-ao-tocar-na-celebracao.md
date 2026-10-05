---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0128 — Escalados só ao tocar na celebração

**Task ID**: `TASK-0128`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): a lista de escalados da `TASK-0127`, aberta para todas as
celebrações do dia, deixou o card cheio de novo. Os escalados devem aparecer só ao clicar numa
celebração específica.

## Implementação

- `Dashboard.vue`: cada celebração do card do dia virou um botão expansível (`aria-expanded`, seta
  que gira). Fica aberta uma celebração por vez (`expandedScaleId`), e trocar de dia fecha tudo.
- O link para `/escalas/:id`, que antes era a própria linha da celebração, foi para dentro da área
  expandida ("Ver escala completa").

## Progresso

- 2026-10-05: implementado. Type-check e testes ok. Concluída.
