---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0036 — Topbar

**Task ID**: `TASK-0036`

## Objetivo

Implementar o padrão de topbar definido em `docs/tasks/0024-navegacao-visual.md`: título da
página, breadcrumbs quando necessário, ações principais, espaço reservado para notificações
futuras, perfil — sem sobrecarregar (SPEC-004 §14).

## Arquivos/componentes envolvidos

- `src/layouts/AuthenticatedLayout.vue` — barra superior (hoje logo + user info + Perfil + Sair).

## Comportamento esperado

Mantém o padrão de cada página declarar seu próprio título via `<template #header>` (já
existente), com a tipografia `H1`/`H2` aplicada. `Breadcrumb` (`TASK-0032`) usado só em fluxos
administrativos complexos (regra já definida na Etapa 2 — não em toda tela). Espaço reservado
para um indicador de notificações futuro, sem criar uma central de notificações agora (SPEC-004
§62, "criar funcionalidades novas").

## Dependências

- `TASK-0034` — layout global.
- `TASK-0032` — `Breadcrumb`.

## Critérios de conclusão

- [x] Topbar aplica tokens visuais (tipografia, espaçamento, cores) sem alterar a informação
      que já exibe hoje (nome do usuário, link Perfil, Sair).
- [x] `Breadcrumb` disponível para uso pontual, não forçado em toda tela.
- [x] `npm run build` passa sem erros.
- [x] Nenhuma ação existente (logout, navegação para perfil) quebrou.

## Riscos

- Baixo — esta task é majoritariamente de estilo sobre uma área já pequena e estável do layout.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §14.
- `docs/tasks/0024-navegacao-visual.md` (especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `AuthenticatedLayout.vue`: botões ícone-apenas da
  topbar (abrir/fechar sidebar) migrados para o `IconButton` da Fundação (`TASK-0030`) — ganham
  alvo de toque de 44px, foco visível e `aria-label`, em vez do `<button>`+SVG inline anterior.
  Wordmark "Ordo Musicalis" e título "Menu" da sidebar migrados para os tokens tipográficos
  `text-h3`/`text-h4`; nome do usuário/"Perfil"/"Sair" migrados de `text-sm` cru para
  `text-body-sm` (mesmo tamanho, agora nomeado pelo token), com hover migrado de
  `hover:text-gray-700` para `hover:text-primary-600`, alinhado ao mesmo token de interação já
  usado na sidebar/bottom nav. Nenhuma informação exibida mudou (mesmo nome, mesmos links).
  `Breadcrumb.vue` (`TASK-0032`) já é standalone e consumível via `<template #header>` de
  qualquer página sob demanda — nenhuma integração no layout foi necessária ou feita, mantendo a
  regra de só usar em fluxos administrativos complexos, nunca em toda tela. Espaço para
  indicador de notificações futuro: **decisão de não adicionar nenhum ícone/placeholder visual**
  — um sino sem função real seria UI enganosa (parece funcionalidade que não existe), o que
  SPEC-004 §62 já veda; "reservar espaço" foi interpretado como não adicionar mais nada à direita
  da topbar agora, deixando-a livre para um indicador futuro sem exigir redesenho, e não como
  criar um elemento visual inerte. Título de página / breadcrumbs / ações contextuais continuam
  vindo inteiramente do slot `#header` de cada tela, como já documentado na `TASK-0024` — fora do
  escopo desta task tocar cada página individualmente. `npm run build` passou sem erros; `dist/`
  restaurado. `git status` confirmou que só `AuthenticatedLayout.vue` mudou entre arquivos de
  tela/layout. Logout e navegação para Perfil testados por leitura de código (mesmos handlers,
  mesmas rotas, nenhuma lógica alterada) — sem ferramenta de navegador neste ambiente para
  confirmação visual, mesma ressalva já registrada nas `TASK-0034`/`TASK-0035`. Task marcada
  `concluida`. **Fim da Fase 2 (Layout + Navegação)**: `TASK-0034` a `0036` concluídas. Próximo
  passo: `TASK-0037` (Dashboard — calendário) inicia a Fase 3.
