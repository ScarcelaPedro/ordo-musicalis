---
status: concluida
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0037 — Calendário do Dashboard (estratégia mobile)

**Task ID**: `TASK-0037`

## Objetivo

Resolver o problema de mobile mais grave do sistema (SPEC-004 §17/§18): o calendário do
Dashboard hoje força `min-w-[560px]` (`Dashboard.vue:335`), obrigando rolagem horizontal em
qualquer celular. Implementar a decisão já tomada em `docs/tasks/0008-wireframes-dashboard.md`
(§31): calendário compacto (sem texto em célula) + lista detalhada abaixo, no mobile; grid
completo mantido no desktop.

## Arquivos/componentes envolvidos

- `src/pages/dashboard/Dashboard.vue` — remover `min-w-[560px]` e a lógica de grid fixo no
  mobile; integrar `Calendar.vue` (`TASK-0032`).

## Comportamento esperado

Desktop: grid mensal completo, como hoje. Mobile (`< 768px`): calendário compacto com
marcadores de dia (sem texto de evento na célula) + lista abaixo com data/horário/comunidade/
celebração/situação completos e legíveis (elimina o `text-[10px]` e o `hidden lg:inline` que
hoje escondem o celebrante no mobile). Cor litúrgica do dia mantida (`CORES_LITURGICAS_CLASSES`,
não alterada).

## Dependências

- `TASK-0032` — `Calendar.vue`.
- `TASK-0029` — tokens.

## Critérios de conclusão

- [x] `min-w-[560px]` removido; nenhuma dependência de scroll horizontal no mobile.
- [x] Calendário compacto implementado no mobile, com indicador visual de evento por dia (não
      texto).
- [x] Lista de eventos abaixo do calendário compacto, com informação completa e legível
      (nenhum texto abaixo de `Body Small`/14px para informação essencial).
- [x] Desktop mantém grid completo, sem regressão.
- [x] `npm run build` passa sem erros.
- [~] Testado manualmente em celular pequeno (ex. 360px), celular grande (ex. 414px), tablet e
      desktop (SPEC-004 §50) — **não executado**: mesma limitação já registrada nas
      TASK-0034/0035/0036 (sem ferramenta de automação de navegador neste ambiente). Verificado
      por leitura de código: `Calendar.vue` (já testado/validado na TASK-0032) só recebeu props
      de dados novas (`cellBackground`/`hasEvents`) e os dois slots (`day`/`list-item`); a lógica
      responsiva `hidden md:block`/`md:hidden` do componente não foi tocada.
- [x] Nenhuma chamada de API alterada — mesmos dados, nova apresentação.

## Riscos

- `Dashboard.vue` tem lógica de filtro por comunidade e navegação de mês acoplada ao grid atual
  — extrair isso para o `Calendar.vue` genérico sem quebrar o filtro exige atenção ao
  refatorar, não só trocar o template.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §16, §17, §18.
- `docs/tasks/0008-wireframes-dashboard.md` (decisão do calendário mobile, formato §31).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `Dashboard.vue`: `<Calendar>` (`TASK-0032`)
  substitui a grade acoplada com `min-w-[560px]`/`overflow-x-auto`, junto com toda a lógica
  duplicada que já existia em `Calendar.vue` (`calendarCells`, `isToday`/`isSunday`/`isSaturday`,
  `MONTH_NAMES`/`DAY_NAMES`, `prevMonth`/`nextMonth`) — removida do Dashboard, não duplicada.
  `celulaClass`/`dayKey` viraram `cellBackground(dateKey)`/`hasEvents(dateKey)`, recebendo a
  chave já pronta que o `Calendar` passa (mesmo formato `YYYY-MM-DD` de `scalesByDate`/
  `liturgiaByDate`, sem recomputar nada). Desktop: slot `#day` reproduz exatamente os chips de
  antes (horário + celebrante `hidden lg:inline`, `chipClass` por status/horário) — sem
  regressão visual. Mobile: slot `#list-item` mostra, por dia com evento, celebração + data
  completa por extenso + horário + comunidade + celebrante + `Badge` de status, tudo em
  `text-body-sm` (14px) — nada abaixo disso, resolvendo o `text-[10px]`/`hidden lg:inline` que
  escondiam o celebrante no mobile. Filtro de comunidade (não pertence ao `Calendar.vue`
  genérico) ficou numa barra própria acima do calendário, preservando o mesmo `v-model`/mesma
  chamada `/scales`. Legendas (turno/confirmada, cores litúrgicas) mantidas exatamente como
  estavam, fora do componente. Nenhuma chamada de API alterada. `npm run build` passou sem
  erros; `dist/` restaurado; `git status` confirmou que só `Dashboard.vue` mudou em `src/pages/`.
  Teste manual em larguras reais (360px/414px/tablet/desktop) **não executado** — mesma limitação
  de ambiente já registrada nas tasks anteriores da Fase 2; validado só por leitura de código.
  Task marcada `concluida`. Próximo passo: `TASK-0038` (Dashboard — visão servidor) já está
  elegível.
