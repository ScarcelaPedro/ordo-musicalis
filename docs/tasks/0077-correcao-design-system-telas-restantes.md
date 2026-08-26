---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0077 — Correção: aplicar o Design System às telas ainda não migradas

**Task ID**: `TASK-0077`

**Prioridade**: P2

## Descrição

Migrar para o Design System da Etapa 3 as telas que a Etapa 4 nunca tocou — hoje usam
Tailwind ad hoc pré-redesign, misturado com o restante do sistema já redesenhado.

## Problema

A Etapa 4 (SPEC-004) teve escopo explícito nas telas prioritárias dos wireframes da Etapa 2 e
nunca tocou 25 arquivos: `auth/{Login,Register,ForgotPassword,ResetPassword}.vue`,
`profile/Edit.vue`, `repertoire/{Show,Edit}.vue`, `reports/Index.vue`,
`servidores/{Create,Edit,Show,Intensity,ServidorForm}.vue`, `celebrantes/{Create,Edit}.vue`,
`comunidades/{Create,Edit}.vue`, `categorias/{Create,Edit}.vue`, `teams/{Create,Edit,Show}.vue`,
`scaleTemplates/{Create,Edit,ScaleTemplateForm}.vue`. Confirmado por leitura direta de código
(`TASK-0057`): usam `<label>`/`InputLabel` sem associação completa, `<select>`/`<textarea>` crus
com `focus:border-indigo-500` literal em vez dos componentes `Select.vue`/`Textarea.vue`,
cabeçalhos `text-xl text-gray-800` em vez da escala `text-h1`-`h4`, cards
`bg-white shadow-sm rounded-lg p-6` crus em vez de `<Card>`, texto de status com cores literais
em vez dos tokens `success`/`warning`/`danger`, abas customizadas em vez de `<Tabs>`. Botões
(`PrimaryButton`/`SecondaryButton`) e `TextInput`/`InputLabel` já são reutilizados nessas telas
(migrados desde a Fundação) — a inconsistência é parcial, não total.

## Impacto

É a maior fonte de inconsistência visual do sistema hoje: cerca de 17 telas redesenhadas na
Etapa 4 convivem lado a lado com 25 no padrão anterior. Não é um bug nem impede o uso de nenhuma
funcionalidade — por isso P2, não P0/P1 — mas prejudica diretamente a consistência (§45) e o
reconhecimento de padrão (§32) que são objetivo central desta etapa do redesign.

## Tela

As 25 telas listadas acima.

## Componente

Componentes do Design System já existentes e prontos para reuso: `Card`, `Select`, `Textarea`,
`Tabs`, `Badge` com tokens semânticos, escala tipográfica (`text-h1`-`h4`/`body`/`caption`).

## Comportamento atual

25 telas com aparência visual do sistema anterior ao redesign, ainda que funcionalmente
corretas e responsivas (confirmado na `TASK-0068`: nenhuma tem problema de layout/scroll).

## Comportamento esperado

As 25 telas seguindo o mesmo Design System já aplicado ao restante do sistema — mesmos
componentes, tokens de cor, escala tipográfica e padrões de card/formulário/tabela já usados nas
telas migradas na Etapa 4.

## Critérios de aceite

- [x] Cada uma das 25 telas revisada e migrada para os componentes/tokens do Design System.
- [x] Nenhuma regra de negócio, campo de formulário ou comportamento funcional alterado durante a
      migração — só aparência (mesma disciplina já seguida durante toda a Etapa 4).
- [x] `npm run build` passa sem erros após cada tela migrada.
- [x] Responsividade e acessibilidade (já validadas na `TASK-0068`/`0069` no estado anterior)
      reconfirmadas após a migração — não regredir o que já estava correto.

## Dependências

- Nenhuma — mas é um volume de trabalho equivalente a uma iniciativa própria, não uma correção
  pontual. Recomendação explícita: **não tratar como uma única sessão de trabalho** — a Etapa 4
  levou ~20 tasks (`TASK-0034`-`0053`) para migrar um número semelhante de telas prioritárias;
  esta task provavelmente deveria ser desmembrada em várias tasks menores (uma por
  domínio/arquivo ou por grupo de 2-3 telas relacionadas) no momento em que for reivindicada,
  seguindo o mesmo padrão de decomposição já usado pela Etapa 4 — não uma migração "big bang" de
  25 arquivos num único commit.

## Referências

- `docs/tasks/0057-validacao-visual-design-system.md` — achado original (Achado A), com a lista
  completa dos 25 arquivos e exemplos concretos de código.
- [`docs/design-system.md`](../design-system.md) — especificação dos componentes/tokens a aplicar.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §32, §45, §55 (regra de decisão:
  inconsistência visual → corrigir no Design System/componente).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir do achado
  principal da `TASK-0057`.
- 2026-08-25 — Task reivindicada e **desmembrada** em 7 tasks menores (`TASK-0089` a `0095`),
  seguindo a própria recomendação registrada nas "Dependências" desta task (não tratar como uma
  única sessão de trabalho) e o precedente da Etapa 4, que decompôs uma migração de volume
  semelhante em ~20 tasks (`TASK-0034`-`0053`). Os 25 arquivos originais foram agrupados por
  domínio/similaridade estrutural, não em ordem arbitrária:

  | Task | Domínio | Arquivos |
  |---|---|---|
  | `TASK-0089` | Autenticação | `auth/{Login,Register,ForgotPassword,ResetPassword}.vue` (4) |
  | `TASK-0090` | Perfil + Repertório | `profile/Edit.vue`, `repertoire/{Show,Edit}.vue` (3) |
  | `TASK-0091` | Relatórios | `reports/Index.vue` (1) |
  | `TASK-0092` | Servidores | `servidores/{Create,Edit,Show,Intensity,ServidorForm}.vue` (5) |
  | `TASK-0093` | Cadastros simples | `celebrantes`+`comunidades`+`categorias` `{Create,Edit}` (6) |
  | `TASK-0094` | Ministérios | `teams/{Create,Edit,Show}.vue` (3) |
  | `TASK-0095` | Escalas recorrentes | `scaleTemplates/{Create,Edit,ScaleTemplateForm}.vue` (3) |

  4+3+1+5+6+3+3 = 25, confere com a lista original da `TASK-0057`. Nenhum código alterado nesta
  task — só planejamento/decomposição, por isso `parcialmente-concluida` (não `concluida`): o
  trabalho real de migração continua pendente, agora nas 7 tasks filhas, cada uma pequena o
  bastante pra caber numa única sessão de trabalho (2-6 arquivos cada, a maioria já
  estruturalmente idêntica entre si). Task marcada `parcialmente-concluida`. Próximo passo:
  qualquer uma das `TASK-0089`-`0095` (todas P2, sem dependência entre si, exceto avisos de
  coordenação com `TASK-0078`/`0086`/`0087` se ainda não tiverem rodado) — por menor número,
  `TASK-0089`. `TASK-0078` (a outra P2 restante da lista original, dark mode em 3 telas de
  detalhe) continua igualmente elegível em paralelo.
- 2026-08-26 — **Todas as 7 tasks filhas concluídas** (`TASK-0089` a `0095`, cada uma com
  build limpo e teste visual real em mobile/desktop, dois temas, dado real via Docker Postgres —
  ver as Notas de progresso de cada uma para o detalhe por domínio). As 25 telas originais da
  `TASK-0057` estão migradas. Dois achados não previstos no planejamento original, descobertos
  durante a execução das filhas, valem registro aqui por afetarem a leitura do estado do Design
  System como um todo: (1) `TASK-0091` encontrou que `Tabs.vue` já existia desde o commit
  original da Etapa 4 — a menção "nunca implementado" no `docs/design-system.md` §7 e no texto
  desta própria task estava incorreta, era só mais um componente órfão (zero usos), mesmo padrão
  já visto com `ErrorState.vue`/`RepertoireItem.vue`; (2) `TASK-0090` confirmou o mesmo padrão
  pra `RepertoireItem.vue`. Nenhum dos dois precisou ser criado — só efetivamente usado pela
  primeira vez. Task marcada `concluida`.
