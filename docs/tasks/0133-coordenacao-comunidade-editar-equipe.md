---
status: concluida
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

- [x] Coordenador de comunidade vê "Editar equipe" só nas escalas da(s) comunidade(s) dele e salva a equipe.
- [x] Admin/coordenador de ministério sem mudança de fluxo.
- [x] Claro e escuro, mobile e desktop.
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
- 2026-10-08 — Executada. Commit: `c147f59`.

  **Store** (`src/stores/auth.ts`): `comunidadesCoordenadas` no `AuthUser`, mais
  `isCommunityCoordinator` e `coordinatesCommunity(id)`.

  **`ScaleForm.vue`**: props `mode` (`'full'` padrão | `'team'`) e `cancelTo`. No modo `team`:
  - abre na etapa 2;
  - troca o "Etapa N de 4" por um resumo somente leitura da celebração (nome, data, horário,
    comunidade);
  - o rodapé da equipe vira "Salvar equipe" (`submit`) + "Cancelar", que volta para a escala.

  O modo completo não mudou: conferido "Etapa 1 de 4 — Celebração" e o cancelar para `/escalas`.

  **`EditTeam.vue`** + rota `/escalas/:id/equipe` (só `auth`, sem `roles`):
  - carrega a escala e as listas e manda para `ScaleForm` em modo `team`;
  - salva via `PUT /scales/:id/servidores`, enviando só os servidores;
  - se o usuário não for staff nem coordenar a comunidade, redireciona para a escala com aviso. A
    API é a guarda real.

  **Detalhes da escala**: "Editar equipe" aparece para quem não é staff e coordena a comunidade.
  O link "Resolver" das funções vazias aponta para `/equipe` nesse caso e para `/editar` para o
  staff.

  **Bug evitado durante o teste**: a primeira versão tirava as escalações "substituído" da lista
  inicial. Como o PUT sincroniza pela lista e `Substituicao` tem `onDelete: Cascade`, salvar teria
  apagado o histórico de substituições. Corrigido para enviar todas as escalações, igual ao
  `Edit.vue` do staff.

  **Verificação** (banco temporário + preview):
  - Xênia (coordena a Matriz):
    - escala da Matriz: botões "Editar equipe/Liturgia/Imprimir", "Resolver" → `/equipe`;
    - escala da Capela: sem botão, sem "Resolver";
    - acesso direto a `/escalas/2/equipe` → volta para `/escalas/2` com aviso;
    - no modo equipe a 1100px claro, adicionar a Xênia em Leitores e salvar dá "Equipe atualizada" e
      volta para a escala. No banco: Xênia `convidado` (Leitores), Yuri `substituido` e Bia
      preservados, histórico das 3 substituições intacto.
  - Yuri (sem coordenação): sem botão; acesso direto redirecionado.
  - Admin: continua com "Editar" completo.
  - 375px escuro: sem scroll horizontal.
  - `npm run build` e `npm test` passam.

  **Achado** (`TASK-0135`): o substituto aprovado não herda a função de quem foi substituído.
  A Bia entrou "sem função".
