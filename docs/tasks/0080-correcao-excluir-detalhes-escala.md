---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0080 — Correção: adicionar ação de excluir na tela de detalhes da escala

**Task ID**: `TASK-0080`

**Prioridade**: P3

## Descrição

Adicionar um botão "Excluir" em `scales/Show.vue`, junto aos demais atalhos já existentes
(Imprimir/Repertório/Editar/Liturgia), reaproveitando o mesmo endpoint `DELETE /scales/:id` e
padrão de confirmação via `Modal` já usados na listagem.

## Problema

Confirmado na `TASK-0058`: a exclusão de escala só existe em `scales/Index.vue` — a tela de
detalhes não tem essa ação, mesmo já reunindo as demais ações relevantes (Imprimir, Repertório,
Editar, Liturgia) no mesmo cabeçalho.

## Impacto

Um coordenador olhando o detalhe de uma escala que decide excluí-la precisa voltar para a
listagem e localizar a linha correspondente para completar a ação — passo extra desnecessário,
já que a exclusão é logicamente equivalente estando em qualquer uma das duas telas.

## Tela

`/escalas/:id`.

## Componente

`src/pages/scales/Show.vue` — reaproveitar o `Modal` de confirmação e a chamada
`DELETE /scales/:id` já implementados em `scales/Index.vue`.

## Comportamento atual

O cabeçalho de `scales/Show.vue` tem "Imprimir", "Repertório", "Editar" e "Liturgia" — sem
"Excluir".

## Comportamento esperado

Um botão "Excluir" no mesmo cabeçalho, restrito a `auth.isStaff` (mesma regra de permissão já
aplicada na listagem), abrindo um `Modal` de confirmação e, ao confirmar, chamando
`DELETE /scales/:id` e redirecionando para `/escalas` com feedback de sucesso.

## Critérios de aceite

- [x] Botão "Excluir" visível no cabeçalho de `scales/Show.vue` para usuários staff.
- [x] Clicar abre um `Modal` de confirmação (nunca exclusão de um clique só, §48).
- [x] Confirmar exclui a escala e redireciona para `/escalas` com mensagem de sucesso.
- [x] Botão ausente para usuários não-staff (mesma regra de permissão da listagem).
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0058-validacao-funcional-autenticacao-escalas.md` — achado original.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §48, §55 (regra de decisão: problema de UX →
  avaliar o fluxo — resolvido aqui expondo a ação já existente em mais um lugar coerente).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0058`.
- 2026-08-26 — Task reivindicada e corrigida. Reaproveitado exatamente o padrão já existente em
  `scales/Index.vue` (`Modal` + `client.delete('/scales/:id')`), adaptado pra tela de detalhe: em
  vez de um ref `paraExcluir` guardando qual item da lista excluir, um simples `confirmandoExclusao`
  booleano (só existe 1 escala nesta tela, sem ambiguidade de "qual"), e ao confirmar redireciona
  pra `/escalas` com `router.push` em vez de filtrar uma lista local. Botão "Excluir" adicionado
  ao cabeçalho seguindo o mesmo estilo visual dos botões já existentes ali (Imprimir/Repertório/
  Editar/Liturgia — `<button>`/`<RouterLink>` cru com classes manuais, não os componentes
  `PrimaryButton`/`SecondaryButton`), com `bg-danger-600`/`hover:bg-danger-700` (token semântico
  correto pra ação destrutiva, não uma cor literal nova) em vez do `bg-gray-200`/`bg-indigo-600`
  dos outros — migrar o cabeçalho inteiro pros componentes do Design System não é o pedido desta
  task (`scales/Show.vue` nem está na lista das 25 telas da `TASK-0057`/`0077`) e seria escopo
  maior do que uma correção P3 pontual justifica. `confirmarExclusao()` espelha
  `Index.vue` exatamente, inclusive sem `try/catch` de erro de rede (mesma lacuna já presente lá
  — corrigi-la across-the-board é o propósito da `TASK-0082`, ainda não executada; não seria
  coerente resolver isso só aqui, de passagem).

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real, incluindo o ciclo de exclusão completo (não só
  abrir/fechar o modal)**: seed temporário `api/prisma/_seedTask0080.ts` (deletado ao final,
  nunca commitado) criou 2 escalas (uma pra exclusão real, outra só pra checar visibilidade do
  botão) e 1 usuário `musico` (não-staff) pra testar a ausência do botão. Confirmado via
  Playwright: (1) botão "Excluir" visível pra staff nas 4 combinações de tema/viewport
  (mobile 390px, desktop 1440px, claro/escuro); (2) botão **ausente** pro usuário `musico`,
  mesma regra de permissão da listagem; (3) ciclo completo real — abrir modal, clicar "Cancelar"
  (confirma que a URL permanece na tela de detalhe, nada foi excluído), reabrir modal, clicar
  "Excluir" de verdade, confirmar redirecionamento pra `/escalas`, mensagem de sucesso "Escala
  excluída" visível, e — o teste mais importante — busca posterior confirmando que a escala
  **não aparece mais** na lista, provando que a exclusão foi real via API, não só uma mudança de
  estado na UI. Screenshots do cabeçalho com o botão (dark/desktop) e do modal aberto
  inspecionadas visualmente: botão vermelho consistente com os demais, modal idêntico ao padrão
  já usado em `Index.vue`.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0081` (P3, seguinte na
  fila por número).
