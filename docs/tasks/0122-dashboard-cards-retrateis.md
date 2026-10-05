---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0122 — Cards retráteis no dashboard do administrador

**Task ID**: `TASK-0122`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): o dashboard do administrador tem informação demais. Os cards
"Próximas celebrações", "Pendências de confirmação" e "Cobertura dos ministérios" devem poder ser
recolhidos para melhorar a visualização.

## Implementação

- Novo componente `src/components/CollapsibleCard.vue`: mesmo visual dos cards laterais, título
  vira um botão (chevron, `aria-expanded`/`aria-controls`) que recolhe/expande o corpo. O slot
  `actions` (ex. "Ver todas") continua visível com o card recolhido.
- O estado aberto/fechado é lembrado por navegador (`localStorage`, chave `collapsed:<storageKey>`)
  via `src/utils/collapsedState.ts`, com fallback para o estado padrão do card se o storage faltar
  ou falhar.
  É só conveniência de quem está vendo, não dado do sistema.
- Os três cards começam **recolhidos** por padrão (`default-collapsed`, pedido do usuário em
  2026-10-05). Quem abrir um card o mantém aberto: os dois estados ficam gravados (`1`/`0`).
- Aplicado aos três cards citados em `src/pages/dashboard/Dashboard.vue`. "Próxima celebração",
  "Situação das escalas" e o calendário não mudaram (não foram pedidos).

## Progresso

- 2026-10-05: implementado, testes (`collapsedState.test.ts`) e build ok. Concluída.
- 2026-10-05: cards passam a iniciar recolhidos por padrão.
