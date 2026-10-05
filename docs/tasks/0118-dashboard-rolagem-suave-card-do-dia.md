---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0118 — Dashboard: rolagem suave até os horários do dia

**Task ID**: `TASK-0118`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): ao clicar em um dia do calendário do dashboard que tenha
celebração marcada, a página deve levar o usuário "delicadamente" até os horários (card do dia,
TASK-0114/TASK-0115).

## Comportamento esperado

- Dia **com** celebração: a página rola com animação suave (easing, ~700 ms) até o card do dia,
  que fica no topo da tela com uma pequena margem. Se o card já está inteiro visível, não rola.
- Dia **sem** celebração: o card abre no lugar, sem rolagem (antes rolava sempre).
- `prefers-reduced-motion`: a rolagem é instantânea. Qualquer rolagem do próprio usuário (roda,
  toque, tecla) durante a animação a interrompe.

## Implementação

- `src/utils/scroll.ts`: `gentleScrollIntoView`, com `easeInOutCubic` e `scrollTargetFor` (funções
  puras, testadas em `src/utils/scroll.test.ts`). O `behavior: 'smooth'` nativo foi descartado por
  ser rápido e brusco no Chromium.
- `Dashboard.vue` (`toggleSelectedDay`): usa o utilitário apenas quando `hasEvents(dia)`.

## Progresso

- 2026-10-05: implementado, testes e build ok. Concluída.
