---
status: backlog
modulo: src/pages/dashboard
owner:
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

- [ ] ADR com a métrica escolhida e alternativas descartadas.
- [ ] Componente funciona com 1, 4 e 10+ categorias sem quebrar o layout.
- [ ] Rótulos descrevem fielmente a métrica.
- [ ] Testes unitários do cálculo (categoria sem escalados, escalado sem categoria mas com
      `team.categoria`, mês sem celebrações).
- [ ] Visível só para staff.
- [ ] Nenhuma mudança de API/banco (ou human gate registrado, se a opção (c) for a única viável).
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §15, §16, §24, §25, §30.
- `docs/tasks/0039-dashboard-coordenador.md` (Riscos — ausência de vagas esperadas).
- `src/pages/scales/Show.vue` — `gruposPorCategoria` (mesma regra de fallback
  `s.categoria ?? s.team?.categoria`).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
