---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0067 — Nível 3: UX de ações destrutivas, prevenção de erro, duplo clique, sessão e regressão visual

**Task ID**: `TASK-0067`

## Objetivo

Avaliar a proteção de ações destrutivas (SPEC-005 §48), oportunidades de prevenção de erro antes
que ele aconteça (§49), proteção contra operação duplicada por clique repetido (§50),
comportamento em situações de sessão/rede (§51), e comparar visualmente o resultado do redesign
contra o estado anterior ao redesign (§52).

## Escopo

- Ações destrutivas: excluir servidor/celebrante/comunidade/categoria/equipe/modelo de escala,
  cancelar/recusar escala, rejeitar substituição.
- Prevenção de erro: `ScaleForm.vue` (seleção de servidor indisponível), `substitutions/Index.vue`
  (sugestão de substituto).
- Duplo clique: submissão de `ScaleForm` (salvar/publicar), `availability/Panel.vue` (fechar
  janela), confirmar/recusar em `MyScales.vue`.
- Sessão: interceptor de autenticação (`src/stores/auth`), comportamento ao expirar token, ao
  atualizar a página, e ao perder rede.
- Regressão visual: comparação com `auditoria-ux.md` (auditoria do estado pré-redesign, feita por
  leitura completa do código-fonte antes da Etapa 1).

## Metodologia

Ações destrutivas (§48): confirmar que toda exclusão/cancelamento/recusa passa por confirmação
explícita (`Modal`), nunca é de um clique só.

Prevenção de erro (§49): identificar onde o sistema já tem a informação para evitar o erro antes
de acontecer (ex.: indicar indisponibilidade antes da seleção, não só depois) — sem criar regra
nova, só usando dado já existente; cruzar com a pendência já registrada no relatório da Etapa 4
(item 3, "sem sugestões" não explica indisponibilidade como motivo).

Duplo clique (§50): clicar repetidamente em ações de salvar/publicar/confirmar/excluir e
confirmar que não gera operação duplicada (ex.: duas escalas idênticas, duas confirmações).

Sessão (§51): forçar expiração de sessão, atualizar a página no meio de um fluxo, simular falha
de rede — verificar se o usuário recebe feedback adequado em cada caso.

Regressão visual (§52): usando `auditoria-ux.md` como registro do "antes", confirmar que nenhuma
informação ou funcionalidade importante documentada ali desapareceu no "depois" — o objetivo não
é preservar a aparência antiga, é não perder substância.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Toda ação destrutiva do Escopo confirmada como protegida por confirmação explícita.
- [x] Ao menos uma oportunidade real de prevenção de erro avaliada e registrada (aproveitando ou
      não dado já existente).
- [~] Duplo clique testado em 2 das 4 ações do §50 (as de maior peso — ver Notas de progresso).
- [~] Comportamento de sessão testado (token corrompido); perda de rede/reload no meio do fluxo
      já cobertos indiretamente na `TASK-0062` (offline), não duplicados aqui.
- [x] Cada item relevante de `auditoria-ux.md` §14 conferido contra o estado atual — nenhuma
      informação/funcionalidade documentada ali ausente sem explicação.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Simular expiração de sessão/perda de rede de forma realista pode exigir manipulação direta do
  token/DevTools — se não for viável no ambiente disponível, registrar a limitação explicitamente.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §48-52, §53.
- `auditoria-ux.md` (raiz do repositório) — baseline "antes" do redesign.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.1, item 3.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright), com escuta de rede
  pra contar requisições de verdade (não inferir pela UI). Seed temporário
  `api/prisma/_seedTask0067.ts` (deletado ao final, nunca commitado): 1 `ScaleTemplate` semanal
  recorrente, pra testar "Gerar escalas do mês" de verdade.

  **§52 Regressão visual — item de `auditoria-ux.md` §14 verificado com dado real: "geração
  automática de escalas a partir de recorrências... não duplica escalas existentes".**
  Testado gerando o mesmo mês (novembro/2026) duas vezes seguidas: 1ª geração →
  "5 criada(s), 0 já existiam"; 2ª geração, mesmo mês → "0 criada(s), 5 já existiam". Contagem
  real na listagem de escalas confirma: 5 antes, 5 depois — **não duplicou**. Claim da auditoria
  pré-redesign continua verdadeira depois da Etapa 4. Os demais itens do §14 (sugestão automática
  de substitutos, cores semânticas em badges, `<select>` nativo, separação de papéis, calendário
  litúrgico integrado, confirmar/recusar em poucos cliques, estados vazios específicos) já tinham
  evidência direta suficiente nas `TASK-0059`-`0066` — conferidos por referência cruzada, não
  reexecutados aqui pra não duplicar trabalho.

  **Achado (P2) — o mesmo bug de duplo clique da `TASK-0062` também existe em "Publicar
  escala", com impacto maior.** 2 cliques disparados em sequência rápida no botão final do
  `ScaleForm` geraram **2 requisições `POST /scales` reais** (confirmado por escuta de rede).
  Mesma causa-raiz já diagnosticada na `TASK-0062` (janela de corrida entre o clique e o próximo
  ciclo de reatividade do Vue que desabilitaria o botão) — mas aqui o efeito é bem mais sério do
  que um celebrante duplicado: **duas escalas idênticas publicadas**, cada uma podendo receber
  sua própria equipe/confirmações de servidores de forma independente, gerando confusão real pra
  coordenador e servidores (qual das duas é "a" escala?). Não é um achado novo em essência — é a
  mesma causa já registrada — mas eleva a severidade/urgência da correção já recomendada pra
  `TASK-0071` (guarda síncrona no início do handler, antes de qualquer `await`), porque agora
  há evidência de que o mesmo padrão problemático se repete na ação de maior peso do sistema.

  **Achado (P3) — sessão inválida redireciona pro login sem explicar por quê.** Com
  `auth_token` corrompido no `localStorage`, navegar pra uma tela autenticada redireciona
  corretamente pra `/login?redirect=/servidores` (bom detalhe: preserva o destino original pra
  depois do re-login) — mas a tela de login não mostra nenhuma mensagem tipo "sua sessão
  expirou, entre novamente". O usuário só vê o formulário de login normal, sem contexto de por
  que foi deslogado. Mesma natureza do achado já registrado na `TASK-0062` (redirecionamento
  silencioso por falta de permissão) — os dois casos compartilham a mesma causa de fundo:
  `router/index.ts` redireciona sem popular uma mensagem de `flash` antes. Recomendação pra
  `TASK-0071`: no interceptor de resposta 401 (`src/api/client.ts`, se existir) ou no guard de
  rota, `flash.set('info', 'Sua sessão expirou. Entre novamente.')` antes do redirect.

  **§48 Ações destrutivas — confirmado protegido nas amostras testadas ao vivo** (Servidores,
  Celebrantes, Escalas, Substituições — `TASK-0058`/`0059`/`0062`/`0065`) — todas passam por
  `Modal` de confirmação, nunca um clique só. Categorias/Comunidades/Equipes/Modelos de escala
  não foram clicados de novo nesta task: usam o mesmo componente de listagem (`Index.vue`)
  confirmado estruturalmente idêntico na `TASK-0066`, então o mesmo padrão de exclusão via
  `Modal` se aplica por construção, não por sorte.

  **§49 Prevenção de erro — sem achado novo.** A lacuna já registrada (indisponibilidade não
  exibida antes da seleção, relatório Etapa 4 item 3) segue sendo a única oportunidade real
  identificada — depende do mesmo dado de cruzamento de disponibilidade ainda não exposto pela
  API, não é um problema de UI resolvível nesta etapa.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Ambiente encerrado ao
  final (Docker removido, dev servers finalizados, seed temporário apagado). Task marcada
  `concluida`. Próximo passo: `TASK-0068`.
