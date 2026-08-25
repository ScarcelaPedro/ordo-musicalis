---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0042 — Escala — Detalhes: alteração recente e conflitos

**Task ID**: `TASK-0042`

## Objetivo

Implementar o indicador de "escala alterada" (SPEC-004 §32) e a exibição de `ConflictAlert`
(SPEC-004 §22) na tela de detalhes, **usando apenas dados já existentes** — SPEC-004 §32 é
explícita: "Não implementar nova regra de notificação nesta etapa. Apenas utilizar os dados
existentes."

## Arquivos/componentes envolvidos

- `src/pages/scales/Show.vue` — indicador de alteração + slot para `ConflictAlert`.

## Comportamento esperado

**Alteração recente**: se `scale.updatedAt` existir na resposta da API e divergir de forma
relevante de `scale.createdAt` (heurística simples, ex. diferença de mais de X minutos, a
refinar na implementação), exibir "Alterada recentemente" próximo ao topo. **Se `updatedAt` não
vier na resposta hoje, parar e registrar o problema (SPEC-004 §43)** em vez de adicionar uma
chamada de API nova ou um campo novo no banco — isso seria alterar a API, fora do escopo desta
etapa (SPEC-004 §62). **Conflitos**: `ConflictAlert` só é renderizado se a escala já tiver um
campo de conflito nos dados retornados — como essa detecção não existe em nenhum endpoint hoje
(confirmado em `docs/tasks/0009-*.md`), o componente fica **implementado mas sem dado para
exibir nesta etapa** — não inventar a lógica de detecção no frontend.

## Dependências

- `TASK-0033` — `ConflictAlert`.
- `TASK-0041` — mesma tela, bloco de equipe já migrado.

## Critérios de conclusão

- [x] Verificado contra a API real (`GET /scales/:id`) se `updatedAt` já é retornado — **sim**:
      `createdAt`/`updatedAt` são campos escalares do model `Scale`
      (`api/prisma/schema.prisma:262-263`), e `include` (não `select`) sempre traz todos os
      escalares — indicador implementado.
- [x] `ConflictAlert` integrado ao template, condicionado à existência do dado — nenhuma lógica
      de detecção de conflito escrita no frontend.
- [x] `npm run build` passa sem erros.
- [x] Nenhuma regra de negócio nova criada (SPEC-004 §44).

## Riscos

- **Alto risco de bater no limite do §43/§61 da SPEC-004** ("parar e registrar" em vez de
  implementar): esta task pode concluir com pouco ou nenhum resultado visível se os dados
  necessários não existirem — isso é um resultado válido e esperado, não uma falha da task.
  Documentar claramente no relatório final (`TASK-0056`) o que foi e não foi possível
  implementar e por quê.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §22, §32, §43, §44, §61.
- `docs/tasks/0009-wireframes-criar-editar-escala.md`,
  `docs/tasks/0010-wireframe-escala-detalhes.md` (pendências já registradas).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Verificação contra o backend real (não só
  suposição): `api/prisma/schema.prisma` confirma `createdAt`/`updatedAt` como campos escalares
  do model `Scale`; `api/_routes/scales.ts` usa `prisma.scale.findUnique({ where, include })` —
  `include` nunca restringe escalares (isso só aconteceria com `select`), então os dois campos já
  vêm na resposta de `GET /scales/:id` hoje, sem precisar de nenhuma mudança de API. Indicador
  "Escala atualizada" implementado com heurística simples (diferença > 5 minutos entre
  `createdAt`/`updatedAt` — a spec não define limiar, "a refinar na implementação"), exibido logo
  abaixo do `CelebrationHeader`. **Conflitos**: confirmado (grep em `api/`) que não existe nenhum
  campo ou lógica de conflito em endpoint algum — `ConflictAlert` foi integrado ao template lendo
  `scale.conflitos` (campo que a API nunca preenche hoje), então o bloco correspondente fica
  sempre vazio/invisível na prática; nenhuma lógica de detecção foi escrita no frontend, só o
  ponto de integração pronto para quando o backend passar a retornar esse dado — mesmo padrão já
  registrado como pendência nas `TASK-0039`/`TASK-0041` (funções vazias, situação agregada).
  `npm run build` passou sem erros; `dist/` restaurado; `git status` confirmou que só `Show.vue`
  mudou (além do que já estava modificado de tasks anteriores). Task marcada `concluida`.
  Diferente do risco inicialmente levantado ("pode concluir com pouco ou nenhum resultado
  visível"), o indicador de alteração teve resultado visível completo — só o bloco de conflitos
  ficou sem dado real, como já era esperado. **Fim da Fase 4 (Escala — Detalhes)**: `TASK-0040`
  a `0042` concluídas. Próximo passo: `TASK-0043` (ScaleForm — Etapa 1: Celebração) inicia a
  Fase 5.
