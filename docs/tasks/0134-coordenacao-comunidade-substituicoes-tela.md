---
status: em-andamento
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0134 — Coordenação por comunidade: Substituições no menu e na rota

**Task ID**: `TASK-0134`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Item "Substituições" no menu (sidebar e "Mais") para coordenador de comunidade; guard do router com `meta.allowCommunityCoordinator` em `/substituicoes`.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0131`, `TASK-0133` (store de auth).

## Critérios de conclusão

- [ ] Coordenador de comunidade acessa Substituições e aprova as da sua comunidade.
- [ ] Servidor comum sem vínculo continua sem acesso.
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
