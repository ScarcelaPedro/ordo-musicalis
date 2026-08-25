---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0045 — Criar/Editar Escala: representação de conflitos

**Task ID**: `TASK-0045`

## Objetivo

Integrar `ConflictAlert` (`TASK-0033`) ao `ScaleForm.vue`, para os casos em que a detecção de
conflito existir (SPEC-004 §22), deixando explicitamente registrado que a **lógica de detecção
em si não existe hoje em nenhum endpoint** (indisponibilidade, dupla escalação) — achado já
confirmado em `docs/tasks/0009-*.md`. "Função incompatível" já é prevenida estruturalmente pelo
filtro de categoria (`TASK-0044`), sem necessidade de alerta ativo.

## Arquivos/componentes envolvidos

- `src/pages/scales/ScaleForm.vue` — bloco de equipe (Etapa 2), junto a cada `ScaleMember`.

## Comportamento esperado

`ConflictAlert` é renderizado condicionalmente **apenas se o dado de conflito existir** na
resposta da busca/sugestão. Como isso não existe hoje, esta task **não implementa a detecção**
— implementa só o encaixe visual do componente, pronto para quando a detecção existir.

## Dependências

- `TASK-0033` — `ConflictAlert`.
- `TASK-0044` — Etapa 2 já implementada (mesma tela, mesmos pontos de inserção).

## Critérios de conclusão

- [x] `ConflictAlert` integrado ao template do `ScaleForm`, condicionado a um campo de dado
      (mesmo que hoje sempre `null`/ausente).
- [x] **Problema registrado formalmente** (não implementado silenciosamente): detecção de
      conflito de horário/indisponibilidade exige nova lógica de backend, fora do escopo desta
      etapa (SPEC-004 §43) — registrar no relatório final (`TASK-0056`).
- [x] `npm run build` passa sem erros.
- [x] Nenhuma lógica de comparação de datas/horários entre escalas escrita no frontend desta
      task (isso seria inventar a regra de negócio no lugar errado).

## Riscos

- Esta task tem resultado majoritariamente **documental/estrutural** (o componente fica pronto,
  sem dado real para mostrar) — é um resultado esperado e correto, não uma falha, dado que a
  SPEC-004 §43/§61 pede exatamente isso: parar e registrar em vez de improvisar.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §22, §43, §44, §61.
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (tabela de conflitos, seção "Representação
  de conflitos").

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Confirmado por leitura de código
  (`api/_lib/suggestServidores.ts`) que a indisponibilidade já é usada internamente para
  **excluir** alguém da sugestão (linha 59: `if (disponibilidade && !disponibilidade.disponivel)
  continue`) — mas isso nunca é exposto ao frontend como motivo; quem está indisponível
  simplesmente não aparece, sem alerta. Confirma exatamente o achado já registrado na
  `TASK-0009`/`TASK-0042`: nenhum endpoint retorna um campo de conflito. `ScaleServidor` (tipo
  local do `ScaleForm`) ganhou um campo opcional `conflito` só para o `ConflictAlert` ter onde
  ler — nunca preenchido por nenhum código deste componente, nenhuma lógica de comparação de
  data/horário escrita. `ConflictAlert` integrado junto a cada pessoa já escalada (dentro do
  loop `entriesDaCategoria`), condicionado a `entry.conflito` — como esse campo nunca existe na
  prática, o alerta fica sempre invisível hoje, pronto para quando a detecção de backend existir.
  Ponto de inserção único e deliberado (só nas linhas já adicionadas, não também nos resultados
  de busca/sugestão) para manter o escopo contido, coerente com o caráter majoritariamente
  documental já previsto na seção "Riscos" desta task. `npm run build` passou sem erros; `dist/`
  restaurado; `git status` confirmou que só `ScaleForm.vue` mudou entre páginas. Task marcada
  `concluida`. Próximo passo: `TASK-0046` (Etapa 3 — Validação) já está elegível — a Fase 5
  (Criar/Editar Escala) ainda tem `TASK-0046`/`0047` pela frente.
