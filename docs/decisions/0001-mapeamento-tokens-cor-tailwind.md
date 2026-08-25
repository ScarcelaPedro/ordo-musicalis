# 0001 — Mapeamento dos tokens de cor semânticos para famílias do Tailwind

- **Data**: 2026-08-24
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0001`
- **Task relacionada**: `TASK-0029`

## Contexto

`docs/design-system.md` (Etapa 3) define a direção da paleta semântica (Primary = azul profundo/
mariano, Secondary = neutro morno, Accent = dourado discreto, Success/Warning/Danger/Info
mantendo a regra de cor já validada pela auditoria), mas não fixa valores hexadecimais — isso
ficou deliberadamente para a implementação (SPEC-003 tratou só a direção). A `TASK-0029` (Etapa
4) precisa de valores reais para `tailwind.config.js`. Restrição adicional encontrada durante a
implementação: `Badge.vue` já usa classes Tailwind literais (`bg-green-100 text-green-800`,
`bg-yellow-100 text-yellow-800`, `bg-red-100 text-red-800`, `bg-blue-100 text-blue-800`,
`bg-purple-100 text-purple-800`) para os estados que também são meta dos tokens semânticos
(sucesso/pendente/erro/informativo) — uma escolha de token que diverja dessas famílias
obrigaria `Badge.vue` a mudar de aparência assim que migrar para os tokens (TASK-0031), o que
seria uma regressão visual não intencional.

## Decisão

Cada token semântico é um alias direto de uma família de cor já existente no Tailwind (sem
hex inventado à mão, sem nova escala custom):

| Token | Família Tailwind | Motivo |
|---|---|---|
| `primary` | `indigo` | Já é, na prática, a cor interativa mais usada do sistema hoje (160 ocorrências confirmadas em `docs/tasks/0017-*.md`); `indigo-700`/`800` lê como "azul profundo" sem inventar hue novo. |
| `secondary` | `stone` | Cinza com viés morno (não `gray`/`slate`, que são frios) — aplica a decisão "neutro morno" da `TASK-0017` com uma família já testada em contraste. |
| `accent` | `amber` | Dourado discreto, uso pontual — deliberadamente diferente de `yellow` (usado em `warning`) para não colidir na mesma tela. |
| `neutral` | `stone` | Mesma família de `secondary` — não há necessidade real de dois eixos de cinza distintos (critério de reutilização, evita token redundante). |
| `success` | `green` | Idêntico ao `color="green"` já usado em `Badge.vue` hoje — migração futura do Badge para o token é visualmente idêntica, zero regressão. |
| `warning` | `yellow` | Idêntico ao `color="yellow"` já usado em `Badge.vue` hoje (não `amber`, para não colidir com `accent` e para preservar a cor exata já em uso). |
| `danger` | `red` | Idêntico ao `color="red"` já usado em `Badge.vue` hoje. |
| `info` | `blue` | Idêntico ao `color="blue"` já usado em `Badge.vue` hoje; visualmente distinto de `primary` (indigo) por ser mais "azul-céu" que "azul-violeta", mesmo os dois sendo tons de azul. |

As cinco cores litúrgicas do calendário (`CORES_LITURGICAS_CLASSES` em `Dashboard.vue`:
Verde/Roxo/Branco/Vermelho/Rosa) **não** são tocadas por este mapeamento — continuam como
classes Tailwind literais, categoria de token separada (já decidido em `docs/tasks/0017-*.md`).
O `purple` usado por `Badge.vue` para "vínculo fixo"/categorias também fica fora do conjunto de
tokens semânticos (não representa um estado de sucesso/erro/aviso/informação).

## Alternativas consideradas

- **Inventar uma escala de azul customizada para `primary`** (hex à mão calibrado para "azul
  mariano") — descartada: exigiria validação de contraste WCAG AA manual em 10 tons sem
  ferramenta de design disponível nesta sessão; `indigo` já é testado, acessível e, mais
  importante, já é a cor que o sistema usa de fato hoje.
- **Usar `amber` para `warning`** (em vez de `yellow`) — descartada: `Badge.vue` já usa
  `yellow` para status pendente; usar `amber` quebraria a continuidade visual na migração
  futura do Badge para tokens, sem nenhum ganho real.

## Consequências

- Migrar `Badge.vue` para os tokens semânticos (`TASK-0031`) fica com risco de regressão visual
  próximo de zero, já que os tokens replicam exatamente as famílias já usadas.
- `primary` (indigo) e `info` (blue) são ambos "azuis" — times futuros devem lembrar que a
  distinção é deliberada (marca/ação principal vs. informação neutra), não um erro a corrigir.
- Se uma calibração de contraste mais fina for necessária no futuro (ex. auditoria de
  acessibilidade formal), este ADR pode ser substituído por um registro com valores hex
  customizados — until then, as famílias padrão do Tailwind já atendem AA na maioria dos pares
  de uso comuns (texto sobre fundo claro nos tons 600–800).
