---
status: em-andamento
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0133 — Coordenação por comunidade: tela "Editar equipe"

**Task ID**: `TASK-0133`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Rota `/escalas/:id/equipe` (`EditTeam.vue`) que reusa o `ScaleForm.vue` em `mode: 'team'` (abre na etapa de equipe, etapa 1 somente leitura) e salva via `PUT /scales/:id/servidores`. Store de auth com `comunidadesCoordenadas`. Botão "Editar equipe" em Detalhes da escala para quem coordena a comunidade.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0130`.

## Critérios de conclusão

- [ ] Coordenador de comunidade vê "Editar equipe" só nas escalas da(s) comunidade(s) dele e salva a equipe.
- [ ] Admin/coordenador de ministério sem mudança de fluxo.
- [ ] Claro e escuro, mobile e desktop.
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
