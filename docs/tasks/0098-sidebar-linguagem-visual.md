---
status: backlog
modulo: src/layouts
owner:
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

- [ ] Diff da estrutura de navegação (arrays de grupos/itens) vazio ou limitado a campos de
      apresentação (ícone/classe) — ordem e visibilidade inalteradas.
- [ ] Estados ativo/hover/focus visíveis nos temas claro e escuro, contraste AA.
- [ ] Nenhum item, badge ou texto fictício da referência adicionado.
- [ ] Desktop, tablet e mobile verificados (mobile continua com bottom nav).
- [ ] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §4, §20, §28, §30.
- `docs/tasks/0034-layout-global-sidebar.md`, `docs/tasks/0035-navegacao-mobile.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
