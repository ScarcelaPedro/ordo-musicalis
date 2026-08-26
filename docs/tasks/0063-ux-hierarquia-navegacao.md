---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0063 — Nível 3: UX de hierarquia, primeiros 5 segundos, reconhecimento e navegação

**Task ID**: `TASK-0063`

## Objetivo

Avaliar se cada tela principal comunica sua hierarquia de informação com clareza imediata
(SPEC-005 §30-31), se padrões visuais são reconhecidos de forma consistente entre telas (§32), e
se o usuário consegue sempre responder onde está, como chegou, para onde pode ir e como volta
(§33-34).

## Escopo

Telas principais: `dashboard/Dashboard.vue`, `scales/{Index,Show,ScaleForm}.vue`,
`servidores/Index.vue`, `availability/Panel.vue`, e as 6 listagens administrativas
(`categorias`, `celebrantes`, `comunidades`, `teams`, `scaleTemplates`). Navegação global
(sidebar, bottom nav, `Breadcrumb.vue`).

## Metodologia

Teste de hierarquia (§30): para cada tela, identificar objetivamente qual é o título, qual é a
informação principal, qual é a ação principal, o que é secundário e o que é auxiliar — se essas
respostas não forem óbvias, registrar problema de hierarquia.

Teste dos primeiros 5 segundos (§31): olhar a tela por ~5 segundos e verificar se dá para
identificar onde se está, o contexto, a informação principal e a próxima ação provável.

Teste de reconhecimento (§32): confirmar que um padrão visual (ex.: botão azul = ação principal)
significa a mesma coisa em todas as telas onde aparece.

Teste de navegação (§33) e breadcrumbs (§34): em cada tela, responder onde estou / como cheguei
aqui / para onde posso ir / como volto; verificar se o `Breadcrumb` aparece só quando necessário
(não "porque existe no Design System").

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Teste de hierarquia aplicado às telas do Escopo.
- [x] Teste dos primeiros 5 segundos aplicado às telas principais.
- [x] Teste de reconhecimento de padrão aplicado a pelo menos botão primário, badge de status e
      indicador de erro.
- [x] Uso de `Breadcrumb` auditado em todas as telas onde aparece — presença/ausência
      justificada em cada caso.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Baixo — validação observacional, não altera código.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §30-34, §53.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada com navegador real (Playwright + screenshots reais
  inspecionados, não só leitura de template) e uma varredura `grep` no código pra auditar o uso
  do `Breadcrumb`. Ambiente: Docker Postgres + seeds padrão + seed temporário
  `api/prisma/_seedTask0063.ts` (deletado ao final, nunca commitado) com uma escala de setembro
  totalmente preenchida (4 categorias com servidor, 3 vazias) pra testar hierarquia com dado
  robusto, não com tela vazia.

  **Achado (P3) — `Breadcrumb.vue` existe mas nunca é usado em lugar nenhum.** `grep` em
  `src/pages/` e `src/layouts/` não encontra nenhuma referência ao componente — só o próprio
  arquivo `src/components/Breadcrumb.vue` (criado na `TASK-0032`, recebeu até uma correção de
  contraste na `TASK-0055` como parte da varredura mecânica de componentes compartilhados, mas
  nunca foi instalado em tela nenhuma). Isso não é, por si só, uma violação do §34 — a regra
  explícita é "não usar breadcrumb só porque existe no Design System", e a ausência total é
  consistente com uma arquitetura de informação rasa (a maioria das telas fica a 1-2 níveis da
  navegação principal). Mas existe **uma exceção real** onde a ausência dói: ver achado abaixo.

  **Achado (P3) — Repertório e Liturgia não têm nenhum caminho de volta pra escala.**
  `repertoire/Show.vue`, `repertoire/Edit.vue` e `liturgia/Show.vue` são acessados a partir de
  `scales/Show.vue` (botões "Repertório"/"Liturgia" no cabeçalho) ou do Dashboard do servidor,
  mas nenhuma das 3 telas tem um link de volta pra escala de origem — só o navegador
  (botão Voltar) resolve isso, sem afordance nenhuma na própria UI. Confirmado visualmente
  (`repertorio-editar.png`): o cabeçalho mostra só "Editar Repertório", sem nenhuma referência a
  qual celebração pertence — pior que `repertoire/Show.vue`, que ao menos mostra
  "{{ celebração }} — {{ data }}" como subtítulo (`repertoire/Show.vue:30`), mas mesmo esse
  subtítulo não é um link. Se o usuário chegar aqui por link direto, atualizar a página, ou
  perder o histórico de navegação (abrir em nova aba, por exemplo), fica sem saber como voltar
  pra escala específica — só dá pra ir pra listagem geral de `/escalas` e procurar de novo. Esse
  é exatamente o cenário em que um `Breadcrumb` faria sentido de verdade (`Escalas > {{
  celebração }} > Repertório`) — o componente já existe pronto no Design System, só nunca foi
  aplicado aqui. Recomendação pra `TASK-0071`: usar `Breadcrumb.vue` (ou, mais simples, um link
  "← Voltar à escala") nessas 3 telas.

  **Confirmado funcionando bem, sem achado**:
  - **Hierarquia (§30)** em `scales/Show.vue` (`escala-show.png`): título → data/local → status
    (badge) → resumo escaneável (3 confirmados / 1 pendentes / 0 recusados / 3 vagas, com bolinha
    colorida + texto, não só cor) → equipe agrupada por categoria → categorias vazias com ⚠ +
    texto + link "Resolver". Em 5 segundos dá pra responder as 4 perguntas do §31 (onde estou,
    contexto, informação principal, próxima ação) sem esforço.
  - **Hierarquia no Dashboard do coordenador** (`dashboard-admin-desktop.png`): 3 stat cards →
    "Pendências de confirmação" em destaque (fundo âmbar, chama atenção de propósito) → calendário
    por último. Nota lateral útil: o widget de pendências usa `GET /scales/pendentes`, um endpoint
    **sem** o filtro de mês que causa o achado P1 já registrado na `TASK-0060` — por isso ele
    mostrou corretamente a pendência de setembro mesmo com o calendário em agosto. Confirma que o
    bug da `TASK-0060` é específico do card "Sua próxima escala" do servidor, não sistêmico.
  - **Reconhecimento de padrão (§32)**: botão primário (roxo/`primary-600`) sempre = ação
    principal, testado em `ScaleForm`, `Show.vue`, `servidores/Index.vue`, `repertorio/Editar` —
    consistente em todas. Badge de status (`Confirmado`=verde, `Convidado`=cinza,
    `Ativo`=verde) consistente entre `Show.vue` e `servidores/Index.vue`. Indicador de
    "vazio/atenção" (⚠ + âmbar) consistente entre `ScaleForm` Etapa 3 (já visto na `TASK-0061`) e
    `scales/Show.vue`.
  - **Navegação (§33)**: nas telas com hierarquia de 1 nível (Dashboard, listagens, `Show.vue`
    de escala), as 4 perguntas do §33 são respondidas pela combinação de topbar (marca + perfil)
    + cabeçalho da própria tela + sidebar — sem precisar de breadcrumb. O problema fica restrito
    à exceção de Repertório/Liturgia acima.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Ambiente encerrado ao
  final desta task (Docker removido, dev servers finalizados, seed temporário apagado). Task
  marcada `concluida`. Próximo passo: `TASK-0064`.
