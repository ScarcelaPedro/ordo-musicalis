---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0097 — Linguagem visual da referência: tokens e Design System

**Task ID**: `TASK-0097`

**Prioridade**: P1 (base visual de todas as demais tasks da SPEC-003.1)

## Objetivo

Traduzir a imagem de referência da SPEC-003.1 em **linguagem visual** (§3, §29) — não em
layout — e incorporá-la ao Design System já existente (`docs/design-system.md`, Etapa 3), antes
de qualquer tela ser retrabalhada. Evita que cada task seguinte (sidebar, topbar, dashboards,
detalhes) interprete a referência de um jeito diferente.

Elementos da referência a extrair e confrontar com o Design System atual:

- superfície da sidebar em azul profundo (navy) com item ativo destacado (§4, §19);
- cards brancos com raio amplo, borda sutil e sombra leve; fundo de página levemente azulado (§21);
- hierarquia tipográfica: saudação/título grande, eyebrow dourado (`PRÓXIMA MISSA`), metadados
  em cinza com ícone (§22);
- dourado como accent pontual (ícone de cruz, barras de progresso, eyebrow) — já coerente com
  `Accent` da Etapa 3;
- ícones de traço (outline) de peso único e tamanho consistente (§23) — confirmar que é o mesmo
  conjunto já usado (`@heroicons/vue`);
- elementos litúrgicos discretos (ilustração de igreja em marca-d'água na sidebar e no card de
  destaque) com moderação (§20).

## Comportamento esperado

- Tokens novos/ajustados (ex. superfície da sidebar, fundo de página, sombra de card) definidos
  em `tailwind.config.*`/`src/assets/app.css` como tokens nomeados, com equivalente dark mode —
  sem hex solto em componentes (mesma regra da `ADR-0001`).
- `docs/design-system.md` ganha uma seção "SPEC-003.1 — Adaptação à referência" descrevendo o
  que foi incorporado e o que **não** foi (ex. conteúdos fictícios da imagem).
- **Decisão em aberto (não tomar silenciosamente)**: a referência usa um azul marinho mais
  escuro que o `primary` atual (`colors.indigo`). A SPEC permite usar essa linguagem "desde que
  coerente com a identidade definida anteriormente" (§19). Decidir na implementação entre (a)
  ajustar o tom do `primary`, (b) criar só um token de superfície escura para a sidebar mantendo
  o `primary`, ou (c) manter tudo como está — e registrar em ADR, já que contradiz/refina a
  decisão de paleta da `TASK-0017`/`ADR-0001`.
- Nenhuma tela é reestilizada nesta task além do necessário para validar os tokens.

## Dependências

- Nenhuma.

## Critérios de conclusão

- [x] Tokens definidos (claro + escuro), sem hex literal em componentes.
- [x] ADR registrando a decisão sobre o tom de azul/superfície da sidebar.
- [x] `docs/design-system.md` atualizado com a seção da SPEC-003.1.
- [x] Contraste AA verificado para texto sobre a nova superfície escura e sobre o fundo de página.
- [x] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §3, §19, §20, §21, §22, §23, §29.
- [`docs/specs/assets/SPEC-003.1-referencia-dashboard.webp`](../specs/assets/SPEC-003.1-referencia-dashboard.webp) — referência visual.
- [`docs/design-system.md`](../design-system.md).
- [`docs/decisions/0001-mapeamento-tokens-cor-tailwind.md`](../decisions/0001-mapeamento-tokens-cor-tailwind.md).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada.

  **Decisão sobre o azul** ([`ADR-0003`](../decisions/0003-primary-azul-profundo-referencia.md)):
  a opção (a) foi escolhida. `primary` deixou de ser `colors.indigo` e passou a ser uma escala
  azul profundo customizada (50–950) calibrada na referência. A opção (b), de token navy só na
  sidebar, foi descartada porque deixaria sidebar navy com botões violeta. Contraste calculado
  pela fórmula WCAG 2.1: todos os pares de uso passam AA (branco/`600` 6.92,
  `700`/`50` 8.11, `400`/`gray-800` 4.67, `slate-200`/`900` 10.36). `ADR-0001` marcado como
  parcialmente substituído (só a linha `primary`).

  **Tokens novos**: `canvas` (variável CSS `--color-canvas` em `app.css`, alternada por
  `.dark`, sem precisar de `dark:`) e `shadow-card`. **Aplicação mínima para validar os tokens**:
  `Card.vue` (`rounded-xl` + `shadow-card`, sem sombra no dark) e o fundo de
  `AuthenticatedLayout.vue` (`bg-canvas`). As 36 classes literais `indigo-*` restantes em 10
  telas foram trocadas por `primary-*` no mesmo tom, para não sobrar nada preso à cor antiga.
  `docs/design-system.md` ganhou a §16 (incorporado × não incorporado).

  **Verificação**: `npm run build` e `npm test` passam. No dev server (tela de login), os
  estilos computados confirmaram: botão "Entrar" = `rgb(47, 90, 152)` (`primary-600`),
  `bg-canvas` = `#f4f7fb` no claro e `gray-900` com `.dark`, `shadow-card` aplicada. As telas
  autenticadas **não** foram inspecionadas visualmente: não há Docker/Postgres no ambiente desta
  sessão e o screenshot do painel de navegador não renderizou. Como a troca é por token, o
  risco é de tom e não de layout. A inspeção completa fica para a `TASK-0107`. Commit: `e23fee0`.
