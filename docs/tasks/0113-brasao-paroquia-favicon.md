---
status: em-andamento
modulo: src
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0113 — Brasão da paróquia no menu lateral e no Dashboard + favicon

**Task ID**: `TASK-0113`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

O usuário forneceu a identidade real da paróquia (2026-09-25): o brasão da **Paróquia São João
Batista** (PNG com fundo transparente, 504×584) e um ícone `.ico` (204×256). Pedido: adicionar o
brasão no menu lateral e no Dashboard. O `.ico` também resolve a pendência antiga do favicon: o
`index.html` apontava para um `/favicon.svg` que nunca existiu (registrada no `AGENTS.md`
raiz, seção "Assets estáticos").

Até aqui o topo da sidebar usava uma cruz genérica e só o nome do produto (a `TASK-0098` evitou
inventar nome de paróquia). Com o brasão, o nome real ("Paróquia São João Batista", que consta
no próprio brasão) pode aparecer.

## Critérios de conclusão

- [ ] Brasão no topo da sidebar (desktop fixo e drawer do tablet), no lugar da cruz genérica,
      com o nome da paróquia.
- [ ] Brasão no Dashboard (os dois perfis), visível também no mobile, onde a sidebar não existe.
- [ ] Imagem otimizada para o tamanho exibido (não servir 185 KB para exibir 48px), com `alt`
      adequado.
- [ ] Favicon usando o `.ico` fornecido; `index.html` e `AGENTS.md` raiz atualizados.
- [ ] Legível nos temas claro e escuro; sem scroll horizontal no mobile.
- [ ] `npm run build` passa.

## Referências

- `docs/tasks/0098-sidebar-linguagem-visual.md`, `docs/tasks/0099-topbar-saudacao-contexto.md`.
- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §19, §20 (elementos litúrgicos com moderação).

## Notas de progresso

- 2026-09-25 — Task criada e reivindicada a pedido do usuário.
