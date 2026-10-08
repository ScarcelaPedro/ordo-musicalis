---
status: backlog
modulo: src
owner:
criado-em: 2026-10-08
---

# 0132 — Coordenação por comunidade: tela do admin para definir coordenadores

**Task ID**: `TASK-0132`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Na edição da comunidade, seção "Coordenadores" visível só para admin: escolher servidores com login e salvar via `PUT /comunidades/:id/coordenadores`.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0129`.

## Critérios de conclusão

- [ ] Admin adiciona/remove coordenadores; não-admin não vê a seção.
- [ ] Claro e escuro, mobile e desktop.
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
