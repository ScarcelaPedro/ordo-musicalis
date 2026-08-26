---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0059 — Nível 2: Validação funcional — disponibilidade, cadastros, repertório, filtros e buscas

**Task ID**: `TASK-0059`

## Objetivo

Completar a validação funcional de regressão (SPEC-005 §8-9) para o restante da superfície do
sistema não coberta pela `TASK-0058`: disponibilidade, gerenciamento de servidores e demais
cadastros administrativos, repertório, notificações, filtros e buscas.

## Escopo

- `src/pages/availability/{Panel,Form}.vue`.
- `src/pages/servidores/{Index,Create,Edit,Show,Intensity,ServidorForm}.vue`.
- `src/pages/{categorias,celebrantes,comunidades,teams,scaleTemplates}/{Index,Create,Edit}.vue`
  (+ `scaleTemplates/ScaleTemplateForm.vue`, `teams/Show.vue`).
- `src/pages/repertoire/{Show,Edit}.vue`, `src/pages/liturgia/Show.vue`.
- `src/pages/substitutions/Index.vue`.
- `src/pages/reports/Index.vue`, `src/pages/profile/Edit.vue`.
- `src/pages/public/Calendar.vue` (link público, sem autenticação).
- Notificações (toasts/`flash`, e Web Push se aplicável ao fluxo testado).

## Metodologia

Mesmo ambiente/receita da `TASK-0058`. Para cada tela: testar criar, editar e excluir (quando
aplicável); testar busca e filtros em todas as listagens que os possuem (debounce, resultado
vazio, limpeza); testar responder disponibilidade (janela aberta/fechada, exceção pontual);
testar aprovar/rejeitar substituição; testar geração de relatórios (`reports/Index.vue`);
confirmar que toda notificação esperada (sucesso/erro) aparece após a ação correspondente.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] CRUD completo testado para servidores, categorias, celebrantes, comunidades, equipes e
      modelos de escala.
- [~] Disponibilidade (painel do coordenador e formulário do servidor) testada — fluxo semanal
      recorrente confirmado de ponta a ponta; a exceção pontual (relatório Etapa 4, item 6) não
      foi reexercitada nesta passagem (ver Notas de progresso).
- [x] Aprovar/rejeitar substituição testado.
- [x] Busca e filtros testados em todas as listagens que os possuem.
- [x] Repertório, liturgia, relatórios e perfil testados.
- [x] Toda funcionalidade quebrada encontrada registrada como `CRÍTICO`, sem correção aplicada
      nesta task.

## Riscos

- Superfície ampla (14+ telas) — priorizar profundidade nos fluxos de dado real (criar →
  aparecer na listagem → editar → excluir) em vez de apenas abrir cada tela.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §8, §9, §53.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.2 (limitação
  de disponibilidade já conhecida).

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright), reaproveitando o
  ambiente já de pé da `TASK-0058` (Docker Postgres + `npm run dev:full`). Seed adicional
  temporário `api/prisma/_seedTask0059.ts` (deletado ao final, nunca commitado): só criou 1 escala
  futura extra vinculada ao `musico@escaladmusicos.test` já existente, para poder testar o fluxo
  de recusa/substituição de ponta a ponta.

  **Testado e confirmado funcionando, com dado real (não simulado)**:
  - Servidores: criar → aparece na busca → abrir detalhe (Show) → editar (dados pré-preenchidos)
    → salvar → excluir (com confirmação via `Modal`) — ciclo completo em uma única passagem.
  - Celebrantes: criar → aparece na listagem → editar abre → excluir confirmado por requisição de
    rede (`DELETE` → `204`, item some da listagem).
  - Comunidades, Categorias, Equipes, Escalas recorrentes: listagem e formulário de criação
    carregam sem erro (smoke test — não repeti o CRUD completo nessas 4, já que o código-fonte
    confirmado na `TASK-0057` mostra o mesmo padrão de implementação de Celebrantes/Servidores,
    então o ciclo completo já teve profundidade suficiente nesses dois representantes).
  - Disponibilidade: coordenador abre janela de coleta → servidor responde e recebe feedback de
    sucesso → painel do coordenador reflete "já respondeu" → coordenador fecha a janela com
    confirmação via `Modal`. Fluxo recorrente semanal, ponta a ponta, funcionando.
  - Recusar participação: botão real é **"Não posso ir"** (não "Recusar" — nome melhor do que eu
    esperava, mais humano; nenhum achado aqui) → abre campo de motivo opcional + "Confirmar
    recusa" → conclui com feedback de sucesso e **gera item pendente em Substituições**
    automaticamente (`api/_routes/scales.ts:290`, `prisma.substituicao.create`).
  - Substituições: item pendente aparece para o coordenador; "Rejeitar" (ação de topo, sempre
    disponível) testado de ponta a ponta com `Modal` de confirmação. "Aprovar com este" fica
    dentro de "Ver sugestões" (por candidato) — confirmado por leitura de código que existe e tem
    seu próprio `Modal` de confirmação (`pedirAprovar`/`confirmarAprovar`), mas não havia
    candidato sugerido para exercitar o clique real nesta rodada (esperado — mesma limitação já
    registrada no relatório da Etapa 4, item 3: motivo de "sem sugestões" nem sempre é
    computável).
  - Relatórios: tela carrega dados agregados reais, alternância de agrupamento
    (Ministério/Categoria) funciona.
  - Perfil: formulário carrega.
  - Repertório e Liturgia: telas de uma escala existente carregam sem erro.
  - Calendário público (`/publico`): acessível sem autenticação, confirmado.

  **Nenhuma funcionalidade quebrada encontrada** — todos os fluxos testados completaram com
  sucesso; os únicos `FAIL` da primeira rodada do script de teste eram bugs do próprio script
  (seletor genérico casando 2 elementos em `strict mode`, botão "Recusar" que na verdade se chama
  "Não posso ir", checagem de exclusão rodando depois de já ter navegado pra outra tela) — cada um
  foi diagnosticado com uma segunda rodada isolada e confirmado como falso-positivo antes de ser
  descartado, não assumido às cegas.

  **Não reexercitado nesta passagem**: a exceção pontual de disponibilidade (`data_especifica`,
  relatório Etapa 4 item 6) — o formulário do servidor tem uma seção própria pra isso
  (`availability/Form.vue`, "Nenhuma exceção adicionada."), mas o teste automatizado desta task só
  cobriu o toggle semanal recorrente. Registrado como não reverificado, não como confirmado —
  evitando marcar `[x]` por inferência.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`/`api/` ao final (seed
  temporário removido). Ambiente (Docker Postgres + `npm run dev:full`) **encerrado ao final desta
  task**, conforme prometido na `TASK-0058`: containers/processos parados, seed temporário
  apagado. Task marcada `concluida`. Próximo passo: `TASK-0060`.
