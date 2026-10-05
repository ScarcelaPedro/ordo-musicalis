---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0127 — Card do dia no dashboard mostra quem está escalado

**Task ID**: `TASK-0127`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): ao clicar num dia com celebração no calendário do dashboard
(desktop e mobile), mostrar quem está escalado, também para usuários comuns, mesmo que a pessoa
ainda não tenha confirmado.

## Implementação

- Sem mudança na API: `GET /scales` já devolve `servidores` (com `servidor` e `status`) para
  qualquer usuário autenticado.
- `src/utils/scaleRole.ts` (+ teste): `scheduledPeople()`. Mostra quem tem status `convidado` ou
  `confirmado`. Deixa de fora `recusado` e `substituido`, porque essas pessoas não servem mais
  naquela celebração. Ordena por ministério e depois por nome.
- `Dashboard.vue`: o card do dia (`selected-day`, comum a desktop e mobile) lista, abaixo de cada
  celebração, os escalados com a função e o status ("Confirmado" ou "Aguardando confirmação",
  com ícone e texto, não só cor). Aparece para todos os perfis. Para a equipe, os nomes de
  ministério vêm das mesmas chamadas `/categorias` e `/teams` que já eram feitas para a cobertura.

## Progresso

- 2026-10-05: implementado. Type-check e testes ok. Concluída.
