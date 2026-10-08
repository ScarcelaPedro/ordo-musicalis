---
status: concluida
modulo: api
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0131 — Coordenação por comunidade: substituições com escopo de comunidade

**Task ID**: `TASK-0131`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Substituições (listar, sugestões, aprovar, rejeitar) passam a aceitar o coordenador da comunidade da escala, além de admin e dono do ministério (regra OR). Recusas também notificam os coordenadores da comunidade.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0129`.

## Critérios de conclusão

- [x] Teste de `substitutionScopeWhere`.
- [x] Coordenador de A lista e aprova substituições de A e não vê as de B; regra de ministério inalterada.
- [x] Recusa notifica os coordenadores da comunidade (push/WhatsApp).
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
- 2026-10-08 — Executada. Commit: `64af595`.

  **Regras** (`api/_lib/communityScope.ts`):
  - `substitutionScopeWhere(user)` é o filtro Prisma da listagem: admin vê tudo; coordenador de
    ministério continua com a regra antiga (`scale.team.responsavelId`); o coordenador de
    comunidade ganha `scale.comunidadeId in [...]`. Quem cai nas duas regras recebe a união.
    Servidor comum recebe `null` → 403.
  - `canDecideSubstitution` usa a mesma regra OR da edição de equipe.
  - 7 testes novos, 90 no total.

  **Rotas** (`api/_routes/substituicoes.ts`): `GET /` usa o filtro. `GET /:id/sugestoes`,
  `PATCH /:id/aprovar` e `/:id/rejeitar` usam o middleware novo `requireSubstitutionAccess` (404
  se não existir), no lugar de `requireRole` + `requireTeamOwnership`. A posse de ministério segue
  o `Scale.teamId` legado, exatamente como antes.

  **Notificação de recusa**: `sendPushToStaff` e `sendWhatsappToStaff` ganharam o parâmetro
  opcional `comunidadeId` e passam a incluir os coordenadores da comunidade da escala. O cálculo
  de destinatários de push foi extraído para `staffRecipientUserIds`, para ser verificável. A
  chamada na recusa (`scales.ts`) passa `pivot.scale.comunidadeId`.

  **Verificação** (banco temporário + API local; o Yuri recusa a escala 1/Matriz e a 2/Capela):

  | Caso | Resultado |
  |---|---|
  | Xênia (coordena a Matriz) lista | só a substituição da Matriz |
  | Admin lista | as duas |
  | Yuri lista | 403 |
  | Xênia sugestões/rejeitar na da Capela | 403 |
  | Xênia aprova a da Matriz com a Bia | 200; Yuri `substituido`, Bia `confirmado` |
  | Yuri aprova | 403 |
  | Admin rejeita a da Capela | 200 |
  | Substituição inexistente | 404 |
  | Regressão: escala da Capela ligada ao ministério legado da Mara | a Mara vê e rejeita; a Xênia continua sem ver |

  **Destinatários** (`staffRecipientUserIds` contra o banco):
  - Matriz → admin + Xênia;
  - Capela com o ministério da Mara → admin + Mara;
  - chamada antiga, sem comunidade → só admin.

  **Inconsistência anterior, não alterada**: a notificação de recusa usa o ministério **da
  escalação** (`pivot.teamId`), mas a permissão de decidir pelo ministério usa o ministério
  **legado da escala** (`Scale.teamId`). Um coordenador de ministério pode ser avisado e não
  conseguir decidir. A regra de comunidade cobre esse caso para quem coordena a comunidade. Fica
  como achado.
