---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0025 — Componentes de domínio da Escala

**Task ID**: `TASK-0025`

## Objetivo

A tela de escala é "o principal caso de uso do sistema" (SPEC-003 §35). Especificar visualmente
os componentes visuais específicos do domínio Escala — celebração, equipe, função, servidor,
status, conflito, disponibilidade, confirmação, vaga (§35) — e os componentes de domínio
nomeados em §53 (ScaleCard, ScaleMember, ScaleRole, CelebrationHeader, AvailabilityStatus,
ConfirmationStatus, ConflictAlert, EmptyRole, RepertoireItem, LiturgicalInfo), aplicados sobre os
fluxos já desenhados na Etapa 2 (`TASK-0009` — Criar/Editar Escala, `TASK-0010` — Detalhes).

## Dependências

- `TASK-0017`, `TASK-0018`, `TASK-0019`, `TASK-0020` — tokens e diretrizes transversais.
- `TASK-0021` — botões (ações como "Resolver", "+ Adicionar").
- `TASK-0022` — badges/alerts (status de confirmação, alertas de conflito).
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (Etapa 2) — estrutura de equipe, conflitos,
  estado sem sugestões já definidos.
- `docs/tasks/0010-wireframe-escala-detalhes.md` (Etapa 2) — hierarquia da tela de detalhes já
  definida.

## Critérios de conclusão

- [x] Representação visual de servidor especificada: avatar/inicial, nome, função, categoria,
      status, ações (§36), consistente com o exemplo conceitual do §36.
- [x] Representação visual de conflito especificada: destaque perceptível sem tornar a tela
      visualmente agressiva, com texto explicando o conflito e ação "Ver conflito" (§37),
      aplicada aos três tipos já definidos na `TASK-0009` (servidor indisponível, já escalado,
      função incompatível).
- [x] Representação visual de função vazia especificada: indicação clara + ação "+ Adicionar"
      (§38), aplicada ao estado já definido na `TASK-0009`/`TASK-0010`.
- [x] Componentes de domínio especificados (§53): `ScaleCard`, `ScaleMember`, `ScaleRole`,
      `CelebrationHeader`, `AvailabilityStatus`, `ConfirmationStatus`, `ConflictAlert`,
      `EmptyRole`, `RepertoireItem`, `LiturgicalInfo` — cada um justificado pelo critério de
      reutilização da `TASK-0020` (repetição real / comportamento próprio / estado próprio),
      não criado apenas para abstrair HTML (§54).
- [x] Nenhuma regra de negócio, dado ou relação entre entidades alterada — apenas a
      representação visual do que já existe (SPEC-002 §32, reafirmado por SPEC-003 §55, §59).
- [x] Cada componente com comportamento responsivo definido (§50).

## Justificativa de reutilização (§54) — evidência real por componente

Antes de especificar cada um, o porquê de existir (não abstração gratuita):

| Componente | Evidência de repetição real |
|---|---|
| `ScaleCard` | Hoje há 3 lugares mostrando a mesma informação de escala de formas ligeiramente diferentes: "Minhas próximas escalas" do Dashboard (`TASK-0008`), `MyScales.vue` (`TASK-0011`) e a listagem de Escalas (`TASK-0012`) — pequena inconsistência entre elas, não uma coincidência |
| `ScaleMember` | Repetido em `ScaleForm.vue` (linha de pessoa escalada) e `scales/Show.vue` (linha da equipe) — mesma informação, dois templates diferentes hoje |
| `ScaleRole` | O bloco "categoria de função" já existe tanto em `ScaleForm.vue` quanto em `scales/Show.vue` (`gruposPorCategoria`), com pequenas diferenças de tratamento entre os dois |
| `CelebrationHeader` | Cabeçalho de escala hoje espalhado pelo `<dl>` plano de `Show.vue` — a `TASK-0010` já decidiu que vira um bloco próprio |
| `ConfirmationStatus`/`AvailabilityStatus` | Aplicações específicas do `Badge` já especificado na `TASK-0022`, com a lista fixa de valores já usada em `STATUS_COLORS` |
| `ConflictAlert`/`EmptyRole` | Necessidade criada pela própria `TASK-0009` (não existiam antes, mas a decisão de UX já as exige) |
| `RepertoireItem` | Lista já existente em `Show.vue`/`repertoire/Show.vue`, mesmo formato repetido |
| `LiturgicalInfo` | Necessidade criada pela decisão em aberto da `TASK-0010` (prévia de liturgia) e pela própria tela de Liturgia existente |

## CelebrationHeader

Aplica a decisão da `TASK-0010`: título (`H1`/`H2`, `TASK-0018`) + subtítulo com data/horário/
comunidade (`Body Small`) + bloco de celebrante em destaque, separado — usa `Avatar`
(`TASK-0023`, iniciais) + nome em `H4` + rótulo "Celebrante" em `Label` acima. Mobile: elementos
empilhados; Desktop: celebrante pode ficar ao lado do bloco de data/hora/comunidade.

## ScaleMember (§36)

```text
┌─────────────────────────────┐
│ (JS) João Silva              │
│      Violão · Música         │
│      ✓ Confirmado            │
└─────────────────────────────┘
```

`Avatar` (iniciais, `TASK-0023`) + nome (`Body`, semibold) + função/instrumento/categoria
(`Body Small`, `--color-text-secondary`) + `ConfirmationStatus` (badge). Ações (remover, editar
instrumento/função) aparecem só no contexto de edição (`ScaleForm`), nunca na visualização
somente-leitura (`Show.vue`) — mesma distinção de permissão já existente hoje, não alterada.

## ScaleRole (bloco de categoria)

Cabeçalho: nome da categoria (`H4`) + contador (`Badge` neutro "N escalado(s)" ou `EmptyRole`
quando 0) — mantém a organização por categoria já existente e considerada um acerto (§32,
reafirmado pela SPEC-002 na Etapa 2). Lista de `ScaleMember` dentro. Cartão com
`surface-bordered` (não `surface` com sombra cheia — um bloco dentro de outro bloco não precisa
da mesma elevação do card externo, evita empilhar sombras, `TASK-0019`).

## Representação de conflitos — ConflictAlert (§37)

Usa o componente `Alert` (tipo aviso/erro conforme severidade, `TASK-0022`), em escala reduzida
— não o Alert de largura total da tela, mas uma variação compacta anexada à linha do
`ScaleMember` em conflito:

```text
⚠ Conflito de horário
João já está escalado às 19:00 em outra comunidade.
[Ver conflito]
```

Aplicado aos três tipos já definidos na `TASK-0009`: servidor indisponível, servidor já
escalado (ambos dependentes da lógica de detecção ainda não implementada, pendência já
registrada), função incompatível (já prevenida estruturalmente, não precisa de alerta ativo —
mantido sem mudança). Cor de aviso (não erro puro) para não tornar a tela "visualmente
agressiva" (§37) — reforça a distinção de severidade que a paleta da `TASK-0017` já prevê
(Warning ≠ Danger).

## Representação de função vazia — EmptyRole (§38)

```text
┌─────────────────────────────┐
│ Teclado                     │
│ ⚠ Nenhum servidor           │
│ [+ Adicionar]               │
└─────────────────────────────┘
```

**Decisão de design**: não usa o componente `Alert` cheio (seria pesado demais se uma escala
tiver várias categorias vazias ao mesmo tempo, cada uma gerando um bloco de alerta saturado) —
usa `surface-bordered` com borda em `--color-warning` e texto em `Body Small`, um tratamento
mais discreto para um **estado de placeholder recorrente**, reservando o `Alert` cheio para
mensagens pontuais que exigem atenção ativa (ex. erro de submissão). Mantém o padrão já bom de
hoje (fundo âmbar + "Ninguém escalado", `ScaleForm.vue:312-323`), só migrando para os tokens
desta etapa; acrescenta o botão "+ Adicionar" também na visualização somente-leitura
(`Show.vue`, staff), resolvendo o achado da `TASK-0010` de que hoje isso só existe na edição.

## AvailabilityStatus, ConfirmationStatus

Aplicações específicas do `Badge` (`TASK-0022`) com listas fixas de valor — não componentes
visualmente novos, só instâncias nomeadas para reforçar consistência semântica:

- `ConfirmationStatus`: Confirmado (Success) / Pendente (Warning) / Recusado (Danger) —
  mesma lista de `STATUS_COLORS` já existente.
- `AvailabilityStatus`: Disponível (Success) / Indisponível (Neutral) — usado no Painel de
  Disponibilidade (`TASK-0013`) e, quando a detecção de conflito existir, no `ConflictAlert`.

## RepertoireItem

Mantém a estrutura já existente (`Show.vue`/`repertoire/Show.vue`): número de ordem (`Caption`,
`--color-text-secondary`) + título da música (`Body`) + tom, quando houver (badge pequeno
neutro). Nenhuma mudança estrutural, só aplicação de tokens.

## LiturgicalInfo

Usa `--font-family-serif` (`TASK-0018`, reservado ao conteúdo litúrgico) para o texto da
leitura/liturgia do dia, com um indicador pequeno da cor litúrgica (reaproveitando
`CORES_LITURGICAS_CLASSES` já existente — categoria de token separada, `TASK-0017`). Usado na
tela de Liturgia (já existente) e, se a decisão em aberto da `TASK-0010` (prévia inline na tela
de Detalhes) se confirmar viável, também ali.

## Responsividade (§50)

- `CelebrationHeader`: empilhado (mobile) → celebrante ao lado (desktop), conforme já descrito.
- `ScaleMember`: linha horizontal única (desktop) → campos empilhados dentro do card (mobile,
  já decidido na `TASK-0009` para resolver o achado de linhas com 4 controles apertados).
- `ScaleRole`: largura total em ambos, sem mudança estrutural entre breakpoints.
- `ConflictAlert`/`EmptyRole`: largura total do bloco onde aparecem, texto que quebra
  naturalmente — nenhum comportamento responsivo especial necessário.
- `ScaleCard`: aplica o mesmo padrão já decidido nas `TASK-0008`/`TASK-0011`/`TASK-0012`.

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §35, §36, §37, §38, §53, §54, §55.
- `TASK-0017`, `TASK-0018`, `TASK-0019`, `TASK-0020`, `TASK-0021`, `TASK-0022`.
- `docs/tasks/0009-wireframes-criar-editar-escala.md`,
  `docs/tasks/0010-wireframe-escala-detalhes.md` (Etapa 2).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Cada um dos 10 componentes justificado com
  evidência real de repetição (tabela dedicada), não abstração especulativa. Achado usado para
  fundamentar `ScaleCard`: hoje há 3 lugares (Dashboard, Minha Escala, listagem de Escalas)
  mostrando a mesma informação de escala de formas ligeiramente diferentes — o componente
  unifica essa pequena inconsistência. Decisão de design registrada para `EmptyRole`: usa
  `surface-bordered` discreto em vez do `Alert` cheio, para não pesar visualmente quando várias
  categorias vazias aparecem na mesma tela — reservando o Alert cheio para mensagens pontuais.
  `ConflictAlert` aplicado aos três tipos de conflito já definidos na `TASK-0009`, mantendo a
  distinção Warning/Danger já prevista na paleta. Nenhuma regra de negócio ou dado alterado —
  só representação visual do que já existe ou já foi decidido nas Etapas 1–2. Task marcada
  `concluida`. Próximo passo: TASK-0026 (telas de referência) já está elegível — depende de
  todos os componentes (0021 a 0025), todos concluídos.
