---
status: concluida
modulo: src/pages/scales
criado-em: 2026-08-24
owner: Pedro Scarcela
---

# 0040 — Escala — Detalhes: cabeçalho e celebrante em destaque

**Task ID**: `TASK-0040`

## Objetivo

Implementar o `CelebrationHeader` (`TASK-0033`) na tela de detalhes da escala, dando destaque
visual ao celebrante — hoje no mesmo `<dl>` plano com o mesmo peso de qualquer outro metadado
(`scales/Show.vue:151-158`), apesar de ser requisito de negócio documentado (SPEC-004 §19).

## Arquivos/componentes envolvidos

- `src/pages/scales/Show.vue` — substituir o bloco `<dl>` de dados (Data/Horário/Status/
  Comunidade/Celebrante/Ministério/Observações) pelo `CelebrationHeader`.

## Comportamento esperado

Título (celebração) + subtítulo (data/horário/comunidade) + bloco de celebrante separado, com
`Avatar` (iniciais) + nome em destaque tipográfico. Ministério responsável e observações
migram para "informações secundárias" (rebaixadas visualmente, seção mais abaixo na página —
ver `TASK-0041`). Nenhum dado novo — os mesmos campos de `scale.*` já retornados pela API.

## Dependências

- `TASK-0033` — `CelebrationHeader`.

## Critérios de conclusão

- [x] Celebrante exibido em bloco visualmente destacado, distinto dos demais metadados.
- [x] Nenhum campo existente (data, horário, comunidade, status, ministério, observações)
      removido — todos continuam presentes, só reorganizados por hierarquia.
- [x] `npm run build` passa sem erros.
- [~] Testado com uma escala que tem celebrante e uma sem — **não executado em navegador**
      (mesma limitação de ambiente já registrada nas tasks anteriores); verificado por leitura de
      código: `CelebrationHeader` já tem `v-if="celebrante"` interno (preserva exatamente o
      comportamento condicional que `scale.celebrante` tinha no `<dl>` antigo).

## Riscos

- Baixo — mudança isolada de apresentação num bloco bem delimitado da tela.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §19.
- `docs/tasks/0010-wireframe-escala-detalhes.md`, `docs/tasks/0025-componentes-dominio-escala.md`.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `scales/Show.vue`: o `<dl>` plano de 7 campos
  (Data/Horário/Status/Comunidade/Celebrante/Ministério/Observações) virou `CelebrationHeader`
  (título + subtítulo com data/horário/comunidade + bloco de celebrante com `Avatar` e destaque
  `accent`) seguido de um `<dl>` secundário, menor e rebaixado (`text-body-sm`, sem `Card`
  próprio, só um `border-t` separando do header), com Status/Ministério/Observações — os únicos
  3 campos que o `CelebrationHeader` não cobre. Data/Horário/Comunidade não desapareceram: agora
  vivem no subtítulo do próprio header, não removidos, só consolidados. Nenhum dado novo — os
  mesmos campos de `scale.*` já retornados pela API. `npm run build` passou sem erros; `dist/`
  restaurado; `git status` confirmou que só `Show.vue` mudou (além do que já estava modificado
  de tasks anteriores). Teste com escala com/sem celebrante não executado em navegador (mesma
  limitação de ambiente já registrada); confirmado por leitura de código que
  `CelebrationHeader` preserva o mesmo `v-if` condicional que existia antes. Task marcada
  `concluida`. Próximo passo: `TASK-0041` (Situação da equipe) já está elegível.
