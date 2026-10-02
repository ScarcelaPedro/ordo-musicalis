---
status: concluida
modulo: api + src/pages
owner: Pedro Scarcela
criado-em: 2026-10-02
---

# 0117 — Recorrências: qualquer função e qualquer comunidade

**Task ID**: `TASK-0117`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-02): a página de Recorrências só permitia escolher um "Ministério"
(na prática, um grupo de músicos), e toda escala gerada caía na comunidade Matriz. Na realidade,
**qualquer função** (Música, Leitores, Acólitos, Ministros da Comunhão...) pode ter recorrência, e
a celebração recorrente pode acontecer em **qualquer comunidade** da paróquia.

## Comportamento esperado

- A recorrência tem uma **comunidade** obrigatória. A geração cria a escala nessa comunidade, e
  a checagem de duplicidade passa a considerar data + horário + comunidade.
- O campo "Ministério esperado" sai do formulário da recorrência (mesmo caminho já tomado na
  escala manual, ver `todo.md` "Campo Ministério responsável removido").
- Cada vínculo fixo guarda a **função** (categoria), obrigatória, e opcionalmente o ministério,
  o instrumento (só Música) e a função litúrgica (só Acólitos). Só servidores com aquela função
  no cadastro podem ser vinculados.
- A escala gerada leva a categoria, o ministério e a função litúrgica de cada vínculo, então as
  pessoas aparecem na seção certa da escala (antes caíam em "sem função definida").
- Vínculos e recorrências que já existem são migrados sem perda (backfill).

## Critérios de conclusão

- [x] Migration aditiva com backfill (comunidade Matriz, ou a primeira, para recorrências antigas;
      categoria/ministério para vínculos antigos).
- [x] API: comunidade obrigatória ao criar/editar recorrência; categoria obrigatória e validada
      no vínculo; geração usando comunidade e categoria.
- [x] Telas de criar/editar/listar recorrência atualizadas, claro e escuro.
- [x] Testes da lógica pura extraída (datas da recorrência, montagem das escalações).
- [x] `npm run build` e `npm test` passam; fluxo testado ponta a ponta em banco local.

## Referências

- `docs/decisions/0006-recorrencia-comunidade-e-funcao-por-vinculo.md`
- `todo.md` (Fase 2: `ScaleServidor.categoriaId`, remoção do ministério da escala).

## Notas de progresso

- 2026-10-02 — Task criada e reivindicada a pedido do usuário.
- 2026-10-02 — Executada. Commit: `a7446f8`.

  **Banco** (`20261002120000_recorrencia_comunidade_funcao`): `scale_templates.comunidade_id`
  e `vinculos_fixos.categoria_id/team_id/funcao_liturgica`, todos nullable com FK `SET NULL`.
  Backfill: recorrência → Matriz (ou a primeira comunidade); vínculo → ministério da
  recorrência e a categoria dele; sem ministério mas com instrumento → Música. Vínculo antigo
  sem nenhuma pista continua sem função (igual a antes).

  **API**: comunidade obrigatória e validada ao criar/editar a recorrência. Vínculo exige
  função que o servidor tem no cadastro; instrumento só em Música (e precisa ser um que ele
  toca); função litúrgica só em Acólitos e Ancilas; ministério opcional, da mesma função;
  servidor repetido na recorrência vira 422 em vez de 500. A geração usa a comunidade da
  recorrência, considera a comunidade na duplicidade e grava categoria/ministério/função
  litúrgica em cada escalação. Permissão do coordenador como na escala manual
  (`requireAnyTeamOwnership`). Lógica pura em `api/_lib/recurrence.ts` + 10 testes.

  **Telas**: "Ministério esperado" substituído por "Comunidade" (padrão: a primeira); listagem
  com coluna Comunidade. Novo `FixedLinksEditor.vue` (usado em criar e editar, que antes
  duplicavam a lógica): função → servidor (só quem tem a função e ainda não está vinculado) →
  instrumento/ministério/função litúrgica conforme a função; lista agrupada por função, com
  avatar e remover por ícone.

  **Verificação** (banco local temporário): 4 vínculos de funções diferentes aceitos e 5
  inválidos recusados com mensagem; recorrências na Capela e na Matriz no mesmo domingo 10h
  geraram 8 escalas (nenhuma tratada como duplicata) e a segunda geração pulou as 8; a escala
  gerada tem cada pessoa na função certa (Música/Coral/Bateria, Acólitos/Turiferário,
  Leitores, Ministros). Backfill testado com linhas no formato antigo dentro de uma transação
  desfeita. Adicionar/remover vínculo pela tela (Playwright) ok; claro/escuro, 1280px e 375px
  sem scroll horizontal. `npm run build`, `tsc -p tsconfig.api.json` e `npm test` (43) passam.

  **Achado fora do escopo**: o componente `Select` converte `null` em `""`, então
  `<option :value="null">` nunca fica selecionada (ex. "Nenhum" do celebrante em
  `ScaleForm.vue` e as opções de `teams/Create.vue`/`Edit.vue` aparecem em branco). Aqui
  contornado com `value=""`; a correção geral fica para outra task.
