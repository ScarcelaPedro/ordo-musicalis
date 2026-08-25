---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0033 — Fundação: componentes de domínio da Escala

**Task ID**: `TASK-0033`

## Objetivo

Implementar os componentes de domínio especificados em
`docs/tasks/0025-componentes-dominio-escala.md`: `ScaleCard`, `ScaleMember`, `ScaleRole`,
`CelebrationHeader`, `AvailabilityStatus`, `ConfirmationStatus`, `ConflictAlert`, `EmptyRole`,
`RepertoireItem`, `LiturgicalInfo` — a última peça da Fundação antes de tocar em telas
(SPEC-004 §46).

## Arquivos/componentes envolvidos

- `src/components/scale/ScaleCard.vue`, `ScaleMember.vue`, `ScaleRole.vue`,
  `CelebrationHeader.vue`, `AvailabilityStatus.vue`, `ConfirmationStatus.vue`,
  `ConflictAlert.vue`, `EmptyRole.vue`, `RepertoireItem.vue`, `LiturgicalInfo.vue` — criar
  (subpasta `scale/` sugerida para não misturar com os componentes genéricos de
  `src/components/`, decisão de organização a confirmar/registrar se divergir).

## Comportamento esperado

`ScaleMember`/`ScaleRole` recebem os dados de uma pessoa/categoria escalada por prop, sem
acesso direto a store ou API — puramente apresentacionais, reutilizáveis tanto em contexto de
edição (`ScaleForm`) quanto de visualização (`Show.vue`) via prop de modo (`editable`). `Avatar`
(`TASK-0032`) é composto dentro de `ScaleMember`/`CelebrationHeader`. `EmptyRole` usa
`surface-bordered` (não `Alert` cheio, decisão já registrada em `docs/tasks/0025-*.md`).
`ConflictAlert` usa `Alert` compacto (`TASK-0031`).

## Dependências

- `TASK-0030` — `Button`.
- `TASK-0031` — `Alert`, `Badge`.
- `TASK-0032` — `Avatar`, `Card`.

## Critérios de conclusão

- [x] `ScaleMember.vue` reproduz o exemplo conceitual da SPEC-003 §36 (avatar + nome + função/
      instrumento + status), com prop `editable` controlando se ações (remover, editar
      instrumento/função) aparecem.
- [x] `ScaleRole.vue` agrupa `ScaleMember` por categoria, com contador ou `EmptyRole` quando
      vazia.
- [x] `CelebrationHeader.vue` dá destaque visual ao celebrante (bloco próprio, não `<dl>` plano).
- [x] `ConflictAlert.vue` aceita os 3 tipos já definidos (indisponível/já escalado/incompatível)
      como prop de tipo, mesmo sem nenhum dado real de conflito disponível ainda (a lógica de
      detecção é pendência registrada em `docs/tasks/0009-*.md`/`0041-*.md`/`0044-*.md` — este
      componente só precisa saber renderizar o alerta quando receber o dado).
- [x] `EmptyRole.vue` com ação "+ Adicionar"/"Resolver" via slot ou prop de callback.
- [x] `ConfirmationStatus.vue`/`AvailabilityStatus.vue` como wrappers finos de `Badge` com lista
      de valores fixa (mantém `STATUS_COLORS` como fonte, sem duplicar o mapeamento).
- [x] `RepertoireItem.vue`/`LiturgicalInfo.vue` reproduzem a estrutura já existente em
      `repertoire/Show.vue`/`liturgia/Show.vue`, só com os novos tokens — ver correção de
      escopo abaixo para `LiturgicalInfo`.
- [x] `npm run build` passa sem erros.
- [x] Nenhuma tela existente foi alterada (componentes ainda não adotados) — confirmado via
      `git status`.

## Correção de escopo: `LiturgicalInfo.vue`

Ao ler `liturgia/Show.vue` por completo (271 linhas) para desenhar este componente, confirmei
que a página de Liturgia é muito mais rica do que uma suposição inicial de "cor + texto de
leitura" cobriria — são ~10 seções (tempo litúrgico, antífona de entrada, coleta, 1ª leitura,
salmo, 2ª leitura, evangelho, oferendas, antífona/oração de comunhão), cada uma com tratamento
tipográfico próprio (título em Playfair Display, corpo em EB Garamond). Reproduzir isso inteiro
num componente de "informação litúrgica" genérico seria inventar uma abstração maior do que o
uso real pede. `LiturgicalInfo.vue` foi desenhado como a **prévia compacta** (tempo litúrgico +
cor) que a `TASK-0010` deixou como decisão em aberto para a tela de Detalhes da Escala — no
mesmo espírito da prévia de Repertório já existente — não uma tentativa de substituir a página
de Liturgia completa. Também confirmado: `RepertoireItem` usa `tituloMusica` (não `titulo`,
correção ao que eu tinha assumido antes de ler o arquivo real).

## Riscos

- Nenhum dado real de conflito existe ainda no backend — `ConflictAlert` precisa ser
  implementado de forma que funcione corretamente tanto "sem prop de conflito" (não renderiza
  nada) quanto "com prop de conflito" (renderiza o alerta), para não travar esta task esperando
  uma capacidade de backend que está fora do escopo desta etapa (SPEC-004 §43/§44).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §46, §47.
- `docs/tasks/0025-componentes-dominio-escala.md` (especificação completa).
- [`docs/design-system.md`](../design-system.md) — seção 8.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Todos os 10 componentes criados em
  `src/components/scale/` (organização sugerida pela própria task, confirmada — sem divergência
  a registrar). Lidos por completo `repertoire/Show.vue` e `liturgia/Show.vue` antes de
  desenhar `RepertoireItem`/`LiturgicalInfo`, corrigindo suposições: campo real é
  `tituloMusica`, e a página de Liturgia é muito mais rica (10 seções) do que caberia num
  componente genérico — `LiturgicalInfo` ficou como prévia compacta, não réplica da página.
  `ScaleRole`/`EmptyRole` separados em dois componentes distintos (grouping neutro vs.
  tratamento de vazio), evitando duplicar o estilo de aviso em dois lugares. `CelebrationHeader`
  usa o token `accent` (dourado) para o destaque do celebrante — o próprio caso de uso que
  justificou a existência desse token na `TASK-0017`. `npm run build` validado com sucesso de
  primeira. Nenhuma tela tocada. Task marcada `concluida`.
  **Fim da Fase 1 (Fundação)**: `TASK-0029` a `0033` estão todas `concluida` — tokens,
  3 grupos de componentes base e componentes de domínio prontos. Próximo passo: TASK-0034
  (layout global + sidebar) já está elegível — primeira task que efetivamente altera uma tela.
