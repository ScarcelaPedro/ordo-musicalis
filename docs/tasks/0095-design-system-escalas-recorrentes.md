---
status: concluida
modulo: src/pages/scaleTemplates
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0095 — Design System: Escalas Recorrentes (Create/Edit/ScaleTemplateForm)

**Task ID**: `TASK-0095`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `scaleTemplates/{Create,Edit,ScaleTemplateForm}.vue` para os componentes/tokens do Design
System — parte 7 de 7 do desmembramento da `TASK-0077` (última).

## Escopo

- `src/pages/scaleTemplates/Create.vue`, `Edit.vue`
- `src/pages/scaleTemplates/ScaleTemplateForm.vue` (formulário compartilhado)

## Comportamento esperado

`ScaleTemplateForm.vue`: trocar os `<select>` crus (dia da semana, recorrência, semana do mês,
ministério esperado) pelo `Select.vue`; card pelo `<Card>`. `Edit.vue`: a seção "Vínculos fixos"
(própria dessa tela, não compartilhada) também precisa da mesma migração —
`<select>`/`<button>` crus pelos componentes correspondentes. Se `TASK-0086` (permitir vínculos
fixos já na criação) já tiver rodado quando esta task for executada, migrar a seção como ela
estiver então, não reverter aquela mudança de comportamento.

## Dependências

- Nenhuma (coordenar com `TASK-0086` se ainda não tiver rodado).

## Critérios de conclusão

- [x] `ScaleTemplateForm.vue` usando `Select`/`Card`.
- [x] Seção "Vínculos fixos" em `Edit.vue` usando os mesmos componentes.
- [x] Nenhuma mudança de campo, validação ou regra de negócio (recorrência semanal vs. mensal
      ordinal, geração automática de escalas).
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop), com dado real (criar recorrência → editar →
      adicionar/remover vínculo fixo).

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe.
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento). Confirmado antes de começar:
  `TASK-0086` (vínculos fixos já na criação) ainda estava `backlog` — migrada a seção "Vínculos
  fixos" de `Edit.vue` como ela está hoje, sem antecipar aquela mudança de comportamento futura,
  conforme a própria task instrui.
- 2026-08-25 — Task reivindicada e corrigida.

  **`ScaleTemplateForm.vue`**: os 4 `<select>` crus (dia da semana, recorrência, semana do mês,
  ministério esperado) → `<Select>`; checkbox "Ativa" cru → `<Checkbox v-model="form.ativo"
  label="Ativa (gera escalas automaticamente)" />`; `<textarea>` de Observações → `<Textarea>`
  (mesmo tratamento já dado a formulários equivalentes — `ServidorForm.vue` na `TASK-0092`,
  `teams/{Create,Edit}.vue` na `TASK-0094` — mesmo não pedido explicitamente no texto desta task,
  pelo mesmo motivo: gap de `dark:` idêntico, mesma correção). O campo condicional "Qual semana
  do mês" (só aparece quando `tipoRecorrencia === 'mensal_ordinal'`) foi confirmado intacto —
  testado ao vivo alternando pra "Uma semana específica do mês" e vendo o campo aparecer
  corretamente.

  **`Create.vue`**: wrapper `bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800` → `<Card>`;
  cabeçalho `<h2>` sem `dark:` → corrigido.

  **`Edit.vue`**: os 2 wrappers (formulário + Vínculos fixos) → `<Card>`; cabeçalho `<h2>` →
  `dark:` corrigido; dentro da seção "Vínculos fixos" (própria desta tela, não compartilhada):
  `<h3>` sem `dark:` → corrigido; `border-b`/`border-t` sem `dark:` → `dark:border-gray-700`;
  nome do servidor no vínculo (`text-gray-900`) → `dark:text-gray-100`; botão "Remover"
  (`text-red-600 hover:text-red-800`, sem `dark:`) → `dark:text-red-400 dark:hover:text-red-300`;
  os 2 `<select>` crus de Servidor/Instrumento (na sub-seção de adicionar vínculo) → `<Select>`.

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real, ponta a ponta, exatamente o ciclo que a task pede**
  (criar recorrência → editar → adicionar vínculo fixo): seed temporário
  `api/prisma/_seedTask0095.ts` (deletado ao final, nunca commitado) criou 1 servidor (Ana Souza)
  pra popular o `<Select>` de vínculo. Fluxo real via UI: `/escalas-recorrentes/criar` →
  preencher celebração/horário, selecionar "Uma semana específica do mês" na `Recorrência`
  (confirma que o campo condicional "Qual semana do mês" aparece corretamente) e "2ª" nele →
  salvar → `/escalas-recorrentes/:id/editar` (confirma que todos os campos, incluindo o
  condicional, foram restaurados corretamente a partir do dado salvo) → selecionar "Ana Souza" no
  `<Select>` de Servidor da seção Vínculos fixos → "Adicionar vínculo" → confirmado que o vínculo
  aparece na lista com o botão "Remover" corretamente estilizado nos dois temas. Playwright
  cobrindo o ciclo completo × 2 temas × 2 viewports (mobile 390px, desktop 1440px). Screenshots
  inspecionadas visualmente em todas as combinações: `Card`/`Select`/`Textarea`/`Checkbox` com
  contraste correto, navegação mobile via "Mais" funcionando.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. **Com esta task, as 7 filhas P2 da `TASK-0077`
  estão todas `concluida`** (`TASK-0089`-`0095`) — junto com todas as demais correções P0-P2 da
  consolidação da Etapa 5. Restam só as 9 tasks P3 (`TASK-0079`-`0087`, exceto `0088` já
  concluída) antes de `TASK-0072` (relatório final da Etapa 5) poder ser iniciada.
