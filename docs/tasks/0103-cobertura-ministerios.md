---
status: concluida
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0103 — Cobertura dos Ministérios (Dashboard administrativo)

**Task ID**: `TASK-0103`

**Prioridade**: P2

## Objetivo

Implementar o componente "Cobertura dos Ministérios" da referência representando os
**ministérios/categorias reais** cadastrados (SPEC-003.1 §15, §16), suportando qualquer
quantidade de categorias.

## Discovery obrigatório (questão que a SPEC deixa aberta)

A referência mostra "12/16 escalados". O sistema tem o numerador (cada `ScaleServidor` traz
`categoriaId`/`team.categoria`, já retornado por `GET /scales`), mas **não tem denominador de
vagas esperadas** por celebração/categoria — lacuna já registrada na `TASK-0039`. Avaliar e
decidir, registrando em ADR:

- (a) **celebrações cobertas**: por categoria, "N de M celebrações do mês com ao menos 1
  servidor escalado" — calculável só com `/scales` + `/categorias`, sem mudar API;
- (b) **total de escalados** por categoria, sem fração/barra de progresso;
- (c) introduzir vagas esperadas por categoria — **exige mudança de modelo/API**, o que a
  §30 proíbe "apenas para reproduzir a referência": se for a única opção com valor real, parar
  e levar ao usuário (human gate), não implementar.

O rótulo precisa dizer exatamente o que é medido (ex. "8/10 celebrações com Leitor"), nunca
"escalados" se a métrica não for essa.

## Comportamento esperado

- Lista de categorias vinda de `/categorias` (respeitando `ativo` e `ordem`), nunca fixa em 4.
- Muitas categorias (§16): lista com scroll interno ou "mostrar mais", sem esticar o card nem
  deformar o Dashboard.
- Barra de progresso com texto numérico ao lado (não depender só da cor, §25); cor da barra de
  cobertura baseada em token semântico, **nunca** em cor litúrgica (§24).
- Escopo temporal coerente com o que o Dashboard já carrega (mês em exibição) e explícito no
  cabeçalho do card.
- Cálculo em função pura testável (ex. `src/utils/coverage.ts`).

## Dependências

- `TASK-0096` — Vitest.
- `TASK-0102` — layout do Dashboard administrativo onde o componente se encaixa.

## Critérios de conclusão

- [x] ADR com a métrica escolhida e alternativas descartadas.
- [x] Componente funciona com 1, 4 e 10+ categorias sem quebrar o layout.
- [x] Rótulos descrevem fielmente a métrica.
- [x] Testes unitários do cálculo (categoria sem escalados, escalado sem categoria mas com
      `team.categoria`, mês sem celebrações).
- [x] Visível só para staff.
- [x] Nenhuma mudança de API/banco (ou human gate registrado, se a opção (c) for a única viável).
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §15, §16, §24, §25, §30.
- `docs/tasks/0039-dashboard-coordenador.md` (Riscos — ausência de vagas esperadas).
- `src/pages/scales/Show.vue` — `gruposPorCategoria` (mesma regra de fallback
  `s.categoria ?? s.team?.categoria`).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `964f261`.

  **Discovery → decisão** ([`ADR-0005`](../decisions/0005-metrica-cobertura-ministerios.md)):
  confirmado que não há vagas esperadas por celebração no modelo. Métrica escolhida: opção (a),
  "celebrações do mês com ao menos um servidor ativo (`convidado`/`confirmado`) da categoria /
  total de celebrações do mês". A opção (c) exigiria mudança de modelo e API. Não foi preciso
  acionar o human gate, porque (a) responde à necessidade real sem isso; a ADR registra que (c)
  seria uma nova SPEC. Rótulo: "N/M celebrações"; subtítulo: "Celebrações com ao menos um
  servidor escalado · {Mês Ano}" (+ "comunidade filtrada" quando há filtro).

  **Implementação**: `src/utils/coverage.ts` (`computeCoverage`, `coveragePercent`), 5 testes
  (30 no total): ordem por `ordem`, categorias inativas ocultas, fallback pela categoria do
  team, `recusado`/`substituido` ignorados, mês sem celebrações. No Dashboard (só staff),
  `GET /categorias` + `GET /teams` (existentes) viram lookups; os números vêm de `scales` (mês e
  comunidade do calendário, já carregados). O card fica na coluna lateral entre Pendências e
  Situação das escalas. Barra `primary` com texto numérico, `role="progressbar"` e `aria-label`
  completo.

  **Verificação com N categorias**: o banco de teste tinha 7 categorias (5 do seed + 2 vindas de
  migrations). Adicionei mais 6 (Salmistas, Cerimoniários, Coroinhas, Cantores...), totalizando
  13, com rolagem interna ativa e card com altura estável (434px). Os casos de 1/4 categorias e
  do mês vazio estão cobertos pelos testes. 1280px claro e escuro. Ajuste de layout: o card do
  calendário ganhou `lg:self-start`, porque esticava até a altura da coluna lateral.
  `npm run build` e `npm test` passam; `dist/` revertido. Nenhuma alteração em `api/`.
