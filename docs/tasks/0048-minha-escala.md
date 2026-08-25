---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0048 — Minha Escala

**Task ID**: `TASK-0048`

## Objetivo

Aplicar o Design System à tela "Minha Escala" (SPEC-004 §30), usando `ScaleCard` e mantendo a
interação de confirmar/recusar exatamente como está — a auditoria já classifica esse fluxo como
"bem resolvido, não precisa de menos passos, só de reforço visual".

## Arquivos/componentes envolvidos

- `src/pages/scales/MyScales.vue` — migrar as linhas de "Próximas"/"Histórico" para `ScaleCard`.

## Comportamento esperado

Cada escala vira um `ScaleCard` com data/horário/comunidade/celebração + função/instrumento da
pessoa (**se `GET /scales?mine=true` já retornar esses campos no pivot** — verificar antes de
assumir; se não vier, registrar como problema em vez de inventar o dado) + `ConfirmationStatus`.
Chevron de tappability (reaproveita o padrão já usado no Dashboard). Confirmar/recusar
permanece inline, sem navegação — interação preservada, só o container visual muda.

## Dependências

- `TASK-0033` — `ScaleCard`.
- `TASK-0031` — `Skeleton` para loading por linha (hoje é um texto "Carregando..." único).

## Critérios de conclusão

- [x] Blocos "Próximas"/"Histórico" migrados para `ScaleCard`.
- [x] Interação de confirmar/recusar (com motivo opcional) preservada byte a byte em
      comportamento — mesmas chamadas `PATCH /scales/:id/confirmar`/`recusar`.
- [x] Loading por linha (skeleton), substituindo o texto único atual.
- [x] `npm run build` passa sem erros.
- [~] Testado confirmando e recusando uma escala, verificando que o comportamento (flash de
      sucesso, atualização da lista) é idêntico ao anterior — **não executado em navegador**
      (mesma limitação de ambiente já registrada); `confirmar`/`recusar`/`motivoAbertoId`/`motivo`
      não foram tocados, só movidos para dentro do slot `actions` do `ScaleCard` — mesmos
      handlers, mesmo corpo de função, verificado por leitura de código.

## Riscos

- Baixo/médio — a interação em si não muda, mas a extração para `ScaleCard` precisa preservar
  exatamente os mesmos handlers (`confirmar`/`recusar`/`motivoAbertoId`) sem regressão.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §30, §31.
- `docs/tasks/0011-wireframe-minha-escala.md` (especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Confirmado por leitura do backend
  (`api/_routes/scales.ts`, `include` compartilhado com `GET /scales?mine=true`) que o pivot já
  retorna `instrument` (relação incluída) e `funcaoLiturgica` (coluna escalar do
  `ScaleServidor`, sempre presente independente de include) — nenhum dado novo precisou ser
  consultado para mostrar "função/instrumento da pessoa".

  **`ScaleCard.vue` estendido** (não só consumido) com 3 adições, todas opcionais/aditivas —
  zero regressão no uso já existente no Dashboard (`TASK-0038`/`0039`): prop `detalhe` (linha
  secundária de texto, mesmo nome/padrão de `ScaleMember.detalhe`), prop `vinculoFixo` (Badge
  roxo, mesmo padrão de `ScaleMember.vinculoFixo`) e slot `actions` (área abaixo do cabeçalho,
  fora do link tapável — motivo: MyScales precisa de botões clicáveis independentes
  [Confirmar/Não posso ir/motivo], e colocá-los dentro da região que já é um `RouterLink`
  causaria navegação acidental ao clicar num botão). Estrutura interna mudou de "um elemento
  raiz que é ou RouterLink ou div" para "uma div externa com fundo, contendo o RouterLink/div
  interno + o slot condicional" — sem slot (caso do Dashboard), o resultado visual e o DOM
  efetivo são equivalentes ao anterior, só com uma div a mais (inerte para `space-y-*`).

  `MyScales.vue`: os dois blocos "Próximas"/"Histórico" agora usam `ScaleCard`; `confirmar`/
  `recusar`/`motivoAbertoId`/`motivo`/`confirmingId`/`recusandoId` não foram tocados, só
  movidos para dentro do slot `actions` (só no bloco "Próximas", como já era — Histórico nunca
  teve ações). `detalheMinha(scale)` combina instrumento + função litúrgica (label já usado em
  `ScaleForm.vue`/`Show.vue`, duplicado aqui pela mesma razão que já era duplicado nos outros
  dois arquivos — não é uma inconsistência nova) + `scale.team?.nome` (dado que já aparecia na
  linha de metadados antes, sem lugar dedicado no `ScaleCard`, então entra no `detalhe`).
  Loading trocou o texto único "Carregando..." por `Skeleton` (`TASK-0031`). `npm run build`
  passou sem erros; `dist/` restaurado; `git status` confirmou que só `MyScales.vue` mudou entre
  páginas (além do `ScaleCard.vue` estendido, ainda não commitado). Teste de confirmar/recusar
  não executado em navegador (mesma limitação de ambiente já registrada); handlers verificados
  por leitura de código — comportamento idêntico, só o container visual mudou. Task marcada
  `concluida`. Próximo passo: `TASK-0049` (Listagens — padrão Servidores) já está elegível.
