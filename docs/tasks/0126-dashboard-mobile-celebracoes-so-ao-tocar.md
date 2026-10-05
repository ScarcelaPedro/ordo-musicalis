---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0126 — Dashboard mobile: celebrações só ao tocar no dia

**Task ID**: `TASK-0126`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): no dashboard mobile, a lista com todas as celebrações do mês
abaixo do calendário polui a tela. As celebrações de um dia só devem aparecer ao tocar nele.

## Implementação

- `src/components/Calendar.vue`: removida a lista mobile do mês (slot `list-item`). No mobile, os
  detalhes do dia aparecem só no card `selected-day` (já usado desde a `TASK-0114`), aberto ao
  tocar no dia.
- `src/pages/dashboard/Dashboard.vue`: removidos o template `#list-item` e `SCALE_CHIP_CLASS`, que
  ficaram sem uso.

## Progresso

- 2026-10-05: implementado. Type-check e testes ok. Concluída.
