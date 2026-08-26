---
status: concluida
modulo: src/pages/reports
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0087 — Correção: links de atalho em Relatórios pequenos demais para toque

**Task ID**: `TASK-0087`

**Prioridade**: P3

## Descrição

Aumentar a área de toque dos 3 links de atalho ("Intensidade", "Disponibilidade",
"Substituições") no topo do filtro de `reports/Index.vue`.

## Problema

Confirmado por medição real (`getBoundingClientRect`) e screenshot na `TASK-0068`: os 3 links são
texto puro, ~20px de altura, sem `padding`, posicionados lado a lado — abaixo do tamanho mínimo
recomendado de alvo de toque (~44px, já usado em todos os outros controles do sistema desde a
`TASK-0030`).

## Impacto

Em tela pequena, tocar precisamente entre dois links tão próximos e pequenos é propenso a erro
(toque no link errado). Baixo impacto — são atalhos secundários, não uma ação principal da tela.

## Tela

`/relatorios`.

## Componente

`src/pages/reports/Index.vue`.

## Comportamento atual

```html
<RouterLink to="/servidores/intensidade" class="text-sm text-indigo-600 hover:underline">Intensidade</RouterLink>
```

Sem `padding`, sem altura mínima.

## Comportamento esperado

Adicionar `padding` suficiente para atingir ~44px de altura de toque (ex.: `px-2 py-2.5`), ou
trocar por `TertiaryButton`, que já tem `min-h-11` embutido — mantendo a aparência visual de
link/atalho secundário se for a opção escolhida.

## Critérios de aceite

- [x] Os 3 links têm altura de toque de pelo menos ~44px.
- [x] Nenhuma mudança na navegação ou no destino de cada link.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0068-responsividade-completa.md` — achado original, com medição e screenshot.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §24, §55 (regra de decisão: inconsistência →
  corrigir no componente).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0068`.
- 2026-08-26 — Task reivindicada e corrigida. Escolhida a primeira opção do texto da task
  (`padding`, mantendo `RouterLink`) em vez de `TertiaryButton`: o `TertiaryButton` é um
  `<button>` com fundo cinza preenchido e tipografia uppercase/tracking — uma mudança visual bem
  mais pesada do que "atalho secundário", que é exatamente o efeito que o próprio texto da task
  pede pra preservar caso essa rota seja escolhida ("mantendo a aparência visual de link/atalho
  secundário"). `inline-flex items-center min-h-11 px-2` adicionado às 3 classes dos
  `RouterLink`, mesmo token `min-h-11` (44px) já usado em todo o resto do sistema pra alvo de
  toque (`Tabs.vue`, links "Ver" das listagens mobile) — sem trocar nenhuma cor/texto/`to`,
  preservando a aparência de link sublinhado. Wrapper do grupo ganhou `flex-wrap` (evita overflow
  horizontal em telas bem estreitas, já que os 3 links agora ocupam mais espaço horizontal com o
  padding) e `gap-1` no lugar de `gap-2` (o `px-2` de cada link já adiciona respiro visual entre
  eles, then não fazia sentido somar os dois espaçamentos).

  `npm run build` passou sem erros (~1min desta vez — sistema seguiu mais lento que o normal a
  sessão inteira); `dist/` revertido.

  **Testado com medição real, mesmo método usado no achado original da `TASK-0068`**
  (`getBoundingClientRect`, não estimativa por leitura de CSS): os 3 links medidos em
  `/relatorios` real, logado, retornaram exatamente **44px de altura** cada (Intensidade,
  Disponibilidade, Substituições) — bate com o `min-h-11` do Tailwind (2.75rem = 44px).
  Confirmado também que a navegação continua intacta: clique real em "Intensidade" navegou
  corretamente pra `/servidores/intensidade` (URL final verificada, não suposição). Screenshot
  inspecionado visualmente: os 3 links continuam com a aparência de texto sublinhado discreto,
  sem virar botões/chips — a área de toque maior é invisível, só perceptível ao medir ou tocar
  perto da borda.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido (nenhum seed
  extra precisou ser criado). Task marcada `concluida`. **Com esta task, todas as tasks de
  correção da consolidação original da `TASK-0071` estão concluídas** (`TASK-0072` era o
  relatório final, ainda bloqueado só por revisão; `TASK-0073`-`0087`, mais as 7 filhas
  `TASK-0089`-`0095` da `TASK-0077`, todas `concluida`). Próximo passo: `TASK-0072` (relatório
  final da Etapa 5) já pode ser reavaliada quanto aos seus próprios critérios de conclusão.
