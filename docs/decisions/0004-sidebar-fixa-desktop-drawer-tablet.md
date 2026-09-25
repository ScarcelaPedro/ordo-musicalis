# 0004 — Sidebar fixa a partir de `lg`, drawer em tablet

- **Data**: 2026-09-25
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0004`
- **Task relacionada**: `TASK-0098`

## Contexto

A `TASK-0004` (Etapa 1) e a `TASK-0024` (Etapa 3) deixaram em aberto, como "decisão de
componente para a implementação", se a navegação desktop seria uma sidebar sempre visível ou um
painel off-canvas aberto por botão. A `TASK-0034` manteve o off-canvas que já existia, a partir
de `md` (768px). A referência visual da SPEC-003.1 mostra uma sidebar escura **sempre visível**,
com a identidade no topo e o usuário no rodapé.

## Decisão

- **≥ `lg` (1024px)**: sidebar fixa de 256px (`w-64`) na lateral esquerda. O conteúdo ganha
  `lg:pl-64`, o botão hamburger some e a marca sai da topbar, porque passa a ficar na sidebar.
- **`md`–`lg` (768–1023px, tablet)**: o mesmo elemento continua como drawer off-canvas com
  overlay. O foco vai para o botão "Fechar" ao abrir; Esc e clique no overlay fecham, e o foco
  volta ao botão de menu. Fechado, fica `invisible` e não recebe tab.
- **< `md` (mobile)**: sem mudança. Continua a bottom nav + "Mais" da `TASK-0035`.
- Perfil e Sair saem da topbar em `md+` e vão para o rodapé da sidebar/drawer, junto com o
  usuário logado. Em mobile continuam no "Mais".
- É um único `<aside>` para os dois modos, alimentado pelo mesmo `navGroups`, para não criar
  uma segunda fonte de navegação.

Isso segue a recomendação da `TASK-0004` §Tablet: tablet com a mesma hierarquia completa do
desktop, mas sem exigir painel fixo.

## Alternativas consideradas

- **Manter off-canvas em todo desktop**: descartada. Em telas largas há espaço sobrando, e a
  navegação principal ficaria a um clique de distância em toda troca de tela; também diverge da
  referência aprovada na SPEC-003.1.
- **Sidebar fixa já a partir de `md`**: descartada. Em 768px os 256px da sidebar deixariam
  cerca de 500px para conteúdo, pouco para tabelas como a de Escalas.
- **Sidebar recolhível (só ícones)**: descartada por enquanto. Os grupos têm sub-itens em
  accordion, e isso exigiria um padrão de flyout novo sem necessidade demonstrada.

## Consequências

- Telas com elementos `fixed` próprios precisam considerar o deslocamento de 256px em `lg+`
  (nenhuma encontrada hoje em `src/pages/`; modais e drawers cobrem a viewport inteira, o que
  é o comportamento desejado).
- A topbar em `lg+` ficou só com o toggle de tema. A `TASK-0099` redefine o conteúdo dela
  (saudação, data), já sabendo que usuário, Perfil e Sair moram na sidebar.
