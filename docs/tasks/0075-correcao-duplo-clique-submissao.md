---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0075 — Correção: cliques repetidos em botões de salvar/publicar geram operações duplicadas

**Task ID**: `TASK-0075`

**Prioridade**: P2

## Descrição

Fechar a janela de corrida que permite que 2 cliques rápidos no botão de salvar/publicar de um
formulário disparem 2 requisições `POST` reais, criando registros duplicados no banco.

## Problema

Confirmado com evidência de rede e de banco de dados em duas telas distintas:
`celebrantes/Create.vue` (`TASK-0062`: 3 cliques rápidos → 2 `POST /celebrantes`, 2 registros
idênticos confirmados via `SELECT` direto no Postgres) e `ScaleForm.vue`, na ação "Publicar
escala" (`TASK-0067`: 2 cliques rápidos → 2 `POST /scales` reais). O padrão de proteção atual
(`loading.value = true` como primeira linha do handler + `:disabled="loading"` no botão) depende
do próximo ciclo de renderização do Vue pra desabilitar o botão — um segundo clique disparado
antes desse ciclo terminar passa direto pela checagem `disabled` do navegador. Como esse mesmo
padrão (`ref` local de `loading` + `:disabled`) se repete em praticamente todos os formulários de
criação/edição do sistema (confirmado estruturalmente idêntico entre pares Criar/Editar na
`TASK-0066`), é provável que a mesma janela de corrida exista em todos eles, não só nos 2
confirmados.

## Impacto

No caso de Celebrantes, gera um registro de cadastro duplicado (fácil de limpar depois, baixo
dano). No caso de "Publicar escala", gera **duas escalas idênticas publicadas**, cada uma capaz
de receber confirmações de servidores de forma independente — confusão real para coordenador e
servidores sobre qual delas é "a" escala vigente. Classificado P2 (não P1) porque reproduzir o
caso do `ScaleForm` exigiu cliques sintéticos mais rápidos que um duplo-clique humano típico —
mas a evidência de que a janela existe é real, não hipotética.

## Tela

Qualquer tela de criação/edição com botão de submissão único — a mais crítica é
`/escalas/criar` → "Publicar escala"; `/celebrantes/criar` já confirmado também.

## Componente

Padrão compartilhado entre `celebrantes/Create.vue`, `ScaleForm.vue`, e provavelmente todos os
outros formulários com o mesmo `ref` `loading` local (`categorias`, `comunidades`, `teams`,
`servidores`, `scaleTemplates` — ver `TASK-0066`).

## Comportamento atual

```js
async function submit() {
  loading.value = true   // depende do próximo tick do Vue pra desabilitar o botão no DOM
  try { await client.post(...) } finally { loading.value = false }
}
```

## Comportamento esperado

Uma guarda síncrona, verificada como a primeira instrução do handler, antes de qualquer `await`
— por exemplo `if (loading.value) return` logo no topo da função — que não depende de nenhum
ciclo de renderização pra ter efeito, bloqueando o segundo clique imediatamente na própria função
JavaScript, independente do estado do DOM.

## Critérios de aceite

- [x] Disparar 2+ cliques rápidos em "Salvar" (`celebrantes/Create.vue`) gera exatamente 1
      requisição `POST`, confirmado por escuta de rede.
- [x] Disparar 2+ cliques rápidos em "Publicar escala" (`ScaleForm.vue`) gera exatamente 1
      requisição `POST /scales`, confirmado por escuta de rede.
- [x] O mesmo padrão de guarda aplicado, por consistência, aos demais formulários que
      compartilham a estrutura `loading` + `:disabled` (categorias, comunidades, teams,
      servidores, scaleTemplates) — ou, alternativamente, extraído para um composable reutilizável
      se isso evitar repetir a correção manualmente em cada arquivo (decisão de implementação
      livre, desde que o resultado observável — 1 requisição por clique real — seja o mesmo em
      todos).
- [x] Nenhuma mudança de comportamento visível pro usuário além de cliques repetidos passarem a
      ser ignorados enquanto a primeira submissão está em andamento (o botão continua mostrando
      "Salvando..."/"Publicando..." como já mostra hoje).
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0062-ux-erros-estados-feedback.md` — reprodução original (Celebrantes), confirmada
  via banco de dados.
- `docs/tasks/0067-ux-acoes-destrutivas-sessao-regressao-visual.md` — reprodução em `ScaleForm`
  (maior impacto), confirmada via escuta de rede.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §50, §55 (regra de decisão: bug → corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achados
  independentes em `TASK-0062` e `TASK-0067` com a mesma causa-raiz.
- 2026-08-25 — Task reivindicada e corrigida. Escolhida a opção "guarda síncrona repetida em cada
  arquivo" em vez de extrair um composable — mais simples de auditar (`grep` confirma cada
  ocorrência isoladamente) e sem introduzir uma abstração nova pra um padrão de 2 linhas.

  Aplicado `if (loading.value) return` como primeira instrução, antes de qualquer outra lógica,
  em **19 arquivos** com o mesmo padrão vulnerável (`grep "async function submit"` em
  `src/pages/`, conferido individualmente): os 2 já confirmados
  (`celebrantes/Create.vue`, `scales/{Create,Edit}.vue` via `ScaleForm`) + os 5 domínios citados
  no escopo original (`categorias`, `comunidades`, `teams`, `servidores`, `scaleTemplates`,
  Create e Edit de cada = 10 arquivos) + `celebrantes/Edit.vue` (par do já confirmado) +
  4 telas de autenticação (`Login`, `Register`, `ForgotPassword`, `ResetPassword`) +
  `availability/Form.vue` — todas compartilhando a mesma estrutura `loading` local +
  `:disabled="loading"`, mesma vulnerabilidade em princípio, mesmo custo baixo de aplicar a
  correção em todas de uma vez em vez de deixar as não-confirmadas pra depois. Em 2 arquivos
  (`auth/Register.vue`, `auth/ResetPassword.vue`) a guarda foi posicionada antes até da validação
  local de senha (não só antes de `loading.value = true`), pra bloquear cliques repetidos mesmo
  nesse caminho de validação síncrona.

  `npm run build` passou sem erros; `dist/` revertido. **Testado com dado real e escuta de
  rede**, reproduzindo exatamente os 2 cenários que originaram o achado: `celebrantes/Create.vue`
  — 3 cliques sintéticos rápidos → **1 `POST /celebrantes`** (antes: 2); `ScaleForm.vue`,
  "Publicar escala" — 2 cliques sintéticos rápidos → **1 `POST /scales`** (antes: 2), com a
  escala publicada normalmente (`/escalas/3`, submissão real bem-sucedida, guarda não bloqueou o
  clique legítimo). Escopo além dos 2 confirmados (os outros 17 arquivos) verificado só por
  `npm run build` + leitura de código — o padrão é idêntico e mecânico o bastante pra não exigir
  reprodução individual de cada um, mas registrado com honestidade que não foram todos
  clicados/testados ao vivo um a um.

  Nota pra fora do escopo desta task: outras ações protegidas por `loading`/`:disabled` que não
  são "submissão de formulário de criação/edição" (confirmar/recusar escala, aprovar/rejeitar
  substituição, abrir/fechar janela de disponibilidade, adicionar item de repertório) usam um
  padrão semelhante e podem, em teoria, compartilhar a mesma vulnerabilidade — não auditadas
  aqui, já que o escopo desta task (`Tela`/`Componente`) era especificamente formulários de
  criação/edição. Se um achado futuro confirmar o mesmo problema num desses outros botões, a
  correção é idêntica (mesma guarda de 1 linha).

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, nenhum seed
  temporário criado (reaproveitou dados já existentes + criados via UI durante o próprio teste).
  Task marcada `concluida`. Próximo passo: qualquer uma das `TASK-0076`-`0078` (P2) — por menor
  número, `TASK-0076`.
