---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0055 — Validação de acessibilidade

**Task ID**: `TASK-0055`

## Objetivo

Validar teclado, foco, contraste, labels, leitura, touch targets, navegação e mensagens de erro
(SPEC-004 §51) em todas as telas migradas — sem framework de teste de acessibilidade
configurado hoje, a validação é majoritariamente manual + ferramentas de auditoria do navegador
(Lighthouse/axe DevTools).

## Arquivos/componentes envolvidos

Todos os componentes de `TASK-0030` a `0033` e as telas de `TASK-0034` a `0053`.

## Comportamento esperado

Navegação completa por teclado (Tab/Shift+Tab/Enter/Esc) em pelo menos: `ScaleForm` (fluxo
completo de criar escala), `Modal` de confirmação (foco preso, Esc fecha), Sidebar/bottom nav.
Contraste de texto e componentes de interface validado contra WCAG 2.1 AA (mínimo 4.5:1 texto
normal, 3:1 texto grande/UI). Todo ícone-apenas com `aria-label`.

## Dependências

- `TASK-0030` a `TASK-0053` — todos os componentes e telas.

## Critérios de conclusão

- [x] Navegação por teclado funcional em `ScaleForm`, `Modal`, `Drawer`, Sidebar, bottom nav —
      testado com Playwright dirigido só por teclado (Tab/Shift+Tab/Enter/Esc), não só leitura
      de código.
- [x] Foco visível em todo controle interativo (nenhum `outline: none` sem substituto visual) —
      confirmado programaticamente em 16 elementos tabulados (Dashboard + Etapa 1 do
      `ScaleForm`): todos com `outline` e/ou `box-shadow` (ring) visíveis ao focar.
- [x] Contraste validado (ferramenta de auditoria) nos textos/componentes usando a paleta da
      `TASK-0029`, nos dois temas (claro e o que já existe de escuro) — `axe-core` real via
      Playwright, não estimativa manual.
- [x] Todo `IconButton`/ícone-apenas tem `aria-label` — verificado que é **estrutural**: a prop é
      obrigatória no TypeScript (`ariaLabel: string`, sem `?`), então `npm run build` já falha se
      algum uso omitir; confirmado por `grep` que 100% dos usos passam `ariaLabel`.
- [x] `Modal`/`Drawer` com `role`/`aria-*` corretos e foco preso enquanto abertos — confirmado
      (`role="dialog"`, `aria-modal="true"`, foco permaneceu dentro do modal após 8 Tabs). Uma
      ressalva registrada abaixo (retorno de foco ao fechar, num fluxo específico).
- [x] Mensagens de erro compreensíveis (nenhum "Error 422"/stack trace exposto — SPEC-004 §40) —
      confirmado por `grep`: 100% das chamadas `flash.set('error', ...)` no projeto usam
      `e.response?.data?.message ?? '<mensagem humana>'` ou uma string humana direta, nenhuma
      expõe código/stack cru.
- [x] Lista de problemas de acessibilidade encontrados e corrigidos registrada nas notas de
      progresso.

## Riscos

- Sem ferramenta de teste automatizado de acessibilidade configurada, a cobertura depende de
  verificação manual — risco de itens passarem despercebidos. Se o volume de problemas
  encontrados for grande, considerar registrar uma decisão em `docs/decisions/` sobre adotar
  `axe-core`/`eslint-plugin-vuejs-accessibility` como ferramenta contínua (fora do escopo desta
  task específica, mas relevante para o relatório final).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §10, §51.
- [`docs/design-system.md`](../design-system.md) — checklist de acessibilidade (`TASK-0020`).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada **com auditoria automatizada real** (`axe-core` via
  Playwright), não só inspeção manual de código — diferente do que "sem ferramenta configurada"
  no objetivo original sugeria ser o teto desta task. Ambiente recriado com o mesmo processo já
  usado na `TASK-0054` (Postgres via Docker, migrações, seed admin + `seedJuly.ts` + um script
  temporário `_seedMusico.ts` com um usuário/servidor `musico`, ambos removidos ao final,
  `npm run dev:full`), mais `npm install --no-save playwright @axe-core/playwright` (nenhuma
  mudança em `package.json`/`package-lock.json` além da entrada pré-existente de
  `@heroicons/vue`, confirmado por `git diff`).

  **Varredura 1 (estado antes de qualquer correção)**: 21 combinações página×tema escaneadas
  (`wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`) — **19 delas com violações reais**, a maioria
  `color-contrast` (até 22 nós numa página só), mais `label`/`select-name` (crítico) em 3 telas.

  **Correções aplicadas** (todas rodadas de novo depois, até a varredura final dar 0 violações
  nas 21 combinações):

  1. **Padrão sistêmico de contraste** — `text-gray-500 dark:text-gray-400` (e a variante
     invertida `text-gray-400 dark:text-gray-500`) para texto secundário sobre fundo branco:
     `gray-500` só tem ~3.55:1 contra branco, abaixo do mínimo de 4.5:1 (texto normal). Esse
     padrão apareceu em **19 arquivos** — a maioria telas tocadas nas `TASK-0034` a `0053`, mas
     também em componentes de Fundação (`CelebrationHeader.vue`, `ScaleMember.vue`,
     `Breadcrumb.vue`, `ErrorState.vue`, `EmptyState.vue`) e até em `public/Calendar.vue` (nunca
     tocado nesta etapa — o padrão já vinha de antes). Substituído por `text-gray-600
     dark:text-gray-400` (gray-600 ≈ 4.86:1, com margem) nos 19 arquivos — mudança pontual de
     valor de cor, sem alteração estrutural, risco baixo.
  2. **Botões primários no modo escuro** — `PrimaryButton.vue` e mais 8 arquivos que copiaram
     suas classes num `RouterLink` (`servidores`/`scales`/`comunidades`/`categorias`/
     `celebrantes`/`teams`/`scaleTemplates`/`dashboard` `Index.vue`/`Dashboard.vue`) usavam
     `dark:bg-primary-500` com texto branco — só ~4.08:1, abaixo do mínimo. Como o preenchimento
     de um botão sólido não depende do tema da página (é a própria cor de fundo do controle), a
     correção foi simplesmente **remover os overrides de cor no modo escuro** e deixar as mesmas
     classes do modo claro (`bg-primary-600 hover:bg-primary-700...`, ~5.38:1) valerem nos dois
     temas — mais simples e mais seguro que escolher um novo tom escuro.
  3. **`Calendar.vue`** (componente de Fundação, `TASK-0032`): cabeçalho de dias da semana
     (`text-rose-400`/`text-primary-400`/`text-gray-400`) e números de domingo/sábado
     (`text-rose-500`/`text-primary-500`) contra fundo branco, todos abaixo de 4.5:1. Corrigido
     para `-600`/`-700` no claro com `dark:` mantendo os tons claros originais (que já eram
     corretos contra fundo escuro real).
  4. **Cartões sem suporte a modo escuro que ficaram inconsistentes com os novos textos
     `dark:`** — ao corrigir os textos acima, dois cartões que nunca tinham `dark:bg-*`
     (calendário do `Dashboard.vue`, os dois blocos de legenda dele, e o cartão que envolve o
     `ScaleForm` em `Create.vue`/`Edit.vue`) ficaram brancos-fixos mesmo no tema escuro, e passei
     a aplicar tons de texto pensados pra fundo escuro sobre esse branco fixo — pior que antes.
     Corrigido completando o `dark:bg-gray-800`/`dark:bg-gray-900/40` que faltava nesses 4
     contêineres, em vez de reverter os textos — mais correto, já que o problema real era o fundo
     nunca ter escurecido, não a cor do texto.
  5. **Rótulos de formulário sem associação programática** (`label`/`select-name`, crítico):
     `scales/Index.vue` (filtro de mês/ministério sem nenhum texto visível) — `aria-label` direto
     nos 3 controles. `availability/Panel.vue` (Mês/Prazo da janela) e `scaleTemplates/Index.vue`
     ("Gerar escalas do mês") usavam `<label>` como irmão solto do `<input>`, sem `for` — par
     `for`/`id` adicionado. `ScaleForm.vue` Etapa 1 (Data/Horário/Celebração/Comunidade/
     Celebrante/Lembrete/Observações, 7 campos): usa o componente `InputLabel`, que nunca teve
     suporte a `for` — **estendido** com uma prop `for` opcional/retrocompatível (quem não passa
     continua exatamente igual), e os 7 campos da Etapa 1 ganharam `id`/`for` pareados.

  **Achado sistêmico registrado, não corrigido — fora do escopo desta task**: `InputLabel` é
  usado em **19 arquivos**; só `ScaleForm.vue` (tocado pela `TASK-0043`-`0047`) foi corrigido
  aqui. Os outros 17 (`ServidorForm.vue`, `celebrantes/Edit-Create.vue`, `teams/Edit-Create.vue`,
  `categorias/Edit-Create.vue`, `comunidades/Edit-Create.vue`, `scaleTemplates/Edit.vue` +
  `ScaleTemplateForm.vue`, `profile/Edit.vue`, `repertoire/Edit.vue`, `auth/Login.vue`,
  `Register.vue`, `ResetPassword.vue`, `ForgotPassword.vue`) têm exatamente a mesma lacuna, mas
  nunca foram tocados por nenhuma task da Etapa 4 — corrigi-los exigiria adicionar `id`/`for` a
  cada campo de cada um, um volume de arquivos muito maior que "correções pontuais". Registrado
  aqui para o relatório final (`TASK-0056`); o componente já está pronto (`for` opcional
  disponível) para quando esse trabalho for feito.

  **Bug real encontrado, não corrigido — registrado com causa-raiz identificada**: o retorno de
  foco do `Modal` ao fechar (`previouslyFocused?.focus()`) **falha especificamente** quando o
  elemento que abriu o modal vive dentro do menu de um `Dropdown` que se fecha (desmonta) no
  mesmo ciclo de reatividade que abre o modal — reproduzido com um fluxo 100% por teclado (Tab
  até "Mais" → Enter → Tab×2 até "Excluir" dentro do menu → Enter → abre o Modal → Esc fecha →
  foco não volta a lugar nenhum, cai em `document.body`). Causa provável: `document.activeElement`
  é lido dentro do `watch` do `Modal` num momento em que o elemento que disparou a abertura já
  pode ter sido removido do DOM pelo próprio fechamento do `Dropdown`, processado no mesmo lote
  de atualização do Vue. Afeta o fluxo "Mais → Excluir" usado em 8 telas de listagem
  (`servidores`/`scales`/`comunidades`/`categorias`/`celebrantes`/`teams`/`scaleTemplates`/
  `substitutions`). Uma correção robusta mexe em `Modal.vue` e/ou `Dropdown.vue` (componentes
  compartilhados, usados em muitos lugares) e merece desenho cuidadoso, não um ajuste apressado —
  registrado aqui para o relatório final, não corrigido nesta task. Fora desse caso específico, o
  foco preso dentro do modal e o fechamento por Esc funcionam corretamente.

  **Verificação final**: rodada a varredura `axe-core` mais uma vez depois de todas as correções
  — **0 violações em 21/21 combinações página×tema** (antes: 19/21 com violações). Teste de
  teclado confirmou foco visível em 16 elementos tabulados e o comportamento correto do `Modal`
  (preso + Esc), com a ressalva de retorno de foco registrada acima. `npm run build` passou sem
  erros; `dist/` restaurado; ambiente desfeito ao final (processos `node` finalizados por PID,
  container `ordo-postgres` removido, `_seedMusico.ts` apagado, `git status` confirmou nada
  pendente em `api/`).

  Task marcada `concluida`. **Fim da Etapa 4 (parcial)**: `TASK-0034` a `0055` concluídas — só
  falta `TASK-0056` (relatório final), que compila todas as pendências "parar e registrar"
  acumuladas ao longo da etapa (incluindo os dois achados desta task e o bug de `comunidadeId`
  vazio da `TASK-0054`).
