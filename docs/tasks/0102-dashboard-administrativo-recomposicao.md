---
status: concluida
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0102 — Dashboard administrativo: recomposição na linguagem da referência

**Task ID**: `TASK-0102`

**Prioridade**: P1

## Objetivo

Recompor o Dashboard de staff (admin/coordenador — `auth.isStaff`) usando a referência como
direção de **proporção, densidade e hierarquia** (SPEC-003.1 §5, §7, §22, §27), com apenas dados
que o sistema realmente possui.

Blocos da referência → decisão com base no que existe hoje:

| Referência | Situação | Ação |
|---|---|---|
| Próxima missa (card destaque, status "Escala confirmada") | dado existe (`upcomingCelebrations[0]`, `status`, `comunidade`, `celebrante`) | implementar como card principal |
| Próximas celebrações (lista lateral) | existe (`upcomingCelebrations`) | lista compacta, "Ver todas" → `/escalas` |
| Calendário litúrgico | existe | integrar o componente da `TASK-0101`, sem dominar a tela |
| Cobertura dos ministérios | parcial (ver `TASK-0103`) | espaço reservado no layout, componente na `TASK-0103` |
| Avisos recentes / "Comunicação importante" | **não existe** módulo de comunicações | **não implementar** (§5) |
| — (não está na referência) | Pendências de confirmação, situação do mês (total/confirmadas/rascunhos) | manter, reestilizados (§7 "pendências", "situação das escalas") |

## Comportamento esperado

- Hierarquia (§22): contexto (saudação, `TASK-0099`) → informação principal (próxima
  celebração) → ação principal (Nova Escala) → secundárias (próximas celebrações, pendências,
  situação, cobertura) → calendário e auxiliares.
- Desktop: layout em 2 colunas inspirado na referência (principal à esquerda, lista/indicadores
  à direita). Tablet: adaptado. Mobile: coluna única **reordenada por prioridade**, não o desktop
  espremido (§28).
- Card de destaque sem ícone musical; símbolo litúrgico (cruz) discreto é permitido (§20).
- Nenhuma nova chamada de API além das já feitas (`/scales`, `/scales/pendentes`,
  `/comunidades`, `/liturgia`).
- O Dashboard do servidor (`!auth.isStaff`) não é tocado por esta task (`TASK-0104`).

## Dependências

- `TASK-0097` — tokens/linguagem visual.
- `TASK-0101` — calendário litúrgico reestilizado.

## Critérios de conclusão

- [x] Card "Próxima celebração" com data, horário, celebração, local, celebrante e status via
      `Badge` (não cor litúrgica).
- [x] Lista de próximas celebrações com link para a escala.
- [x] Pendências e situação do mês preservadas.
- [x] Nenhum bloco sem dado real (sem avisos/comunicações fictícios, sem placeholders
      prometendo recurso inexistente).
- [x] Layout validado em mobile, tablet e desktop; claro e escuro.
- [x] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §5, §7, §21, §22, §27, §28.
- `docs/tasks/0039-dashboard-coordenador.md` (lacunas de dado já registradas: funções sem
  servidor, conflitos).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `5d7b615`.

  **Layout**: grid `lg:grid-cols-3`. À esquerda (`col-span-2`) ficam o card "Próxima celebração"
  e, abaixo, o calendário litúrgico da `TASK-0101`. À direita (`row-span-2`) ficam Próximas
  celebrações ("Ver todas" → `/escalas`), Pendências de confirmação (com contagem) e Situação das
  escalas (Celebrações/Confirmadas/Rascunhos, rotulada com o mês exibido no calendário, porque é
  desse mês que os números vêm). A ordem do DOM é a ordem de prioridade do mobile: próxima →
  próximas → pendências → situação → calendário. Conferido no DOM a 375px.

  **Card de destaque**: eyebrow `accent` "Próxima celebração", cruz discreta (§20), título
  "Domingo, 27 de setembro · 10:00 — Missa Solene", local, celebrante, "N servidores · M
  confirmados" (contado de `scale.servidores`, dado real, sem ícone musical) e status via
  `Badge` ("Escala confirmada"/"Escala em rascunho"). O card inteiro leva à escala.

  **Correções de dado (sem mudar API)**: (1) as próximas celebrações dependiam das escalas do
  **mês navegado no calendário**, então avançar o calendário trocava a "próxima celebração".
  Agora há uma fonte própria (`GET /scales?mes=` do mês corrente + seguinte, mesmo endpoint e
  parâmetro já usados), mesmo raciocínio da `TASK-0088`. (2) "Hoje" era calculado com
  `toISOString()` (UTC): depois das 21h no Brasil, as celebrações da noite sumiam. A função pura
  `selectUpcoming` em `src/utils/upcoming.ts` usa data/hora locais (4 testes novos, 16 no total).
  Os cards de estatística ganharam variante dark (achado da `TASK-0101`).

  **Não implementado, por falta de dado real** (§5): avisos/comunicações, funções sem servidor e
  conflitos (Riscos da `TASK-0039`). Cobertura por ministério fica com a `TASK-0103`. As ações de
  staff do header (Substituições/Relatórios/Nova Escala) seguem como estavam; o reestilo é da
  `TASK-0099`.

  **Verificação** (seed temporário): admin a 1280px claro e escuro e a 375px (ordem por
  prioridade, sem scroll horizontal). Servidora a 375px sem nenhum bloco de staff. `npm run
  build` e `npm test` passam; `dist/` revertido.

  **Pendente para outras tasks**: `myNextScales` (dashboard do servidor) também usa
  `toISOString()` (UTC). Deve passar a usar `selectUpcoming` na `TASK-0104`. No mobile, os cards
  do Dashboard encostam nas bordas da tela porque `main` não tem padding abaixo de `sm`
  (pré-existente); registrar na validação `TASK-0107`.
