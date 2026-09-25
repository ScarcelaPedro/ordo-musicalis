---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0096 — Configurar Vitest no frontend

**Task ID**: `TASK-0096`

**Prioridade**: P1 (pré-requisito de teste das tasks da SPEC-003.1 que introduzem lógica)

## Objetivo

A SPEC-003.1 gera tasks com lógica pura nova no frontend (mapeamento centralizado de cores
litúrgicas em `TASK-0100`, cálculo de cobertura por ministério em `TASK-0103`). A regra 3 do
`AGENTS.md` raiz exige teste para mudança de comportamento, e `src/AGENTS.md` registra que **não
há framework de teste no frontend** (sem `test` script em `package.json`). Configurar Vitest
(nativo do ecossistema Vite, já indicado por `src/AGENTS.md`) antes dessas tasks.

## Escopo

- Instalar `vitest` (e, só se necessário para os testes previstos, `@vue/test-utils` + `jsdom`/
  `happy-dom`) como devDependency.
- Script `test` em `package.json` (`vitest run`), reaproveitando o alias `@` do `vite.config.ts`.
- Um teste de fumaça sobre uma função pura já existente (ex. `src/utils/date.ts`,
  `parseDateOnly`) para provar que a configuração funciona.
- Atualizar a seção "Testes" de `src/AGENTS.md`.

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] `npm test` roda e passa localmente.
- [x] Pelo menos 1 teste real sobre função existente em `src/utils/`.
- [x] `npm run build` continua passando (arquivos de teste fora do type-check de produção ou
      compatíveis com ele).
- [x] `src/AGENTS.md` (seção "Testes") atualizado.
- [x] ADR em `docs/decisions/` **somente** se houver escolha real entre alternativas (ex.
      `jsdom` vs `happy-dom`, ou teste de componente vs. só funções puras); Vitest em si já é
      prescrito por `src/AGENTS.md` e não precisa de ADR.

## Referências

- [`src/AGENTS.md`](../../src/AGENTS.md) — seção "Testes".
- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — contexto (tasks que dependem desta).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada (commit de claim isolado) e executada.

  `vitest@^2.1.9` como devDependency — v2 escolhida por ser a linha compatível com o `vite@^5`
  do projeto (sem forçar upgrade do Vite). Config em `vitest.config.mts` reaproveitando
  `vite.config.ts` via `mergeConfig` (plugin Vue + alias `@`); extensão `.mts` porque o
  `package.json` não é `"type": "module"` e, como `.ts`, o Vite carregava a config pela API CJS
  depreciada (aviso no console). `include: src/**/*.test.ts`, ambiente `node`.
  `tsconfig.node.json` passou a incluir a config. Scripts `test` (`vitest run`) e `test:watch`.

  Testes iniciais sobre funções reais já existentes: `src/utils/date.test.ts` (`parseDateOnly`:
  dia preservado para meia-noite UTC, string `YYYY-MM-DD`, entradas vazias) e
  `src/utils/recurrence.test.ts` (`recorrenciaLabel`: gênero semanal, ordinal mensal com gênero,
  ordinal ausente → 1ª semana). 7 testes passando (inclusive com `TZ=America/Sao_Paulo`).

  Sem ADR: Vitest já era prescrito por `src/AGENTS.md`, e nenhum ambiente DOM foi adicionado
  (só funções puras por enquanto) — a escolha `happy-dom` vs `jsdom` fica para quando o primeiro
  teste de componente for de fato necessário, registrada como orientação em `src/AGENTS.md`.
  `src/AGENTS.md` (seção "Testes") e `AGENTS.md` raiz (bloco Build) atualizados.
  `npm run build` passou sem erros; `dist/` revertido. Commit: `885704f`.

  Achado fora de escopo (não alterado): o build copia `public/AGENTS.md` para `dist/AGENTS.md`,
  ou seja, o arquivo de documentação seria servido publicamente no deploy.
