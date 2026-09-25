---
status: em-andamento
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

- [ ] Com o drawer aberto, Tab/Shift+Tab circulam só entre os elementos do drawer.
- [ ] Sem regressão no desktop (sidebar fixa, sem trap) nem no mobile (bottom nav).
- [ ] `npm run build` passa.

## Dependências

- Nenhuma.

## Referências

- `docs/decisions/0004-sidebar-fixa-desktop-drawer-tablet.md`.
- `docs/tasks/0074-correcao-foco-modal-via-dropdown.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da validação da SPEC-003.1.
