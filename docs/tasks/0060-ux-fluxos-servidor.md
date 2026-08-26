---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0060 — Nível 3: UX dos fluxos principais do servidor

**Task ID**: `TASK-0060`

## Objetivo

Executar do início ao fim os três fluxos prioritários do perfil servidor definidos na Etapa 2 e
retomados em SPEC-005 §10: (1) verificar a próxima escala, (2) confirmar participação,
(3) informar disponibilidade. Para cada um, aplicar o teste de tarefa (§11) e a métrica de
fricção (§12).

## Escopo

- `src/pages/dashboard/Dashboard.vue` (perfil servidor).
- `src/pages/scales/{MyScales,Show}.vue`.
- `src/pages/availability/Form.vue`.

## Metodologia

Logado como `musico`, sem se auto-orientar previamente (§63 — não ensinar o caminho antes do
teste, mesmo sendo o próprio agente quem observa). Para cada fluxo, responder (§11): o ponto de
partida é óbvio? o objetivo de cada etapa é compreensível? a ação principal é clara? o resultado
da ação é comunicado? um erro é recuperável sem ajuda externa? Registrar (§12): quantos passos
reais foram necessários, em que momento haveria dúvida, em que momento haveria erro, se o
feedback do sistema foi suficiente.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Fluxo 1 (ver próxima escala) executado e avaliado.
- [x] Fluxo 2 (confirmar participação) executado e avaliado.
- [x] Fluxo 3 (informar disponibilidade) executado e avaliado.
- [x] Para cada fluxo: passos/dúvidas/erros/feedback registrados nas Notas de progresso.
- [x] Problemas de UX encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Baixo — validação observacional, não altera código.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §10 (Fluxos 1-3), §11, §12, §53, §63.
- `docs/tasks/0008-wireframes-dashboard.md` (prioridade original do Dashboard-servidor).

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright), sem atalhos de URL
  para os pontos de entrada (a navegação até cada tela foi feita clicando na UI, como um usuário
  faria — só a etapa de login foi direta). Ambiente: Docker Postgres + seeds padrão + seed
  temporário `api/prisma/_seedTask0060.ts` (deletado ao final, nunca commitado) com um
  `musico@escaladmusicos.test` com uma escala futura em `convidado` (6/set/2026), outra já
  `confirmada` (13/set/2026) e uma janela de disponibilidade aberta (out/2026). Testado
  primariamente em viewport mobile (375×812) — é o caminho primário do servidor por decisão já
  tomada na `TASK-0035` (bottom nav com Início/Minha Escala/Disponibilidade) — com uma checagem
  comparativa em desktop (1280×900).

  **Achado (P1) — "Sua próxima escala" no Dashboard só busca dentro do mês calendário atual,
  não a próxima de verdade.** `Dashboard.vue` (`load()`, linha ~74) chama `GET /scales` com
  `params: { mes: currentYear-currentMonth }` — sempre o mês em exibição no calendário (hoje,
  agosto/2026, o mês real corrente). `myNextScales` (linha 176) filtra esse mesmo array já
  restrito por `dataCelebracao >= hoje`. Resultado: uma escala real, futura, já confirmada
  no sistema, mas em setembro/2026 (mês seguinte), **não aparece de jeito nenhum** no bloco
  "Sua próxima escala" — o card inteiro desaparece e vira o estado vazio "Nenhuma escala sua
  neste período." (`Dashboard.vue:337`), exatamente na posição mais proeminente da tela, logo
  abaixo do "Bem-vindo". Capturado em screenshot (`01-dashboard-mobile.png`): a tela mostra
  "Nenhuma escala sua neste período." como primeira informação real, sem nenhum indício de que
  existe uma ação pendente. **Isso não é um problema de UI, é a fonte de dado errada** — o
  bloco foi desenhado (`TASK-0038`, §16) pra ser a prioridade #1 da tela exatamente pra evitar
  que o servidor precise ir atrás da própria escala; hoje ele faz o oposto quando a data cai
  fora do mês calendário em exibição. `scales/MyScales.vue` **não tem esse problema** — busca
  sem o parâmetro `mes` e encontrou a escala corretamente (confirmado: "Confirmar" apareceu lá
  e funcionou). Classificado **P1**, não P0, porque existe um caminho alternativo funcional
  (Minha Escala, 1 toque na bottom nav) — mas é crítico porque o caminho *quebrado* é
  exatamente o que a Etapa 4 desenhou pra ser o principal, e a mensagem que ele mostra
  ("nenhuma escala") é ativamente enganosa, não neutra. Recomendação pra `TASK-0071`: `load()`
  do Dashboard deveria calcular `myNextScales` a partir de uma consulta própria sem o filtro de
  `mes` (mesmo padrão que `MyScales.vue` já usa), independente do mês que o calendário do
  coordenador está exibindo.

  **Fluxo 1 — verificar próxima escala**: como consequência direta do achado acima, o teste de
  tarefa (§11) falha no ponto de partida mais óbvio (Dashboard) e só é bem-sucedido navegando
  para "Minha Escala" pela bottom nav (1 toque, sempre visível, rótulo autoexplicativo). Um
  usuário real que confiasse só no Dashboard concluiria — errado — que não tem nada agendado.

  **Fluxo 2 — confirmar participação**: bem-sucedido via Minha Escala. Passos reais: 1) tocar
  "Minha Escala" na bottom nav, 2) tocar "Confirmar" no card da escala pendente — 2 toques a
  partir do Dashboard (deveria ser 1, direto do Dashboard, se o achado P1 acima não existisse).
  Ação principal inequívoca (botão "Confirmar" sozinho, sem ambiguidade com outras ações no
  mesmo card antes de abrir o motivo de recusa). Feedback de sucesso confirmado após o clique.
  Nenhum erro possível de cometer neste fluxo específico (não há como confirmar a escala
  errada — só a própria aparece).

  **Fluxo 3 — informar disponibilidade**: o melhor dos três, nenhum problema encontrado. Passos:
  1) tocar "Disponibilidade" na bottom nav, 2) marcar período(s), 3) "Salvar disponibilidade" —
  3 toques, direto. Microcopy exemplar e autoexplicativa, capturada literalmente na tela:
  "Coleta de disponibilidade de outubro/2026 aberta — responda até 25/09/2026." e "Marque os
  períodos em que você pode servir. Períodos não marcados são tratados como indisponíveis." —
  responde sozinha a "o que é isso" e "o que fazer" sem exigir ajuda externa (§11). Seção de
  "Exceções pontuais" claramente separada do padrão semanal, com estado vazio explicado
  ("Nenhuma exceção adicionada."). Feedback de sucesso confirmado após salvar.

  **Comparação desktop (medida de fricção, §12)**: a sidebar não fica visível por padrão em
  nenhuma largura — é um drawer que exige clicar o ícone de hambúrguer (`sidebarOpen =
  ref(false)`, decisão já documentada em `AuthenticatedLayout.vue:199`, "substitui o menu
  horizontal quando não cabe mais na tela"). A partir do Dashboard em 1280×900, chegar em
  "Minha Escala" custa 3 cliques (hambúrguer → expandir grupo "Escalas" → link), contra 1 toque
  na bottom nav mobile. Não é um bug — é uma escolha de design já registrada — mas é uma
  fricção real e mensurável que vale registrar como **P3** (a bottom nav cobre exatamente os 3
  fluxos desta task; o desktop só fica pior para quem prefere não usar mouse/toque teclado, mas
  isso é escopo da `TASK-0069`, não desta).

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Ambiente de teste
  (Docker + `npm run dev:full`) será reaproveitado pela `TASK-0061` (mesmo tipo de validação,
  perfil coordenador) antes de ser encerrado. Task marcada `concluida`. Próximo passo:
  `TASK-0061`.
