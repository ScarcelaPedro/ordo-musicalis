---
status: concluida
modulo: src/pages/auth
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0089 — Design System: telas de autenticação

**Task ID**: `TASK-0089`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `auth/{Login,Register,ForgotPassword,ResetPassword}.vue` para os componentes/tokens do
Design System — parte 1 de 10 do desmembramento da `TASK-0077`.

## Escopo

- `src/pages/auth/Login.vue`
- `src/pages/auth/Register.vue`
- `src/pages/auth/ForgotPassword.vue`
- `src/pages/auth/ResetPassword.vue`

## Comportamento esperado

As 4 telas já usam `InputLabel`/`TextInput`/`InputError`/`PrimaryButton` (migrados desde a
Fundação) e já têm o `for`/`id` corrigido (`TASK-0069`) — o que falta é principalmente
tipografia: título/mensagens ainda não usam a escala `text-h1`-`h4`/`body`/`caption` de forma
consistente com o restante do sistema (`GuestLayout.vue` já define a moldura visual; conferir se
o título "Ordo Musicalis" dentro dele segue o token certo). Revisar as 4 telas juntas, já que
compartilham a mesma estrutura (`GuestLayout` + `form` + `InputError` + `PrimaryButton`) —
qualquer ajuste de tipografia deve ser aplicado de forma idêntica nas 4 pra não criar uma nova
inconsistência entre elas.

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] As 4 telas revisadas quanto a tipografia/espaçamento contra `docs/design-system.md`.
- [x] Nenhuma mudança de campo, validação ou comportamento de submit.
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop) — screenshot ou navegação real, não só leitura de
      código.

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe, com o achado original
  completo (`TASK-0057`).
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento).
- 2026-08-25 — Task reivindicada e corrigida. Leitura completa das 4 telas (`Login.vue`,
  `Register.vue`, `ForgotPassword.vue`, `ResetPassword.vue`) mais `GuestLayout.vue` (moldura
  visual compartilhada): confirmado que a maior parte do trabalho de Design System já estava
  feita por tasks anteriores — `InputLabel`/`TextInput`/`InputError`/`PrimaryButton` desde a
  Fundação, `for`/`id` correto desde a `TASK-0069`, guarda de duplo clique desde a `TASK-0075`.
  Restavam só 2 pontos de tipografia:

  1. `GuestLayout.vue` — título "Ordo Musicalis" usava `text-3xl font-bold` (literal) em vez do
     token `text-display` do Design System (que já embute peso 700). Trocado por `text-display`.
     Como as 4 telas de auth compartilham este layout, a correção vale para as 4 de uma vez —
     não precisou editar `Login.vue`/`Register.vue`/`ResetPassword.vue` individualmente.
  2. `ForgotPassword.vue` — mensagem de sucesso usava cor literal `text-green-700
     dark:text-green-400` em vez do token semântico `text-success-700 dark:text-success-400`
     (mapeia pra `colors.green` no `tailwind.config.js` — mudança de nomenclatura, não de cor).

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real** (Docker Postgres + seed padrão, sem seed extra —
  as 4 telas de auth não exigem dado além do usuário admin já seedado): Playwright cobrindo as 4
  rotas (`/login`, `/register`, `/forgot-password`, `/reset-password?...`) × 2 temas × 2
  viewports (mobile 390px, desktop 1440px). Confirmado via `getComputedStyle` que o `<h1>`
  renderiza 36px/700 (token `text-display`) nas 4 telas em todas as combinações.

  Para a mensagem de sucesso, o endpoint real `/api/auth/forgot-password` retornou 500 neste
  ambiente sandbox (Resend API key não configurada — limitação de infraestrutura de dev, fora do
  escopo desta task). Para exercitar o caminho real de renderização do componente sem mascarar
  o problema, interceptei a resposta via `page.route(...).fulfill(200, {message: "Se o email
  existir, um link foi enviado."})` — mesma técnica já usada na `TASK-0076`. Resultado: cor
  computada `rgb(21,128,61)` no claro e `rgb(74,222,128)` no escuro — idênticas a `green-700`/
  `green-400` (`#15803d`/`#4ade80`), confirmando zero regressão visual na troca de token.
  Screenshots capturadas em ambas as combinações e inspecionadas visualmente — layout, contraste
  e alinhamento corretos em mobile e desktop, claro e escuro.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, script de
  verificação e screenshots temporários apagados (nunca commitados). Task marcada `concluida`.
  Próximo passo: `TASK-0090` (Design System: perfil e repertório), P2, desmembrada da
  `TASK-0077`.
