---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0061 — Nível 3: UX dos fluxos principais do coordenador

**Task ID**: `TASK-0061`

## Objetivo

Executar do início ao fim os cinco fluxos prioritários do perfil coordenador (SPEC-005 §10,
Fluxos 4-8): criar escala, adicionar servidores, resolver conflito, publicar escala, consultar
situação das escalas. Dar atenção especial ao fluxo de criação de escala (§13), que "não deve
parecer burocrático", e à pergunta de complexidade do §14 ("é necessário tudo isso para realizar
esta tarefa?").

## Escopo

- `src/pages/dashboard/Dashboard.vue` (perfil coordenador).
- `src/pages/scales/{Index,Show,ScaleForm}.vue`.

## Metodologia

Logado como `admin`, sem autoexplicar o caminho antes de observar (§63). Para cada fluxo,
aplicar o teste de tarefa (§11) e a métrica de fricção (§12), como na `TASK-0060`. Para o fluxo
de criação de escala especificamente, percorrer as 8 etapas do §13 (encontrar criação → informar
celebração → montar equipe → adicionar servidores → identificar conflitos → resolver problemas →
revisar → salvar/publicar) e, para cada uma, perguntar se é realmente necessária (§14) — sem
remover etapa alguma sem antes checar se há uma regra de negócio por trás dela.

Considerar a pendência já conhecida de conflitos não serem detectados (relatório Etapa 4, item
2) ao avaliar o Fluxo 6 ("resolver conflito") — este fluxo provavelmente não pode ser totalmente
validado enquanto essa lacuna de dado não for resolvida; registrar isso explicitamente em vez de
simular um conflito que o sistema não gera de verdade.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Fluxos 4-8 executados e avaliados.
- [x] As 8 etapas do fluxo de criação de escala (§13) percorridas e avaliadas individualmente
      quanto à necessidade real (§14).
- [x] Limitação do Fluxo 6 (conflito não detectável hoje) registrada explicitamente, sem
      inventar um cenário de teste que o sistema não suporta.
- [x] Problemas de UX encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Baixo — validação observacional, não altera código.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §10 (Fluxos 4-8), §11-14, §53, §63.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.1, item 2
  (conflitos não detectáveis).

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright, 1280×900, logado como
  `admin`), reaproveitando o ambiente da `TASK-0060`. Seed adicional temporário
  `api/prisma/_seedTask0061.ts` (deletado ao final, nunca commitado): 3 servidores candidatos
  reais (2 na categoria "Música" com instrumento, 1 em outra categoria), pra que a busca/sugestão
  da Etapa 2 tivesse candidato de verdade a encontrar, em vez de "sem resultado" o tempo todo.

  **Resultado geral: fluxo de criação/gestão de escala funciona bem e se autoexplica** — ao
  contrário da `TASK-0060`, esta task não encontrou nenhum problema novo de UX além dos já
  registrados. Percorrido de ponta a ponta, sem atalho de URL exceto pro ponto de entrada inicial:

  - **Fluxo 4 (criar escala)**: link "criar escala" (`/escalas/criar`) está direto no Dashboard do
    coordenador, sem precisar abrir o menu — ponto de partida óbvio (§11).
  - **Etapa 1 (Celebração)**: campos obrigatórios marcados com `*`, ajuda inline útil ("0
    desativa o lembrete automático para esta escala"). Bug do `comunidadeId` vazio (já registrado
    P2 na `TASK-0058`) reconfirmado aqui, sem duplicar o registro.
  - **Fluxo 5 (adicionar servidores) / Etapa 2 (Equipe)**: microcopy de abertura explica o
    *porquê* da organização por categoria ("numa celebração normalmente todas as funções servem
    ao mesmo tempo... adicione só o que se aplica") — responde a "por que a tela é assim" antes
    mesmo de o usuário precisar perguntar. Fluxo real testado: buscar "Ana" no campo da categoria
    certa → resultado "Ana Cantora" aparece → clicar no nome (isso só *seleciona* o candidato,
    não adiciona ainda — dá chance de revisar/trocar o instrumento antes de confirmar, decisão de
    design correta pra função "Música") → clicar "Adicionar" → aparece refletida na equipe.
    2 cliques por servidor adicionado, nenhuma ambiguidade encontrada.
  - **Fluxo 6 (resolver conflito)**: confirmado, sem simular — Etapa 3 **não menciona conflito**
    nesta escala real, porque o dado não existe (limitação já registrada no relatório da Etapa 4,
    item 2, e na `TASK-0061` mantida como está, não contornada). O que a Etapa 3 mostra de fato
    (obrigatórios OK / categorias vazias) usa exatamente o padrão ⚠ + texto exigido pelo §28
    (teste de cor) — "⚠ Ninguém escalado em Ministros da Comunhão" com link "Resolver" por
    categoria, já compatível com a regra de não depender só de cor.
  - **Fluxo 7 (publicar escala)**: Etapa 4 (Revisão) mostra "Situação atual: rascunho" e dois
    botões claramente distintos, "Publicar escala" vs. "Salvar como rascunho" — nenhuma
    ambiguidade sobre qual ação faz o quê. Publicação real testada: sucesso, feedback confirmado,
    redirecionamento para `/escalas/38` (a escala recém-criada).
  - **Fluxo 8 (consultar situação das escalas)**: a coluna "STATUS" na listagem (`/escalas`)
    mostra o status de cada escala sem precisar abrir nenhuma — responde à pergunta do fluxo
    diretamente na tela de índice.
  - **§13/§14 (fluxo de criação, necessidade de cada etapa)**: as 8 etapas descritas na spec
    mapeiam 1:1 pras 4 etapas reais do `ScaleForm` (Etapa 1 = encontrar+informar celebração;
    Etapa 2 = montar equipe+adicionar servidores; Etapa 3 = identificar conflitos+resolver
    problemas, hoje parcialmente vazia pela lacuna de dado já conhecida; Etapa 4 =
    revisar+salvar/publicar). Nenhuma etapa pareceu burocrática ou dispensável na execução real —
    cada uma pede exatamente a informação que a etapa seguinte precisa, sem repetição.

  **Nenhum achado P0-P3 novo nesta task.** As únicas lacunas visíveis (comunidadeId vazio,
  ausência de detecção de conflito) já estavam registradas antes desta task (`TASK-0058`;
  relatório da Etapa 4, itens 2 e 7) — esta task serviu para **confirmar com evidência real**,
  não hipotética, que o restante do fluxo de criação/publicação de escala atende ao critério do
  §67 (tarefa realizada de forma clara, previsível e confortável) para o perfil coordenador.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Seed temporário removido.
  Ambiente (Docker + `npm run dev:full`) **mantido de propósito** para a `TASK-0062`, que também
  precisa de navegador real — será encerrado ao final daquela, não desta. Task marcada
  `concluida`. Próximo passo: `TASK-0062`.
