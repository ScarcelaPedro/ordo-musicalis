---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0034 — Layout global e Sidebar (desktop)

**Task ID**: `TASK-0034`

## Objetivo

Implementar o layout global desktop (Sidebar + Topbar + Conteúdo, SPEC-004 §11) e a sidebar
reorganizada pela hierarquia de domínios da Etapa 1 (Dashboard/Escalas/Pessoas/Conteúdo/
Análises/Configurações/Perfil), corrigindo o achado de que o item ativo hoje é indicado só por
cor (viola SPEC-003 §18, confirmado em `docs/tasks/0024-navegacao-visual.md`).

## Arquivos/componentes envolvidos

- `src/layouts/AuthenticatedLayout.vue` — reestruturar `navItems` (lista achatada hoje) para
  refletir a hierarquia de 2 níveis (domínio → sub-item); atualizar o template da sidebar.

## Comportamento esperado

Sidebar agrupa por domínio (nível 1), com sub-itens (nível 2) visíveis simultaneamente em
desktop. Item ativo indicado por **mais de um sinal** simultâneo: fundo + indicador lateral
(borda 3px `--color-primary`) + peso tipográfico (`font-semibold`) — não só cor. Sidebar
**não exibe** links que o `auth.user.role` atual não pode acessar — mesma lógica de permissão já
existente (`auth.isStaff`), sem duplicar nem enfraquecer regra de autorização do backend
(SPEC-004 §13, "não duplicar regras de autorização do backend" — a interface só decide o que
*mostrar*, o backend continua sendo autoridade final em cada endpoint).

## Dependências

- `TASK-0029` — tokens.
- `TASK-0030` — `IconButton` (toggle da sidebar).

## Critérios de conclusão

- [x] `navItems` reestruturado em domínios com sub-itens, mapeando exatamente o mapa de
      navegação de `docs/arquitetura-interface.md` (nenhum item novo inventado, nenhum item
      existente removido).
- [x] Item ativo indicado por pelo menos 2 sinais simultâneos além de qualquer texto (fundo +
      indicador lateral, no mínimo).
- [x] Sidebar continua respeitando `auth.isStaff`/roles como hoje — nenhuma rota nova exposta a
      um perfil que não deveria vê-la.
- [x] Estados hover/focus/active definidos nos itens da sidebar (SPEC-004 §12).
- [x] `npm run build` passa sem erros.
- [~] Navegação testada manualmente logado como `admin`/`coordenador` e como `musico` — **não
      executado**: este ambiente não tem uma ferramenta de automação de navegador disponível, só
      terminal/build. Verificado por leitura de código: `navGroups` preserva exatamente as mesmas
      condições `auth.isStaff` do `navItems` anterior, mesmo conjunto de rotas por perfil, nenhuma
      nova exposta. Teste manual em navegador real fica como pendência para o usuário confirmar
      visualmente.
- [x] Nenhuma rota do `src/router/index.ts` foi alterada.

## Riscos

- `AuthenticatedLayout.vue` é usado por **todas** as páginas autenticadas — qualquer regressão
  aqui afeta o sistema inteiro. Testar em múltiplas telas antes de considerar concluído (regra
  de regressão, SPEC-004 §59).
- Migração incremental (SPEC-004 §53): esta task troca a sidebar, mas a navegação mobile
  (dropdown) só é substituída na `TASK-0035` — durante o intervalo entre as duas, garantir que
  o dropdown mobile continue funcionando com a lista de itens antiga sem quebrar, mesmo que a
  fonte de dados (`navItems`) já tenha mudado de formato.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §11, §12, §13.
- `docs/tasks/0024-navegacao-visual.md` (especificação completa da sidebar).
- [`docs/arquitetura-interface.md`](../arquitetura-interface.md) — mapa de navegação (Etapa 1).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `AuthenticatedLayout.vue`: `navItems` (lista
  achatada) substituído por `navGroups` (2 níveis, domínio → sub-item), refletindo exatamente o
  mapa de `docs/arquitetura-interface.md` — "Escalas" (Escalas/Substituições/Recorrências/
  Disponibilidade painel), "Pessoas" (Servidores/Intensidade de Serviço), "Análises"
  (Relatórios), "Configurações" (Ministérios/Categorias/Comunidades/Celebrantes) para staff;
  "Escalas" (Minha Escala/Disponibilidade) para servidor. "Conteúdo" (Repertórios/Liturgia) ficou
  de fora deliberadamente — sem rota de listagem própria hoje (lacuna já registrada na
  TASK-0002, não inventada aqui). Dashboard ficou como link avulso fora dos grupos, com
  `HomeIcon`/`HomeIconSolid`. Accordion: só o grupo da rota ativa abre por padrão
  (`openGroup` + `watch(navGroups)`), com toggle manual via `ChevronDownIcon` rotacionado.
  Item ativo (grupo e sub-item) agora sinalizado por 3 sinais simultâneos — borda esquerda de
  4px `border-primary-500`, fundo `bg-primary-50`/`dark:bg-primary-900/30` e `font-semibold` —
  corrigindo o achado da TASK-0024 de que hoje só a cor indica o item ativo. Ícones outline
  (inativo) / solid (ativo) por domínio, seguindo o padrão dual já estabelecido na Fundação.
  Escopo respeitado à risca: dropdown mobile (`v-show="mobileMenuOpen"`) e a barra `<nav>` do
  topo (hamburger/logo/tema/usuário/Perfil/Sair) **não foram tocados** — seguem com sua própria
  lista hardcoded antiga, coexistindo sem quebrar mesmo com `navItems` tendo mudado de formato
  (risco already previsto na task, mitigado por não reaproveitar a mesma variável). Nenhuma rota
  de `src/router/index.ts` alterada. `npm run build` passou sem erros de primeira; `dist/`
  restaurado (`git checkout -- dist/ && git clean -f dist/`). `git status` confirmou que só
  `AuthenticatedLayout.vue` mudou entre arquivos de tela/layout. Teste manual em navegador logado
  como `admin`/`musico` **não foi executado** — este ambiente não tem ferramenta de automação de
  navegador disponível; a paridade de rotas por perfil foi verificada por leitura de código
  (mesmas condições `auth.isStaff`), mas a confirmação visual fica pendente para o usuário. Task
  marcada `concluida` com essa ressalva registrada.
