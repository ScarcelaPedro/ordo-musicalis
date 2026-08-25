---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0046 — Criar/Editar Escala: Etapa 3 (validação)

**Task ID**: `TASK-0046`

## Objetivo

Implementar a Etapa 3 (Validação) do `ScaleForm.vue`: checklist consolidado de campos
obrigatórios, categorias vazias e conflitos (quando existirem), antes de avançar para a revisão
final (SPEC-004 §28).

## Arquivos/componentes envolvidos

- `src/pages/scales/ScaleForm.vue` — nova seção/etapa de validação.

## Comportamento esperado

Checklist agrupado: "Obrigatórios" (bloqueante — impede avançar se data/horário/celebração/
comunidade estiverem vazios), "Categorias vazias" (informativo, usa `EmptyRole` já existente da
Etapa 2, não bloqueia — pode ser intencional), "Conflitos" (só aparece se
`TASK-0045` tiver dado real para mostrar; hoje, na prática, fica vazio). Cada item da lista, com
link/âncora para o bloco correspondente na Etapa 2.

## Dependências

- `TASK-0044` — Etapa 2 implementada.
- `TASK-0045` — `ConflictAlert` integrado.

## Critérios de conclusão

- [x] Validação bloqueante de campos obrigatórios (mesmos campos já obrigatórios hoje — não
      adicionar nem remover nenhum).
- [x] Lista de categorias vazias exibida, sem bloquear avanço.
- [x] Navegação de volta à Etapa 2 a partir de um item específico da validação.
- [x] `npm run build` passa sem erros.
- [~] Testado com uma escala com campos faltando (deve bloquear) e uma completa (deve avançar) —
      **não executado em navegador** (mesma limitação de ambiente já registrada); verificado por
      leitura de código: `avancar()` bloqueia em `etapaAtual === 3` quando
      `obrigatoriosFaltando.value.length` é maior que zero, e o botão "Avançar" fica `disabled`
      no mesmo caso — dupla proteção (clique e submit por Enter).

## Riscos

- Baixo — é lógica de validação sobre dados já existentes no `form`, sem novo estado externo.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §28.
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (Etapa 3, especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Substituída a "ponte mínima" honesta que a
  `TASK-0043` tinha deixado na Etapa 3 (`docs/decisions/0002-*.md`) pelo checklist real. Três
  blocos: "Obrigatórios" (`obrigatoriosFaltando`, os mesmos 4 campos já obrigatórios desde a
  Etapa 1 — nenhum campo novo criado; bloqueante, com dupla proteção — `avancar()` recusa
  avançar e o botão "Avançar" fica `disabled`); "Categorias vazias" (`categoriasVazias`,
  reaproveita `entriesDaCategoria` já existente da Etapa 2, mostrado via `EmptyRole`, TASK-0033
  — informativo, não bloqueia); "Conflitos" (`conflitosResumo`, lê `entry.conflito`, TASK-0045 —
  só aparece se algum dia existir dado real; hoje sempre vazio). Cada item da lista tem
  navegação de volta ao ponto exato: adicionei `id`s âncora nos 4 campos obrigatórios da Etapa 1
  (`campo-dataCelebracao` etc.) e em cada bloco de categoria da Etapa 2 (`categoria-{id}`); a
  função `irPara(etapa, anchorId)` troca `etapaAtual` e faz `scrollIntoView` suave no `nextTick`
  seguinte — clicar num item da validação leva direto ao campo/categoria correspondente, não só
  troca de etapa genericamente. `npm run build` passou sem erros; `dist/` restaurado; `git
  status` confirmou que só `ScaleForm.vue` mudou entre páginas. Teste com escala incompleta/
  completa não executado em navegador (mesma limitação de ambiente já registrada); validado por
  leitura de código da condição de bloqueio. Task marcada `concluida`. Próximo passo:
  `TASK-0047` (Etapa 4 — Revisão) já está elegível — última task da Fase 5.
