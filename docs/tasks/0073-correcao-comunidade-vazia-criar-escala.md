---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0073 — Correção: campo Comunidade nasce vazio ao abrir "Nova Escala"

**Task ID**: `TASK-0073`

**Prioridade**: P2

## Descrição

Corrigir o campo Comunidade do `ScaleForm.vue`, que fica sem seleção ao abrir `/escalas/criar`,
mesmo quando existe uma única comunidade cadastrada — obrigando o coordenador a reabrir o
`<select>` e escolher manualmente antes de conseguir avançar.

## Problema

`Create.vue` (`src/pages/scales/Create.vue`) calcula `form.value.comunidadeId` de forma síncrona
(`props.initialData?.comunidadeId ?? props.comunidades[0]?.id ?? null`) no momento em que o
`ScaleForm` é montado — antes de o `fetch` assíncrono de `/comunidades` ter resolvido. Como
nenhum `watch` reage à chegada tardia da lista, o campo permanece `null` para sempre, mesmo
depois de as opções aparecerem no `<select>`. Reproduzido e confirmado em `TASK-0058` e
`TASK-0061` com dado real: o `<select>` mostra "Matriz" como única opção, mas `.value` fica `""`
até o usuário reabrir o dropdown e escolher manualmente.

## Impacto

Todo coordenador que abre "Nova Escala" esbarra nisso — clicar direto em "Avançar" sem tocar no
campo Comunidade mostra o erro "Selecione a comunidade.", mesmo quando só existe uma opção
possível. Não impede a tarefa (o fluxo completa normalmente assim que o usuário seleciona
manualmente), mas é uma fricção desnecessária, não óbvia, no primeiro passo do fluxo mais
importante do sistema.

## Tela

`/escalas/criar` (`scales/Create.vue`) — o mesmo padrão pode existir em `scales/Edit.vue` se
`initialData` também chegar depois da montagem, mas ali `comunidadeId` já vem preenchido pela
escala existente, então o sintoma não se manifesta.

## Componente

`src/pages/scales/Create.vue` (origem do bug) e `src/pages/scales/ScaleForm.vue` (onde o campo é
renderizado, mas o formulário em si está correto — só reage ao valor que recebe).

## Comportamento atual

`form.value.comunidadeId` é definido uma única vez, na inicialização do `ref`, antes do `fetch`
de `/comunidades` resolver. Quando a lista chega, nada atualiza o campo.

## Comportamento esperado

Quando a lista de comunidades chegar e `comunidadeId` ainda não tiver sido definido pelo usuário
nem vier de `initialData`, preencher automaticamente com a primeira (ou única) comunidade
disponível — sem sobrescrever uma escolha que o usuário já tenha feito manualmente antes da
resposta chegar (situação rara, mas possível se a rede for lenta).

## Critérios de aceite

- [x] Abrir `/escalas/criar` com uma única comunidade cadastrada: o campo Comunidade já vem
      preenchido, sem exigir interação do usuário.
- [~] Abrir `/escalas/criar` com múltiplas comunidades cadastradas: o comportamento continua
      apresentando a primeira como padrão (mesma regra de hoje), só que de forma confiável —
      verificado pela lógica do código (mesmo caminho de execução do caso de 1 comunidade), não
      testado ao vivo com 2+ comunidades reais nesta rodada.
- [x] Se o usuário selecionar manualmente uma comunidade antes do fetch resolver (raro, mas
      possível), a seleção manual não é sobrescrita quando a lista chegar — garantido pela
      guarda `form.value.comunidadeId == null` no `watch`.
- [x] `scales/Edit.vue` continua funcionando sem alteração de comportamento (já usa
      `initialData`, não deve regredir).
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma — correção isolada em `Create.vue`, sem depender de outra task de correção.

## Referências

- `docs/tasks/0058-validacao-funcional-autenticacao-escalas.md` — reprodução original.
- `docs/tasks/0061-ux-fluxos-coordenador.md` — reconfirmação em fluxo real.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.3, item 7
  (achado original, Etapa 4).
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §55 (regra de decisão: bug → corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0058`/`0061`, já havia sido identificado (mas não corrigido) no relatório
  da Etapa 4.
- 2026-08-25 — Task reivindicada e corrigida. `ScaleForm.vue`: removido o cálculo síncrono
  `props.comunidades[0]?.id` da inicialização do `form` (linha 83, sempre avaliava contra um
  array ainda vazio em `Create.vue`); adicionado um `watch(() => props.comunidades, ..., {
  immediate: true })` que preenche `form.value.comunidadeId` assim que a lista chegar, só quando
  o campo ainda está `null` — não sobrescreve nem uma escolha manual do usuário nem o valor já
  populado por `initialData` em `Edit.vue`.

  `npm run build` passou sem erros; `dist/` revertido. **Testado com dado real**: reproduzida a
  receita de ambiente já validada (Docker Postgres + seeds). Primeira rodada de verificação bateu
  num falso-negativo (campo ainda vazio, fluxo não avançou) causado por um cold-start de
  compilação do Vite logo após editar o arquivo — confirmado como artefato de ambiente, não bug,
  checando o valor real do `<select>` no DOM diretamente (voltou `"1"` mesmo nessa primeira
  rodada) e reexecutando o mesmo teste logo em seguida, que passou de forma limpa e repetível:
  campo já vem com `"1"` selecionado ao abrir `/escalas/criar`, o fluxo completo (Etapa 1 → 2 → 3
  → 4 → Publicar) funciona de ponta a ponta **sem tocar no campo Comunidade em nenhum momento**,
  terminando em "Escala criada com sucesso!" com a comunidade "Matriz" corretamente associada.
  `scales/Edit.vue` conferido à parte: abrir uma escala existente continua preenchendo o campo
  com o valor real da escala (`"1"`), sem regressão.

  Não testado ao vivo nesta rodada: cenário com 2+ comunidades cadastradas (só existe "Matriz"
  no seed padrão) — a lógica do `watch` usa exatamente o mesmo caminho (`lista[0].id`)
  independente de quantos itens a lista tem, então a cobertura do caso de 1 comunidade já
  exercita o código relevante, mas registrado como não verificado com múltiplas comunidades
  reais, por honestidade.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, nenhum seed
  temporário criado nesta task (reaproveitou os dados já existentes do `db:seed` padrão). `git
  status` confirmado: só `ScaleForm.vue` mudou em `src/pages/scales/`. Task marcada `concluida`.
  Próximo passo: qualquer uma das `TASK-0074`-`0078` (P2, todas elegíveis, sem dependência entre
  si) — pela regra de desempate por menor número, `TASK-0074` é a próxima.
