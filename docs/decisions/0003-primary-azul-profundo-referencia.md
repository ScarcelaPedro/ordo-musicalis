# 0003 — `primary` passa de `indigo` para escala azul profundo customizada

- **Data**: 2026-09-25
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0003`
- **Task relacionada**: `TASK-0097`

## Contexto

A Etapa 3 (`TASK-0017`) definiu a direção cromática do `Primary` como **azul profundo/mariano**.
Na implementação (`ADR-0001`) esse token virou um alias de `colors.indigo`, por pragmatismo: era
a cor interativa já mais usada e dispensava calibrar uma escala nova sem ferramenta de contraste.

A SPEC-003.1 trouxe uma referência visual (`docs/specs/assets/SPEC-003.1-referencia-dashboard.webp`)
com forte predominância de um azul marinho — sidebar, item ativo, botão principal, marcador de
"Hoje" — e autoriza usar essa linguagem "desde que coerente com a identidade definida
anteriormente" (§19). O `indigo` do Tailwind puxa para o violeta (`#4f46e5`) e fica visivelmente
distante tanto da referência quanto do "azul mariano" que a própria Etapa 3 descreveu.

## Decisão

`primary` em `tailwind.config.js` passa a ser uma escala customizada de 11 tons (50–950), hue
~215°, calibrada a partir da referência (`600 = #2f5a98`, `800 = #1e3d6b`, `900 = #1a3259`).
Os demais tokens do `ADR-0001` (`secondary`, `accent`, `neutral`, `success`, `warning`, `danger`,
`info`) **não mudam**. As 36 classes literais `indigo-*` que ainda restavam em `src/` foram
trocadas por `primary-*` no mesmo tom, para que nada fique preso à cor antiga.

Na mesma task foram criados dois tokens de apoio da linguagem da referência:

- `canvas` — fundo de página ciente do tema (variável CSS `--color-canvas` em
  `src/assets/app.css`: `#f4f7fb` no claro, `gray-900` no escuro).
- `shadow-card` — sombra leve com tom azulado, usada pela Elevation 1 do `Card.vue`.

Contraste WCAG verificado por cálculo (fórmula de luminância relativa WCAG 2.1):

| Par | Razão |
|---|---|
| branco sobre `primary-600` (botão) | 6.92 |
| `primary-600` sobre branco (link) | 6.92 |
| `primary-700` sobre `primary-50` (item ativo) | 8.11 |
| `primary-500` sobre branco (borda/ícone, mínimo 3:1) | 4.81 |
| `primary-300` sobre `gray-800` (dark mode) | 7.07 |
| `primary-400` sobre `gray-800` (dark mode) | 4.67 |
| `slate-200` sobre `primary-900` (texto da sidebar escura) | 10.36 |

Todos atendem AA. O `indigo-600` anterior dava 6.29 com texto branco, então o botão principal
ficou com contraste melhor.

## Alternativas consideradas

- **Manter `primary = indigo` e criar só um token de superfície navy para a sidebar**:
  descartada. A sidebar ficaria navy e todos os botões e links continuariam violeta, uma
  incoerência visível que a referência não tem. Além disso, o `indigo` é justamente o desvio da
  direção "azul mariano" da Etapa 3 que esta task tem a chance de corrigir.
- **Usar `colors.blue` do Tailwind como `primary`**: descartada. `blue` já é o token `info`
  (`ADR-0001`); marca e informação neutra ficariam idênticos.
- **Manter tudo como está**: descartada pelo mesmo motivo da primeira alternativa. A
  preocupação do `ADR-0001` com não calibrar uma escala à mão foi resolvida com a verificação
  de contraste acima.

## Consequências

- Toda a interface muda de tom de azul de uma vez, sem edição tela a tela, porque os
  componentes já consomem `primary-*`. As telas autenticadas não foram inspecionadas visualmente
  nesta task (sem banco/Docker no ambiente), só por computed style na tela de login e por
  build. A validação visual completa fica para a `TASK-0107`.
- O `ADR-0001` fica **parcialmente substituído**: a linha `primary` dele não vale mais; o resto
  continua válido.
- `primary` (navy) e `info` (`blue`) continuam sendo dois azuis. A distinção agora é maior que
  antes (navy dessaturado vs. azul-céu), mas continua sendo deliberada.
- Código novo deve usar `primary-*` e nunca `indigo-*`.
