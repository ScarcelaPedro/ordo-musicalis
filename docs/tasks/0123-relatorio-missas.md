---
status: concluida
modulo: geral
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0123 — Relatório de missas e Celebrações da Palavra

**Task ID**: `TASK-0123`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): um relatório com a quantidade de missas e Celebrações da Palavra
em cada comunidade, a quantidade de missas celebradas por cada padre (Pe.) e de Celebrações da
Palavra celebradas por cada diácono (Diác.). Diáconos não celebram missas e padres não celebram
Celebrações da Palavra.

## Implementação

- `api/_lib/massReport.ts`: classifica cada escala (ver [ADR-0007](../decisions/0007-tipo-celebracao-pelo-titulo-do-celebrante.md))
  e agrega por comunidade e por celebrante. Testes em `api/_lib/massReport.test.ts`.
- `GET /api/reports/missas?inicio=&fim=` (admin/coordenador), mesmo período padrão de
  `/reports/resumo` (mês atual). Conta todas as escalas do período, como o resumo.
- `src/pages/reports/Index.vue`: novo card "Missas e Celebrações da Palavra" com totais e abas
  "Por Comunidade" / "Por Celebrante", usando o mesmo filtro de datas da página.

## Progresso

- 2026-10-05: implementado, testes e build ok. Concluída.
