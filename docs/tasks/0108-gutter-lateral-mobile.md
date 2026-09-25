---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0108 — Gutter lateral no mobile (conteúdo encostando na borda)

**Task ID**: `TASK-0108`

**Prioridade**: P2

## Objetivo

Achado da validação da SPEC-003.1 (`TASK-0107`, §28): abaixo de `sm` (640px) o `<main>` de
`AuthenticatedLayout.vue` não tem padding horizontal (`max-w-7xl mx-auto sm:px-6 lg:px-8`), então
os cards ficam com `left = 0`, colados na borda da tela (medido a 375px no Dashboard). Isso vale
para **todas** as telas autenticadas, por isso não foi corrigido dentro da validação.

## Comportamento esperado

- Gutter de 16px (`px-4`) no mobile, mantendo `sm:px-6 lg:px-8`.
- Conferir telas que possam depender do full-bleed atual (tabelas com `overflow-x-auto`, listas
  com `divide-y` de ponta a ponta) para não criar gutter duplo.

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] Nenhum card com `left = 0` a 360/375/414px nas telas principais (Dashboard dos dois
      perfis, Escalas, Detalhes da escala, Minha Escala, Substituições, Servidores).
- [x] Sem gutter duplo e sem scroll horizontal novo.
- [x] `npm run build` passa.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §28.
- `docs/tasks/0107-validacao-spec-003-1.md` (achado).

## Notas de progresso

- 2026-09-25 — Task criada a partir da validação da SPEC-003.1 (`TASK-0107`).
- 2026-09-25 — Executada. Commit: `2498785`.

  O container do `<main>` em `AuthenticatedLayout.vue` passou de `max-w-7xl mx-auto sm:px-6
  lg:px-8` para `... px-4 sm:px-6 lg:px-8`. Antes, nenhuma tela usava margem negativa ou
  full-bleed intencional (grep por `-mx-` em `src/pages` vazio), então não há risco de
  gutter duplo.

  **Medição automática** (iframes; menor distância entre qualquer superfície com fundo ou sombra
  dentro de `main` e as bordas; seed temporário): admin a 360/375/414px em Dashboard, Escalas,
  Detalhes da escala, Substituições e Servidores → **16px dos dois lados**, sem scroll horizontal;
  servidora a 375px em Dashboard, Minha Escala, Detalhes e Disponibilidade → 16px; a 640px
  (`sm`) → 24px, igual a antes. `npm run build` passa; `dist/` revertido.
