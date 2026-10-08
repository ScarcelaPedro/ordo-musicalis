---
status: backlog
modulo: api
owner:
criado-em: 2026-10-08
---

# 0135 — Substituto aprovado não herda a função de quem foi substituído

**Task ID**: `TASK-0135`

**Prioridade**: P2

## Objetivo

Achado da `TASK-0133`, ao testar a coordenação por comunidade: ao aprovar uma substituição,
`PATCH /substituicoes/:id/aprovar` (`api/_routes/substituicoes.ts`) cria ou atualiza a escalação do
substituto copiando **só** o `instrumentId`. Ficam de fora `categoriaId`, `teamId` e
`funcaoLiturgica` da escalação original.

Resultado: o substituto entra na escala **sem função** e cai em "Sem função definida". Exemplo
real do teste: a Bia aprovada no lugar de um Leitor não apareceu em Leitores.

Isso é anterior à coordenação por comunidade, mas fica mais visível agora, porque coordenadores de
comunidade passam a aprovar substituições.

## Comportamento esperado

- A escalação do substituto herda `categoriaId`, `teamId`, `funcaoLiturgica` e `instrumentId` da
  escalação substituída.
- Isso vale tanto no `create` quanto no `update` do upsert.

## Critérios de conclusão

- [ ] Substituto aprovado aparece na mesma função de quem foi substituído.
- [ ] Teste do dado copiado (função pura extraída, padrão de `api/_lib`).
- [ ] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0133-coordenacao-comunidade-editar-equipe.md` (achado).

## Notas de progresso

- 2026-10-08 — Task criada a partir do achado da `TASK-0133`.
