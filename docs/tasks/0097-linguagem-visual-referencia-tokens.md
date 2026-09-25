---
status: em-andamento
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

- [ ] Tokens definidos (claro + escuro), sem hex literal em componentes.
- [ ] ADR registrando a decisão sobre o tom de azul/superfície da sidebar.
- [ ] `docs/design-system.md` atualizado com a seção da SPEC-003.1.
- [ ] Contraste AA verificado para texto sobre a nova superfície escura e sobre o fundo de página.
- [ ] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §3, §19, §20, §21, §22, §23, §29.
- [`docs/specs/assets/SPEC-003.1-referencia-dashboard.webp`](../specs/assets/SPEC-003.1-referencia-dashboard.webp) — referência visual.
- [`docs/design-system.md`](../design-system.md).
- [`docs/decisions/0001-mapeamento-tokens-cor-tailwind.md`](../decisions/0001-mapeamento-tokens-cor-tailwind.md).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
