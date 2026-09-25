---
status: backlog
modulo: src
owner:
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

- [ ] Mapeamento litúrgico centralizado; `Dashboard.vue`, `liturgia/Show.vue` e
      `LiturgicalInfo.vue` sem mapa próprio.
- [ ] Legenda litúrgica com significado textual, separada visualmente de qualquer legenda de
      status.
- [ ] Nenhuma cor verde de status adjacente/equivalente ao "Verde" litúrgico no calendário.
- [ ] Indicadores com rótulo acessível.
- [ ] Teste unitário do módulo (valores conhecidos + fallback para valor desconhecido).
- [ ] Nenhuma alteração em API, banco ou em `fetchLiturgia.ts`.
- [ ] `npm run build` e `npm test` passam.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §9, §10, §24, §25, §31.
- [`docs/design-system.md`](../design-system.md) — §2 (cores litúrgicas como categoria separada).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
