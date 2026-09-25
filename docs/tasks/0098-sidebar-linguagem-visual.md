---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0098 — Sidebar: nova linguagem visual preservando a ordem atual

**Task ID**: `TASK-0098`

**Prioridade**: P1

## Objetivo

Aplicar à sidebar (`AuthenticatedLayout.vue`) a linguagem visual da referência (superfície
escura, item ativo destacado, ícones consistentes, identificação da paróquia no topo, usuário no
rodapé) **sem reorganizar a navegação** (SPEC-003.1 §4, §30).

A referência mostra itens como "Minhas Missas", "Músicos", "Repertórios", "Comunicações" em uma
ordem própria — **isso não deve ser copiado**. A ordem e os grupos atuais são a fonte de verdade:
staff → Escalas (Escalas, Substituições, Recorrências, Disponibilidade) · Pessoas (Servidores,
Intensidade de Serviço) · Análises (Relatórios) · Configurações (Ministérios, Categorias,
Comunidades, Celebrantes); servidor → Escalas (Minha Escala, Disponibilidade).

## Comportamento esperado

- Mesmos grupos, mesmos itens, mesma ordem, mesmas regras de visibilidade por perfil
  (`auth.isStaff`/`meta.roles`) — só apresentação muda.
- Estados ativo/hover/focus claramente distintos e com foco visível (§4 itens 3–4).
- Topo: identificação do sistema/paróquia — **somente** com dado que já exista (se não houver
  cadastro de nome/cidade da paróquia, não inventar "Paróquia São João Batista – Montes Claros";
  usar o nome do produto).
- Rodapé: usuário logado (nome/e-mail/avatar já disponíveis em `auth.user`) com acesso ao
  perfil/sair, se isso já existir no layout.
- Badge numérico em item de menu **só** se houver contagem real disponível (a referência mostra
  "Comunicações 2", funcionalidade que não existe no sistema — não criar).
- Elemento litúrgico decorativo (marca-d'água de igreja) opcional e discreto (§20); nunca
  prejudicando contraste dos itens.
- Navegação mobile (bottom nav + "Mais", `TASK-0035`) mantém a própria lógica — não é a sidebar
  encolhida (§28).

## Dependências

- `TASK-0097` — tokens de superfície/linguagem visual.

## Critérios de conclusão

- [x] Diff da estrutura de navegação (arrays de grupos/itens) vazio ou limitado a campos de
      apresentação (ícone/classe) — ordem e visibilidade inalteradas.
- [x] Estados ativo/hover/focus visíveis nos temas claro e escuro, contraste AA.
- [x] Nenhum item, badge ou texto fictício da referência adicionado.
- [x] Desktop, tablet e mobile verificados (mobile continua com bottom nav).
- [x] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §4, §20, §28, §30.
- `docs/tasks/0034-layout-global-sidebar.md`, `docs/tasks/0035-navegacao-mobile.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `7a81c72`.

  **Sidebar** (`AuthenticatedLayout.vue`): superfície `primary-900` (`primary-950` no escuro),
  item ativo em pílula `primary-700` com texto branco, grupo ativo em branco negrito, idle
  `primary-100` com hover `white/5`, foco visível `ring-accent-300` em todos os itens, alvos
  ≥ 44px. Topo: cruz discreta em `accent` + "Ordo Musicalis" / "Escalas da paróquia" (nome do
  produto, não uma paróquia inventada). Rodapé: `Avatar` + nome/e-mail do usuário logado (link
  para Perfil) + Sair. Sem badges e sem marca-d'água: não há contagem real para badge, e a
  marca-d'água foi dispensada para manter a moderação da §20.

  **Decisão** ([`ADR-0004`](../decisions/0004-sidebar-fixa-desktop-drawer-tablet.md), questão
  que estava aberta desde as `TASK-0004`/`0024`): sidebar fixa em `lg+`, drawer off-canvas em
  tablet, mobile inalterado. O drawer ganhou gestão de foco (entra no "Fechar", Esc fecha e
  devolve o foco ao botão de menu, e fica `invisible` quando fechado). Antes, o foco ficava atrás
  do overlay.

  **Ordem/visibilidade**: `navGroups` não foi reordenado nem teve itens adicionados ou removidos.
  Ordem conferida no DOM: Dashboard · Escalas (Escalas, Substituições, Recorrências,
  Disponibilidade) · Pessoas (Servidores, Intensidade de Serviço) · Análises (Relatórios) ·
  Configurações (Ministérios, Categorias, Comunidades, Celebrantes); servidor só vê Escalas
  (Minha Escala, Disponibilidade). **Correção de estado ativo** (§4 item 4): em
  `/escalas-recorrentes`, o item "Escalas" também acendia (`startsWith('/escalas')`). Agora há um
  único item ativo (helper `isScalesRoute`, aplicado também à bottom nav).

  **Verificação com dado real**: Postgres temporário em Docker + seed temporário
  (`api/prisma/_seedSpec031.ts`, não commitado: 6 servidores em 5 categorias, admin,
  coordenadora e servidora com login, 6 escalas, liturgia de setembro). Admin em 1440px e
  1100px no claro (sidebar fixa, sem scroll horizontal), 820px no escuro (drawer: abrir, Tab,
  Esc, foco devolvido) e servidora em 375px (sidebar ausente, bottom nav "Início, Minha Escala,
  Disponibilidade, Mais" intacta) e 1100px. `npm run build` e `npm test` passam; `dist/`
  revertido. O ambiente de teste foi mantido para as próximas tasks da SPEC-003.1.
