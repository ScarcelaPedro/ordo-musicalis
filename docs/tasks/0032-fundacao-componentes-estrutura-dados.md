---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0032 — Fundação: componentes base — estrutura e dados

**Task ID**: `TASK-0032`

## Objetivo

Implementar os componentes de estrutura e apresentação de dados especificados em
`docs/tasks/0023-componentes-estrutura-dados.md`: `Card`, `Calendar` (consolidando as duas
implementações quase idênticas hoje em `Dashboard.vue` e `public/Calendar.vue`), `Avatar`,
`Tabs` (generaliza o padrão pill-toggle já usado em `reports/Index.vue`), `Dropdown`,
`Breadcrumb`. `Table`/`Pagination` ficam especificados só na aparência-alvo (ordenação/seleção),
sem ativar essas capacidades em nenhuma listagem agora (nova funcionalidade, fora do escopo —
SPEC-004 §62 "criar funcionalidades novas").

## Arquivos/componentes envolvidos

- `src/components/Card.vue`, `Avatar.vue`, `Tabs.vue`, `Dropdown.vue`, `Breadcrumb.vue`,
  `Calendar.vue` — criar.
- `src/pages/dashboard/Dashboard.vue`, `src/pages/public/Calendar.vue` — **não alterar
  nesta task** (a extração do `Calendar.vue` reutilizável é feita aqui; a migração das duas
  telas para consumi-lo acontece nas tasks de tela, `TASK-0038` e futura, para manter o escopo
  desta task restrito a componentes).

## Comportamento esperado

`Calendar.vue` recebe os eventos/mês/ano por prop e emite navegação de mês e seleção de dia,
sem acoplamento a nenhuma tela específica — deve conseguir substituir a lógica hoje duplicada em
`Dashboard.vue` (`calendarCells`/`prevMonth`/`nextMonth`) e em `public/Calendar.vue`. `Avatar`
usa iniciais + cor de fundo neutra fixa (não variável por pessoa). `Tabs` reproduz visualmente o
padrão já usado em `reports/Index.vue`. `Dropdown` abre ao clicar, fecha ao clicar fora ou
selecionar uma opção.

## Dependências

- `TASK-0029` — tokens.
- `TASK-0031` — `Drawer` (o "Mais" das listagens no mobile pode usar `Dropdown` ou uma variação
  do `Drawer`, decisão fina de implementação já registrada em `docs/tasks/0023-*.md`).

## Critérios de conclusão

- [x] `Card.vue` com Elevation 1 (`surface`) por padrão, prop para variante `bordered`
      (Elevation 0, sem sombra).
- [x] `Calendar.vue` extraído — ver correção importante abaixo sobre o real escopo da
      duplicação.
- [x] `Avatar.vue` com iniciais extraídas do nome (2 letras) e cor neutra fixa.
- [x] `Tabs.vue` com pelo menos 2 abas suportadas, indicando aba ativa por mais de um sinal.
- [x] `Dropdown.vue` com fechamento ao clicar fora (listener de clique global com cleanup no
      `onUnmounted`).
- [x] `Breadcrumb.vue` com último item sem link (página atual).
- [x] `npm run build` passa sem erros.
- [x] Nenhuma tela existente quebrou — `Dashboard.vue`/`public/Calendar.vue` não foram tocadas
      (confirmado via `git status`).

## Correção importante encontrada durante a implementação

Ao ler `public/Calendar.vue` por completo para desenhar o `Calendar.vue`, descobri que o achado
"duas implementações quase idênticas de calendário" (da auditoria, repetido em
`docs/tasks/0023-*.md` e no objetivo original desta task) **está errado**: `public/Calendar.vue`
não tem grade nenhuma — é uma lista por mês (navegação + lista de celebrações), sem
`calendarCells` nem células de dia. A única duplicação real entre as duas telas é a navegação de
mês (`prevMonth`/`nextMonth`/`MONTH_NAMES`), não uma grade completa.

Isso muda o que `Calendar.vue` precisa fazer: extraí a grade completa (com o comportamento
mobile compacto + lista já decidido na `TASK-0008`) baseada fielmente na lógica real de
`Dashboard.vue` — é a única tela que tem o problema de largura que esse componente resolve.
`public/Calendar.vue` **não precisa adotar `Calendar.vue`** — já é lista, já não tem o problema
de scroll horizontal, sempre foi mobile-friendly nesse aspecto. Não criei nenhuma task nova para
"migrar" `public/Calendar.vue` para uma grade que ele nunca teve e não precisa.

## Decisão de design: `Calendar.vue` genérico via slots

Para não acoplar o componente base a "escala" (SPEC-004 §46/§47 — Calendar é componente base,
não de domínio), eventos/cor de fundo por dia entram via props de função
(`cellBackground`, `hasEvents`) e dois slots com escopo (`day` para o conteúdo da célula
desktop, `list-item` para a lista mobile) — quem consome (`TASK-0038`, Dashboard) decide o que
renderizar (chips de escala, cor litúrgica), sem o componente base precisar conhecer o formato
de uma `Scale`.

## Riscos

- Consolidar duas implementações de calendário em uma só pode expor pequenas diferenças de
  comportamento hoje não documentadas entre `Dashboard.vue` e `public/Calendar.vue` (ex. uma
  delas pode tratar fuso horário ou primeiro dia da semana de forma sutilmente diferente) —
  testar as duas telas lado a lado antes de considerar a consolidação concluída.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §8.
- `docs/tasks/0023-componentes-estrutura-dados.md` (especificação completa).
- [`docs/design-system.md`](../design-system.md) — seção 7.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. **Correção importante**: o achado "duas
  implementações quase idênticas de calendário" (herdado da auditoria, repetido em várias tasks
  anteriores) estava errado — `public/Calendar.vue` é lista, não grade. Corrigido nesta task
  antes de desenhar `Calendar.vue`, evitando construir um componente para resolver um problema
  que uma das duas telas nunca teve. `Calendar.vue` extraído fielmente da lógica real de
  `Dashboard.vue` (`calendarCells`/`prevMonth`/`nextMonth`/`isToday`/`isSunday`/`isSaturday`),
  mantido genérico via slots (`day`, `list-item`) e props de função
  (`cellBackground`/`hasEvents`) para não acoplar a "escala". Criados também `Card`, `Avatar`,
  `Tabs`, `Dropdown`, `Breadcrumb`. `npm run build` validado com sucesso de primeira. Nenhuma
  tela tocada. Task marcada `concluida`. Próximo passo: TASK-0033 (componentes de domínio da
  Escala) já está elegível.
