---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0083 — Correção: Repertório e Liturgia sem caminho de volta para a escala

**Task ID**: `TASK-0083`

**Prioridade**: P3

## Descrição

Adicionar um link de volta à escala de origem em `repertoire/Show.vue`, `repertoire/Edit.vue` e
`liturgia/Show.vue`.

## Problema

Confirmado visualmente na `TASK-0063` (`repertorio-editar.png`): as 3 telas são acessadas a
partir de `scales/Show.vue` (botões "Repertório"/"Liturgia") ou do Dashboard do servidor, mas
nenhuma tem um link de volta para a escala de origem — só o botão Voltar do navegador resolve
isso. `repertoire/Edit.vue` é a pior das três: nem mostra a qual celebração pertence (diferente
de `Show.vue`/`liturgia/Show.vue`, que ao menos têm "{{ celebração }} — {{ data }}" como
subtítulo, mas mesmo esse subtítulo não é um link).

## Impacto

Se o usuário chegar por link direto, atualizar a página, ou abrir em nova aba (perdendo o
histórico de navegação), fica sem saber como voltar para a escala específica — só dá para ir
para a listagem geral de `/escalas` e procurar de novo.

## Tela

`/escalas/:id/repertorio`, `/escalas/:id/repertorio/editar`, `/escalas/:id/liturgia`.

## Componente

`src/pages/repertoire/Show.vue`, `src/pages/repertoire/Edit.vue`, `src/pages/liturgia/Show.vue`.
O componente `Breadcrumb.vue` já existe no Design System (criado na `TASK-0032`) e nunca é usado
em nenhuma tela do sistema — esta é a oportunidade natural de aplicá-lo, em vez de criar um novo
padrão de "voltar".

## Comportamento atual

Cabeçalho mostra só o título da tela (`repertoire/Edit.vue`) ou título + subtítulo não-clicável
(`repertoire/Show.vue`, `liturgia/Show.vue`) — nenhum link de volta.

## Comportamento esperado

Um `Breadcrumb` (ou, alternativa mais simples, um link "← Voltar à escala") em cada uma das 3
telas, levando de volta para `/escalas/:id`.

## Critérios de aceite

- [x] As 3 telas têm um caminho de volta explícito para a escala de origem.
- [x] `repertoire/Edit.vue` passa a mostrar também a referência da celebração (nome + data),
      igualando `repertoire/Show.vue`.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0063-ux-hierarquia-navegacao.md` — achado original, com screenshot.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §33, §34, §55 (regra de decisão: problema de
  UX → avaliar o fluxo).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0063`.
- 2026-08-26 — Task reivindicada e corrigida, usando exatamente o componente já apontado no
  texto da task: `Breadcrumb.vue` (`items: {label, to}[]`), confirmado com zero usos em todo o
  codebase antes desta task — mesmo padrão de componente do Design System pronto mas nunca
  implantado já visto várias vezes nesta sessão (`ErrorState`, `RepertoireItem`, `Tabs`, e o
  `Toast` da `TASK-0081`).

  Adicionado `<Breadcrumb :items="[{label:'Escalas', to:'/escalas'}, {label: scale?.celebracao,
  to: '/escalas/:id'}, {label: '<tela atual>'}]" />` nas 3 telas — o segundo item é o link de
  volta à escala específica que a task pede, o primeiro dá também o caminho até a listagem
  geral (não pedido explicitamente, mas gratuito por já ser a forma natural como o componente
  funciona, e resolve por completo o "só dá pra ir pra listagem geral e procurar de novo" citado
  no Impacto original).

  `repertoire/Edit.vue` — a "pior das três", como o próprio texto da task registra — não buscava
  a escala de origem nenhuma (só o repertório), por isso não tinha como mostrar a celebração
  nem linkar de volta. Adicionado o `client.get('/scales/:id')` em paralelo ao fetch do
  repertório (`Promise.all`, mesmo padrão já usado em `repertoire/Show.vue`), e o mesmo
  subtítulo "{{ celebração }} — {{ data }}" que `Show.vue`/`liturgia/Show.vue` já tinham,
  igualando as 3 telas exatamente como o critério de aceite pede.

  **Achado durante o teste visual, não relacionado ao escopo desta task — regressão real que eu
  mesmo introduzi na `TASK-0079`, corrigida imediatamente**: ao trocar o `<span
  v-if="liturgia.editadoManualmente">` por `<Badge color="yellow">Corrigido manualmente</Badge>`
  naquela task, o `v-if` foi perdido na troca — o badge passou a aparecer **sempre**,
  independente do valor real de `editadoManualmente`. Não foi pego na verificação da própria
  `TASK-0079` porque o seed usado lá sempre criava a liturgia com `editadoManualmente: true`
  (nunca exercitou o caso `false`). Só ficou visível agora porque o seed desta task criava uma
  liturgia sem esse campo (`false` por padrão do schema). Corrigido restaurando o `v-if` no
  `<Badge>`: `<Badge v-if="liturgia.editadoManualmente" color="yellow">`. Rebuild e reteste
  confirmaram: com `editadoManualmente: false`, o badge não aparece mais.

  `npm run build` passou sem erros (nas duas rodadas — antes e depois da correção do `v-if`);
  `dist/` revertido.

  **Testado com dado real e navegação real**: seed temporário `api/prisma/_seedTask0083.ts`
  (deletado ao final, nunca commitado) criou uma escala com repertório (1 item) e uma liturgia
  correspondente (sem `editadoManualmente`, o que acabou expondo a regressão acima). Login real,
  navegação pelas 3 rotas (`/escalas/1/repertorio`, `/escalas/1/repertorio/editar`,
  `/escalas/1/liturgia`). Confirmado via Playwright, não só leitura de tela: o texto do
  breadcrumb em cada uma ("Escalas > Missa Dominical > <tela>"), e — o teste que realmente prova
  o requisito, não só a presença visual — **clique real** no link do meio do breadcrumb
  (`href="/escalas/1"`) navegando de fato para `/escalas/1`, confirmado pela URL final da
  página. Screenshots das 3 telas inspecionadas visualmente, incluindo a confirmação de que
  `repertoire/Edit.vue` agora mostra "Missa Dominical — 06/09/2026" (nunca mostrava nada antes).

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0084` (P3, seguinte na
  fila por número).
