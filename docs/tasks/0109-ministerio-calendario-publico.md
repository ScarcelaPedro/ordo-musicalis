---
status: concluida
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

- [x] Decisão registrada (aprovar ou cancelar a task).
- [x] Se aprovada: ministério visível no calendário público para qualquer tipo de servidor;
      teste da rota pública cobrindo o campo novo (ver `api/AGENTS.md` sobre testes).

## Referências

- `docs/tasks/0105-linguagem-multiministerio-ui.md` (tabela de achados).

## Notas de progresso

- 2026-09-25 — Task criada a partir da validação da SPEC-003.1.
- 2026-09-25 — **Decisão do usuário (human gate resolvido)**: aprovado mostrar o ministério no
  calendário público ("Sim, mostrar ministério"), sabendo que isso expõe o nome do ministério a
  visitantes anônimos. Task reivindicada.
- 2026-09-25 — Executada. Commit: `d5f2c82`.

  **API**: o `select` da rota anônima `GET /api/public/scales` foi extraído para
  `api/_lib/publicScaleSelect.ts` (contrato de privacidade num só lugar, com comentário do que
  nunca pode entrar). Novos campos por escalação: `categoria.nome`, `team.categoria.nome`
  (fallback, igual a `scales/Show.vue`) e `funcaoLiturgica`. Nada mais do servidor além de
  `nome`. **Testes**: `api/_lib/publicScaleSelect.test.ts` (3 testes: ministério exposto, campos
  antigos preservados, **nenhum** e-mail/telefone/observações/userId do servidor); o Vitest
  passou a incluir `api/**/*.test.ts` (33 testes no total); `api/AGENTS.md` (seção Testes)
  atualizado. Nenhuma mudança de banco. `tsc -p tsconfig.api.json` limpo.

  **Frontend**: `public/Calendar.vue` mostra "Nome · {ministério · função/instrumento}" via
  `assignmentRoleLabel`; o complemento passou de `text-gray-400` (abaixo de AA sobre branco) para
  `text-gray-500 dark:text-gray-400`.

  **Verificação com banco temporário** (servidores cadastrados **com** e-mail e telefone
  fictícios): chamada anônima (`curl`, sem token) devolve `categoria.nome` para os 4 ministérios,
  e o payload **não contém** os e-mails/telefones. A página `/publico` sem login, a 375px,
  mostra "Ana Souza · Leitores", "Bruno Lima · Acólitos e Ancilas · Turiferário", "Clara Dias ·
  Ministros da Comunhão" e "Davi Rocha · Música · Violão", sem scroll horizontal. `npm run build`
  passa; `dist/` revertido.
