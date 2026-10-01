---
status: em-andamento
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-10-01
---

# 0115 — Calendário desktop: blocos uniformes + card do dia ao clicar

**Task ID**: `TASK-0115`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-01): no desktop, dias com várias celebrações (ex. 3 missas no mesmo
dia) faziam os blocos do calendário esticarem de forma desigual, porque cada escala virava um
chip dentro do bloco. O desktop deve passar a funcionar como o mobile (`TASK-0114`): ao clicar em
um dia, aparece um card com os horários das celebrações, e cada horário abre a escala.

## Comportamento esperado

- Blocos do desktop com **altura fixa e uniforme**, sem chips de escala: número do dia, ponto
  litúrgico, "Hoje" e um indicador de quantidade ("3 celebrações").
- Bloco clicável (botão, `aria-pressed`, foco visível); o dia selecionado tem destaque.
- O mesmo card da `TASK-0114` (data, liturgia, horários → `/escalas/:id`, estado vazio, fechar,
  limpa ao trocar de mês), abaixo da grade, trazido para a área visível ao abrir.
- Legenda "Escalas" atualizada (os chips com ícone de confirmada deixam de existir).
- Mobile continua como está.

## Critérios de conclusão

- [ ] Todos os blocos do desktop com a mesma altura, com 0, 1 ou 3 celebrações no dia.
- [ ] Clique no dia abre o card; clique no horário abre a escala; estados vazio/fechar/mês ok.
- [ ] Um único card no DOM (sem `id` duplicado entre desktop e mobile).
- [ ] Mobile sem regressão; claro e escuro; teclado.
- [ ] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0114-calendario-mobile-card-do-dia.md`, `docs/tasks/0101-calendario-liturgico-linguagem-visual.md`.

## Notas de progresso

- 2026-10-01 — Task criada e reivindicada a pedido do usuário.
