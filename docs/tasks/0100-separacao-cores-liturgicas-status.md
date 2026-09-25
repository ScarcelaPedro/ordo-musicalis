---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0100 — Separar cores do tempo litúrgico das cores de status

**Task ID**: `TASK-0100`

**Prioridade**: P1 (critério de aceite explícito da SPEC-003.1 §31)

## Objetivo

Garantir que as cores do calendário sejam lidas **exclusivamente** como tempo litúrgico e nunca
confundidas com status do sistema (SPEC-003.1 §9, §10, §24, §25).

Problemas concretos encontrados no código atual:

- A legenda do calendário do Dashboard mistura, lado a lado, cores de **status/turno**
  (Manhã = accent, Tarde/Noite = primary, **Confirmada = verde success**) com cores
  **litúrgicas** (Verde, Roxo, Branco, Vermelho, Rosa) — "Confirmada" verde vs. "Verde" litúrgico
  é exatamente a confusão que §24 proíbe.
- O mapeamento de cor litúrgica está duplicado em três lugares com classes diferentes:
  `CORES_LITURGICAS_CLASSES` (`Dashboard.vue`), `CORES_CLASSES` (`liturgia/Show.vue`) e
  `CORES_BADGE` (`components/scale/LiturgicalInfo.vue`).
- A legenda litúrgica só mostra o nome da cor, sem dizer o que ela significa.

## Comportamento esperado

- Um único módulo (ex. `src/utils/liturgicalColors.ts`) com os valores **já existentes** no dado
  (`Liturgia.cor`: Verde, Roxo, Branco, Vermelho, Rosa — default `Verde` em
  `api/_lib/fetchLiturgia.ts`), suas classes de indicador/badge e o texto de significado da
  legenda (ex. "Verde — Tempo Comum", "Roxo — Advento/Quaresma"). Os três pontos acima passam a
  consumi-lo.
- **Não criar nova classificação litúrgica** (§10): a categoria "Especial" da referência só entra
  se já existir no dado/regra atual — discovery deve confirmar; se não existir, não é adicionada.
- Cores litúrgicas formam categoria de token separada da paleta semântica (já prescrito pela
  Etapa 3) — nenhum uso de `success`/`warning` para liturgia nem de cor litúrgica para status.
- Status das escalas (rascunho/confirmada, confirmação do servidor) passa a ser comunicado por
  `Badge`/texto/ícone, não por cor de fundo de chip que colida com a paleta litúrgica. A
  distinção manhã/tarde por cor pode ser mantida ou removida — decidir na implementação e
  registrar a justificativa na task.
- Acessibilidade (§25): indicador litúrgico com `aria-label`/`title` ("Tempo litúrgico: Roxo —
  Advento/Quaresma") e legenda textual sempre visível; informação nunca só por cor.

## Dependências

- `TASK-0096` — Vitest (teste do módulo de mapeamento).

## Critérios de conclusão

- [x] Mapeamento litúrgico centralizado; `Dashboard.vue`, `liturgia/Show.vue` e
      `LiturgicalInfo.vue` sem mapa próprio.
- [x] Legenda litúrgica com significado textual, separada visualmente de qualquer legenda de
      status.
- [x] Nenhuma cor verde de status adjacente/equivalente ao "Verde" litúrgico no calendário.
- [x] Indicadores com rótulo acessível.
- [x] Teste unitário do módulo (valores conhecidos + fallback para valor desconhecido).
- [x] Nenhuma alteração em API, banco ou em `fetchLiturgia.ts`.
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §9, §10, §24, §25, §31.
- [`docs/design-system.md`](../design-system.md) — §2 (cores litúrgicas como categoria separada).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `cc34d13`.

  **Módulo único** `src/utils/liturgicalColors.ts`: `LITURGICAL_COLORS` (exatamente Verde, Roxo,
  Branco, Vermelho, Rosa, os valores já gravados em `Liturgia.cor`), estilos `dot`/`cell`/`badge`
  com variantes dark e `meaning` (texto de legenda), `liturgicalColorStyle()` com fallback
  **neutro** para valor ausente ou desconhecido (antes cada tela assumia uma cor diferente:
  Verde, Branco ou fundo branco) e `liturgicalColorLabel()` para rótulo acessível.
  `Dashboard.vue`, `liturgia/Show.vue` (badge e `<select>` de correção, que agora mostra o
  significado) e `LiturgicalInfo.vue` consomem o módulo; nenhum mapa local restou.
  **"Especial" não foi adicionado**: discovery confirmou que o valor não existe no dado nem na
  API (`fetchLiturgia.ts`/`routes/liturgia.ts` só gravam as 5 cores, default `Verde`).
  Achado de brinde: as células do calendário usavam `bg-green-200` etc. sem variante dark (fundo
  claro no tema escuro). Agora usam `-950/40` no escuro.

  **Status × liturgia**: chips de escala no calendário (e cards da lista mobile) ficaram
  **neutros**. "Confirmada" passou a ser um ícone `CheckCircle` + texto sr-only + `title`, e
  rascunho não tem ícone; na lista mobile continua o `Badge` com texto. **Decisão registrada
  aqui (não virou ADR, a task permitia)**: a distinção manhã/tarde por cor foi **removida**. O
  horário já está escrito no chip, e as cores accent/primary sobre a célula colorida competiam
  com a leitura litúrgica. Legendas separadas: "Cor do dia · Tempo litúrgico" (bolinha + nome +
  significado) e "Escalas" (ícone = confirmada). O texto de ajuda "Passe o cursor... para ver os
  servidores" estava errado (o tooltip mostra celebração/celebrante) e foi corrigido.

  **A11y (§25)**: `Calendar.vue` ganhou a prop opcional `cellLabel` → `title` + `sr-only` na
  célula desktop e `aria-label` completo no botão da grade compacta mobile (ex. "Dia 20, com
  celebrações, Tempo litúrgico: Verde — Tempo Comum").

  **Verificação**: 5 testes novos (12 no total) cobrindo valores conhecidos, fallback, rótulo e
  ausência de tokens semânticos nas classes litúrgicas. `npm run build` passa; `dist/`
  revertido. Visual com dado real (seed temporário): admin a 1100px claro e escuro (células com
  as 5 cores, legendas, chip com ícone) e 375px (grade compacta + lista, sem scroll horizontal).
  Nenhuma alteração em `api/`.

  **Para a `TASK-0101`**: o número do domingo em `rose-600` sobre célula Vermelho/Rosa também é
  cor que pode ser lida como litúrgica. Avaliar no redesenho do calendário (troca para
  indicador em ponto).
