---
status: backlog
modulo: src
owner:
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

- [ ] `npm test` roda e passa localmente.
- [ ] Pelo menos 1 teste real sobre função existente em `src/utils/`.
- [ ] `npm run build` continua passando (arquivos de teste fora do type-check de produção ou
      compatíveis com ele).
- [ ] `src/AGENTS.md` (seção "Testes") atualizado.
- [ ] ADR em `docs/decisions/` **somente** se houver escolha real entre alternativas (ex.
      `jsdom` vs `happy-dom`, ou teste de componente vs. só funções puras); Vitest em si já é
      prescrito por `src/AGENTS.md` e não precisa de ADR.

## Referências

- [`src/AGENTS.md`](../../src/AGENTS.md) — seção "Testes".
- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — contexto (tasks que dependem desta).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
