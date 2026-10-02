# 0006 — Recorrência com comunidade própria e função por vínculo fixo

- **Data**: 2026-10-02
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0006`
- **Task relacionada**: `TASK-0117`

## Contexto

`ScaleTemplate` (recorrência) nasceu na Fase 1, quando a escala pertencia a um único ministério
(`teamId`). Desde a Fase 2 a escala reúne várias funções, e cada escalação carrega sua categoria
(`ScaleServidor.categoriaId`). A recorrência não acompanhou essa mudança:

- o formulário só oferecia um "Ministério esperado" (na prática, grupos de Música);
- `VinculoFixo` guardava só servidor + instrumento, então quem era gerado automaticamente caía em
  "sem função definida" na escala;
- não havia comunidade: a geração forçava a Matriz (`TODO(Fase 2)` na rota `generate`).

## Decisão

1. **`ScaleTemplate.comunidadeId`** (FK para `comunidades`). A API exige o campo ao criar e não
   aceita removê-lo ao editar. A coluna fica **nullable no banco**: a migration preenche as
   recorrências antigas com a Matriz (ou a primeira comunidade), e a geração mantém esse mesmo
   fallback só para alguma linha legada que tenha ficado nula. Assim a migration nunca falha em
   produção por falta de comunidade.
2. **Duplicidade na geração** passa a ser data + horário + comunidade. Duas comunidades podem ter
   missa no mesmo horário.
3. **`VinculoFixo` ganha `categoriaId`, `teamId` e `funcaoLiturgica`**, espelhando
   `ScaleServidor`. A API exige `categoriaId` ao criar, valida que o servidor tem essa função no
   cadastro e impede o mesmo servidor duas vezes na mesma recorrência (a escala gerada tem
   `@@unique([scaleId, servidorId])`). Backfill: `teamId` = ministério da recorrência;
   `categoriaId` = categoria desse ministério, ou Música quando o vínculo tem instrumento.
4. **"Ministério esperado" sai do formulário**, mesmo caminho da escala manual na Fase 2.
   `ScaleTemplate.teamId` continua no banco (legado, ainda copiado para `Scale.teamId` na
   geração e listado em `teams/Show.vue`), mas não é mais editado.
5. **Permissão do coordenador**: criar recorrência continua liberado para admin/coordenador
   (igual à escala). Editar/excluir a recorrência e seus vínculos usa `requireAnyTeamOwnership`
   sobre o ministério legado da recorrência + os ministérios dos vínculos (e, ao criar um
   vínculo, o ministério informado nele). É a mesma regra da escala manual.
6. A lógica pura (dias do mês de uma recorrência, montagem das escalações a partir dos vínculos)
   sai da rota para `api/_lib/recurrence.ts`, com testes.

## Alternativas consideradas

- **Recorrência com várias comunidades (N:N)**: descartada. Uma recorrência descreve uma
  celebração concreta (ex. "Domingo 10h na Capela X"); a mesma missa em outra comunidade é outra
  recorrência, com outra equipe fixa.
- **`comunidadeId` NOT NULL no banco**: descartado por risco de migration falhar num banco sem
  comunidade cadastrada. A obrigatoriedade fica na API e no formulário.
- **Manter "Ministério esperado" como opcional no formulário**: descartado. Era exatamente o
  que passava a ideia de que recorrência é só de músicos, e a escala manual já abandonou o
  ministério no nível da celebração.

## Consequências

- Escalas geradas passam a ter a equipe fixa agrupada nas funções certas.
- Coordenador sem nenhum ministério nos vínculos de uma recorrência não consegue editá-la (só
  admin), como já acontece com escalas.
- `ScaleTemplate.teamId` vira dado legado. Pode ser removido numa limpeza futura, junto com a
  seção de recorrências em `teams/Show.vue`.
