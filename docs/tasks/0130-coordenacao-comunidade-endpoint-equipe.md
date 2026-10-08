---
status: concluida
modulo: api
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0130 — Coordenação por comunidade: endpoint só de servidores da escala

**Task ID**: `TASK-0130`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Extrair o diff de servidores do `PATCH /scales/:id` para `api/_lib/scaleServidoresSync.ts` (função pura `diffScaleServidores` + aplicação + notificações), sem mudar o comportamento do PATCH. Criar `PUT /scales/:id/servidores` (só `servidores`) autorizado por `canManageScaleServers` (admin OU dono de ministério OU coordenador da comunidade gravada da escala). Liberar `GET /scales/sugestoes` para coordenador de comunidade.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0129`.

## Critérios de conclusão

- [x] Testes: `canManageScaleServers` e `diffScaleServidores`.
- [x] Coordenador de A edita a equipe de A; 403 em B; 403 no `PATCH` completo.
- [x] Sem regressão no `PATCH /scales/:id` (staff).
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
- 2026-10-08 — Executada. Commit: `d9c9c17`.

  **`api/_lib/scaleServidoresSync.ts`**: `diffScaleServidores` (pura), `applyScaleServidores`
  (aplica o diff e devolve quem entrou) e `notifyAddedServidores` (push e WhatsApp de "Nova
  escalação", mesmos textos de antes). O `PATCH /scales/:id` passou a usar os três, sem mudar o
  comportamento: continua preservando o status de quem permanece.

  **`api/_lib/communityScope.ts`**:
  - `canManageScaleServers(user, scale, ownsAnyScaleTeam)` implementa a regra OR do ADR-0009 (admin
    OU coordenador dono de ministério da escala OU coordenador da comunidade).
  - `canUseSchedulingTools(user)` cobre staff ou quem coordena alguma comunidade.

  **`PUT /scales/:id/servidores`**:
  - Aceita só `{ servidores }` e autoriza pela comunidade **gravada** da escala.
  - A posse de ministério é calculada como no `requireAnyTeamOwnership` (`resolveScaleTeamIds` +
    `responsavelId`).
  - Valida que os servidores e funções existem (422) e devolve a escala completa.
  - A mensagem de 403 é genérica, para valer também para o coordenador de ministério.

  **`GET /scales/sugestoes`**: liberado para quem coordena comunidade, porque o passo de equipe do
  formulário usa.

  **Testes**: 3 de `diffScaleServidores`, 5 de `canManageScaleServers` e 1 de `canUseSchedulingTools`
  (83 no total).

  **Verificação** com banco temporário, API local e curl. A Xênia coordena a Matriz; a escala 1 é
  da Matriz e a 2 da Capela.

  | Caso | Resultado |
  |---|---|
  | Xênia mantém o Yuri e adiciona a Bia na escala 1 | 200; o Yuri continua `confirmado` |
  | Xênia na escala 2 (Capela) | 403, escala intacta |
  | Xênia faz `PATCH /scales/1` mudando o status | 403 |
  | Yuri, sem coordenação | 403 |
  | Servidor inexistente, função inexistente, lista que não é array | 422 |
  | `/sugestoes` | 200 para a Xênia, 403 para o Yuri |
  | Escala inexistente | 404 |
  | Lista vazia | remove todos |
  | Regressão: `PATCH` do admin com servidores e observações | 200, mesmo diff |
  | Coordenadora de ministério dona de um ministério na escala 2 | 200 na 2, 403 na 1 |

  `tsc` da API, `npm run build` e `npm test` passam.
