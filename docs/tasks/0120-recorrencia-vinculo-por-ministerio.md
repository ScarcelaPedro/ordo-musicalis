---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0120 — Recorrência: ministério adiciona todos os membros, instrumento opcional

**Task ID**: `TASK-0120`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05) para a segunda parte da criação/edição de recorrência (vínculos
fixos, `src/pages/scaleTemplates/FixedLinksEditor.vue`):

- Ao selecionar um ministério, todos os servidores vinculados a ele devem ser adicionados.
- Instrumento não é obrigatório.

## Comportamento

- Formulário: Função → Ministério (opcional) → Servidor. Com um ministério escolhido, o campo de
  servidor some e aparece a lista dos membros que serão adicionados, com o botão
  "Adicionar todos (N)". Cada vínculo criado leva a função e o ministério escolhidos.
- Entram só membros ativos, que ainda não têm vínculo na recorrência e que têm a função no
  cadastro (a API recusa os outros). Os que não têm a função aparecem listados à parte.
- Instrumento (só em Música) passa a começar vazio, com a opção "Sem instrumento", tanto no
  vínculo individual quanto em cada membro do ministério. A API já aceitava vínculo sem
  instrumento; a obrigatoriedade era só da tela (o select não tinha opção vazia).
- Sem ministério, o fluxo de adicionar uma pessoa por vez continua igual, mas sem ministério
  associado ao vínculo. Revisão registrada em `ADR-0006`.

## Implementação

- `teamMembersForFixedLinks` em `src/utils/recurrence.ts` (testado em `recurrence.test.ts`),
  usando `servidores[].teams` que `GET /servidores` já devolve.
- Criação em lote no front com `Promise.allSettled` sobre `POST /vinculos-fixos` (sem endpoint
  novo); falhas parciais são informadas no toast.

## Progresso

- 2026-10-05: implementado, testes e build ok. Concluída.
