---
status: concluida
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

- [x] Todos os blocos do desktop com a mesma altura, com 0, 1 ou 3 celebrações no dia.
- [x] Clique no dia abre o card; clique no horário abre a escala; estados vazio/fechar/mês ok.
- [x] Um único card no DOM (sem `id` duplicado entre desktop e mobile).
- [x] Mobile sem regressão; claro e escuro; teclado.
- [x] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0114-calendario-mobile-card-do-dia.md`, `docs/tasks/0101-calendario-liturgico-linguagem-visual.md`.

## Notas de progresso

- 2026-10-01 — Task criada e reivindicada a pedido do usuário.
- 2026-10-01 — Executada. Commit: `6bb3672`.

  **`Calendar.vue`**: cada dia do desktop virou `<button>` de **altura fixa** (`h-[84px]` /
  `lg:h-[92px]`, antes `min-h`), com `aria-pressed`, contorno de seleção (o mesmo
  `SELECTED_DAY_CLASS` da `TASK-0114`), hover e foco visível, emitindo `select-day`. Os dias
  fora do mês continuam como `div` vazio da mesma altura. O conteúdo do slot `day` fica preso à
  base do bloco (`mt-auto`). O slot `selected-day` saiu de dentro do bloco mobile: a ordem
  agora é grade desktop | grade mobile | **card (único, serve os dois)** | lista mobile. Assim não
  há `id`/`aria-live` duplicado, e o mobile mantém grade → card → lista (conferido pelos irmãos
  no DOM).

  **Dashboard**: o slot `day` deixou de renderizar um chip por escala (era o que esticava a
  linha) e mostra um indicador compacto, ícone de relógio + quantidade, com "celebração(ões)" em
  `sr-only`. O texto completo ("3 celebrações") truncava a 1280px, porque o bloco fica com cerca
  de 44px úteis ao lado da sidebar e da coluna lateral. Ao abrir, o card rola para a área visível
  (`scrollIntoView({ block: 'nearest' })`, sem salto se já estiver visível). Card com margens de
  desktop (`md:mx-6`). Legenda "Escalas" refeita: no desktop "🕒N celebrações no dia"; no mobile
  o ponto (claro) ou o traço (escuro); e "Clique/Toque no dia para ver os horários". A legenda do
  ícone de confirmada saiu porque os chips deixaram de existir (o status agora está escrito no
  card). `CheckCircleIcon` continua importado (usado em "Presença confirmada").

  **Verificação** (banco temporário: 3 escalas em 04/10, 1 em 11/10, 2 em 18/10): a 1280px os 35
  blocos têm **uma única altura (92px)** com 0, 1, 2 ou 3 celebrações. Clique no dia 4 abre o card
  com 07:00/10:00/19:00, dentro da área visível, e um só card no DOM. Clique real (1100px,
  escuro) em "10:00 Missa Solene" abriu `/escalas/2`. Segundo clique fecha, dia vazio (9),
  botão fechar, dia 18 com 2 itens e troca de mês: todos ok. Mobile 375px: card abaixo da grade,
  3 itens, lista abaixo do card, sem scroll horizontal. `npm run build` e `npm test` passam;
  `dist/` revertido.
