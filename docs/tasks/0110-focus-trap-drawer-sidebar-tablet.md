---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0110 — Focus trap no drawer da sidebar (tablet)

**Task ID**: `TASK-0110`

**Prioridade**: P3

## Objetivo

Achado da `TASK-0098`/`TASK-0107`: no tablet (768–1023px) a sidebar abre como drawer com
overlay (`ADR-0004`). O foco já entra no drawer ao abrir, Esc fecha e o foco volta ao botão de
menu, mas **Tab não fica preso dentro do drawer**: ao passar do último item ("Sair"), o foco vai
para elementos da página atrás do overlay. `Drawer.vue`/`Modal.vue` já têm um padrão de
contenção de foco (`TASK-0074`) que pode ser reaproveitado.

## Critérios de conclusão

- [x] Com o drawer aberto, Tab/Shift+Tab circulam só entre os elementos do drawer.
- [x] Sem regressão no desktop (sidebar fixa, sem trap) nem no mobile (bottom nav).
- [x] `npm run build` passa.

## Dependências

- Nenhuma.

## Referências

- `docs/decisions/0004-sidebar-fixa-desktop-drawer-tablet.md`.
- `docs/tasks/0074-correcao-foco-modal-via-dropdown.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da validação da SPEC-003.1.
- 2026-09-25 — Executada. Commit: `d34ff56`.

  `AuthenticatedLayout.vue`: `onSidebarKeydown` no `<aside>` (substitui o `@keydown.esc`) usa o
  mesmo algoritmo de `Drawer.vue`: primeiro e último focáveis, com volta em Tab/Shift+Tab. Filtra
  os elementos visíveis (`offsetParent !== null`), porque os grupos recolhidos do accordion ficam
  no DOM com `v-show`. Só age com a gaveta aberta e `innerWidth < 1024`; na sidebar fixa de
  `lg+` não há trap.

  **Verificação** (820px, admin em `/escalas`): ao abrir, o foco vai para "Fechar menu"; 14× Tab
  percorre Dashboard → Escalas (4 subitens) → Pessoas → Análises → Configurações → usuário →
  Sair → **volta** para "Ordo Musicalis" → "Fechar menu" → Dashboard, sem nenhum foco fora do
  `aside`. Shift+Tab a partir do primeiro item vai para "Sair". Esc fecha e devolve o foco a
  "Abrir menu". A 1280px, Tab a partir de "Sair" segue para a página, sem trap. `npm run build`
  e `npm test` passam; `dist/` revertido.
