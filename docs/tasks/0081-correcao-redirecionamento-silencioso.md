---
status: concluida
modulo: src/router
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0081 — Correção: redirecionamento sem explicação por falta de permissão ou sessão expirada

**Task ID**: `TASK-0081`

**Prioridade**: P3

## Descrição

Adicionar uma mensagem de `flash` explicando o motivo sempre que o guard de rota redirecionar um
usuário por falta de permissão ou por sessão inválida/expirada.

## Problema

Dois cenários confirmados com a mesma causa de fundo, em `src/router/index.ts`
(`router.beforeEach`): (1) `TASK-0062` — um `musico` acessando uma rota restrita a
`admin`/`coordenador` (ex. `/celebrantes`) é corretamente redirecionado para `/dashboard`, mas
sem nenhuma mensagem explicando por quê; (2) `TASK-0067` — um token de sessão corrompido/inválido
redireciona corretamente para `/login?redirect=...` (preservando o destino original, o que já
está certo), mas a tela de login não mostra nenhuma indicação de que a sessão expirou. Em ambos
os casos, o controle de acesso em si funciona corretamente — só falta o feedback ao usuário.

## Impacto

Baixo — a navegação normal nunca oferece links para telas que o usuário não pode acessar (só
afeta URL digitada manualmente, bookmark antigo ou link compartilhado desatualizado), e uma
sessão expirada é relativamente rara. Mas quando acontece, o usuário fica sem explicação
nenhuma do que ocorreu, contrariando diretamente o §51 ("o usuário deve receber feedback
adequado").

## Tela

Qualquer rota com `meta.roles` (permissão insuficiente) ou `meta.auth` (sessão inválida) — o
efeito é visível em `/dashboard` (destino do redirect por permissão) e `/login` (destino do
redirect por sessão).

## Componente

`src/router/index.ts` (`router.beforeEach`).

## Comportamento atual

```js
if (to.meta.auth && !auth.isAuthenticated) {
  return { name: 'login', query: { redirect: to.fullPath } }
}
// ...
if (roles && auth.user && !roles.includes(auth.user.role)) {
  return { name: 'dashboard' }
}
```

Nenhum dos dois `return` popula uma mensagem de `flash` antes do redirecionamento.

## Comportamento esperado

Antes de cada redirect, definir uma mensagem clara: "Sua sessão expirou. Entre novamente." para o
caso de autenticação; "Você não tem permissão para acessar esta página." para o caso de
permissão insuficiente — usando o mesmo `useFlashStore` já usado no resto do sistema.

## Critérios de aceite

- [x] Acessar uma rota restrita por papel sem permissão suficiente mostra uma mensagem
      explicando o motivo, na tela para onde foi redirecionado.
- [x] Acessar uma rota autenticada com token inválido/expirado mostra uma mensagem de sessão
      expirada na tela de login.
- [x] O comportamento de redirecionamento em si (destinos, preservação de `?redirect=`) não muda.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0062-ux-erros-estados-feedback.md` — achado original (permissão).
- `docs/tasks/0067-ux-acoes-destrutivas-sessao-regressao-visual.md` — achado original (sessão).
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §15, §16, §51, §55 (regra de decisão: bug →
  corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), unificando dois achados
  independentes (`TASK-0062`, `TASK-0067`) com a mesma causa de fundo numa única correção.
- 2026-08-26 — Task reivindicada e corrigida.

  **Achado bloqueante, não previsto no texto original da task**: o critério "mostra uma mensagem
  de sessão expirada na tela de login" é **impossível de cumprir** com o componente que o sistema
  usa hoje (`FlashMessage.vue`) — ele só é renderizado dentro de `AuthenticatedLayout.vue`, e
  `/login` usa `GuestLayout.vue`, que nunca importou nem renderizou nenhum componente de flash.
  Confirmado por `grep`: zero ocorrências de `FlashMessage`/`useFlashStore` em `GuestLayout.vue`
  ou em `App.vue`. Ou seja, mesmo definindo a mensagem certa no `flash` store antes do redirect,
  ela nunca apareceria na tela — um `flash.set()` silencioso, sem efeito visível.

  Investigando a causa, encontrei que o sistema **já tem** um componente `Toast.vue` pronto pra
  isso exato: `<Teleport to="body">`, posicionamento flutuante fixo, ícones por tipo, tokens de
  cor semânticos corretos, reaproveitando a mesma `useFlashStore` — e o próprio comentário do
  componente documenta a intenção original: "Não substitui FlashMessage.vue nesta task... os dois
  convivem até essa migração acontecer" (referindo a uma `TASK-0034` da Etapa 4 que aparentemente
  nunca completou essa troca). `docs/design-system.md` também já documenta essa decisão como
  tomada ("Toast... a especificação reaproveita a store existente, só muda a posição de inline
  pra flutuante"). É exatamente o mesmo padrão já visto repetidas vezes nesta sessão
  (`ErrorState.vue` na `TASK-0076`, `RepertoireItem.vue` na `TASK-0090`, `Tabs.vue` na
  `TASK-0091`) — um componente do Design System já pronto, nunca de fato colocado em uso.

  Completar essa migração pendente é a única forma correta de cumprir o critério desta task (não
  dava pra simplesmente duplicar `<FlashMessage/>` dentro de `GuestLayout.vue` também — isso
  perpetuaria a duplicação que o próprio `Toast.vue` foi desenhado pra eliminar, e um usuário
  autenticado acabaria vendo a mesma mensagem duas vezes: uma vez inline via `FlashMessage`, outra
  flutuante via `Toast`, assim que qualquer flash existente disparasse em página autenticada).
  Escopo da migração, mantido mínimo: `Toast` montado uma vez em `App.vue` (cobre toda rota, dos
  dois layouts, via `Teleport to="body"`); `<FlashMessage/>` e seu import removidos de
  `AuthenticatedLayout.vue`; `FlashMessage.vue` **deletado** (ficou com zero usos reais após a
  troca — só resquícios de comentário/doc em `Toast.vue`/`src/AGENTS.md`, que não contam);
  `src/AGENTS.md` atualizado (citava `FlashMessage` na lista de componentes reutilizáveis,
  trocado por `Toast`).

  **A correção pedida em si** (`src/router/index.ts`, `beforeEach`): duas mensagens novas via
  `flash.set('warning', ...)`, uma antes de cada `return` de redirecionamento — "Sua sessão
  expirou. Entre novamente." (branch `to.meta.auth && !auth.isAuthenticated`) e "Você não tem
  permissão para acessar esta página." (branch `roles && ... !roles.includes(...)`). Ponto de
  cuidado, não mencionado no texto original: o branch de sessão expirada também dispara numa
  visita direta a uma rota protegida por alguém que **nunca** fez login (sem token nenhum) — não
  só num token que expirou de verdade. Mostrar "sua sessão expirou" nesse caso seria enganoso (a
  pessoa nunca teve sessão pra expirar). Capturei `hadToken = !!auth.token` **antes** de chamar
  `fetchMe()` (que, ao falhar, chama `logout()` e apaga o token — depois disso não dá mais pra
  distinguir os dois casos só olhando `auth.token`/`isAuthenticated`) e só mostro a mensagem
  quando `hadToken` for `true`. O caso "nunca logado" continua silencioso, exatamente como hoje
  — cumprindo o critério "o comportamento de redirecionamento em si não muda", que fala só do
  destino/query, mas que eu apliquei também ao silêncio do caso não coberto pelos dois achados
  originais.

  `npm run build` passou sem erros (demorou incomumente ~50s desta vez, sem relação com o
  tamanho da mudança — provavelmente carga do sistema); `dist/` revertido.

  **Testado com dado real e navegação real, cobrindo os 2 cenários do critério de aceite mais 2
  cenários de regressão que a própria investigação levantou**: seed temporário
  `api/prisma/_seedTask0081.ts` (deletado ao final, nunca commitado) criou 1 usuário `musico`
  (não-staff). Playwright cobrindo, cada um login real: (1) `musico` acessando `/celebrantes`
  (staff-only) → redirecionado pra `/dashboard`, toast "Você não tem permissão..." visível —
  confirmado por texto real capturado do elemento `[role="status"]`, não suposição; (2) `admin`
  logado, token corrompido via `localStorage` (simula expiração real), acessando `/servidores` →
  redirecionado pra `/login?redirect=/servidores` (query preservada), toast "Sua sessão
  expirou..." visível **na tela de login** — o teste que prova que a migração Toast realmente
  resolveu o problema, não só teoricamente; (3) visita direta a `/servidores` sem nenhum login
  prévio → mesmo redirecionamento com `?redirect=` preservado, **zero toast visível** (contagem
  do elemento = 0), confirmando que o caso "nunca logado" continua silencioso; (4) regressão —
  criar um celebrante como `admin` autenticado e confirmar que o flash "Celebrante criado com
  sucesso!" ainda aparece corretamente via `Toast` (prova que remover `FlashMessage` de
  `AuthenticatedLayout` não quebrou nenhum flash existente em nenhuma das dezenas de telas que já
  usam `flash.set()`). Screenshots dos 2 cenários principais inspecionadas visualmente: toast
  flutuante no canto inferior direito, ícone de aviso, cor `warning` correta, em ambas as
  páginas.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0082` (P3, correção de
  mensagens de erro de rede — nota: essa task provavelmente também vai tocar o mesmo
  `useFlashStore`/`Toast` agora unificado, o que deve simplificar, não complicar, sua execução).
