---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0082 — Correção: mensagens de erro genéricas não distinguem falha de rede

**Task ID**: `TASK-0082`

**Prioridade**: P3

## Descrição

Diferenciar, na mensagem de erro mostrada ao usuário, uma falha de conexão (sem resposta do
servidor) de um erro de validação/negócio retornado pelo backend.

## Problema

Confirmado na `TASK-0062`: com a rede desligada (`context.setOffline`, testado como falha de uma
requisição dentro da SPA já carregada, não um `reload`), submeter `celebrantes/Create.vue`
mostrou "Erro ao criar celebrante" — o fallback genérico já existente no código
(`e.response?.data?.message ?? 'Erro ao criar celebrante'`). A mensagem é compreensível, mas não
diz que o problema é de conexão — o usuário não sabe se deve verificar a internet ou tentar de
novo mais tarde. Esse padrão de fallback genérico se repete em praticamente todos os formulários
do sistema (mesma estrutura de `try/catch`).

## Impacto

Baixo — o usuário sempre recebe algum feedback (não fica sem nada), e o dado preenchido não se
perde (já confirmado). Mas a mensagem não ajuda a diagnosticar a causa real do problema.

## Tela

Qualquer formulário de criação/edição — reproduzido em `celebrantes/Create.vue`, mas o padrão é
compartilhado.

## Componente

Padrão de `catch` compartilhado entre os formulários; possivelmente um interceptor central em
`src/api/client.ts`, se existir, é o lugar certo para essa distinção em vez de repetir a lógica
em cada tela.

## Comportamento atual

```js
catch (e: any) {
  flash.set('error', e.response?.data?.message ?? 'Erro ao criar X')
}
```

Não distingue `e.response` ausente (falha de rede, sem resposta do servidor) de um erro com
resposta HTTP real.

## Comportamento esperado

Quando `e.response` for `undefined` (requisição não completou — rede fora do ar, timeout),
mostrar uma mensagem específica de conectividade (ex.: "Não foi possível conectar ao servidor.
Verifique sua conexão e tente novamente."), preservando a mensagem específica do backend quando
ela existir.

## Critérios de aceite

- [x] Com a rede desligada, submeter um formulário mostra uma mensagem que menciona conexão/rede,
      não o fallback genérico atual.
- [x] Com uma resposta de erro real do backend (ex.: validação), a mensagem específica do
      backend continua sendo mostrada normalmente (sem regressão).
- [x] Dado preenchido continua preservado em caso de erro (comportamento já correto, não deve
      mudar).
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0062-ux-erros-estados-feedback.md` — achado original.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §16, §51, §55 (regra de decisão: problema de
  UX → avaliar o fluxo).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0062`.
- 2026-08-26 — Task reivindicada e corrigida, seguindo exatamente a sugestão já registrada no
  texto original da task ("possivelmente um interceptor central em `src/api/client.ts`... em vez
  de repetir a lógica em cada tela") — confirmada como a abordagem certa: `grep` por
  `e.response?.data?.message` mostra dezenas de ocorrências do mesmo padrão em praticamente todo
  formulário do sistema (`celebrantes`, `comunidades`, `categorias`, `servidores`, `teams`,
  `scaleTemplates`, `scales`, `auth`...). Corrigir arquivo por arquivo seria não só mais
  trabalho como um risco real de inconsistência (esquecer um, redigir a mensagem de forma
  ligeiramente diferente em outro).

  A correção fica inteira no interceptor de resposta que já existe em `client.ts` (usado hoje só
  pro caso 401/logout): quando `error.response` vem `undefined` — o único jeito de saber que a
  requisição não recebeu resposta nenhuma do servidor, seja por rede fora do ar, timeout, ou
  bloqueio de CORS — sintetizo `error.response = { data: { message: 'Não foi possível conectar
  ao servidor. Verifique sua conexão e tente novamente.' } }` antes de rejeitar a promise. Como
  todo `catch` do sistema já lê `e.response?.data?.message ?? 'mensagem genérica da tela'`, essa
  única mudança faz a mensagem de rede aparecer em toda tela automaticamente, sem tocar em
  nenhum dos formulários — e um erro real do backend (que já vem com `error.response` preenchido)
  passa batido pela minha checagem `if (!error.response)`, preservando a mensagem específica do
  backend sem nenhuma mudança. Confirmado por `grep` antes de implementar que **nenhum outro
  lugar do código** depende de `error.response` ser `undefined`/falsy pra alguma outra decisão
  além de ler `.data.message` — só o próprio interceptor usa `error.response?.status` (pro
  check de 401), então sintetizar um `response` fake não interfere em nada mais.

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real, reproduzindo exatamente o método já usado na
  `TASK-0062`** (`context.setOffline`, falha de uma requisição dentro da SPA já carregada, não
  um reload da página): login real, ir pra `/celebrantes/criar`, preencher o campo Nome, aí sim
  desligar a rede (`context.setOffline(true)`) e submeter. Resultado: toast vermelho com "Não foi
  possível conectar ao servidor. Verifique sua conexão e tente novamente." (não mais o fallback
  genérico "Erro ao criar celebrante"); campo "Nome" continua preenchido com o valor digitado
  (nenhuma perda de dado); usuário continua na tela de criação (não navegou, exatamente o
  comportamento esperado de uma submissão que falhou). **Regressão verificada em dois ângulos**:
  (1) login com senha errada (erro real do backend, HTTP 401 com corpo) mostra "Credenciais
  inválidas" normalmente, sem menção a conexão — confirma que a mensagem de rede não vaza pra
  erros reais; (2) criar um celebrante com a rede normal mostra "Celebrante criado com sucesso!"
  como sempre — confirma que a mudança no interceptor não afeta o caminho de sucesso. Screenshot
  do cenário offline inspecionado visualmente: toast, ícone e cor de erro corretos, formulário
  intacto.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido (nenhum seed
  extra precisou ser criado desta vez — a correção não depende de nenhum dado específico). Task
  marcada `concluida`. Próximo passo: `TASK-0083` (P3, seguinte na fila por número).
