---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0076 — Correção: falha de API deixa a tela presa em loading, sem estado de erro

**Task ID**: `TASK-0076`

**Prioridade**: P2

## Descrição

Tratar o caso de falha de requisição (rede fora do ar, backend retornando erro) nas telas de
listagem, trocando o estado de carregamento preso por um estado de erro visível e acionável,
usando o componente `ErrorState.vue` que o Design System já oferece.

## Problema

Confirmado em `servidores/Index.vue` interceptando `GET /servidores` para retornar 500
(`TASK-0062`): a tela fica com 5 `Skeleton` (`animate-pulse`) presos indefinidamente na tela —
`<main>` fica sem nenhum texto além dos skeletons, sem a palavra "erro" em lugar nenhum, sem
botão de tentar de novo. O `catch` do carregamento (se existir) não troca o estado visual de
loading por um estado de erro; o componente `ErrorState.vue` já existe no Design System (criado
na `TASK-0031`, usado em outras telas) mas não está sendo usado no tratamento de falha desta
listagem.

## Impacto

Numa queda real de rede ou de backend (não simulada), o coordenador veria a tela "carregando"
para sempre, sem nenhuma indicação de que algo deu errado nem como recuperar — precisaria
adivinhar que precisa atualizar a página manualmente. Só foi verificado diretamente em
`servidores/Index.vue`, mas o padrão de `try/catch` ausente no tratamento de erro de
carregamento é provavelmente sistêmico às demais listagens (mesmo padrão de componente).

## Tela

`servidores/Index.vue` (confirmado); provavelmente as demais listagens administrativas
(`categorias`, `comunidades`, `celebrantes`, `teams`, `scaleTemplates`, `scales/Index.vue`) usam
o mesmo padrão de carregamento e merecem a mesma verificação ao implementar esta correção.

## Componente

Lógica de `load()`/`onMounted()` de cada página de listagem; `src/components/ErrorState.vue`
(já existente, só precisa ser conectado ao `catch`).

## Comportamento atual

O carregamento inicial não tem tratamento de erro visível — se a requisição falhar, o estado de
`loading`/`Skeleton` nunca é substituído por um retorno concreto (sucesso ou erro).

## Comportamento esperado

Se o carregamento inicial falhar, mostrar `ErrorState.vue` com uma mensagem compreensível (ex.:
"Não foi possível carregar os servidores.") e uma ação de "Tentar novamente" que repete a mesma
chamada.

## Critérios de aceite

- [x] Em `servidores/Index.vue`, forçar uma falha de `GET /servidores` (via interceptação de
      rede) mostra `ErrorState.vue` em vez de skeletons presos, com opção de tentar de novo.
- [x] Auditadas as demais listagens principais quanto ao mesmo padrão de `try/catch` ausente;
      corrigidas as que apresentarem o mesmo sintoma.
- [x] O caminho de sucesso (carregamento normal) não muda de comportamento.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0062-ux-erros-estados-feedback.md` — reprodução original, com detalhe de
  implementação (contagem de `Skeleton`/`animate-pulse` presos).
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §15, §18, §55 (regra de decisão: bug →
  corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0062`.
- 2026-08-25 — Task reivindicada e corrigida. A auditoria (`grep "async function load"` em
  `src/pages/`) confirmou que o sintoma era sistêmico, não isolado: **11 telas além de
  `servidores/Index.vue`** tinham exatamente o mesmo padrão — `loading.value = false` como
  última linha, sem `try`/`catch`/`finally`, então uma falha de rede deixava a Promise rejeitar
  sem nunca chegar a essa linha, e a tela ficava presa em loading pra sempre: `celebrantes/Index`,
  `teams/Index`, `categorias/Index`, `comunidades/Index`, `substitutions/Index`,
  `scaleTemplates/Index`, `scales/{Index,MyScales}`, `reports/Index`, `availability/Panel`,
  `servidores/Intensity`. `dashboard/Dashboard.vue` e `public/Calendar.vue` já tinham
  `try/finally` (sem `catch` explícito, mas ao menos não ficavam presas — falha silenciosa, não
  travamento) — deixadas de fora do escopo desta correção por já não apresentarem o sintoma mais
  grave (stuck forever), e por já terem sido tocadas noutras tasks recentes.

  Aplicado o mesmo padrão nos 12 arquivos (os 11 + `servidores/Index.vue` já corrigido antes da
  auditoria): `error` ref adicional, `try { ... } catch { error.value = true } finally { ... }`
  em volta da chamada de API, e um novo ramo `<ErrorState v-else-if="error">` com botão "Tentar
  novamente" (`@click="load"`) entre o bloco de loading e o conteúdo normal — reaproveitando
  `ErrorState.vue`, que **nunca tinha sido usado em tela nenhuma até agora** (`grep` confirma:
  0 usos antes desta task). Em 2 telas sem nenhum componente do Design System ainda
  (`reports/Index.vue`, `servidores/Intensity.vue` — telas não migradas, achado da `TASK-0057`),
  foi necessário importar `SecondaryButton` pela primeira vez, só para o botão de ação do
  `ErrorState`; nenhum outro elemento dessas telas foi tocado.

  `npm run build` passou sem erros; `dist/` revertido. **Testado com dado real e interceptação de
  rede de verdade** (não simulação de código lido) em 10 das 12 telas: forçado `GET` → 500 em
  cada endpoint (`/servidores`, `/celebrantes`, `/teams`, `/categorias`, `/comunidades`,
  `/scale-templates`, `/scales`, `/substituicoes`, `/reports/resumo`,
  `/servidores/intensidade`) — todas as 10 mostraram `ErrorState` com "Tentar novamente" visível,
  **zero** skeletons presos em qualquer uma. Testado também o caminho de recuperação: forçar erro
  em `/servidores`, remover a interceptação, clicar "Tentar novamente" — a tela carrega
  normalmente, confirmando que o botão realmente chama `load()` de novo e não é decorativo.
  `availability/Panel.vue` e `scales/MyScales.vue` receberam a mesma correção mecânica mas não
  foram testados ao vivo nesta rodada (a segunda exige login como `musico`, fora do fluxo de
  teste desta passagem) — registrado com honestidade, não assumido como testado.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, nenhum seed
  temporário necessário (a verificação foi só de interceptação de rede sobre dados já existentes
  do `db:seed` padrão). Task marcada `concluida`. Próximo passo: qualquer uma das `TASK-0077`/
  `0078` (P2) — por menor número, `TASK-0077`.
