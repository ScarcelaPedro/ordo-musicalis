---
status: concluida
modulo: src/pages/reports
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0091 — Design System: Relatórios

**Task ID**: `TASK-0091`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `reports/Index.vue` para os componentes/tokens do Design System — parte 3 de 10 do
desmembramento da `TASK-0077`.

## Escopo

- `src/pages/reports/Index.vue`

## Comportamento esperado

Trocar os 5 cartões de estatística (`bg-white shadow-sm rounded-lg p-4`, cru) por `<Card>`;
`<label>` cru dos filtros Início/Fim por `InputLabel` com `for`/`id` (mesmo padrão já aplicado em
`TASK-0069` nos outros 17 arquivos — este NÃO estava naquela lista porque, na época, ainda usava
`<label>` sem `InputLabel` nenhum, então nem se qualificava como "InputLabel sem for"; agora que
o resto da tela for migrado, vale aplicar o padrão certo desde o início); alternador "Por
Ministério"/"Por Categoria de Função" (`<button>` com classes manuais) pelo componente `<Tabs>`;
cores de status (`text-green-600`/`text-yellow-600`/`text-red-600`) pelos tokens
`success`/`warning`/`danger`; tabelas para o padrão visual já usado nas listagens migradas. Os 3
links de atalho (Intensidade/Disponibilidade/Substituições) já devem estar com área de toque
corrigida se `TASK-0087` já tiver rodado — se não, não é escopo desta task resolver isso
separadamente (fica pra `TASK-0087`).

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] Cartões de estatística usando `<Card>`.
- [x] Filtros de data com `InputLabel`/`TextInput` (ou `Select`, se aplicável) com `for`/`id`.
- [x] Alternador de agrupamento usando `<Tabs>`.
- [x] Cores de status usando tokens semânticos.
- [x] Nenhuma mudança de comportamento (cálculo de período, dados exibidos, navegação).
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop), com dado real.

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe.
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento).
- 2026-08-25 — Task reivindicada e corrigida.

  **Achado importante, corrige a premissa da task**: `src/components/Tabs.vue` **já existia**,
  commitado desde o commit original da Etapa 4 (`43e5bb8`) — não precisava ser criado do zero
  como a redação desta task ("Comportamento esperado") e o próprio `docs/design-system.md` §7
  ("Tabs... nunca implementado", texto que eu mesmo tinha lido como se o componente não
  existisse) sugeriam. É exatamente o mesmo padrão de "componente do catálogo já pronto, porém
  com zero usos em todo o codebase" já encontrado com `ErrorState.vue` na `TASK-0076` e
  `RepertoireItem.vue` na `TASK-0090` — só que desta vez percebido tarde: um `Glob` inicial por
  `src/components/Tabs.vue` retornou "No files found" (falso negativo, causa não determinada — o
  arquivo estava commitado e presente no working tree o tempo todo), o que me levou a **escrever
  um `Tabs.vue` do zero e sobrescrever sem querer o arquivo real já existente** (props `options`
  em vez de `tabs`, cor de estado ativo `bg-gray-800` reinventada em vez do `bg-primary-600` já
  correto no original, sem o `min-h-11` de área de toque que o original já tinha). Percebido ao
  rodar `git diff` antes de revalidar o ambiente — o diff mostrou uma modificação a um arquivo
  que eu pensava ser novo. Corrigido com `git checkout -- src/components/Tabs.vue` (restaura o
  original, que já era corretamente feito) e ajustada a chamada em `reports/Index.vue` pra usar
  a prop certa (`:tabs=`, não `:options=`). `Tabs.vue` fica com **diff zero** no resultado final
  — nenhuma mudança real nele, só o uso dele (que é, de fato, exatamente o que "migrar pro
  Design System" pede).

  **`reports/Index.vue`**: os 5 cartões de estatística, o filtro de datas, e o container da
  tabela de agrupamento — todos os 3 blocos `bg-white shadow-sm rounded-lg` crus — viraram
  `<Card>` (o container da tabela usa `:bordered="false" class="!p-0 overflow-hidden"`, mesmo
  padrão já usado em `teams/Index.vue`/`servidores/Index.vue`). Os `<label>` crus de Início/Fim
  viraram `InputLabel` com `for`/`id` (os `<input type="date">` continuam nativos, não
  `TextInput`, porque `TextInput` força `w-full` no template e quebraria a largura compacta do
  filtro — segui o precedente já real de `availability/Panel.vue`, que trata datas inline da
  mesma forma: input nativo com `dark:` correto, sem o componente). O alternador de agrupamento
  (`<button>` com classes manuais duplicando exatamente o que `Tabs.vue` já implementa) virou
  `<Tabs v-model="agrupamento" :tabs="[...]" />`. Cores de status dos 3 cartões relevantes
  (`text-green-600`/`text-yellow-600`/`text-red-600`, nenhum com `dark:`) viraram
  `text-success-600 dark:text-success-400` / `text-warning-600 dark:text-warning-400` /
  `text-danger-600 dark:text-danger-400` — troca de token 1:1, mesmo dígito de shade, sem
  reavaliar a intensidade da cor (isso seria escopo de auditoria de contraste, não desta task).
  As duas tabelas (Ministério/Categoria) ganharam o padrão visual completo já usado nas
  listagens migradas (`teams/Index.vue`): `dark:` em todas as colunas, `divide-gray-700`,
  `bg-gray-900/40` no `thead`, e — não previsto no texto original da task, mas coberto pelo
  critério "tabelas para o padrão visual já usado nas listagens migradas" — split responsivo
  `hidden md:block` (tabela) / `md:hidden` (lista de cards empilhados), já que as tabelas originais
  só tinham `overflow-x-auto` (scroll horizontal em mobile), diferente do padrão já estabelecido
  nas listagens reais. Os 3 links de atalho (Intensidade/Disponibilidade/Substituições) ganharam
  `dark:text-primary-400`, mantendo a cor literal `indigo-600` no claro (troca de token é escopo
  da `TASK-0079`).

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real**: seed temporário `api/prisma/_seedTask0091.ts`
  (deletado ao final, nunca commitado) criou um ministério com 3 servidores, 3 celebrações em
  setembro/2026, e uma substituição pendente — pra popular os 5 cartões de estatística com
  números reais (não só o estado vazio) e exercitar as duas tabelas com dado de verdade. Login
  real via `/login`, navegação até `/relatorios`, ajuste do filtro "Fim" pra incluir o período
  seedado. Playwright cobrindo os dois agrupamentos (clique real no `Tabs`, não simulação) × 2
  temas × 2 viewports (mobile 390px, desktop 1440px). Screenshots inspecionadas visualmente:
  cartões de estatística com cores de status corretas e bom contraste nos dois temas, `Tabs`
  alternando estado ativo/inativo corretamente ao clicar, tabelas renderizando os dados reais
  (3 celebrações, 9 escalações, 56% confirmação, 4 pendentes, 1 substituição pendente) em ambos
  os agrupamentos, grid de cartões e pills do `Tabs` se ajustando corretamente em mobile.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0092` (Design System:
  servidores), P2, desmembrada da `TASK-0077`.
