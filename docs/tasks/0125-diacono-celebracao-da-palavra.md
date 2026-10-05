---
status: concluida
modulo: api, src
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0125 — Diácono como celebrante força "Celebração da Palavra"

**Task ID**: `TASK-0125`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): sempre que um diácono for o celebrante, a celebração tem que ser
"Celebração da Palavra", automaticamente. Diáconos não podem celebrar Missas.

## Implementação

Ver `ADR-0008`.

- `api/_lib/deaconCelebration.ts` (+ teste): `celebrationNameFor(celebracao, nomeCelebrante)`.
- `api/_routes/scales.ts`: `POST` e `PATCH` aplicam a regra. O `PATCH` também a aplica quando só
  o nome muda.
- `src/utils/celebrante.ts` (+ teste): cópia da regra para o formulário.
- `ScaleForm.vue`: ao escolher um diácono, o nome vira "Celebração da Palavra" e o campo fica
  travado, com uma explicação abaixo.
- `scales/Index.vue`: o seletor rápido (`TASK-0124`) atualiza o nome com o que a API devolver e
  avisa no toast quando o nome mudou.

## Progresso

- 2026-10-05: implementado, testes e type-check ok. Concluída.
