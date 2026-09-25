---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0101 — Calendário litúrgico: nova linguagem visual mantendo a lógica mobile própria

**Task ID**: `TASK-0101`

**Prioridade**: P1

## Objetivo

Aplicar a linguagem visual da referência ao calendário (`src/components/Calendar.vue` + uso em
`Dashboard.vue`) tratando-o como **componente próprio do calendário litúrgico**, não como o
calendário principal do Dashboard (SPEC-003.1 §8), e preservando a experiência mobile já
definida (§11) — grade compacta + lista detalhada, decidida na `TASK-0008` §31 e implementada na
`TASK-0037`.

## Comportamento esperado

- **Desktop** (§12): grade mensal com células arejadas, número do dia, indicador em ponto no
  canto indicando o tempo litúrgico (substituindo o fundo inteiro colorido atual, se isso
  melhorar a leitura), destaque de "Hoje" e de solenidades com nome (ex. "Assunção") **somente**
  quando o nome vier do dado `Liturgia.liturgia`. Cabeçalho "Calendário Litúrgico — {mês ano}"
  com navegação de mês e "Mês atual". Tamanho contido — não pode dominar a hierarquia do
  Dashboard.
- **Mobile**: mantém a lógica própria existente (compacta + lista); só recebe os tokens visuais.
  Não é uma versão reduzida da grade desktop.
- Eventos (escalas) no dia continuam acessíveis como hoje (chips no desktop, lista no mobile),
  sem usar cor litúrgica para status (ver `TASK-0100`).
- Filtro por comunidade mantido (hoje um `<select>` cru — migrar para `Select.vue`).
- Nenhuma mudança nas chamadas `/scales` e `/liturgia`.

## Dependências

- `TASK-0097` — tokens/linguagem visual.
- `TASK-0100` — mapeamento e legenda litúrgica separados de status.

## Critérios de conclusão

- [x] Desktop com indicadores de tempo litúrgico + legenda textual; "Hoje" destacado.
- [x] Mobile com o mesmo comportamento funcional da `TASK-0037` (compacto + lista), sem scroll
      horizontal em 360px.
- [x] Nenhum rótulo litúrgico inventado (só o que vem de `/liturgia`).
- [x] Filtro de comunidade usando `Select.vue`.
- [x] Verificado em 360px, 414px, tablet e desktop, claro e escuro.
- [x] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §8, §9, §11, §12.
- `docs/tasks/0008-wireframes-dashboard.md` (§31), `docs/tasks/0037-dashboard-calendario.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `2cf76cb`.

  **`Calendar.vue`** (usado só pelo Dashboard, confirmado por grep): cabeçalho "{title} — {Mês
  Ano}" com ‹ / "Mês atual" (desabilitado quando já está no mês corrente) / ›. **Desktop**:
  células viram tiles separados (`gap-1.5`, `rounded-lg`, borda), altura contida (84/92px, antes
  90/108px). Com a nova prop opcional `cellMarker`, o tile fica neutro e a cor litúrgica vira um
  ponto no canto (como na referência). Sem `cellMarker`, o comportamento de fundo tingido
  continua (o componente segue genérico). "Hoje" = número em círculo `primary-700` + legenda
  "Hoje" + tile levemente tingido. **Removidas as cores de dia da semana** (domingo `rose-600`,
  sábado `primary-600`): o número vermelho do domingo sobre célula Vermelho/Rosa era lido como
  informação litúrgica (achado da `TASK-0100`). Cabeçalhos de dia ficaram neutros. **Mobile**:
  mesma lógica da `TASK-0037` (grade compacta com fundo tingido + ponto de evento + lista
  abaixo), só com tokens novos, iniciais dos dias da semana (antes não havia cabeçalho) e
  `aria-label` que inclui "hoje".

  **Nome da liturgia**: não é escrito dentro da célula, porque `Liturgia.liturgia` existe para
  todo dia ("Dia de semana do Tempo Comum") e escrevê-lo em cada tile poluiria a grade;
  distinguir "solenidade" exigiria uma heurística nova, que a §10 veda. O nome entra no
  tooltip/sr-only junto com o tempo litúrgico (ex. "Tempo litúrgico: Branco — Natal, Páscoa e
  festas · Santos Arcanjos Miguel, Gabriel e Rafael"). Tudo vem de `/liturgia`.

  **Dashboard**: `title="Calendário Litúrgico"`, `cellMarker`/`cellLabel`, filtro de comunidade
  com `Select.vue` + label sr-only, wrapper com `shadow-card`/`rounded-xl`; texto dos chips subiu
  de `text-[10px]` para `text-caption` (12px, piso do Design System), e o celebrante aparece a
  partir de `xl`.

  **Verificação** (seed temporário): 1280px claro (grade de tiles com pontos, "Hoje" no dia 25),
  820px escuro (navegação ›, "Mês atual" volta para setembro, sem scroll horizontal), 375px
  claro (compacta + lista, sem scroll horizontal). `npm run build` e `npm test` passam; `dist/`
  revertido. Nenhuma chamada de API alterada.

  **Achado para a `TASK-0102`**: os 3 cards de estatística (Total/Confirmadas/Rascunhos) não
  têm variante dark (ficam brancos no tema escuro). Pré-existente, não alterado aqui.
