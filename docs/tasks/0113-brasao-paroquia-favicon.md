---
status: concluida
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

- [x] Brasão no topo da sidebar (desktop fixo e drawer do tablet), no lugar da cruz genérica,
      com o nome da paróquia.
- [x] Brasão no Dashboard (os dois perfis), visível também no mobile, onde a sidebar não existe.
- [x] Imagem otimizada para o tamanho exibido (não servir 185 KB para exibir 48px), com `alt`
      adequado.
- [x] Favicon usando o `.ico` fornecido; `index.html` e `AGENTS.md` raiz atualizados.
- [x] Legível nos temas claro e escuro; sem scroll horizontal no mobile.
- [x] `npm run build` passa.

## Referências

- `docs/tasks/0098-sidebar-linguagem-visual.md`, `docs/tasks/0099-topbar-saudacao-contexto.md`.
- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §19, §20 (elementos litúrgicos com moderação).

## Notas de progresso

- 2026-09-25 — Task criada e reivindicada a pedido do usuário.
- 2026-09-25 — Executada. Commit: `0c3528c`.

  **Imagens**: o PNG original (504×584, 185 KB, fundo transparente) foi redimensionado com
  GDI+ (bicúbico de alta qualidade, alfa preservado) para **200×232, 39 KB** em
  `src/assets/images/brasao-paroquia.png`, o suficiente para ~66px em telas 3×. Importado nos
  componentes; no build vira `assets/brasao-paroquia-<hash>.png`. Criado `src/env.d.ts`
  (`/// <reference types="vite/client" />`), porque o projeto não tinha tipos do Vite para
  importar imagens. O `.ico` (204×256) foi copiado sem alteração para `public/favicon.ico`, e o
  `index.html` troca `/favicon.svg` (que nunca existiu) por `/favicon.ico`.

  **Sidebar**: a cruz genérica deu lugar ao brasão (56px de altura), com o texto "Paróquia /
  **São João Batista** / Ordo Musicalis". O nome da paróquia é real, está no próprio brasão.
  A imagem tem `alt=""` porque o texto ao lado já nomeia a paróquia. O cabeçalho da sidebar
  passou de 80 para 96px. No drawer do tablet, o nome quebra em duas linhas em vez de truncar
  (dividia espaço com o botão fechar). **Dashboard**: brasão (64px no mobile, 80px a partir de
  `sm`) ao lado da saudação, nos dois perfis, com `alt="Brasão da Paróquia São João Batista"`.
  É o único lugar onde ele aparece no mobile, que não tem sidebar.

  **Verificação** (banco temporário com seed padrão): 1280px claro (sidebar + header, imagens
  carregadas: 48×56 e 69×80), 375px escuro (header legível, sem scroll horizontal), 820px drawer
  (nome em duas linhas). `GET /favicon.ico` → 200 `image/x-icon`. `npm run build` e
  `npm test` passam; `dist/` revertido. `AGENTS.md` raiz ("Assets estáticos") atualizado: a
  pendência do favicon foi resolvida e está documentado onde fica o brasão.
