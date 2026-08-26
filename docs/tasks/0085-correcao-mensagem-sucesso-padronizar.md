---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0085 — Correção: padronizar a mensagem de sucesso entre Criar e Editar

**Task ID**: `TASK-0085`

**Prioridade**: P3

## Descrição

Uniformizar a fórmula das mensagens de sucesso de `flash` entre as telas de criação e edição dos
mesmos cadastros.

## Problema

Confirmado por comparação direta de código na `TASK-0066`: em 5 dos 6 pares Criar/Editar
(celebrantes, categorias, comunidades, teams, scaleTemplates — todos exceto escalas, que usa
texto próprio via `ScaleForm`), o `Create.vue` sempre usa "X criado(a) **com sucesso**!" e o
`Edit.vue` correspondente sempre usa só "X atualizado(a)!", sem o "com sucesso". Padrão
sistemático (5/6), não um caso isolado.

## Impacto

Muito baixo — ambas as mensagens comunicam sucesso claramente, não confunde o usuário. É uma
inconsistência perceptível só para quem usa os dois fluxos em sequência.

## Tela

`/celebrantes/{criar,:id/editar}`, `/categorias/{criar,:id/editar}`,
`/comunidades/{criar,:id/editar}`, `/equipes/{criar,:id/editar}`,
`/escalas-recorrentes/{criar,:id/editar}`.

## Componente

`src/pages/{celebrantes,categorias,comunidades,teams,scaleTemplates}/Edit.vue` (os 5 arquivos
com a mensagem sem "com sucesso").

## Comportamento atual

`flash.set('success', 'Celebrante atualizado!')` (e equivalentes nos outros 4 arquivos).

## Comportamento esperado

`flash.set('success', 'Celebrante atualizado com sucesso!')` (e equivalentes), alinhando com a
fórmula já usada em todos os 6 arquivos de `Create.vue`.

## Critérios de aceite

- [x] Os 5 arquivos de `Edit.vue` identificados usando a mesma fórmula "com sucesso" já usada em
      `Create.vue`.
- [x] Nenhuma outra mudança de comportamento.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0066-ux-densidade-consistencia-linguagem.md` — achado original, com linhas exatas
  de cada par.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §46, §55 (regra de decisão: inconsistência →
  corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0066`.
- 2026-08-26 — Task reivindicada e corrigida. `grep` por `flash.set('success'` em todo
  `src/pages` confirmou exatamente os 5 arquivos listados no texto da task (`celebrantes`,
  `categorias`, `comunidades`, `teams`, `scaleTemplates` — todos `Edit.vue`) e confirmou também
  a premissa da task: `servidores/Edit.vue` (o 6º par, fora do escopo) já usa "com sucesso" —
  é o "1 de 6" que já estava certo — e `scales/Edit.vue` usa texto próprio via `ScaleForm`,
  explicitamente excluído. Mudança idêntica nos 5: `'X atualizado(a)!'` →
  `'X atualizado(a) com sucesso!'`, sem tocar em mais nada em cada arquivo.

  `npm run build` passou sem erros (~2min15s desta vez — bem mais lento que o normal, sem
  relação com o tamanho da mudança, provavelmente carga do sistema); `dist/` revertido.

  **Testado com dado real e navegação real, os 5 domínios, ciclo completo criar → editar →
  salvar** (não só leitura de código): para cada um dos 5, criei um registro real pela UI,
  fui pra edição dele, salvei sem alterar nada, e capturei o texto exato do toast exibido.
  Resultado, os 5 confirmados com a fórmula "com sucesso": "Celebrante atualizado com
  sucesso!", "Comunidade atualizada com sucesso!", "Categoria atualizada com sucesso!",
  "Ministério atualizado com sucesso!", "Recorrência atualizada com sucesso!".

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido (nenhum
  seed temporário precisou ser criado — os registros de teste foram criados pela própria UI
  durante o teste, sem tocar o banco diretamente). Task marcada `concluida`. Próximo passo:
  `TASK-0086` (P3, seguinte na fila por número).
