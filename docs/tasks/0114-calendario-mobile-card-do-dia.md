---
status: em-andamento
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-10-01
---

# 0114 — Calendário mobile: card do dia com os horários das celebrações

**Task ID**: `TASK-0114`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-01): **no mobile**, ao tocar num dia do calendário do Dashboard,
deve aparecer um card com os horários das celebrações já criadas naquele dia; tocar num horário
abre a escala. **O desktop não muda.**

Hoje os botões de dia da grade compacta (`Calendar.vue`) já emitem `select-day`, mas o
Dashboard não trata o evento, então o toque não faz nada.

## Comportamento esperado

- Toque num dia → card logo abaixo da grade, com data por extenso, informação litúrgica do dia
  (quando houver) e a lista de celebrações do dia (horário + nome + status). Cada item é um
  link para `/escalas/:id`.
- Dia sem celebração → card com mensagem informativa (não inventa ação).
- Dia selecionado destacado na grade; tocar de novo no mesmo dia ou no "fechar" esconde o card.
  Trocar de mês limpa a seleção.
- Funciona nos dois perfis (o calendário aparece para staff e servidor) e nas duas variantes da
  grade compacta (claro/tinta e escuro/blocos da `TASK-0111`).
- Desktop (≥ `md`): sem nenhuma mudança visual ou de comportamento.

## Critérios de conclusão

- [ ] Card aparece ao tocar num dia, com horários reais das escalas daquele dia.
- [ ] Tocar no horário navega para a escala correspondente.
- [ ] Estado vazio, fechar e trocar de mês funcionam.
- [ ] Acessível: dia selecionado com `aria-pressed`, card com título e anúncio para leitor de tela.
- [ ] Desktop inalterado; sem scroll horizontal a 360px; claro e escuro.
- [ ] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0101-calendario-liturgico-linguagem-visual.md`, `docs/tasks/0111-calendario-mobile-modo-escuro.md`.

## Notas de progresso

- 2026-10-01 — Task criada e reivindicada a pedido do usuário.
