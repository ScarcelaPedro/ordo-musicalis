---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0019 — Espaçamento, radius, elevação e grid

**Task ID**: `TASK-0019`

## Objetivo

Definir as escalas estruturais restantes do Design System — espaçamento (§13, princípio do
"respiro com função", §4.4), border radius (§14), elevação/sombras (§15), diferenciação de
superfícies (§16) e grid/layout (§17) —, todas compartilhadas por praticamente todos os
componentes das TASK-0021 a TASK-0025.

## Dependências

- `TASK-0016` — achado da auditoria sobre uso repetitivo de sombra/superfície ("white + shadow +
  rounded").

## Critérios de conclusão

- [x] Escala de espaçamento consistente definida (ex. 4/8/12/16/24/32/40/48/64 — §13), com
      função clara para cada valor (não arbitrário) — reforça §4.4: espaçamento separa seções/
      grupos/ações/informações, não decoração "premium".
- [x] Escala de border radius definida (pequeno/médio/grande/pill — §14), com regra de quando
      usar cada nível — não aplicar o mesmo radius em todos os elementos.
- [x] Níveis de elevação definidos (ex. Elevation 0 sem sombra, 1 cards/superfícies discretas, 2
      menus/dropdowns, 3 modal/dialog — §15), evitando sombras fortes/exageradas — resposta
      direta ao achado de sombra repetitiva da `TASK-0016`.
- [x] Diferenciação de superfícies definida: background, surface, elevated surface, bordered
      surface (§16) — evitando que toda a interface pareça "white card sobre gray background".
- [x] Grid e layout definidos: largura máxima de conteúdo, gutters, colunas, espaçamento entre
      seções (§17) — sem conteúdo excessivamente largo em monitores grandes nem comprimido em
      telas pequenas.
- [x] Tokens nomeados para spacing (xs/sm/md/lg/xl/2xl), radius (sm/md/lg/full), shadow
      (sm/md/lg) e breakpoints (mobile/tablet/desktop/large desktop) — §51.

## Evidência quantitativa do estado atual (confirmada nesta task)

| Classe | Ocorrências em `src/**/*.vue` |
|---|---|
| `shadow-sm` | 114 |
| `shadow-xl` | 1 (só o menu lateral deslizante) |
| `rounded-lg` | 75 |
| `rounded-md` | 88 |
| `space-y-6` | 28 |
| `max-w-7xl` | 1 (em `AuthenticatedLayout.vue` — mas governa a largura de toda página autenticada, por ser o layout compartilhado) |

Confirma numericamente o achado da `TASK-0016`: `shadow-sm` domina de forma esmagadora (114
ocorrências) contra 1 único uso de um nível mais alto — não existe hoje uma escala de elevação
real, existe um nível só. `rounded-lg`/`rounded-md` coexistem sem regra clara de quando usar
qual (achado da SPEC-003 §14, confirmado pelos números).

## Espaçamento (§13, §4.4)

Escala de 8 valores, mapeada diretamente sobre a escala padrão do Tailwind já em uso — sem
introduzir valores novos que exigissem migração; só nomeia semanticamente o que já é o padrão
de fato (`space-y-6`/`p-4`/`p-6`, achados acima):

| Token | Valor | Função | Uso já existente hoje |
|---|---|---|---|
| `spacing-xs` | 4px | Espaço entre ícone e texto, ajustes finos | — |
| `spacing-sm` | 8px | Gap entre itens relacionados dentro de um controle | — |
| `spacing-md` | 16px | Padding padrão de formulário, gap entre campos | já comum (`p-4`) |
| `spacing-lg` | 24px | Padding interno de card, gap entre blocos relacionados | já é o padrão dominante (`p-6`, `space-y-6`, 28 ocorrências) |
| `spacing-xl` | 32px | Gap entre seções distintas de uma página | — |
| `spacing-2xl` | 48–64px | Separação em nível de página, blocos de destaque | — |

Cada valor tem uma função declarada (§4.4) — nenhum é "espaço a mais para parecer premium";
onde o sistema já usa um valor consistentemente (16px/24px), o token só absorve o que já
funciona, em vez de forçar uma migração sem necessidade real.

## Border radius (§14)

| Token | Valor aproximado | Uso | Contraste com hoje |
|---|---|---|---|
| `radius-sm` | 4–6px | Badges, chips, elementos inline pequenos | Hoje badges usam o mesmo `rounded` genérico de outros elementos maiores — sem hierarquia própria |
| `radius-md` | 8px | Inputs, botões — nível mais comum | Corresponde ao uso de `rounded-md` já dominante (88 ocorrências) |
| `radius-lg` | 12px | Cards, superfícies maiores, modais | Corresponde ao uso de `rounded-lg` já dominante (75 ocorrências) |
| `radius-full` | 9999px (pill) | Badges de status, avatares | A definir na `TASK-0022`/`TASK-0021` |

A mudança real em relação a hoje não é técnica, é de **regra**: `rounded-md`/`rounded-lg` já
existem e já são usados; o que falta é a hierarquia declarada (elemento pequeno → radius menor,
superfície grande → radius maior) — resolve diretamente o achado da SPEC-003 §14 ("não aplicar
`rounded-lg` em absolutamente todos os elementos").

## Elevação e sombras (§15)

| Nível | Sombra | Uso | Situação hoje |
|---|---|---|---|
| Elevation 0 | Nenhuma (só borda, quando necessário) | Superfícies discretas, inputs | Pouco usado — quase tudo tem `shadow-sm` mesmo quando não precisaria |
| Elevation 1 | Leve (equivalente a `shadow-sm`) | Cards, superfícies padrão | **Já é o nível universal hoje** (114 ocorrências) — mantido como base, não removido |
| Elevation 2 | Média | Dropdowns, menus flutuantes | Praticamente inexistente hoje |
| Elevation 3 | Mais perceptível (equivalente a `shadow-lg`/`shadow-xl`) | Modais, drawers | Só 1 ocorrência hoje (`shadow-xl`, menu lateral) — vira o padrão para os novos componentes de modal/drawer (`TASK-0022`) |

Resolve diretamente o achado da `TASK-0016`/auditoria: a "sensação achatada" de hoje vem de
usar só a Elevation 1 para tudo. A escala não abandona esse nível (ele já funciona bem para
cards) — acrescenta os níveis que faltam para dar profundidade a elementos que hoje competem
visualmente com o mesmo peso (dropdown vs. card vs. modal, todos com a mesma sombra ou nenhuma).

## Superfícies (§16)

| Camada | Papel | Diferenciação de `surface` |
|---|---|---|
| `background` | Fundo geral da página | Tom levemente mais escuro/morno que `surface` (hoje `bg-gray-100`/`bg-gray-900` no dark) |
| `surface` | Card/painel padrão (Elevation 1) | Cor de "primeiro plano" — hoje sempre branco |
| `surface-elevated` | Dropdown, modal, popover (Elevation 2/3) | Mesma cor de `surface`; diferenciação vem da sombra (elevação), não de um tom de cor à parte — evita multiplicar tokens de cor sem necessidade real (§54) |
| `surface-bordered` | Bloco discreto que não precisa "flutuar" (ex. filtro de listagem, seção secundária) | Sem sombra, delimitado só por `--color-border` — resolve o achado "tudo é card com sombra", oferecendo uma alternativa visual mais discreta para conteúdo que não é o foco principal da tela |

## Grid e layout (§17)

- **Largura máxima de conteúdo**: mantém `max-w-7xl` (já em uso hoje, `AuthenticatedLayout.vue`)
  — funciona bem em monitores grandes sem parecer esticado, aplicado a toda página autenticada
  por herdar do layout compartilhado.
- **Gutters**: mantém o padrão já usado (`px-4` mobile → `px-6` tablet → `px-8` desktop, já
  presente no layout).
- **Colunas**: **decisão deliberada de não introduzir um grid formal de 12 colunas** — o
  produto não tem telas complexas o suficiente para justificar esse investimento (critério de
  reutilização da `TASK-0020`, §54); mantém o padrão já usado e suficiente hoje
  (`grid sm:grid-cols-2` em formulários, já consistente segundo a auditoria).
- **Espaçamento entre seções**: usa `spacing-xl`/`spacing-2xl` (definidos acima) entre blocos
  de página distintos.

## Tokens (§51)

```text
--spacing-xs (4px) / --spacing-sm (8px) / --spacing-md (16px) / --spacing-lg (24px)
--spacing-xl (32px) / --spacing-2xl (48–64px)

--radius-sm / --radius-md / --radius-lg / --radius-full

--shadow-sm (Elevation 1) / --shadow-md (Elevation 2) / --shadow-lg (Elevation 3)

--breakpoint-mobile (< 768px) / --breakpoint-tablet (768–1024px)
--breakpoint-desktop (1024–1280px) / --breakpoint-desktop-lg (> 1280px)
```

Breakpoints alinhados aos já usados pelo Tailwind padrão (`sm`/`md`/`lg`/`xl`) e às decisões de
navegação mobile/desktop já tomadas na Etapa 1 (`TASK-0004`) e Etapa 2 (`TASK-0007`) — sem
introduzir um novo sistema de breakpoints paralelo ao que o framework já oferece.

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §4.4, §13, §14, §15, §16, §17, §51
  (Spacing, Radius, Shadow, Breakpoints).
- `TASK-0016`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Achado da `TASK-0016` confirmado
  quantitativamente por grep: `shadow-sm` aparece 114 vezes contra 1 única ocorrência de
  `shadow-xl` — não existe hoje uma escala de elevação real, só um nível universal. Escala de
  espaçamento mapeada diretamente sobre os valores já em uso (`p-6`/`space-y-6`, 28 e 75+
  ocorrências) em vez de introduzir números novos sem necessidade. Radius/elevação definidos
  como uma mudança de **regra**, não de valor técnico — `rounded-md`/`rounded-lg`/`shadow-sm`
  já existem e já são usados corretamente em isolamento, só falta a hierarquia declarada de
  quando usar cada um. Decisão deliberada de **não** introduzir um grid formal de 12 colunas,
  por não haver necessidade real no produto (critério de reutilização) — mantido o padrão já
  suficiente (`grid sm:grid-cols-2`, `max-w-7xl`). Task marcada `concluida`. Próximo passo:
  TASK-0020 (diretrizes transversais visuais) já está elegível.
