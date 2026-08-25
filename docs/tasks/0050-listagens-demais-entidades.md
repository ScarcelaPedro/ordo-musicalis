---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0050 — Listagens: replicar padrão nas demais entidades

**Task ID**: `TASK-0050`

## Objetivo

Replicar o padrão validado em `TASK-0049` (Servidores) para as demais 7 listagens
administrativas: Escalas, Comunidades, Categorias, Celebrantes, Ministérios (Equipes), Escalas
Recorrentes — já confirmado em `docs/tasks/0012-*.md` que todas compartilham a mesma estrutura
de base (SPEC-004 §33).

## Arquivos/componentes envolvidos

- `src/pages/scales/Index.vue`, `comunidades/Index.vue`, `categorias/Index.vue`,
  `celebrantes/Index.vue`, `teams/Index.vue`, `scaleTemplates/Index.vue`.

## Comportamento esperado

Mesmo padrão de `TASK-0049`: tabela desktop, card+Mais mobile, confirmação via `Modal`, loading
via `Skeleton`. `scales/Index.vue` mantém seus 3 filtros existentes (mês/ministério/comunidade);
`teams/Index.vue` ganha o estado de loading que hoje não tem (achado confirmado em
`docs/tasks/0012-*.md`).

## Dependências

- `TASK-0049` — padrão já validado numa primeira tela real.

## Critérios de conclusão

- [x] As 6 listagens migradas para o padrão card/tabela, sem `overflow-x-auto` dependente no
      mobile.
- [x] `teams/Index.vue` ganha loading state (gap corrigido).
- [x] `scales/Index.vue` preserva os 3 filtros existentes, com hierarquia visual (SPEC-004 §35).
- [x] Exclusão em todas via `Modal`, não `confirm()` nativo (substitui os usos restantes dos 12
      já mapeados em `docs/tasks/0006-*.md`).
- [x] `npm run build` passa sem erros.
- [~] Testado em cada uma das 6 telas, mobile e desktop — **não executado em navegador** (mesma
      limitação de ambiente já registrada); cada tela verificada por leitura de código: mesmos
      endpoints (`GET`/`DELETE`) e mesmos campos de dado das versões anteriores, só o container
      visual e o gatilho de exclusão mudaram.

## Riscos

- Volume de telas grande para uma task só — se o esforço real de implementação divergir muito
  entre as 6 telas (ex. `scaleTemplates/Index.vue` tem lógica adicional de "gerar escalas do
  mês"), considerar dividir em sessões separadas por tela ao executar, mesmo mantendo esta task
  única no registro (nada impede múltiplos commits sob a mesma task).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §33, §34, §35, §36.
- `docs/tasks/0012-wireframes-listagens-administrativas.md`.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada nas 6 telas (`scales/Index.vue`,
  `comunidades/Index.vue`, `categorias/Index.vue`, `celebrantes/Index.vue`, `teams/Index.vue`,
  `scaleTemplates/Index.vue`), replicando exatamente o padrão validado na `TASK-0049`: `Card`
  como container, tabela `hidden md:block` (sem `overflow-x-auto`), cards `md:hidden` com
  badges + `[Ver]`/`[Mais]` conforme cada tela tem ou não rota de detalhe própria (Comunidades/
  Categorias/Escalas Recorrentes não têm — só "Mais", igual já registrado em
  `docs/tasks/0012-*.md`; Escalas/Ministérios têm — "Ver" + "Mais"), exclusão via `Modal`
  (`paraExcluir`/`confirmarExclusao`, `DangerButton` com loading) em vez de `confirm()` nativo,
  `Skeleton` no loading. `Avatar` só em Celebrantes (única das 6 cujo registro é uma pessoa,
  mesmo critério já usado em Servidores/`TASK-0049`).

  Dois gaps de loading corrigidos (achados confirmados em `docs/tasks/0012-*.md`):
  `scales/Index.vue` e `teams/Index.vue` não tinham `loading.value` nenhum — adicionado do zero
  em ambos, seguindo o mesmo padrão das outras 4 telas (que já tinham).
  `scales/Index.vue` manteve os 3 filtros (mês/ministério/comunidade) exatamente como
  funcionavam, só dentro do `Card`. `scaleTemplates/Index.vue` manteve o painel "Gerar escalas
  do mês" inteiramente intocado (fora do `Card`, é lógica adicional que a task já sinalizava
  como fora do escopo da migração) — só a tabela/lista abaixo dele foi migrada. Todas as 6 chamam
  exatamente os mesmos endpoints `GET`/`DELETE` de antes, mesmos campos de dado, mesmas mensagens
  de flash — só o container visual e o gatilho de exclusão (clique no modal em vez de
  `confirm()`) mudaram. `npm run build` passou sem erros; `dist/` restaurado; `git status`
  confirmou que exatamente as 6 páginas listadas mudaram. Teste em mobile/desktop com busca/
  editar/excluir em cada tela não executado em navegador (mesma limitação de ambiente já
  registrada); validado por leitura de código. Task marcada `concluida`. **Fim da Fase 7
  (Listagens)**: `TASK-0049`/`0050` concluídas (Fase 6, "Minha Escala", já tinha fechado na
  `TASK-0048`). Próximo passo: `TASK-0051` (Painel de Disponibilidade) inicia a Fase 8.
