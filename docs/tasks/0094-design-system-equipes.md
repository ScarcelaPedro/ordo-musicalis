---
status: concluida
modulo: src/pages/teams
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0094 — Design System: Ministérios (Create/Edit/Show)

**Task ID**: `TASK-0094`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `teams/{Create,Edit,Show}.vue` para os componentes/tokens do Design System — parte 6 de 7
do desmembramento da `TASK-0077`.

## Escopo

- `src/pages/teams/Create.vue`, `Edit.vue`, `Show.vue`

## Comportamento esperado

Mesmo padrão de `Card`/tipografia/`Checkbox` da `TASK-0093`, aplicado a `Create.vue`/`Edit.vue`;
`<select>` cru de Categoria de função/Responsável pelo `Select.vue`. Preservar os pills de seleção
de servidores (`toggleServidor`) — mesmo padrão de interação já usado em `ServidorForm.vue`, não
é um `<select>`. `Show.vue` já ganhou modo escuro na `TASK-0078`, se já concluída — revisar
`Card`/tipografia sem desfazer aquela correção.

## Dependências

- Nenhuma (coordenar com `TASK-0078` se ainda não tiver rodado, mesmo arquivo `Show.vue`).

## Critérios de conclusão

- [x] `Create.vue`/`Edit.vue` usando `Card`/`Select`/`Checkbox`.
- [x] `Show.vue` revisado quanto a `Card`/tipografia.
- [x] Pills de seleção de servidores preservados sem alteração de comportamento.
- [x] Nenhuma mudança de campo, validação ou regra de negócio.
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop), com dado real (criar → ver → editar).

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe.
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento). Confirmado antes de começar:
  `TASK-0078` (modo escuro em `Show.vue`) já estava `concluida` — sem conflito, correção
  preservada.
- 2026-08-25 — Task reivindicada e corrigida.

  **`Create.vue`/`Edit.vue`**: mesmo padrão já aplicado a `ServidorForm.vue` na `TASK-0092`
  (estrutura de campos praticamente idêntica: nome/descrição/select/select/checkbox/pills) —
  `<select>` de Categoria de função e Responsável/coordenador → `<Select>`; `<textarea>` de
  Descrição → `<Textarea>` (não pedido explicitamente no texto da task, mas o mesmo gap de
  `dark:` ausente já corrigido em todo formulário equivalente esta sessão — `ServidorForm.vue`,
  `repertoire/Edit.vue` — então tratado aqui também por consistência); checkbox "Ativo" →
  `<Checkbox v-model="form.ativo" label="Ministério ativo" />`; wrapper `bg-white shadow-sm
  rounded-lg p-6 dark:bg-gray-800` → `<Card>`; cabeçalho `<h2>` sem `dark:` → corrigido. Os pills
  de seleção de servidores (`toggleServidor`) foram **preservados exatamente**, só ganhando o
  par `dark:` que faltava no estado inativo (mesmo tratamento já dado aos pills de
  `ServidorForm.vue` na `TASK-0092`).

  **`Show.vue`**: já tinha tratamento de modo escuro completo desde a `TASK-0078` — única
  mudança real foi trocar os 3 `div`s crus (já com `dark:bg-gray-800` correto) pelo componente
  `<Card>`, sem alterar nada visualmente, mesma decisão já tomada pra `servidores/Show.vue` na
  `TASK-0092` e `teams/Show.vue`/`servidores/Show.vue` reforçando o mesmo padrão.

  Mantida a mesma decisão de escopo já registrada nas `TASK-0090`/`0093`: cabeçalho de página
  não convertido pra token `text-h1`-`h4` (não pedido nesta task, e consistente com a análise já
  feita — nenhuma página migrada usa esse token no cabeçalho).

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real, ponta a ponta (criar → ver → editar), conforme o
  próprio critério da task exige** (diferente da `TASK-0093`, aqui não há a permissão de reduzir
  escopo — só 1 domínio mesmo, mas o ciclo completo obrigatório): seed temporário
  `api/prisma/_seedTask0094.ts` (deletado ao final, nunca commitado) criou 2 servidores (Ana
  Souza, Bruno Lima) pra popular os pills de seleção com opções reais. Fluxo real via UI:
  `/equipes/criar` → preencher nome/descrição, selecionar categoria via `Select`, clicar no pill
  "Ana Souza" (confirma `toggleServidor` intacto) → salvar → `/equipes/:id` (Show, confirma que a
  membresia "Ana Souza" foi persistida e aparece corretamente) → `/equipes/:id/editar` (confirma
  que TODOS os campos novos — nome, descrição no `Textarea`, categoria no `Select`, checkbox
  "Ministério ativo", pill "Ana Souza" com campo de função — foram restaurados corretamente a
  partir do dado salvo, sem nenhuma perda). Playwright cobrindo o ciclo completo × 2 temas × 2
  viewports (mobile 390px, desktop 1440px). Screenshots inspecionadas visualmente em todas as
  combinações: `Card`/`Select`/`Textarea`/`Checkbox`/pills com contraste correto nos dois temas,
  navegação mobile via cartão "Ver"/"Editar" funcionando.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0095` (Design System:
  escalas recorrentes — `scaleTemplates`), P2, última das 7 filhas da `TASK-0077`.
