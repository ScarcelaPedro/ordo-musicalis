# 0008 — Escala com diácono vira "Celebração da Palavra" automaticamente

- **Data**: 2026-10-05
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0008`
- **Task relacionada**: `TASK-0125`

## Contexto

Regra informada pelo usuário: diáconos não podem celebrar Missas. Sempre que um diácono for o
celebrante de uma escala, a celebração tem que ser "Celebração da Palavra". O modelo continua sem
campo de tipo (ver `ADR-0007`): o diácono é reconhecido pelo título no nome do celebrante
(`Diác.`/`Diácono`), e o tipo da celebração aparece no texto livre `Scale.celebracao`.

## Decisão

- A regra é aplicada **na API** (`POST /scales` e `PATCH /scales/:id`), via
  `api/_lib/deaconCelebration.ts`, que reaproveita `celebranteTipo` do `ADR-0007`. Assim vale
  para qualquer tela: formulário completo, seletor rápido da lista de escalas ou outra futura.
- Com diácono, `celebracao` passa a ser `"Celebração da Palavra"`. Um nome que já fala em
  "Palavra" e não fala em "Missa" é mantido (ex. "Celebração da Palavra - Crisma"), para não
  apagar um detalhe escrito de propósito.
- No `PATCH`, a regra é verificada sempre que muda o celebrante **ou** o nome, usando o valor
  salvo do campo que não foi enviado. Isso impede renomear para "Missa" uma escala de diácono.
- O formulário (`ScaleForm.vue`) aplica a mesma regra na hora, com uma cópia em
  `src/utils/celebrante.ts`, e trava o campo "Celebração" enquanto o celebrante é diácono.
- Trocar de diácono para padre **não** muda o nome de volta. Não há como saber qual era o nome
  certo, então quem edita ajusta.

## Alternativas consideradas

- Bloquear o salvamento com erro de validação — obrigaria quem escala a corrigir o nome à mão,
  e o pedido foi que a troca fosse automática.
- Aplicar só no frontend — o seletor rápido da lista e qualquer outro cliente poderiam furar a regra.
- Campo enum de tipo em `Scale` — mesmo custo de migration já descartado no `ADR-0007`.

## Consequências

- Escalas antigas que já tinham diácono e nome de Missa só mudam quando forem salvas de novo.
  O relatório de missas já as conta como Celebração da Palavra (`ADR-0007`).
- A detecção de diácono existe em dois lugares (API e `src/utils/celebrante.ts`). Se o critério
  de título mudar, os dois precisam mudar juntos. A API é quem vale.
