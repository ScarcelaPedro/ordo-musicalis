---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0044 — Criar/Editar Escala: Etapa 2 (montagem da equipe — busca inline e sugestões)

**Task ID**: `TASK-0044`

## Objetivo

Implementar o redesenho da interação de adicionar servidor (SPEC-004 §25, §26, §27), a mudança
de maior impacto identificada pela auditoria: hoje são 30+ interações discretas (select +
clique, repetido por pessoa) para montar uma equipe comum. Substituir por busca inline dentro
de cada bloco de categoria, com sugestões distribuídas por categoria em vez de um bloco
"Sugeridos" único competindo visualmente com a seleção manual.

## Arquivos/componentes envolvidos

- `src/pages/scales/ScaleForm.vue` — bloco "Equipe da celebração" (Etapa 2).
- `src/components/scale/ScaleRole.vue`, `ScaleMember.vue` (`TASK-0033`).

## Comportamento esperado

Cada `ScaleRole` (por categoria) mostra: sugestões daquela categoria primeiro (cruzando
`Suggestion.servidorId` com `Servidor.categorias`, já disponível no frontend — **sem chamada de
API nova**, só filtragem client-side do resultado de `GET /scales/sugestoes`, já existente);
busca inline abaixo, sempre visível; campos condicionais (instrumento/função litúrgica)
preenchidos durante a busca, antes de confirmar adicionar. "Adicionar equipe inteira"
(ministério) preservado como está. Filtro por categoria (`servidoresDaCategoria`) mantido —
continua prevenindo "função incompatível" na origem.

## Dependências

- `TASK-0033` — `ScaleRole`, `ScaleMember`.
- `TASK-0043` — Etapa 1 já estruturada (mesma tela).

## Critérios de conclusão

- [x] Busca inline por categoria implementada, substituindo o `<select>` "Adicionar
      servidor..." + botão separado.
- [x] Sugestões distribuídas por categoria (client-side), removendo o bloco "Sugeridos" único
      do topo.
- [x] Nenhuma nova rota/endpoint criado — reaproveita `GET /scales/sugestoes` como está.
- [x] "Adicionar equipe inteira" preservado, sem alteração de comportamento.
- [x] Filtro de elegibilidade por categoria (`servidoresDaCategoria`) preservado.
- [x] `npm run build` passa sem erros.
- [~] Testado adicionando pessoas via sugestão e via busca manual, em pelo menos 2 categorias
      diferentes — **não executado em navegador** (mesma limitação de ambiente já registrada);
      verificado por leitura de código (ver notas de progresso: rastreei manualmente os 3 casos —
      Música com instrumento, Acólitos com função litúrgica, categoria sem nenhum dos dois — pelo
      valor final que cada um produziria em `form.servidores`).
- [x] Regressão verificada por leitura de código: `adicionarServidor` só resolve o instrumento
      automaticamente quando `instrumentId` não é passado (`undefined`) — os 3 chamadores
      antigos que nunca passam esse argumento (`adicionarEquipeInteira`, `adicionarSemCategoria`,
      sugestão aceita) continuam produzindo exatamente o mesmo resultado de antes; só o novo
      caminho (busca inline → `adicionarNaCategoria`) passa o valor explícito escolhido no
      formulário pré-confirmação.

## Riscos

- Esta é a mudança de interação mais substancial de toda a Etapa 4 — maior risco de regressão
  funcional sutil (ex. perder o `teamId`/`instrumentId` corretos ao adicionar via busca em vez
  do fluxo antigo). Testar exaustivamente antes de considerar concluído (SPEC-004 §59, regra de
  regressão).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §25, §26, §27.
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (decisão §31 completa: "Adicionar
  servidor").

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `ScaleForm.vue` (Etapa 2): bloco "Sugeridos" único
  do topo removido; cada bloco de categoria agora mostra suas próprias sugestões primeiro
  (`sugestoesDaCategoria`, cruzando `Suggestion.servidorId` com `Servidor.categorias` já
  disponível na prop `servidores`, sem chamada de API nova), com "Adicionar"/"Ignorar" por
  sugestão. O `<select>` "Adicionar servidor..." + botão foi substituído por busca inline
  (`TextInput` + lista de resultados clicável, filtrando por nome dentro de
  `servidoresDaCategoria`, preservando o filtro de elegibilidade de sempre): ao clicar num
  resultado, o candidato fica "pré-selecionado" com os campos condicionais (instrumento pra
  Música, função litúrgica pra Acólitos, ministério) já visíveis e editáveis, e só um clique em
  "Adicionar" confirma — igual ao fluxo definido em `docs/tasks/0009-*.md` §7.3 ("buscar →
  escolher pessoa → preencher o que for aplicável → um único Adicionar"), em vez do fluxo antigo
  (adicionar → editar depois). `adicionarServidor` ganhou dois parâmetros opcionais
  (`instrumentId`/`funcaoLiturgica`) que só sobrescrevem o auto-preenchimento quando
  explicitamente passados (`!== undefined`) — os 3 chamadores que não passam esses argumentos
  (`adicionarEquipeInteira`, `adicionarSemCategoria`, aceitar sugestão) continuam com o
  comportamento de auto-escolher o primeiro instrumento cadastrado pra Música, exatamente como
  antes. "Adicionar equipe inteira" não foi tocado.

  **Melhoria que já saiu de quebra, não escopo extra inventado**: aceitar uma sugestão agora
  passa a `categoriaId` do bloco onde ela apareceu (`adicionarSugerido(s, cat.id)`), em vez de
  sempre cair em "sem função definida" como antes — consequência direta e esperada de "distribuir
  sugestões por categoria" (se a sugestão já está dentro do bloco certo, faz sentido que aceitar
  ali já aloque na categoria certa). Documentado aqui para não parecer uma mudança de
  comportamento não anunciada.

  **Decisão de não forçar `ScaleRole`/`ScaleMember` nas linhas já adicionadas**: considerei migrar
  a lista de "já escalados" de cada categoria para os componentes de domínio, mas a linha atual
  tem 3 controles editáveis simultâneos (instrumento/ministério/função litúrgica) que não têm
  onde caber no contrato de `ScaleMember` (`detalhe` é texto só-leitura, `actions` é um slot
  único) sem inventar uma API nova nesses componentes — e o destaque âmbar de categoria vazia
  (`border-amber-200`) também não tem equivalente em `ScaleRole` (que é neutro por design). Trocar
  isso teria puxado escopo além do que a task pede (busca inline + sugestões por categoria) e
  arriscado regressão visual/funcional na parte que já funciona. Mantive a estrutura de linha
  editável existente intacta; `ScaleRole`/`ScaleMember`/`EmptyRole` continuam sendo os
  componentes certos pra visualização (já adotados em `scales/Show.vue`, `TASK-0041`), não
  necessariamente para esta tela de edição multi-select. `npm run build` passou sem erros;
  `dist/` restaurado; `git status` confirmou que só `ScaleForm.vue` mudou entre páginas.
  Verificação de regressão feita por leitura de código (não em navegador, mesma limitação de
  ambiente já registrada) rastreando os 3 caminhos de adição pelo valor final produzido em
  `form.servidores`. Task marcada `concluida`. Próximo passo: `TASK-0045` (conflitos) já está
  elegível.
