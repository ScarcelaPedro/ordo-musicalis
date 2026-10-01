---
status: concluida
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

- [x] Card aparece ao tocar num dia, com horários reais das escalas daquele dia.
- [x] Tocar no horário navega para a escala correspondente.
- [x] Estado vazio, fechar e trocar de mês funcionam.
- [x] Acessível: dia selecionado com `aria-pressed`, card com título e anúncio para leitor de tela.
- [x] Desktop inalterado; sem scroll horizontal a 360px; claro e escuro.
- [x] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0101-calendario-liturgico-linguagem-visual.md`, `docs/tasks/0111-calendario-mobile-modo-escuro.md`.

## Notas de progresso

- 2026-10-01 — Task criada e reivindicada a pedido do usuário.
- 2026-10-01 — Executada. Commit: `2868bcd`.

  **`Calendar.vue`** (genérico): nova prop `selectedKey`, que nas duas variantes da grade
  compacta mobile dá ao dia selecionado `aria-pressed="true"` e um `outline` escuro/claro. É um
  contorno, e não um `ring`, para não se confundir com o anel de "hoje". Novo slot
  `selected-day` renderizado logo abaixo da grade, dentro do bloco `md:hidden`, então nunca
  aparece no desktop. O evento `select-day` já existia e não era tratado.

  **Dashboard**: `selectedDayKey` + `toggleSelectedDay` (tocar de novo no mesmo dia fecha) e
  `watch` de mês/ano que limpa a seleção. Card do dia: data por extenso, `LiturgicalInfo`
  (cor + nome da liturgia, quando houver) e lista das escalas do dia em ordem de horário. Cada
  item é um link para `/escalas/:id` com o horário em destaque, o nome, o status ("Confirmada"/
  "Rascunho") e comunidade · celebrante. O status ficou na segunda linha para o nome não truncar
  a 375px. Dia sem escala: "Nenhuma celebração criada neste dia." Botão "Fechar" com
  `aria-label`; card com `aria-live="polite"` e título. Usa só os dados já carregados (`scales`
  do mês, `liturgias`), sem nova chamada de API.

  **Verificação** (banco temporário com 3 escalas em 04/10 e 1 em 11/10): a 375px claro, tocar no
  dia 4 abre o card com 07:00/10:00/19:00 apontando para `/escalas/1`, `/2` e `/3`; o clique
  real em "19:00 Missa Vespertina" abriu `/escalas/3`. Fechar no segundo toque, dia vazio (9),
  botão fechar e troca de mês: todos confirmados por script. Escuro (grade em blocos) ok; sem
  scroll horizontal. A 1280px: nenhum tile clicável, card não renderizado, grade mobile oculta.
  `npm run build` e `npm test` passam; `dist/` revertido.

  **Ponto para o usuário**: a lista "Dia N" que já existia abaixo da grade mobile (todas as
  escalas do mês, `TASK-0037`) foi mantida, porque não foi pedido removê-la. Com o card, ela
  ficou parcialmente redundante.
