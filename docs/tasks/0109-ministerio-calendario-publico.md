---
status: em-andamento
modulo: api
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0109 — Mostrar o ministério no Calendário Público

**Task ID**: `TASK-0109`

**Prioridade**: P3

## Objetivo

Achado da `TASK-0105` (SPEC-003.1 §13/§14): `src/pages/public/Calendar.vue` lista cada escalado
como "Nome · {instrumento}", ou seja, só músicos ganham uma função visível. Diferente das telas
autenticadas, **não dá para resolver no frontend**: `api/_routes/public.ts` não seleciona
`categoriaId`/`categoria` do `ScaleServidor`, e `/categorias` exige login. Resolver exige
incluir a categoria (só `nome`) no `select` da rota pública.

**Decisão pendente (human gate)**: é uma mudança de API numa rota **pública**, que expõe dado
novo a visitantes anônimos. A SPEC-003.1 §30 veda mudança de API "sem necessidade". Confirmar com
o responsável se o ministério deve aparecer publicamente antes de implementar.

## Comportamento esperado (se aprovado)

- `public.ts`: incluir `categoria: { select: { nome: true } }` no `select` dos servidores.
- `public/Calendar.vue`: "Nome · {ministério · função/instrumento}" via `assignmentRoleLabel`
  (`src/utils/scaleRole.ts`).

## Dependências

- Nenhuma técnica; depende de aprovação do responsável (ver acima).

## Critérios de conclusão

- [ ] Decisão registrada (aprovar ou cancelar a task).
- [ ] Se aprovada: ministério visível no calendário público para qualquer tipo de servidor;
      teste da rota pública cobrindo o campo novo (ver `api/AGENTS.md` sobre testes).

## Referências

- `docs/tasks/0105-linguagem-multiministerio-ui.md` (tabela de achados).

## Notas de progresso

- 2026-09-25 — Task criada a partir da validação da SPEC-003.1.
- 2026-09-25 — **Decisão do usuário (human gate resolvido)**: aprovado mostrar o ministério no
  calendário público ("Sim, mostrar ministério"), sabendo que isso expõe o nome do ministério a
  visitantes anônimos. Task reivindicada.
