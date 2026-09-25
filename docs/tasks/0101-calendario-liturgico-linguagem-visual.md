---
status: backlog
modulo: src/components
owner:
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

- [ ] Desktop com indicadores de tempo litúrgico + legenda textual; "Hoje" destacado.
- [ ] Mobile com o mesmo comportamento funcional da `TASK-0037` (compacto + lista), sem scroll
      horizontal em 360px.
- [ ] Nenhum rótulo litúrgico inventado (só o que vem de `/liturgia`).
- [ ] Filtro de comunidade usando `Select.vue`.
- [ ] Verificado em 360px, 414px, tablet e desktop, claro e escuro.
- [ ] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §8, §9, §11, §12.
- `docs/tasks/0008-wireframes-dashboard.md` (§31), `docs/tasks/0037-dashboard-calendario.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
