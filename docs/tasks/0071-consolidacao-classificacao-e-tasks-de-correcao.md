---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0071 — Consolidação, classificação de problemas e geração das tasks de correção

**Task ID**: `TASK-0071`

## Objetivo

Reunir todo problema registrado nas Notas de progresso de `TASK-0057` a `TASK-0070`, confirmar
sua classificação P0-P3 (SPEC-005 §53) sob um critério único e consistente, priorizar (§54:
P0 → P1 → P2 → P3), e transformar cada problema numa task de correção formal (§69), com Título,
Descrição, Problema, Impacto, Prioridade, Tela, Componente, Comportamento atual, Comportamento
esperado e Critérios de aceite.

Para cada problema, aplicar a regra de decisão do §55 antes de criar a task: é bug → corrigir;
é inconsistência visual → corrigir no Design System/componente; é problema de UX → avaliar o
fluxo; é problema de arquitetura → não mascarar com CSS, registrar retorno à Etapa 2 (§56); é
funcionalidade nova → não implementar nesta etapa, registrar como melhoria futura (§68, item 10)
em vez de task de correção.

## Numeração das tasks de correção

Cada task de correção é um novo arquivo `docs/tasks/00NN-correcao-*.md`, numerado
sequencialmente a partir do próximo número livre em `docs/tasks/` no momento da execução desta
task (nunca reutilizar `TASK-0072`, já reservado para o relatório final) — seguir o protocolo de
`docs/AGENTS.md` ("Evitando colisão ao criar um novo arquivo de task"). Cada task de correção
deve ter `Prioridade` explícita no corpo (P0/P1/P2/P3), para que a seleção automática de próxima
task (`docs/AGENTS.md`, "Seleção automática da próxima task") a priorize corretamente.

## Dependências

- `TASK-0057`, `TASK-0058`, `TASK-0059`, `TASK-0060`, `TASK-0061`, `TASK-0062`, `TASK-0063`,
  `TASK-0064`, `TASK-0065`, `TASK-0066`, `TASK-0067`, `TASK-0068`, `TASK-0069`, `TASK-0070` —
  todas as tasks de validação da Etapa 5 devem estar `concluida` antes desta consolidação.

## Critérios de conclusão

- [x] Toda entrada de problema das 14 tasks de validação lida e listada numa tabela única
      (Problema/Tela/Componente/Prioridade/Task de correção gerada).
- [x] Cada problema classificado como bug, inconsistência visual, problema de UX, problema de
      arquitetura, ou funcionalidade nova, seguindo a regra de decisão do §55.
- [x] Uma task de correção criada (template §69) para cada problema classificado como bug,
      inconsistência ou UX corrigível nesta etapa.
- [x] Todo problema de arquitetura identificado registrado como retorno à Etapa 2, não corrigido
      com CSS/gambiarra (§56).
- [x] Toda funcionalidade nova sugerida registrada como melhoria futura (não vira task de
      correção desta etapa).
- [x] Lista final ordenada por prioridade (P0 → P1 → P2 → P3), pronta para orientar a execução.

## Riscos

- Risco de duplicar tasks se dois níveis de validação registrarem o mesmo problema
  independentemente (ex.: um problema de contraste pode aparecer tanto na `TASK-0057` visual
  quanto na `TASK-0069` de acessibilidade) — deduplicar antes de criar os arquivos.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §53-56, §69.
- `docs/AGENTS.md` — protocolo de numeração e campo `Prioridade` na seleção automática de tasks.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada: lidas as Notas de progresso das 14 tasks de
  validação (`TASK-0057`-`0070`), todas `concluida`. **16 tasks de correção criadas**
  (`TASK-0073` a `TASK-0088`, numeração livre confirmada a partir de `TASK-0072`, já reservada
  pro relatório final) — 1 P1, 6 P2, 9 P3. Nenhuma duplicata entre níveis de validação (o único
  risco de sobreposição real, contraste, já tinha sido resolvido on-the-fly dentro da própria
  `TASK-0069`, não sobrou pra consolidar aqui).

  ### Tabela consolidada — problemas → tasks de correção

  | # | Problema | Tela | Prioridade | Task | Origem |
  |---|---|---|---|---|---|
  | 1 | "Sua próxima escala" no Dashboard ignora escalas fora do mês em exibição | Dashboard (servidor) | **P1** | `TASK-0088` | `TASK-0060` |
  | 2 | Campo Comunidade vazio ao abrir "Nova Escala" | `/escalas/criar` | P2 | `TASK-0073` | `TASK-0058`/`0061` (já conhecido desde Etapa 4) |
  | 3 | `Modal` não devolve foco quando aberto via `Dropdown` | Listagens mobile (8 telas) | P2 | `TASK-0074` | `TASK-0065` (já conhecido desde Etapa 4) |
  | 4 | Duplo clique gera operação duplicada (Celebrantes, Publicar escala) | Formulários de submissão | P2 | `TASK-0075` | `TASK-0062`+`0067` |
  | 5 | Falha de API deixa listagem presa em loading, sem erro | `servidores/Index.vue` (+prováveis outras) | P2 | `TASK-0076` | `TASK-0062` |
  | 6 | 25 telas nunca migradas para o Design System da Etapa 4 | Auth, perfil, repertório, relatórios, servidores, celebrantes, comunidades, categorias, equipes, recorrências | P2 | `TASK-0077` | `TASK-0057` |
  | 7 | Modo escuro ausente em telas de detalhe | Servidores/Equipes/Liturgia (Show) | P2 | `TASK-0078` | `TASK-0069` |
  | 8 | Cores literais em vez de tokens semânticos | Dashboard, Liturgia | P3 | `TASK-0079` | `TASK-0057` |
  | 9 | Sem ação de excluir na tela de detalhes da escala | `scales/Show.vue` | P3 | `TASK-0080` | `TASK-0058` |
  | 10 | Redirecionamento sem explicação (permissão/sessão) | Router global | P3 | `TASK-0081` | `TASK-0062`+`0067` |
  | 11 | Mensagens de erro não distinguem falha de rede | Formulários em geral | P3 | `TASK-0082` | `TASK-0062` |
  | 12 | Repertório/Liturgia sem caminho de volta à escala | Repertório, Liturgia | P3 | `TASK-0083` | `TASK-0063` |
  | 13 | Foco não vai ao primeiro campo inválido | `ScaleForm` Etapa 1 | P3 | `TASK-0084` | `TASK-0064` |
  | 14 | Mensagem de sucesso inconsistente (Criar vs. Editar) | 5 pares de cadastro | P3 | `TASK-0085` | `TASK-0066` |
  | 15 | Vínculos fixos só disponíveis em Editar, não em Criar | `scaleTemplates` | P3 | `TASK-0086` | `TASK-0066` |
  | 16 | Links de atalho pequenos demais para toque | `reports/Index.vue` | P3 | `TASK-0087` | `TASK-0068` |

  ### Problemas de arquitetura (dado ausente no backend) — retorno à Etapa 2/backend, §56

  Não viram task de correção de frontend — dependem de dado que a API não expõe hoje; forçar uma
  correção de UI sobre eles seria mascarar a lacuna real, não resolvê-la (§56 explícito: "não
  tentar mascará-lo com CSS"):

  - **Conflitos de horário/dupla-escalação nunca detectados** — `ConflictAlert` integrado em 3
    pontos (`ScaleForm`, `scales/Show.vue`, listagem de substituições) mas nunca populado; "sem
    sugestões" não explica indisponibilidade como motivo; Dashboard-coordenador não mostra
    "funções sem servidor"/conflitos. Três sintomas, uma única causa: nenhum endpoint cruza
    `Availability`/dupla-escalação hoje. Já registrado desde `docs/relatorio-implementacao-etapa4.md`
    §7.1 (itens 1-3); reconfirmado sem solução nova em `TASK-0061`/`0067`. Recomendação:
    detecção de conflito como funcionalidade de backend numa etapa futura.
  - **Exceção pontual de disponibilidade não aparece no painel do coordenador** — limitação de
    dado pré-existente ao redesign (já documentada desde a Etapa 2, `docs/tasks/0013-*.md`), não
    reexercitada com solução na `TASK-0059`/`0068`.

  ### Funcionalidade nova sugerida — não implementar nesta etapa (§68 item 10, melhorias futuras)

  - **"Adicionar substituto manualmente"** em Substituições — não existe endpoint de busca/adição
    manual; sugerido pelo próprio wireframe da Etapa 2 como próximo passo do estado vazio, mas
    fora do escopo de correção desta etapa (§70: "não adicionar funcionalidades novas"). Registrar
    para avaliação de produto numa etapa futura.
  - **Indicador de disponibilidade preenchida/pendente no Dashboard do servidor** — decisão de
    escopo (exigiria uma chamada de API que o Dashboard não faz hoje), não um bug; melhoria
    futura opcional, baixa prioridade.

  ### Problema de dado de cadastro (não é código) — revisão manual pelo time

  - **Categorias de função duplicadas por nomenclatura** ("Acólitos e Ancilas"/"Acólitos e
    Coroinhas", "Comentaristas"/"Comentarista") — questão de integridade do cadastro, não de
    código; já registrada na `TASK-0054`, sem novo achado nesta etapa. Recomendação: revisão
    manual do cadastro pelo time responsável pelo conteúdo, fora do escopo de qualquer task de
    frontend.

  Nenhuma correção de código aplicada nesta task — só criação de documentos `docs/tasks/`. Task
  marcada `concluida`. Próximo passo: `TASK-0072` (relatório final da Etapa 5), que depende de
  P0/P1 (`TASK-0088`) e P2 (`TASK-0073`-`0078`) estarem `concluida` antes de poder fechar.
