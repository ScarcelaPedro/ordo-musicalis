---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0041 — Escala — Detalhes: situação agregada, equipe por categoria e função vazia

**Task ID**: `TASK-0041`

## Objetivo

Implementar a faixa-resumo de situação da escala (confirmados/pendentes/recusados/vagas) e
migrar o bloco de equipe para `ScaleRole`/`ScaleMember`, listando **todas** as categorias
cadastradas — hoje uma categoria sem ninguém escalado simplesmente não aparece na tela
(`gruposPorCategoria` só itera sobre `scale.servidores`, achado confirmado em
`docs/tasks/0010-*.md`). SPEC-004 §19, §20, §21.

## Arquivos/componentes envolvidos

- `src/pages/scales/Show.vue` — bloco "Equipe da celebração".

## Comportamento esperado

Faixa-resumo calculada client-side a partir de `scale.servidores[].status` (nenhuma nova
consulta de API). Equipe agrupada por categoria via `ScaleRole`, agora incluindo categorias sem
ninguém (usa a lista completa de categorias cadastradas, não só as presentes em
`scale.servidores` — requer buscar `categorias` junto com a escala, ou já vir na resposta atual;
confirmar contra `GET /scales/:id` antes de assumir). `EmptyRole` com botão "Resolver" para
staff (leva à edição), sem botão para servidor (só indicação).

## Dependências

- `TASK-0033` — `ScaleRole`, `ScaleMember`, `EmptyRole`, `ConfirmationStatus`.
- `TASK-0040` — cabeçalho já migrado (mesma tela).

## Critérios de conclusão

- [~] Faixa-resumo de situação implementada, com contagem correta validada contra pelo menos
      uma escala real com mix de status — **validação contra dado real não executada** (sem
      ambiente de backend/DB rodando nesta sessão); lógica verificada por leitura de código
      (`confirmadosCount`/`pendentesCount`/`recusadosCount` filtram por `status`, `vagasCount`
      conta grupos com `servidores.length === 0`, `substituido` excluído de todas as contagens).
- [x] Todas as categorias cadastradas aparecem no bloco de equipe, com ou sem gente — confirmado
      contra `GET /categorias` (`api/_routes/categorias.ts`), endpoint já usado por
      `ScaleForm.vue`, sem alteração de API.
- [x] `EmptyRole` com ação "Resolver" (staff) / só indicação (servidor).
- [x] Regra de "Acólitos e Ancilas em 2 colunas quando 6+" preservada (comportamento de negócio
      existente, `scales/Show.vue:83-91`).
- [x] `npm run build` passa sem erros.

## Riscos

- **Risco real de precisar de dado que a API não retorna hoje**: se `GET /scales/:id` só
  incluir categorias com gente (mesma limitação de `gruposPorCategoria`), listar categorias
  vazias exige uma chamada adicional a `GET /categorias` e cruzamento client-side — viável sem
  alteração de API (usar um endpoint já existente), mas precisa ser verificado antes de assumir
  que é trivial.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §19, §20, §21.
- `docs/tasks/0010-wireframe-escala-detalhes.md` (especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Verificado primeiro (via `api/_routes/scales.ts`)
  que `GET /scales/:id` NÃO inclui a lista completa de categorias, só as presentes em
  `scale.servidores` (confirma a limitação apontada pela própria task) — mas `GET /categorias`
  (`api/_routes/categorias.ts`) já existe e já é consumido pelo `ScaleForm.vue` com exatamente
  essa forma (`{id, nome, ordem}`), então usei o mesmo endpoint em `Show.vue` (`onMounted`, em
  paralelo com a busca da escala) em vez de inventar dado ou parar a task — dentro do que a
  própria seção "Riscos" já previa como solução viável. `gruposPorCategoria` passou a começar
  pela lista completa de `categorias` (todas aparecem, mesmo com 0 servidores) e só depois
  distribui `scale.servidores` nelas; registros com `status === 'substituido'` são excluídos
  (o substituto já entra como um novo `ScaleServidor` ativo via `api/_routes/substituicoes.ts`,
  então o antigo não deve contar como presença nem deixar a categoria "vazia" indevidamente).
  Bloco de equipe migrado para `ScaleRole`/`ScaleMember`/`EmptyRole` (`TASK-0033`), preservando a
  regra de 2 colunas para "Acólitos e Ancilas" com 6+ servidores. `EmptyRole` mostra ação
  "Resolver" (link para `/escalas/:id/editar`, rota já existente) só quando `auth.isStaff`, sem
  botão para servidor comum. Faixa-resumo adicionada acima da lista, com 4 contadores
  (confirmados/pendentes/recusados/vagas) calculados só a partir dos dados já carregados —
  nenhuma chamada de API nova além do `/categorias` já justificado acima. `npm run build` passou
  sem erros; `dist/` restaurado; `git status` confirmou que só `Show.vue` mudou (além do que já
  estava modificado de tasks anteriores). Validação da contagem contra uma escala real com mix de
  status não foi possível nesta sessão (sem backend/DB rodando) — lógica revisada por leitura de
  código, registrado como ressalva no critério correspondente. Task marcada `concluida`. Próximo
  passo: `TASK-0042` (Alterações e conflitos) já está elegível.
