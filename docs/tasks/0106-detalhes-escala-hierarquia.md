---
status: em-andamento
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0106 — Detalhes da escala: hierarquia Celebração → Funções → Servidores

**Task ID**: `TASK-0106`

**Prioridade**: P2

## Objetivo

Aplicar a nova linguagem visual à tela de detalhes (`src/pages/scales/Show.vue`) reforçando a
escala como objeto multiministério (SPEC-003.1 §17, §18): Celebração → Escala → Funções →
Servidores, sem priorizar a informação musical.

## Comportamento esperado

- Topo (contexto + informação principal): celebração, data, horário, local/comunidade,
  celebrante, status da escala (`Badge`), informações litúrgicas (`LiturgicalInfo`, usando o
  mapeamento da `TASK-0100`).
- Corpo: seção de equipe agrupada por categoria (`gruposPorCategoria` — já existe, inclusive
  categorias vazias), cada servidor com status de confirmação; nenhuma categoria tratada como
  principal.
- Repertório e demais conteúdos musicais como seção **secundária**, após a equipe.
- Observações e demais informações existentes preservadas.
- Ações (editar, excluir, confirmar, substituir) mantidas com as mesmas regras de permissão.
- Mobile: mesma ordem de prioridade em coluna única.

## Dependências

- `TASK-0097` — tokens/linguagem visual.
- `TASK-0100` — mapeamento litúrgico centralizado.

## Critérios de conclusão

- [ ] Ordem visual: contexto → equipe por função → repertório/auxiliares.
- [ ] Todas as informações hoje presentes continuam acessíveis (nenhuma removida).
- [ ] Nenhuma mudança de regra de permissão, API ou fluxo de confirmação/substituição.
- [ ] Verificado com escala multiministério real (≥ 3 categorias, uma vazia), mobile e desktop,
      claro e escuro.
- [ ] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §17, §18, §22.
- `docs/tasks/0040-escala-detalhes-cabecalho.md`, `docs/tasks/0041-escala-detalhes-situacao-equipe.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
