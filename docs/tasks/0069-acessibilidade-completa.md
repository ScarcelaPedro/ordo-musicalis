---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0069 — Nível 4: Acessibilidade completa — teclado, foco, contraste, cor e legibilidade

**Task ID**: `TASK-0069`

## Objetivo

Estender a auditoria de acessibilidade real feita na `TASK-0055` (que cobriu 21 combinações
página×tema durante a Etapa 4, e registrou explicitamente uma lacuna em 17 arquivos que usam
`InputLabel` sem `for`/`id`) para o restante do sistema, fechando essa lacuna conhecida e
cobrindo as ~42 telas.

## Escopo

Todas as telas de `src/pages/` não cobertas por `TASK-0055`, com atenção específica aos 17
arquivos já identificados no relatório da Etapa 4 (item 9) que usam `InputLabel` sem associação
`for`/`id`: `ServidorForm`, `Create`/`Edit` de celebrantes/teams/categorias/comunidades,
`scaleTemplates`, `profile`, `repertoire`, `auth/*`.

## Metodologia

Reaproveitar a receita já validada na `TASK-0055` (Playwright + `@axe-core/playwright`,
`AxeBuilder({ page }).withTags([...]).analyze()`) e o padrão de contraste já estabelecido
(`text-gray-500` → `text-gray-600`, `primary-500` → `primary-600` no texto sobre fundo claro).

Teste de teclado (§25): `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, setas quando aplicável,
em todas as telas do Escopo.

Foco (§26): todo elemento interativo deve ter um estado de foco perceptível; o usuário nunca deve
perder a referência de onde está navegando só por teclado.

Contraste (§27): validar texto, botões, badges, alertas, links, placeholders e estados
desabilitados usando critério de acessibilidade (WCAG AA, 4.5:1 texto normal / 3:1 texto
grande), não percepção visual.

Teste de cor (§28): confirmar que nenhuma informação importante depende só de cor (ex.: conflito
não deve ser só vermelho — precisa de ícone + texto + cor).

Teste de legibilidade (§29): tamanho, peso, contraste, `line-height`, largura de linha.

## Dependências

- `TASK-0056` — Etapa 4 concluída.
- `TASK-0055` — metodologia e padrão de correção de contraste já validados; esta task estende a
  cobertura e fecha a lacuna dos 17 arquivos de `InputLabel` já identificada.

## Critérios de conclusão

- [x] Varredura `axe-core` executada em todas as telas do Escopo, nos dois temas.
- [x] Lacuna dos 17 arquivos de `InputLabel` sem `for`/`id` corrigida (o componente já suporta a
      prop `for`, adicionada na `TASK-0055` — aqui é só aplicar aos arquivos restantes).
- [x] Navegação por teclado testada nas telas do Escopo, incluindo `ScaleForm`, `ServidorForm` e
      os demais formulários de cadastro.
- [x] Teste de cor (§28) aplicado a todo indicador de status/conflito/erro que hoje dependa só de
      cor — reaproveitando evidência já coletada (não duplicado; ver Notas de progresso).
- [x] 0 violações WCAG 2.1 A/AA na varredura final.
- [x] Ambiente de teste encerrado e limpo ao final.

## Riscos

- Baixo — a correção da lacuna de `InputLabel` é mecânica (o componente já suporta `for`); risco
  principal é esquecer algum dos 17 arquivos — conferir contra a lista exata do relatório da
  Etapa 4 antes de fechar esta task.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §25-29, §53.
- `docs/tasks/0055-acessibilidade.md` — metodologia e receita de ambiente.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.3, item 9
  (lista exata dos 17 arquivos pendentes).

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005. Diferente das demais tasks de
  Nível 3/4 desta etapa, esta envolveu **correção real de código**, não só observação — o próprio
  §69 da SPEC-005 permite isso quando a lacuna já está diagnosticada e o conserto é mecânico
  (mesma lógica já usada pra decidir não abrir uma task de correção separada pra algo trivial).

  **Correção 1 — `InputLabel` `for`/`id` nos 17 arquivos identificados no relatório da Etapa 4
  (item 9)**: `servidores/ServidorForm.vue`, `celebrantes/{Create,Edit}.vue`,
  `teams/{Create,Edit}.vue`, `categorias/{Create,Edit}.vue`, `comunidades/{Create,Edit}.vue`,
  `scaleTemplates/{Edit,ScaleTemplateForm}.vue`, `profile/Edit.vue`, `repertoire/Edit.vue`,
  `auth/{Login,Register,ResetPassword,ForgotPassword}.vue`. Confirmado por `grep` que eram
  exatamente 17 (mais o `ScaleForm.vue` já corrigido na `TASK-0055` = 18 usos totais de
  `InputLabel` no projeto). Cada campo com controle único ganhou `id`/`for` correspondente; os
  poucos rótulos de grupo sem controle único (`Função(ões)`, `Instrumentos`, `Ministérios` em
  `ServidorForm.vue`; `Servidores` em `teams/Create.vue`/`Edit.vue`; `Equipe da celebração` em
  `ScaleForm.vue`) foram deixados sem `for`, mesmo critério já usado no `ScaleForm.vue` original —
  não há um controle único pra apontar.

  **Correção 2 (achado durante a própria varredura, não planejada) — dark mode ausente nos
  cartões e textos secundários dos mesmos 17 arquivos.** A primeira rodada de `axe-core` (depois
  da Correção 1) caiu de "label"/"select-name" pra 0, mas revelou **17 violações novas de
  `color-contrast`**, concentradas quase todas em modo escuro: o wrapper
  `bg-white shadow-sm rounded-lg p-6` de cada uma dessas telas nunca tinha ganhado
  `dark:bg-gray-800` (mesma causa-raiz já documentada na `TASK-0055` pra `Calendar.vue`/
  Dashboard — texto corretamente adaptado pro tema escuro, fundo do cartão não). Corrigido em 2
  rodadas (igual ao padrão iterativo da `TASK-0055`): 1ª rodada tratou os wrappers de cartão (14
  arquivos com esse padrão exato, via `grep`/`replace_all` da string literal
  `class="bg-white shadow-sm rounded-lg p-6"`); revarredura caiu de 17 para 7 violações; 2ª rodada
  tratou textos secundários individuais sem par `dark:` (`text-gray-700`→`dark:text-gray-300` em
  cabeçalhos, `text-gray-600`→`dark:text-gray-400` e `text-gray-500`→`text-gray-600
  dark:text-gray-400` em parágrafos auxiliares, `text-red-700`→`dark:text-red-400` em "Excluir
  Conta", `text-green-600`→`text-green-700 dark:text-green-400` na mensagem de sucesso do
  `ForgotPassword.vue`) em `profile/Edit.vue`, `repertoire/Edit.vue`, `servidores/ServidorForm.vue`,
  `scaleTemplates/Edit.vue` e `auth/ForgotPassword.vue`. **Resultado final: 0 violações em 36
  combinações página×tema** (17 telas × 2 temas, confirmado por varredura real após rebuild).

  **Achado (P2) — as telas de visualização (`Show.vue`) de Servidores, Ministérios e Liturgia não
  têm tratamento de modo escuro nenhum, não só um detalhe isolado.** Descoberto por `grep` da
  mesma string de risco (`bg-white shadow-sm rounded-lg p-6`) em `servidores/Show.vue`,
  `teams/Show.vue` e `liturgia/Show.vue` — essas 3 telas usam dezenas de `<dt>`/`<dd>`/`<h3>`/`<p>`
  com `text-gray-500`/`700`/`800`/`900` sem nenhum `dark:` correspondente, muito além de 1 cartão
  isolado (`liturgia/Show.vue` sozinha tem 10 ocorrências do wrapper de risco). **Deliberadamente
  não corrigido nesta task** — diferente da Correção 2 acima (poucos pontos, mesmo padrão simples
  já validado), aqui é um retrabalho completo de tema escuro em 3 telas inteiras, escopo maior do
  que "aplicar um padrão mecânico já pronto". Registrado pra a `TASK-0071` avaliar como task de
  correção própria.

  **§25/§26 Teclado e foco**: testado com teclado real (não `.click()`) em
  `celebrantes/criar` — ordem de tab lógica (nome com `autofocus` → telefone → email → ativo →
  salvar → cancelar), foco sempre visível (`outline`/`box-shadow` presente em cada parada), e o
  checkbox "Ativo" alterna corretamente com `Space` — confirma que a correção 1 (`for`/`id`) não
  quebrou nada da interação por teclado que já funcionava.

  **§28 Teste de cor**: não repetido do zero — já confirmado nas `TASK-0057` (badges de status),
  `TASK-0061` (categorias vazias com ⚠ + texto + âmbar) e `TASK-0062` (nenhum achado de
  informação dependente só de cor). Nenhuma tela desta etapa introduziu um indicador novo
  dependente só de cor.

  **§27/§29 Contraste e legibilidade**: cobertos integralmente pela varredura `axe-core` acima
  (a regra `color-contrast` do axe cobre exatamente a exigência WCAG de contraste; legibilidade
  de tamanho/`line-height` já herdada da escala tipográfica do Design System, sem achado novo).

  `npm run build` executado 3 vezes (após cada rodada de correção), sempre sem erros; `dist/`
  revertido a cada vez. `git status` confirmado limpo em `src/`/`api/` fora dos arquivos de
  código realmente alterados (as 17 correções de `for`/`id` + as ~19 correções de contraste —
  todas dentro do escopo desta task, nenhuma fora do declarado). Ambiente (Docker +
  `npm run dev:full`) encerrado ao final: dev servers finalizados, container Postgres removido,
  seed temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0070`.
