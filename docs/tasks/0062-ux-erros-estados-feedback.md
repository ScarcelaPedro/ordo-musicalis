---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0062 — Nível 3: UX de erros, estados vazios, loading e feedback

**Task ID**: `TASK-0062`

## Objetivo

Forçar deliberadamente situações de erro, estado vazio e loading em toda a superfície do
sistema (SPEC-005 §15-19) e avaliar se o sistema comunica cada situação com clareza — não só se
tecnicamente "não quebra".

## Escopo

Toda a superfície de `src/pages/`, com foco nos pontos onde erro/vazio/loading são mais
prováveis: `ScaleForm.vue`, `availability/Form.vue`, formulários de cadastro (`ServidorForm`,
`ScaleTemplateForm`, `Create`/`Edit` de categorias/celebrantes/comunidades/teams), e todas as
listagens com busca (para o caso "nenhum resultado").

## Metodologia

Teste de erro (§15): campo obrigatório vazio, servidor indisponível (selecionar alguém fora de
disponibilidade quando o formulário permitir), conflito de horário (quando aplicável), falha de
API (simular via DevTools/interceptação de rede), perda de conexão, operação inválida, ação sem
permissão (testar rota restrita logado com o perfil errado). Para cada erro, avaliar a mensagem
(§16): é compreensível? é específica? diz o que aconteceu? diz o que fazer? evita jargão técnico?

Teste de estados vazios (§17): nenhuma escala, nenhum servidor, nenhuma disponibilidade, nenhum
repertório, nenhum resultado de busca — cada um deve explicar o que está acontecendo e o que
fazer a seguir.

Teste de loading (§18): carregamento inicial, de listas, de busca, salvamento, exclusão,
atualização — evitando tela congelada, ausência de feedback, ou cliques múltiplos causando
operação duplicada.

Teste de feedback (§19): depois de salvar, adicionar, excluir, confirmar, recusar, publicar,
alterar disponibilidade — o usuário sabe que a ação funcionou?

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Situações de erro forçadas e mensagens avaliadas contra os 4 critérios do §16.
- [x] Estados vazios revisados em pelo menos 5 telas (escalas, servidores, disponibilidade,
      repertório, busca sem resultado).
- [~] Loading revisado — cenário de sucesso confirmado (Skeleton some quando os dados chegam);
      cenário de falha revela um achado real (ver Notas de progresso) em vez das 6 operações
      todas confirmadas como corretas.
- [x] Feedback revisado — reaproveitando evidência já coletada nas `TASK-0058`-`0061` (não
      duplicado aqui) e complementado com o achado de duplo clique desta task.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Simular falha de API/perda de conexão de forma realista pode exigir DevTools (throttling
  offline) em vez do ambiente Playwright padrão — se não for viável no ambiente disponível,
  registrar essa limitação explicitamente em vez de pular o teste silenciosamente.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §15-19, §53.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright), reaproveitando o
  ambiente da `TASK-0061`. Forçou erro de verdade (campo vazio, sem permissão, API retornando
  500 via interceptação de rede, offline real via `context.setOffline(true)`, duplo clique via
  `dispatchEvent`), não simulação de código lido.

  **Achado (P2) — duplo clique gera registro duplicado real no banco.** 3 cliques disparados em
  sequência rápida (mais agressivo que um duplo-clique humano normal, mas revelador de uma
  janela de corrida real) no botão "Salvar" de `celebrantes/Create.vue` geraram **2 requisições
  POST reais**, confirmadas por escuta de rede E por consulta direta ao banco
  (`SELECT id, nome FROM celebrantes WHERE nome LIKE 'Pe. Duplo Clique%'` retornou 2 linhas com
  o mesmo nome e o mesmo timestamp). O componente já faz `loading.value = true` como primeira
  linha de `submit()` e o botão já tem `:disabled="loading"` — mas a atualização do atributo
  `disabled` no DOM depende do próximo ciclo de reatividade do Vue, e um segundo clique disparado
  antes desse ciclo terminar passa direto. Como este padrão de formulário (`InputLabel`+
  `TextInput`+`PrimaryButton` com `loading` local) se repete em praticamente todos os ~17-25
  cadastros simples identificados na `TASK-0057`, a mesma janela de corrida provavelmente existe
  em todos eles, não só em Celebrantes. Recomendação pra `TASK-0071`: guarda síncrona no próprio
  handler (`if (loading.value) return` como primeira linha, antes de qualquer `await`), que não
  depende do ciclo de renderização do Vue — SPEC-005 §50 pede exatamente essa garantia.

  **Achado (P2) — falha de API deixa a tela presa no Skeleton pra sempre, sem erro nenhum.**
  Interceptando `GET /servidores` pra retornar 500, a tela renderizou **5 elementos de
  `Skeleton` (`animate-pulse`) que nunca saem da tela** — `<main>` ficou literalmente vazio de
  texto além dos skeletons, sem nenhuma palavra como "erro"/"falha"/"indisponível", sem botão de
  tentar de novo. O Design System já tem `ErrorState.vue` (criado na `TASK-0031`, usado em
  outras telas) mas não é usado no tratamento de falha do `GET` de `servidores/Index.vue` — o
  `catch` (se existir) não troca o estado visual de loading por um estado de erro. Numa queda
  real de rede ou do backend, o coordenador veria a tela "carregando" para sempre, sem saber que
  algo deu errado. Recomendação: usar `ErrorState.vue` no `catch` do carregamento, com uma ação
  de "tentar novamente" — mesmo padrão que provavelmente falta nas outras listagens que também
  não foram auditadas individualmente aqui (achado pontual em Servidores, mas o padrão de
  `try/catch` ausente é provavelmente sistêmico).

  **Achado (P3) — redirecionamento silencioso quando falta permissão.** `musico` acessando
  `/celebrantes` (restrita a `admin`/`coordenador`) é corretamente redirecionado pro Dashboard
  pelo guard de rota (`router/index.ts:306`) — o controle de acesso em si funciona — mas **sem
  nenhuma mensagem explicando por quê**. Quem digitar/receber um link pra uma tela que não pode
  acessar simplesmente "aparece" no Dashboard sem entender o que aconteceu. Baixo impacto porque
  a navegação normal nunca oferece esses links pra quem não tem permissão (só afeta URL digitada
  manualmente ou link compartilhado desatualizado), mas é exatamente o que o §15/§16 pedem pra
  registrar. Recomendação: `flash.set('error', 'Você não tem permissão para acessar esta
  página.')` no guard antes do redirect.

  **Achado (P3) — mensagens de erro genéricas não distinguem causa de rede.** Com a rede
  desligada (`context.setOffline(true)`, não um `goto` — testado como uma falha de requisição
  dentro da SPA já carregada), submeter `celebrantes/Create.vue` mostrou "Erro ao criar
  celebrante" — o fallback genérico já existente no código (`e.response?.data?.message ??
  'Erro ao criar X'`), que é compreensível mas não específico sobre a causa (não diz "verifique
  sua conexão"). **Ponto positivo confirmado junto**: o formulário não apagou o nome já
  preenchido (§38 respeitado). Achado de baixo impacto — o usuário sempre recebe *algum*
  feedback, só não sabe se deve verificar a internet ou tentar de novo mais tarde.

  **Confirmado funcionando bem, sem achado**: validação de campo obrigatório em `ScaleForm`
  Etapa 1 (4 mensagens específicas por campo: "Informe a data da celebração.", "Informe o
  horário.", "Informe o nome da celebração.", "Selecione a comunidade." — exatamente o padrão
  exigido pelo §16); estados vazios em 5 telas reais (`servidores` busca sem resultado — "Nenhum
  servidor encontrado."; `escalas` filtradas sem resultado — "Nenhuma escala encontrada.";
  `repertoire/Show.vue` sem repertório — "Nenhum repertório cadastrado para esta escala.";
  `availability/Panel.vue` — "Já responderam"/"Ainda não responderam" com nomes reais listados;
  `substitutions/Index.vue` já confirmado na `TASK-0059` — "Nenhuma substituição pendente 🎉").

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Registros de teste
  (celebrantes duplicados, escala de teste) descartados junto com o container ao final, não
  limpos manualmente. Ambiente (Docker + `npm run dev:full`) **encerrado ao final desta task** —
  as próximas tasks (`TASK-0063` em diante) ainda são de validação, mas o volume de achados
  já reunidos torna um ponto de checagem melhor antes de seguir levantando ambiente novo.
  Task marcada `concluida`. Próximo passo: `TASK-0063`.
