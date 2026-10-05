---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0119 — Lista de escalas: remover "Ministério" e abrir no mês atual

**Task ID**: `TASK-0119`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05) para a tela `/escalas` (`src/pages/scales/Index.vue`):

- Retirar a parte de "Ministério" da lista, que não faz mais sentido no projeto.
- Ao entrar na tela, já vir filtrada pelo mês atual, em vez de listar todas as escalas criadas.

## Implementação

- Removidos a coluna "Ministério" (desktop), o badge do ministério (mobile) e o filtro
  "Todos os ministérios" (com a carga de `/teams` que só servia a ele). A API continua aceitando
  `teamId`, só a tela deixou de usar.
- `filterMes` começa com `toMonthValue()` (novo em `src/utils/date.ts`, testado em
  `date.test.ts`), no formato `YYYY-MM` do `<input type="month">`. Limpar o campo continua
  listando todas as escalas.

## Progresso

- 2026-10-05: implementado, testes e build ok. Concluída.
