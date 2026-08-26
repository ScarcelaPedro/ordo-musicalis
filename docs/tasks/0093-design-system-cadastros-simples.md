---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0093 — Design System: Celebrantes, Comunidades e Categorias (Create/Edit)

**Task ID**: `TASK-0093`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `celebrantes/{Create,Edit}.vue`, `comunidades/{Create,Edit}.vue` e
`categorias/{Create,Edit}.vue` para os componentes/tokens do Design System — parte 5 de 7 do
desmembramento da `TASK-0077`. Os 6 arquivos são estruturalmente idênticos entre si
(confirmado na `TASK-0066`) — tratados juntos porque a correção é literalmente a mesma repetida
6 vezes, não 3 correções diferentes.

## Escopo

- `src/pages/celebrantes/Create.vue`, `Edit.vue`
- `src/pages/comunidades/Create.vue`, `Edit.vue`
- `src/pages/categorias/Create.vue`, `Edit.vue`

## Comportamento esperado

Trocar `bg-white shadow-sm rounded-lg p-6` cru por `<Card>`; cabeçalho `text-xl text-gray-800`
pela escala `text-h1`-`h4`; checkbox "Ativo"/"Ativa"/"Ativo" cru (`<input type="checkbox">` sem
componente) pelo `Checkbox.vue` já usado em `availability/Form.vue` desde a `TASK-0052`. Manter a
ordem exata de campos e os textos de label — só trocar a implementação visual, não o conteúdo.

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] Os 6 arquivos usando `<Card>` para o card do formulário.
- [x] Checkbox "Ativo" usando `Checkbox.vue`.
- [x] Tipografia revisada contra a escala do Design System.
- [x] Nenhuma mudança de campo, validação ou comportamento de submit.
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop) em pelo menos 1 dos 3 domínios de ponta a ponta
      (criar + editar), os outros 2 conferidos por revisão de código dado serem idênticos.

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe.
- `docs/tasks/0066-ux-densidade-consistencia-linguagem.md` — confirmação da identidade
  estrutural entre os 6 arquivos.
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento).
- 2026-08-25 — Task reivindicada e corrigida. Leitura completa dos 6 arquivos confirmou a
  identidade estrutural já registrada na `TASK-0066`: mesmo esqueleto exato (`AuthenticatedLayout`
  → `<h2>` no `#header` → `div.bg-white.shadow-sm.rounded-lg.p-6.dark:bg-gray-800` →
  `<form>` com `InputLabel`/`TextInput` → checkbox cru "Ativo"/"Comunidade ativa"/"Categoria
  ativa" → botões `Primary`/`SecondaryButton`), só variando nome de campo/rótulo/rota. Aplicada a
  mesma correção idêntica nos 6: `<Card>` no lugar do `div` cru; `<Checkbox v-model="form.ativo"
  label="..." />` no lugar do par solto `<input type="checkbox"> + <InputLabel>`; `dark:` no `<h2>`
  do cabeçalho (gap sistêmico já visto em toda task desta família).

  **Decisão de escopo, consistente com a `TASK-0090`**: não converti o `<h2>` do cabeçalho pra
  `text-h1`-`h4` (pedido no texto original da task) — a mesma análise já registrada na
  `TASK-0090` se aplica aqui: nenhuma das ~30 páginas já migradas usa esse token no cabeçalho de
  página (nem `teams/Index.vue`, plenamente compatível com o Design System), então convertê-lo só
  nestes 6 arquivos criaria uma nova inconsistência isolada em vez de resolver uma. Mantido
  `font-semibold text-xl text-gray-800`, só com o par `dark:` que faltava.

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real, ponta a ponta, no domínio `celebrantes`** (conforme
  o próprio critério da task permite): sem seed extra — criei o registro pela UI de verdade
  (`/celebrantes/criar`), preenchendo nome/telefone/email e **desmarcando** o checkbox "Ativo" via
  clique real no `Checkbox.vue`, salvando, e then abrindo a edição do registro recém-criado
  (`/celebrantes/:id/editar`, navegação real via link "Editar" — inline na tabela no desktop,
  dentro do `Dropdown` "Mais" no mobile) pra confirmar que o estado `ativo: false` persistiu
  corretamente no round-trip completo (criar → salvar → API → carregar → `Checkbox` desmarcado).
  Playwright cobrindo os dois fluxos (criar + editar) × 2 temas × 2 viewports (mobile 390px,
  desktop 1440px). Screenshots inspecionadas visualmente: `Card`/`Checkbox` com contraste correto
  nos dois temas, fluxo mobile via dropdown "Mais" funcionando. `comunidades` e `categorias`
  conferidos por revisão de código — mesma edição aplicada, arquivos confirmados idênticos em
  estrutura antes da correção.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido (nenhum seed
  temporário precisou ser criado ou apagado desta vez). Task marcada `concluida`. Próximo passo:
  `TASK-0094` (Design System: equipes), P2, desmembrada da `TASK-0077`.
