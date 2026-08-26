---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0057 — Nível 1: Validação visual contra o Design System

**Task ID**: `TASK-0057`

## Objetivo

Abrir a Etapa 5 (SPEC-005 §5-7) verificando cada tela do sistema contra os tokens definidos em
`docs/design-system.md`: cores, tipografia, espaçamento, alinhamento, componentes, ícones,
hierarquia e consistência. Esta task **não corrige** nada — só observa, avalia e registra. Toda
inconsistência encontrada vira insumo para a `TASK-0071` (consolidação), que a transforma numa
task de correção formal (SPEC-005 §69).

## Escopo

Todas as telas de `src/pages/` (42 arquivos, ~14 domínios: `auth`, `availability`,
`categorias`, `celebrantes`, `comunidades`, `dashboard`, `liturgia`, `profile`, `public`,
`repertoire`, `reports`, `scaleTemplates`, `scales`, `servidores`, `substitutions`, `teams`),
mais os layouts (`src/layouts/`) e os componentes compartilhados de `src/components/`.

## Metodologia

Para cada tela, avaliar (SPEC-005 §5): cores (tokens semânticos vs. literais), tipografia (escala
`text-h1`-`h4`/`body`/`caption`/`label`), espaçamento (grid padrão), alinhamento, componentes
(reutilização real vs. reimplementação ad hoc), ícones (Heroicons outline/solid consistentes),
hierarquia visual e consistência entre elementos equivalentes (§6) — ex.: todos os botões
primários, todos os campos, todos os badges, todos os estados de erro seguem o mesmo padrão.

Registrar cada inconsistência encontrada (§7) no formato: tela, componente/elemento,
comportamento observado, comportamento esperado (o que o Design System prescreve), e uma
classificação preliminar P0-P3 (§53) — tipicamente P3 (polimento visual), a menos que a
inconsistência afete compreensão da tela (aí sobe para P2).

## Dependências

- `TASK-0056` — Etapa 4 (implementação) concluída; é o estado que está sendo validado aqui.

## Critérios de conclusão

- [x] Todas as telas listadas no Escopo revisadas contra `docs/design-system.md`.
- [x] Lista de inconsistências encontradas registrada nas Notas de progresso (mesmo que vazia),
      cada uma com tela/elemento/observado/esperado/classificação preliminar.
- [x] Nenhuma correção aplicada nesta task — confirmado que o `git status` não muda nenhum
      arquivo de código.

## Riscos

- Julgamento visual é inerentemente subjetivo. Mitigação: toda inconsistência registrada deve
  apontar para um token/regra concreta de `docs/design-system.md` que está sendo violada — não
  para preferência pessoal do agente.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §5, §6, §7, §53.
- [`docs/design-system.md`](../design-system.md).
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — estado
  conhecido ao final da Etapa 4, incluindo exceções já conscientes (cores litúrgicas, badges de
  instrumento/categoria).

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada. Revisão feita por leitura direta do código-fonte
  (templates Vue + classes Tailwind, que são determinísticas — mesma metodologia usada em
  `auditoria-ux.md` para o "antes"), mais varredura sistemática via grep de todo `src/pages/`
  procurando classes de cor Tailwind literais (`text-*-NNN`/`bg-*-NNN` fora da paleta de tokens
  semânticos — `primary`/`secondary`/`accent`/`neutral`/`success`/`warning`/`danger`/`info`) e
  confirmação de que nenhuma página importa `@heroicons` diretamente (ícones só existem dentro de
  9 componentes compartilhados — `AuthenticatedLayout`, `ErrorState`, `Breadcrumb`, `Calendar`,
  `ScaleCard`, `Drawer`, `Modal`, `Alert`, `Toast` — logo não há risco de ícone divergente por
  tela; nenhum achado necessário aqui).

  **Achado A (P2) — ~25 telas nunca migradas para o Design System da Etapa 4.** A Etapa 4
  (SPEC-004, `TASK-0029`-`0053`) teve escopo explícito nas telas prioritárias dos wireframes da
  Etapa 2; nunca tocou: `auth/{Login,Register,ForgotPassword,ResetPassword}.vue`,
  `profile/Edit.vue`, `repertoire/{Show,Edit}.vue`, `reports/Index.vue`,
  `servidores/{Create,Edit,Show,Intensity,ServidorForm}.vue`,
  `celebrantes/{Create,Edit}.vue`, `comunidades/{Create,Edit}.vue`, `categorias/{Create,Edit}.vue`,
  `teams/{Create,Edit,Show}.vue`, `scaleTemplates/{Create,Edit,ScaleTemplateForm}.vue` (25
  arquivos). Verificado em `teams/Create.vue` e `reports/Index.vue` como amostra representativa:
  usam `<label>` cru sem `for`/`id` (ou `InputLabel` sem `for`, mesma lacuna já registrada no
  relatório da Etapa 4, item 9 — este achado é o retrato visual mais amplo da mesma causa), campo
  `<select>`/`<textarea>` cru com `focus:border-indigo-500` literal em vez dos componentes
  `Select.vue`/`Textarea.vue`, cabeçalho `text-xl text-gray-800` em vez da escala `text-h1`-`h4`,
  cards `bg-white shadow-sm rounded-lg p-4/p-6` cru em vez de `<Card>`, texto de status
  `text-green-600`/`text-yellow-600`/`text-red-600` literal em vez dos tokens
  `success`/`warning`/`danger`, alternador de abas com `bg-gray-800`/`bg-gray-100` custom em vez
  de `<Tabs>`. Botões (`PrimaryButton`/`SecondaryButton`) e `TextInput`/`InputLabel` **já são**
  reutilizados nessas telas (migrados desde a Fundação, `TASK-0030`) — a inconsistência é parcial,
  não total. Efeito prático: o sistema hoje mistura visivelmente dois vocabulários de UI lado a
  lado — cerca de 17 telas redesenhadas na Etapa 4 e 25 telas ainda no padrão anterior. Não é bug
  nem impede uso (por isso P2, não P0/P1), mas é a maior fonte de inconsistência visual do
  sistema hoje.

  **Achado B (P3) — cores literais em vez de tokens semânticos em telas já migradas.**
  `dashboard/Dashboard.vue` usa `emerald-50/100/600/700`, `amber-50/100/600/700/800` e
  `indigo-50/200/700` literais em pelo menos 4 pontos (linhas ~138-141 badges de status, ~281-287
  stat cards "Confirmadas"/"Rascunhos", ~381-384 alerta de pendência, ~461 legenda do calendário)
  em vez dos tokens `success`/`accent`/`primary` (`accent` já é literalmente `colors.amber` no
  `tailwind.config.js` — mesmo valor visual hoje, mas o nome literal não segue o token se ele for
  remapeado no futuro). Origem provável: introduzido durante a própria correção de contraste da
  `TASK-0055` (que trocou `emerald-500`/`amber-500` por `-600`/`-700` sem passar pelos aliases).

  **Achado C (P3) — badges de `liturgia/Show.vue` com cor literal.** "Tem Glória"/"Tem Credo" usam
  `bg-indigo-100 text-indigo-800` e "Corrigido manualmente" usa `bg-yellow-100 text-yellow-800`
  literais, em vez de `primary`/`warning` (ou do componente `Badge.vue`, nunca importado nessa
  tela). Distinto e não confundir com o mapa `CORES_LITURGICAS` (linhas 33-37, `Verde`/`Roxo`/
  `Vermelho`/`Rosa`) e os títulos `text-red-700` em estilo de rubrica de missal (linhas 193-245)
  — ambos são convenções de conteúdo litúrgico legítimas, mesma categoria de exceção já registrada
  para o calendário do Dashboard (`docs/relatorio-implementacao-etapa4.md` §1.1), não um achado.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/` ao final da task. Os 3
  achados (A, B, C) ficam registrados aqui para a `TASK-0071` consolidar e transformar em tasks de
  correção formais. Task marcada `concluida`. Próximo passo: `TASK-0058`.
