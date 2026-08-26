---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0090 — Design System: Perfil e Repertório

**Task ID**: `TASK-0090`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `profile/Edit.vue` e `repertoire/{Show,Edit}.vue` para os componentes/tokens do Design
System — parte 2 de 10 do desmembramento da `TASK-0077`.

## Escopo

- `src/pages/profile/Edit.vue`
- `src/pages/repertoire/Show.vue`
- `src/pages/repertoire/Edit.vue`

## Comportamento esperado

Trocar `bg-white shadow-sm rounded-lg p-6` (cru, sem `dark:`) por `<Card>`; cabeçalhos `text-xl
text-gray-800`/`font-semibold text-gray-700` pela escala `text-h1`-`h4`; texto secundário sem
`dark:` (ex. `text-sm text-gray-600` em `profile/Edit.vue`, várias ocorrências) recebendo o par
`dark:text-gray-400` já padrão no resto do sistema. Não alterar nenhuma lógica de negócio (toggle
de push, troca de senha, exclusão de conta, upload de PDF de repertório) — só aparência.
`repertoire/Edit.vue`/`Show.vue` também têm o achado já registrado na `TASK-0083` (link de volta
à escala) — se `TASK-0083` já estiver concluída quando esta task for executada, não desfazer
aquela correção; se não estiver, esta task não precisa resolvê-la (escopo é só visual).

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] As 3 telas usando `<Card>` em vez de `div` cru para os blocos de conteúdo.
- [x] Tipografia revisada contra a escala do Design System.
- [x] Nenhuma mudança de comportamento (push, senha, exclusão de conta, upload de PDF).
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop), em ambos os temas claro/escuro.

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe.
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento).
- 2026-08-25 — Task reivindicada e corrigida.

  **`profile/Edit.vue`**: os 4 blocos de conteúdo (Informações do Perfil, Atualizar Senha,
  Notificações, Excluir Conta) trocados de `div` cru por `<Card>` (o bloco de Excluir Conta,
  que tem borda vermelha própria, usa `<Card class="border border-red-100
  dark:border-red-900/40">`, já que o `Card` não tem uma variante de cor de borda própria para
  esse caso). Cabeçalhos dos cards já tinham `dark:` correto de tasks anteriores — não alterados
  (ver decisão de escopo abaixo). Único gap real de contraste: o `<h2>` do cabeçalho da página
  ("Perfil") e a mensagem de navegador sem suporte a push não tinham par `dark:` — corrigidos
  (`dark:text-gray-100` e `text-gray-600 dark:text-gray-400`, respectivamente).

  **`repertoire/Show.vue`** e **`repertoire/Edit.vue`**: achado não previsto na task original —
  existe um componente de domínio `src/components/scale/RepertoireItem.vue` (do catálogo do
  `docs/design-system.md` §8, criado por task anterior) com **zero usos em todo o codebase**,
  exatamente o mesmo padrão de "componente órfão" já encontrado com `ErrorState.vue` na
  `TASK-0076`. As duas telas duplicavam manualmente (com classes ligeiramente diferentes e várias
  sem par `dark:`) o exato markup que esse componente já implementa corretamente. Em vez de
  corrigir cada `dark:` isoladamente nas duas cópias duplicadas, migrei ambas para usar
  `<RepertoireItem>` (via slot `#actions` para os botões PDF/Link/Remover, que variam entre as
  duas telas) — elimina a duplicação E corrige a tipografia de uma vez, e é exatamente o que
  "migrar para os componentes do Design System" pede. Os dois blocos de conteúdo (`bg-white
  shadow-sm rounded-lg p-6` com e sem `dark:` já presente) viraram `<Card>`. `repertoire/Edit.vue`
  também tinha um `<textarea>` (Observações) sem nenhum tratamento de modo escuro — corrigido
  seguindo o padrão já usado em `scales/ScaleForm.vue` (`dark:border-gray-600 dark:bg-gray-700
  dark:text-gray-100`), sem trocar `focus:border-indigo-500` pelo token `primary` (troca de
  token de cor é escopo da `TASK-0079`, não desta). A lista de itens em `Edit.vue` mudou de
  `<div>` para `<ol>`/`<li>` (via `RepertoireItem`) por corretude semântica HTML, sem mudança de
  comportamento.

  **Decisão de escopo, não previsto na task original**: o `<h2>` do slot `#header` de TODAS as
  páginas do sistema (não só estas 3) usa `font-semibold text-xl text-gray-800` em vez de um
  token da escala tipográfica (`text-h1`/`h2`) — confirmado por grep: nenhuma das ~30 páginas já
  migradas usa `text-h1`/`text-h2` no cabeçalho de página, nem mesmo páginas totalmente
  compatíveis com o Design System como `teams/Index.vue`. Migrar só estas 3 telas para um token
  tipográfico ali criaria uma nova inconsistência isolada entre elas e o resto do sistema — o
  oposto do objetivo desta task. Mantive o padrão atual (`font-semibold text-xl text-gray-800`,
  só adicionando o par `dark:` que faltava) e não apliquei `text-h4` aos subtítulos dos cards:
  o componente-irmão mais próximo estruturalmente (`availability/Form.vue`, já migrado, mesmo
  padrão de "página com Cards + formulário") usa `font-medium text-gray-800 dark:text-gray-100`
  simples para seus subtítulos de card, não o token `text-h4` — segui esse precedente estrutural
  em vez do usado por componentes de chrome (`Modal`/`Drawer`/`Calendar`), que é um contexto
  diferente. Se o sistema decidir padronizar cabeçalhos de página com tokens da escala no futuro,
  é um achado sistêmico que merece task própria (como a `TASK-0079` já é para cores) — registrado
  aqui para referência futura, não implementado nesta task.

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real**: seed temporário `api/prisma/_seedTask0090.ts`
  (deletado ao final, nunca commitado) criou uma escala confirmada com repertório de 3 itens
  (um só com tom, um com PDF, um com link externo) — para exercitar os 3 estados do
  `RepertoireItem`/slot de ações nas duas telas. Playwright cobrindo `/profile`,
  `/escalas/1/repertorio` e `/escalas/1/repertorio/editar` × 2 temas × 2 viewports (mobile 390px,
  desktop 1440px), com login real via `/login`. Screenshots inspecionadas visualmente em todas as
  combinações: os 4 cards de `profile/Edit.vue` renderizam com fundo/sombra consistentes nos dois
  temas; a lista de repertório (agora via `RepertoireItem`) renderiza corretamente com badge de
  tom, botões PDF/Link/Remover e numeração, em ambas as telas; o `<textarea>` de observações
  agora acompanha o tema escuro do card (antes ficava um retângulo branco cru mesmo com o card
  escuro ao redor).

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0091` (Design System:
  relatórios), P2, desmembrada da `TASK-0077`.
