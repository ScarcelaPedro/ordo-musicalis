---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0043 — Criar/Editar Escala: Etapa 1 (dados da celebração)

**Task ID**: `TASK-0043`

## Objetivo

Reestruturar o `ScaleForm.vue` (430 linhas, o formulário mais denso do sistema) nas 4 etapas
lógicas definidas em `docs/tasks/0009-wireframes-criar-editar-escala.md`, começando pela Etapa
1 — dados da celebração — agrupando campos principais/secundários (SPEC-004 §23, §24). Este é
o fluxo de maior prioridade de toda a Etapa 4 (SPEC-004 §23: "Este é o fluxo de maior
prioridade").

## Arquivos/componentes envolvidos

- `src/pages/scales/ScaleForm.vue` — introduzir a navegação por etapas (estado local de "etapa
  atual", 1 a 4); mover os campos de cabeçalho (data/horário/celebração/comunidade/celebrante/
  observações/lembrete) para dentro da Etapa 1.

## Comportamento esperado

Etapa 1 mostra só os campos de dados da celebração, com campos principais (data, horário,
celebração, comunidade) visualmente distintos dos secundários (celebrante, observações,
lembrete). Validação inline dos campos obrigatórios antes de avançar. Nenhum campo removido,
nenhum campo novo — o campo `status` (hoje um `<select>` aqui) **migra para a Etapa 4**
(`TASK-0047`), não fica na Etapa 1.

## Dependências

- `TASK-0030` — `Select`, `TextInput` com erro/sucesso.
- `TASK-0033` — não estritamente necessário para a Etapa 1, mas a task deve preparar a
  estrutura de navegação por etapas que `TASK-0044` a `0047` vão usar.

## Critérios de conclusão

- [x] Estrutura de navegação por etapas implementada (indicador textual "Etapa 1 de 4", ação
      "Avançar"), sem componente de stepper visual novo (decisão já registrada em
      `docs/tasks/0026-*.md`: uso único não justifica componente dedicado).
- [x] Campos de cabeçalho movidos para a Etapa 1, agrupados por principal/secundário.
- [x] `form` (estado reativo) preservado exatamente como está hoje — mesma interface de dados
      emitida no `submit` final (a reestruturação é só de apresentação/navegação interna, não
      do contrato do componente com `Create.vue`/`Edit.vue`).
- [x] `npm run build` passa sem erros.
- [~] Testado criando e editando uma escala até o fim — **não executado em navegador** (mesma
      limitação de ambiente já registrada nas tasks anteriores); estrutura verificada por leitura
      de código (as 4 etapas existem e o formulário chega a `emit('submit', form)` normalmente na
      Etapa 4, com o mesmo `form` de sempre).

## Riscos

- **Migração incremental dentro de uma única tela** (SPEC-004 §53): como o `ScaleForm.vue` só
  terá a Etapa 1 implementada nesta task, é preciso decidir como o formulário continua
  funcionando de ponta a ponta até `TASK-0044`–`0047` completarem as demais etapas — duas
  opções: (a) implementar as 4 etapas como uma sequência de "telas" dentro do mesmo componente,
  mas manter todos os campos sempre montados (só visualmente escondidos) até a task de cada
  etapa realmente separar a lógica, ou (b) aceitar que o formulário fica funcionalmente
  incompleto entre esta task e `TASK-0047` num branch de trabalho não mesclado a `main`. Decisão
  de implementação a registrar em `docs/decisions/` se não for óbvia.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §23, §24.
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (especificação completa das 4 etapas).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Decisão de migração incremental (Riscos, opção a)
  registrada em `docs/decisions/0002-scaleform-migracao-incremental-4-etapas.md`: as 4 etapas
  existem como navegação real desde já, mas só a Etapa 1 é redesenhada nesta task — Etapa 2
  mantém "Sugeridos"+"Equipe da celebração" exatamente como funcionam hoje (`TASK-0044`), Etapa 3
  é uma ponte mínima honesta sem checklist inventada (`TASK-0046`), Etapa 4 mantém o `<select>`
  de status real e o botão "Salvar" real (`TASK-0047` troca por Publicar/Salvar rascunho).
  `etapaAtual` (1-4) controla qual `<template v-if>` renderiza; indicador "Etapa N de 4 —
  {nome}" é só texto (`text-label`), sem stepper visual novo, conforme já decidido na
  `TASK-0026`. Etapa 1: campos principais (Data/Horário/Celebração/Comunidade, obrigatórios)
  num grupo, secundários (Celebrante/Observações/Lembrete, opcionais) rebaixados abaixo de um
  `border-t`; `status` saiu da Etapa 1 e foi para a Etapa 4, como a task pedia. Validação inline
  (`validarEtapa1`) bloqueia "Avançar" e marca os campos obrigatórios vazios com `TextInput
  error` + `InputError`, sem exigir submeter o formulário inteiro pra descobrir. `form` (estado
  reativo) e o contrato `emit('submit', form)` não mudaram — só `etapaAtual`/`etapa1Erros` foram
  adicionados como estado novo, local à navegação.

  **Efeito colateral fora do escopo listado, documentado aqui**: adotar o componente `Select`
  (`TASK-0030`) para Comunidade/Celebrante/Status expôs um bug real e ainda não exercitado nele —
  usava `:value`/`@change` manuais, então `event.target.value` sempre devolvia string, perdendo o
  tipo `number` dos IDs (ex. `comunidadeId` viraria `"3"` em vez de `3` após qualquer seleção).
  `Select` nunca tinha sido consumido em lugar nenhum do sistema até agora, então o bug era
  latente. Corrigido trocando a ligação manual por um `v-model` de verdade sobre um `computed`
  proxy — mesmo mecanismo que faz um `<select v-model>` nativo preservar o tipo do valor
  selecionado. Escopo do fix contido a `Select.vue` (arquivo não listado na task, mas o bug só
  foi descoberto por causa desta adoção; corrigido em vez de contornado, já que deixá-lo quebrado
  atingiria qualquer consumidor futuro com ID numérico — a maioria dos selects do sistema).
  `npm run build` passou sem erros; `dist/` restaurado; `git status` confirmou que só
  `ScaleForm.vue` (entre páginas) e `Select.vue` mudaram. Teste end-to-end criando/editando uma
  escala não executado em navegador (mesma limitação de ambiente já registrada); estrutura e
  contrato verificados por leitura de código. Task marcada `concluida`. Próximo passo:
  `TASK-0044` (Etapa 2 — Equipe, busca inline) já está elegível.
