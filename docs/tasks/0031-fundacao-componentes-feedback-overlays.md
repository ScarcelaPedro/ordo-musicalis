---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0031 — Fundação: componentes base — feedback e overlays

**Task ID**: `TASK-0031`

## Objetivo

Implementar os componentes de feedback e sobreposição especificados em
`docs/tasks/0022-componentes-feedback-overlays.md`: `Badge` (migrar tokens), `Alert` (novo),
`Toast` (reaproveita `stores/flash.ts`, só muda posicionamento de inline para flutuante),
`Modal` (novo), `Drawer` (generaliza o mecanismo já usado no menu lateral de
`AuthenticatedLayout.vue`), `EmptyState`, `Loading`/`Skeleton`, `ErrorState` (novos, padronizam
o que hoje é texto simples/spinner ad-hoc por tela). Inclui também **`Tooltip`**, componente
citado em SPEC-003 §52/SPEC-004 §8 que não recebeu uma task própria de especificação na Etapa 3
— achado registrado aqui: por ser um primitivo pequeno e de baixo risco (balão de texto ao
hover/focus, principal uso é reforço visual de `aria-label` em `IconButton`), é especificado
diretamente nesta task de implementação em vez de voltar à Etapa 3 para um novo ciclo de
design.

## Arquivos/componentes envolvidos

- `src/components/Badge.vue` — editar (migrar cores para tokens, manter API/props atuais).
- `src/components/FlashMessage.vue` → vira a base do `Toast.vue` (reposicionar para flutuante,
  adicionar tipo `warning` que falta hoje); `src/stores/flash.ts` — **não reescrever a lógica**,
  só usar como está (já tem auto-dismiss de 4s, confirmado em `docs/tasks/0022-*.md`).
- `src/components/Alert.vue`, `Modal.vue`, `Drawer.vue`, `Tooltip.vue`, `EmptyState.vue`,
  `Skeleton.vue`, `ErrorState.vue` — criar.
- `src/layouts/AuthenticatedLayout.vue` — **não alterar nesta task** (o `Drawer` genérico é
  extraído do mecanismo já existente ali, mas a integração/substituição do menu lateral em si
  fica para a task de layout, `TASK-0034`).

## Comportamento esperado

`Toast` mantém o comportamento hoje já correto (auto-dismiss 4s, uma mensagem por vez), só muda
de posição. `Alert` não some sozinho. `Modal`/`Drawer` fecham por botão, clique fora e tecla
Esc, com foco preso dentro do overlay enquanto aberto (acessibilidade — SPEC-004 §10).
Confirmação padrão (substituindo `confirm()` nativo) é uma aplicação do `Modal`, não um
componente à parte.

## Dependências

- `TASK-0029` — tokens.
- `TASK-0030` — `Button`/`IconButton` usados dentro de `Modal`/`Alert`/`Toast`.

## Critérios de conclusão

- [x] `Badge` com os 9 estados de `docs/tasks/0022-*.md`, tokens migrados, API compatível com o
      uso atual (`color` prop) para não quebrar nenhuma tela que já usa `Badge.vue`.
- [x] `Toast` flutuante, reaproveitando `flash.ts` sem alterar sua lógica; tipo `warning`
      adicionado.
- [x] `Alert` com 4 tipos (informação/sucesso/aviso/erro), sem auto-dismiss.
- [x] `Modal` com overlay, fechamento por Esc/clique fora/botão, `role="dialog"` e
      `aria-modal="true"`, foco preso dentro enquanto aberto.
- [x] `Drawer` generalizando o mecanismo de slide-in já usado no menu lateral (mesma transição,
      200ms).
- [x] `Tooltip` acessível (aparece em hover e em focus via teclado, não só mouse).
- [x] `EmptyState`/`Skeleton`/`ErrorState` com a estrutura já definida (título+explicação+ação;
      blocos pulsantes no formato do conteúdo; mensagem humana+próximo passo).
- [x] `npm run build` passa sem erros.
- [x] Nenhuma tela existente foi alterada (componentes ainda não adotados) — confirmado via
      `git status`: só `src/components/`, `src/stores/flash.ts`,
      `tailwind.config.js`/`app.css`/`package.json`.

## Decisões de implementação

- **Badge**: mantida a API (`color: 'green'|'yellow'|'red'|'blue'|'purple'|'gray'`) idêntica —
  as 9 estados do Design System já são representáveis com as cores existentes (ex. Confirmado→
  green, Pendente→yellow, Rascunho→gray); só a implementação interna passou a referenciar os
  tokens semânticos (`bg-success-100` em vez de `bg-green-100`), sem qualquer mudança de CSS
  gerado (`ADR-0001`: os tokens já são aliases das mesmas famílias).
- **Toast/FlashMessage**: **não substituí `FlashMessage.vue`** — criei `Toast.vue` como um
  componente novo, paralelo, lendo a mesma store `flash.ts`. Trocar o que
  `AuthenticatedLayout.vue` renderiza é uma mudança de tela, fora do escopo desta task
  (fica para `TASK-0034`/`0035`). Os dois componentes coexistem até essa migração.
- **Foco preso em `Modal`/`Drawer`**: implementado à mão (ciclo de Tab manual via listener de
  teclado), sem adicionar `focus-trap` ou dependência equivalente — resolve o risco já previsto
  na task sem introduzir biblioteca nova (SPEC-004 §62).
- **`Tooltip`**: nota registrada no próprio componente — ele é reforço visual, não a fonte
  primária de nome acessível; o elemento disparador (ex. `IconButton`) já carrega seu próprio
  `aria-label`, que é o que leitores de tela de fato anunciam.

## Riscos

- Foco preso (focus trap) dentro de `Modal`/`Drawer` sem biblioteca de terceiros exige
  implementação manual cuidadosa (Vue não tem isso nativo) — avaliar se vale a pena uma
  dependência pequena e madura (ex. `focus-trap`) versus implementar à mão; se optar por
  dependência nova, justificar em `docs/decisions/` (SPEC-004 §62 pede evitar bibliotecas
  desnecessárias, mas acessibilidade de foco é um requisito real, não decorativo).
- `stores/flash.ts` é usado hoje por várias telas — mudar `FlashMessage.vue` de posição sem
  quebrar nenhum consumidor exige teste manual em pelo menos 3 telas diferentes.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §8, §9, §10, §38–42.
- `docs/tasks/0022-componentes-feedback-overlays.md` (especificação completa).
- [`docs/design-system.md`](../design-system.md) — seção 7, 9.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004. Inclui `Tooltip`, gap de
  especificação da Etapa 3 resolvido diretamente aqui (ver Objetivo).
- 2026-08-24 — Task reivindicada e executada. Adicionado tipo `warning` a `FlashType` em
  `stores/flash.ts` (mudança aditiva, não quebra nenhum `flash.set('success'|'error'|'info', ...)`
  já existente). Criados `Toast`, `Alert`, `Modal`, `Drawer`, `Tooltip`, `EmptyState`,
  `ErrorState`, `Skeleton`; `Badge` migrado internamente para tokens sem mudar API/CSS gerado.
  Erro de build corrigido: `vue-tsc` não resolveu `aria-label` (kebab) para a prop `ariaLabel`
  (camelCase) do `IconButton` em contexto de type-check — usado `:ariaLabel` diretamente nos 2
  pontos afetados (`Modal.vue`, `Drawer.vue`). `npm run build` validado com sucesso. Nenhuma
  tela/layout tocada — `FlashMessage.vue` e `AuthenticatedLayout.vue` continuam exatamente como
  estavam, a integração fica para as tasks de layout. Task marcada `concluida`. Próximo passo:
  TASK-0032 (componentes de estrutura e dados) já está elegível.
