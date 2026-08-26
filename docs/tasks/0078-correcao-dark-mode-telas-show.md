---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0078 — Correção: modo escuro ausente em Servidores, Ministérios e Liturgia (telas de detalhe)

**Task ID**: `TASK-0078`

**Prioridade**: P2

## Descrição

Adicionar tratamento completo de modo escuro a `servidores/Show.vue`, `teams/Show.vue` e
`liturgia/Show.vue` — hoje usam dezenas de classes `text-gray-500`/`700`/`800`/`900` e cartões
`bg-white` sem nenhum par `dark:` correspondente.

## Problema

Descoberto por `grep` durante a `TASK-0069` ao procurar o padrão de risco já conhecido
(`bg-white shadow-sm rounded-lg p-6` sem `dark:bg-gray-800`): essas 3 telas não têm **nenhum**
tratamento de tema escuro, não só um ponto isolado — `liturgia/Show.vue` sozinha tem 10
ocorrências do cartão sem `dark:`, além de dezenas de `<dt>`/`<dd>`/`<h3>`/`<p>` com cor de texto
fixa. Diferente da correção mecânica aplicada na `TASK-0069` (que tratou 17 arquivos com o mesmo
padrão simples, 1-2 pontos por arquivo), aqui o volume por tela é maior — é um retrabalho
completo de tema escuro em 3 telas inteiras.

## Impacto

Um usuário com tema escuro ativado que abra o detalhe de um servidor, de um ministério, ou a
liturgia do dia, vê texto ilegível ou com contraste ruim (fundo continua branco/claro enquanto o
resto do sistema está em modo escuro) — inconsistência perceptível de imediato, já que essas são
3 das telas de detalhe mais acessadas do sistema.

## Tela

`/servidores/:id`, `/equipes/:id`, `/escalas/:id/liturgia`.

## Componente

`src/pages/servidores/Show.vue`, `src/pages/teams/Show.vue`, `src/pages/liturgia/Show.vue`.

## Comportamento atual

Cartões `bg-white shadow-sm rounded-lg p-6` sem `dark:bg-gray-800`; texto `text-gray-500`/`700`/
`800`/`900` sem par `dark:` em nenhum dos três arquivos.

## Comportamento esperado

Mesmo padrão de modo escuro já aplicado ao restante do sistema desde a Fundação: cartões com
`dark:bg-gray-800`, texto secundário com `dark:text-gray-400`, texto principal com
`dark:text-gray-100`/`dark:text-gray-300` conforme o peso visual, mantendo o contraste mínimo de
4.5:1 exigido pelo §27 em ambos os temas.

## Critérios de aceite

- [x] `servidores/Show.vue`, `teams/Show.vue` e `liturgia/Show.vue` revisados e com `dark:`
      aplicado em todo cartão e todo texto que hoje não tem.
- [x] Varredura `axe-core` (`color-contrast`, tag `wcag2aa`) nas 3 telas, em modo escuro,
      retornando 0 violações — mesma metodologia já usada na `TASK-0069`.
- [x] `liturgia/Show.vue`: preservadas as exceções já conscientes de cor litúrgica
      (`CORES_CLASSES`, convenção de rubrica em vermelho) — **correção à premissa original desta
      task**: as rubricas `text-red-700` NÃO já tinham `dark:` correto (essa suposição estava
      errada); a varredura real encontrou e esta task corrigiu isso também, ver Notas de
      progresso.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0069-acessibilidade-completa.md` — achado original, com a evidência de `grep` que
  identificou as 3 telas.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §27, §55 (regra de decisão: inconsistência
  visual → corrigir no Design System/componente).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0069`.
- 2026-08-25 — Task reivindicada e corrigida. `servidores/Show.vue` e `teams/Show.vue`:
  `dark:bg-gray-800` nos 2 cartões de cada tela, `text-gray-500`→`text-gray-600 dark:text-gray-400`
  nas legendas `<dt>` (mesmo padrão sistêmico já corrigido em outros arquivos na `TASK-0055`, só
  que estes dois nunca tinham recebido a varredura), `dark:text-gray-100` nos valores `<dd>` e
  títulos, `dark:border-gray-700` nas divisórias entre linhas, `dark:text-primary-400` nos links
  (mantendo a cor literal `indigo-600` no modo claro — trocar por token semântico é escopo da
  `TASK-0079`, não desta).

  `liturgia/Show.vue` (a maior das 3 — 12 cartões): `dark:bg-gray-800` aplicado nos 12 de uma vez
  via `replace_all` na substring `bg-white shadow-sm rounded-lg p-6`; todo `text-gray-900/800/700`
  sem `dark:` recebeu o par correto (`dark:text-gray-100`/`300` conforme o peso); todo
  `text-gray-500` sem `dark:` foi tratado como o padrão sistêmico já conhecido — upgrade pra
  `text-gray-600 dark:text-gray-400`, não só adicionar o par escuro à cor que já falhava no claro.

  **Achado durante a correção, não previsto na task original**: a varredura `axe-core` real (não
  só leitura de código) encontrou uma 2ª causa de falha específica do modo escuro — os títulos em
  estilo de rubrica de missal (`text-red-700`, ex. "Antífona de Entrada") nunca tinham `dark:`
  nenhum, e ao ganhar o novo fundo escuro do cartão (`dark:bg-gray-800`) passaram a falhar
  contraste (2,26:1 medido, contra o mínimo de 3:1 pra texto grande em negrito) — exatamente o
  mesmo tipo de problema colateral já visto na `TASK-0055` (Dashboard/Calendar.vue: corrigir a cor
  do texto sem cuidar do fundo escuro que ainda não existia). Corrigido com
  `dark:text-red-400` — mantém a convenção de rubrica em vermelho (não é a mesma categoria da
  paleta `CORES_CLASSES`, é decoração tipográfica de missal, preservada), só ajusta o tom pra
  passar em fundo escuro.

  `npm run build` passou sem erros; `dist/` revertido. **Testado com dado real e `axe-core`**
  (`AxeBuilder({ page }).withTags(['wcag2a','wcag2aa'])`, mesma metodologia da `TASK-0069`), nas
  3 telas × 2 temas (6 combinações): seed temporário `api/prisma/_seedTask0078.ts` (deletado ao
  final, nunca commitado) criou um servidor com categoria/instrumento/ministério, um ministério
  com servidor+horário recorrente, uma escala real vinculada, e um registro de `Liturgia` real
  com todos os campos preenchidos (antífonas, coleta, oferendas) — pra exercitar os cartões que
  só aparecem com dado presente, não só os estados vazios. Primeira rodada: 5/6 limpas, 1 com 1
  violação de contraste (o achado das rubricas, acima). Segunda rodada, após a correção: **0
  violações nas 6 combinações**.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: qualquer uma das `TASK-0089`-
  `0095` (P2, migração de Design System nas telas restantes, desmembradas da `TASK-0077`) — por
  menor número, `TASK-0089`. Com esta task, **todas as P0-P2 da consolidação da Etapa 5 estão
  concluídas ou desmembradas em tasks filhas** — restam só P3 (`TASK-0079`-`0087`) além das 7
  filhas P2 da `TASK-0077`.
