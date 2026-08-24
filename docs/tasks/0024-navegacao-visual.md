---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0024 — Navegação visual (sidebar, navegação mobile, topbar)

**Task ID**: `TASK-0024`

## Objetivo

Aplicar o Design System à arquitetura de navegação já definida na Etapa 1
([`docs/arquitetura-interface.md`](../arquitetura-interface.md)): sidebar (§18), navegação
mobile (§19) e topbar (§20). SPEC-003 §1 proíbe redefinir a arquitetura em si — o mapa de
navegação, a matriz de acesso por perfil e a recomendação de bottom nav diferenciada por perfil
já foram decididos (`TASK-0002`, `TASK-0004`, ambas concluídas); esta task só desenha a aparência
consistente com o Design System.

## Dependências

- `TASK-0017` — paleta de cores (indicação de página ativa sem depender só de cor, §18).
- `TASK-0018` — tipografia.
- `TASK-0019` — espaçamento, radius, elevação, grid.
- `TASK-0020` — diretrizes transversais.
- `docs/tasks/0002-mapa-navegacao-matriz-acesso-perfil.md` (Etapa 1) — hierarquia de domínios a
  refletir na sidebar.
- `docs/tasks/0004-recomendacoes-desktop-tablet-mobile.md` (Etapa 1) — estratégia de navegação
  mobile já recomendada (bottom nav diferenciada por perfil).

## Critérios de conclusão

- [x] Sidebar especificada refletindo a hierarquia de domínios da `TASK-0002` (Dashboard,
      Escalas, Pessoas, Conteúdo, Análises, Configurações, Perfil): seção atual visível,
      hierarquia entre domínio e sub-item, separação entre grupos, página ativa destacada por
      mais de um sinal (fundo, ícone, texto, indicador lateral, peso tipográfico — não só cor —
      §18).
- [x] Navegação mobile especificada com solução própria (não a sidebar desktop reduzida — §19),
      aplicando visualmente a recomendação já tomada na `TASK-0004` (bottom nav com itens
      principais por perfil + "Mais"), sem redecidir a estrutura.
- [x] Topbar especificada: título da página, breadcrumbs quando necessários, ações principais,
      notificações, perfil — sem sobrecarregar (§20).
- [x] Comportamento responsivo de cada elemento de navegação definido explicitamente para
      mobile/tablet/desktop (§50), consistente com o que a `TASK-0004` já recomendou
      estruturalmente.

## Estado atual (releitura de `AuthenticatedLayout.vue`)

- **3 padrões de navegação coexistindo hoje** (achado da auditoria, confirmado): barra superior
  horizontal, sidebar deslizante desktop (aberta por botão hambúrguer, redundante com a barra) e
  dropdown mobile. A arquitetura já decidida nas Etapas 1–2 resolve isso para **2** padrões
  claros: Sidebar (desktop) e Bottom nav (mobile) — o dropdown mobile atual é eliminado, não
  vestido visualmente.
- **Achado de acessibilidade confirmado**: item ativo da sidebar hoje é indicado **só por
  cor** (`bg-indigo-50 text-indigo-700` vs. `text-gray-600`) — nenhum outro sinal (peso, ícone,
  indicador lateral). Viola diretamente a regra do §18 ("não utilizar apenas cor").
  Adicionalmente, o dropdown mobile **não destaca item ativo de forma alguma** (achado da
  auditoria) — resolvido pela própria eliminação do dropdown em favor do bottom nav.
  Comentário no próprio código confirma que a lista de navegação mobile é mantida **duplicada**
  manualmente em relação à fonte única da sidebar (`AuthenticatedLayout.vue:16-17`) — problema
  de arquitetura de componente que a implementação futura deve resolver usando uma fonte única
  (fora do escopo visual desta task, mas registrado para não ser esquecido).
- `navItems` hoje é uma lista **achatada** (sem agrupamento por domínio) — confirma exatamente
  o que a `TASK-0002` já tinha mapeado.

## Sidebar (§18)

Reflete os domínios já definidos em `docs/arquitetura-interface.md`/`TASK-0002`: Dashboard,
Escalas, Pessoas, Conteúdo, Análises, Configurações, Perfil.

- **Hierarquia**: nível 1 = domínio (ex. "Escalas"), nível 2 = sub-itens (ex. Substituições,
  Recorrências, Disponibilidade) — visíveis simultaneamente em desktop (já decidido na
  `TASK-0004`), com indentação e `Label`/`Caption` (`TASK-0018`) para diferenciar peso visual
  entre os dois níveis.
- **Separação entre grupos**: `spacing-md`/`spacing-lg` (`TASK-0019`) entre blocos de domínio,
  sem depender de linhas divisórias pesadas.
- **Página ativa — pelo menos 2 sinais simultâneos** (corrige o achado de "só cor" acima):
  1. Fundo com tom suave de `--color-primary` (mantido, já existe).
  2. **Indicador lateral**: barra de 3px em `--color-primary` na borda esquerda do item ativo.
  3. Peso tipográfico: `font-weight-semibold` no item ativo vs. regular nos demais.
  4. Ícone: variante `solid` do Heroicon quando ativo, `outline` quando inativo (`TASK-0020`) —
     reaproveita a dualidade solid/outline que a biblioteca já oferece, sem custo adicional.
- **Não fica visualmente carregada**: só o domínio atual expande seus sub-itens (accordion),
  os demais ficam colapsados só no nível 1 — evita listar todos os sub-itens de todos os
  domínios ao mesmo tempo.

## Navegação mobile (§19)

Aplica visualmente a recomendação já tomada na `TASK-0004` — bottom nav fixo, diferenciado por
perfil, sem redecidir a estrutura:

```text
Servidor:      Início │ Minha Escala │ Disponibilidade │ Mais
Coordenador:   Início │ Escalas │ + (Nova escala) │ Mais
```

- Ícone (Heroicons, outline/solid conforme ativo) + `Label` abaixo, mesma lógica de destaque da
  sidebar (2 sinais: cor + preenchimento do ícone).
- Item central "+" (coordenador): leve destaque (ex. círculo com `--color-primary`,
  ligeiramente elevado — Elevation 2), sem efeito exagerado (reforça §59: nada de sombra
  exagerada).
- "Mais" abre o `Drawer` já especificado na `TASK-0022`, subindo a partir da base da tela em
  mobile (variação do drawer lateral, mais natural para essa posição), listando o restante dos
  itens do perfil (Pessoas, Substituições, Recorrências, Relatórios, Configurações, Perfil,
  conforme o caso já definido na `TASK-0004`).
- Elimina o dropdown mobile atual e a duplicação de lista associada a ele.

## Topbar (§20)

- **Título da página**: cada tela já declara seu próprio título (`<template #header>`,
  padrão existente em todas as páginas) — a topbar aplica a tipografia `H1`/`H2`
  (`TASK-0018`) a esse título; se esse título deve migrar para dentro de uma barra fixa
  (em vez do padrão atual, dentro do fluxo de conteúdo) é uma decisão de arquitetura de
  componente para a etapa de implementação, não uma redefinição de UX desta etapa.
- **Breadcrumbs**: só em fluxos administrativos complexos (regra já definida na Etapa 2,
  SPEC-002 §19) — ex. "Escalas → Escala de 23/08 → Editar" (`TASK-0023`), nunca em toda tela.
- **Ações principais**: mantém o padrão já bom de hoje (ex. "Nova Escala" como `Primary` no
  header da tela, `TASK-0021`), sem migrar para a topbar global — ações são contextuais à tela,
  não à navegação.
- **Notificações**: não existe hoje um indicador de notificações na topbar (push só é
  configurado dentro do Perfil) — a especificação reserva o espaço visual no padrão de topbar
  para um indicador futuro, mas **não** implica criar uma central de notificações agora (seria
  nova funcionalidade, fora do escopo — mesma ressalva já aplicada a Pagination/ordenação na
  `TASK-0023`).
- **Perfil**: mantém o padrão já existente (nome do usuário + link Perfil + Sair).
- **Não sobrecarregar**: no máximo título + 1-2 ações contextuais + ícones de utilidade
  (tema, notificações futuras, perfil) — nunca uma lista extensa de controles na mesma barra.

## Responsividade (§50)

- **Sidebar**: presente em desktop (off-canvas por toggle, já é o padrão hoje, ou fixa —
  decisão de componente para a implementação, já registrada como em aberto na `TASK-0004`);
  ausente em mobile (substituída pelo bottom nav).
- **Bottom nav**: presente só em mobile (< 768px, breakpoint da `TASK-0019`); ausente em
  tablet/desktop.
- **Topbar**: presente em todas as larguras; em mobile, ações contextuais que não couberem
  migram para dentro do próprio conteúdo da tela (já é o padrão hoje em headers com múltiplos
  botões, `flex-wrap`).

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §1, §18, §19, §20.
- [`docs/arquitetura-interface.md`](../arquitetura-interface.md).
- `TASK-0017`, `TASK-0018`, `TASK-0019`, `TASK-0020`.
- `docs/tasks/0002-mapa-navegacao-matriz-acesso-perfil.md`,
  `docs/tasks/0004-recomendacoes-desktop-tablet-mobile.md` (Etapa 1).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Releitura de `AuthenticatedLayout.vue` confirmou
  que o item ativo da sidebar hoje é indicado só por cor (`bg-indigo-50 text-indigo-700`),
  violando diretamente a regra do §18 — resolvido com indicador lateral + peso tipográfico +
  variante solid/outline do ícone, além da cor. Os 3 padrões de navegação hoje coexistentes
  (barra horizontal, sidebar, dropdown mobile duplicado) reduzidos a 2 claros (Sidebar desktop,
  Bottom nav mobile), eliminando o dropdown e a duplicação de lista que o próprio comentário no
  código já reconhecia como problema. Bottom nav aplica visualmente a estrutura já decidida na
  `TASK-0004` sem redecidir. Reservado espaço para notificações futuras na topbar sem criar
  central de notificações agora (mesma ressalva de "nova funcionalidade" já aplicada em tasks
  anteriores). Task marcada `concluida`. Próximo passo: TASK-0025 (componentes de domínio da
  Escala) já está elegível.
