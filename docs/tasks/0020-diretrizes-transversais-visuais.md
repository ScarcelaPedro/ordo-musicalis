---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0020 — Diretrizes transversais de aplicação visual

**Task ID**: `TASK-0020`

## Objetivo

Definir, uma única vez, as regras que todos os componentes (TASK-0021 a TASK-0025) e telas de
referência (TASK-0026) precisam seguir de forma consistente: iconografia (§44, §45), uso de
imagens/elementos litúrgicos (§46), microinterações (§47), acessibilidade visual (§48, §49,
touch target), responsividade por componente (§50) e o critério de quando criar um componente
novo (reutilização, §54). Mesmo papel que `TASK-0007` cumpriu na Etapa 2 — definir os padrões
transversais antes das tasks de componente por componente evita divergência entre elas.

## Dependências

- `TASK-0016` — achados de acessibilidade/legibilidade relevantes.

## Critérios de conclusão

- [x] Biblioteca/estilo de ícones definido conceitualmente: mesmo estilo, espessura e proporção
      consistentes em todo o sistema (§44).
- [x] Regra de uso de ícone definida: ícone não substitui texto quando o significado não é
      óbvio; em ações recorrentes/universais, ícone isolado é aceitável com tooltip/
      acessibilidade adequada (§45).
- [x] Diretriz de uso de imagens/elementos litúrgicos definida: onde podem aparecer (Dashboard,
      estados especiais, páginas institucionais, cabeçalhos específicos) e onde não devem
      (decoração em todas as telas) — a identidade litúrgica vem do Design System, não da
      quantidade de imagens religiosas (§46).
- [x] Diretriz de microinterações definida (hover, focus, seleção, confirmação, expansão,
      loading), com a regra de que animação comunica mudança de estado, não decora (§47).
- [x] Checklist de acessibilidade visual consolidado: contraste, tamanho mínimo de texto, foco
      visível, áreas de toque, leitura em telas pequenas, estados não dependentes exclusivamente
      de cor (§48).
- [x] Regra de touch target definida: área de toque mínima adequada, evitando botões pequenos
      demais, ícones encostados, controles muito próximos (§49).
- [x] Princípio de responsividade por componente definido: cada componente precisa de
      comportamento explícito para mobile/tablet/desktop, não apenas classes responsivas
      genéricas (§50) — este princípio vira critério obrigatório nas TASK-0021 a TASK-0025.
- [x] Critério de quando criar um componente novo definido (repetição real, comportamento
      próprio, estado próprio, necessidade de consistência — §54), para orientar as tasks de
      componente a não abstrair HTML sem necessidade.

## Estado atual (confirmado nesta task)

- `aria-label` aparece em só 2 arquivos hoje — confirma o achado da auditoria de que o acerto
  pontual do `ThemeToggle` (que tem `aria-label`) não se repete, por exemplo, nas setas de
  navegação de mês do Dashboard.
- Ícones inline (`<svg>`) aparecem em só 3 arquivos — poucos ícones no sistema hoje, sem
  biblioteca e sem estilo declarado (confirma achado da `TASK-0016`).
- Durações de transição já usadas no código: `duration-150` (5 ocorrências) e `duration-200` (2
  ocorrências) — nenhuma duração maior encontrada. Base real para a diretriz de microinterações
  abaixo, em vez de valores inventados.

## Iconografia (§44, §45)

**Decisão**: adotar **Heroicons** (`@heroicons/vue`) como biblioteca de ícones, em vez de
continuar com SVGs copiados manualmente sem padrão. Não conta como a "biblioteca de UI
desnecessária" que a SPEC-003 §59 proíbe — é um conjunto de glifos SVG, feito pela própria
Tailwind Labs, sem qualquer componente de interação/comportamento (diferente de
Vuetify/PrimeVue, que a §55 explicitamente não quer). Variante `outline` (24px, traço 1.5) para
a maioria dos usos; variante `solid` (20px) para estados ativos/pequenos.

- **Por que não manter SVGs manuais**: a auditoria já confirma que hoje são "poucos ícones...
  sem biblioteca de ícones", cada um copiado à mão — Heroicons resolve isso na origem (uma
  fonte só, sempre consistente), em vez de depender de disciplina manual contínua.
- **Regra de uso** (§45): ícone nunca substitui texto quando o significado não é óbvio (preferir
  `[Excluir]` a `[🗑]`, exemplo já dado pela própria SPEC). Em ações recorrentes e
  universalmente reconhecidas (setas de navegação, fechar, tema), ícone isolado é aceitável —
  **mas sempre com `aria-label`/`title`, sem exceção**. Resolve diretamente a inconsistência
  confirmada acima (só 2 de N controles ícone-apenas têm `aria-label` hoje).

## Imagens e elementos litúrgicos (§46)

Onde podem aparecer: Dashboard (ex. um elemento visual discreto ligado ao tempo litúrgico atual,
complementar às cores já usadas em `CORES_LITURGICAS_CLASSES`), estados especiais/vazios,
páginas institucionais (se existirem no futuro), cabeçalhos específicos de contexto religioso
(ex. Liturgia). Onde não devem aparecer: como decoração recorrente em telas operacionais
(listagens, formulários, Escala). A identidade litúrgica continua vindo do conjunto do Design
System (paleta, tipografia serifada reservada à Liturgia — `TASK-0018` —, iconografia), não da
quantidade de imagens religiosas na tela.

## Microinterações (§47)

Duração padrão **150ms** para hover/focus/seleção (já é o valor mais usado no código hoje — não
inventado) e **200ms** para expansão/recolhimento (drawer, accordion, dropdown — já usado na
transição do menu lateral). Nenhuma duração maior que isso — reforça a proibição de "animações
excessivas" da SPEC-003 §59. Regra: toda animação comunica uma mudança de estado real (abrir,
fechar, selecionar, carregar) — nunca decoração pura (§47, último parágrafo).

## Acessibilidade visual (§48)

- **Contraste**: mínimo WCAG 2.1 AA — 4.5:1 para texto normal, 3:1 para texto grande (≥18px/
  24px bold) e para elementos de interface não-textuais (bordas de input, ícones informativos).
  Vale tanto para o tema claro quanto para o escuro que hoje só existe parcialmente (achado da
  `TASK-0016`) — a paleta final da `TASK-0017`, quando ganhar valores hexadecimais definitivos
  na implementação, precisa validar esse contraste nos dois temas.
- **Tamanho mínimo de texto**: já resolvido na `TASK-0018` — `Caption`/12px é o piso absoluto.
- **Foco visível**: todo controle interativo precisa de indicador de foco visível — já
  consistente nos campos hoje via `@tailwindcss/forms` (`focus:ring-indigo-500`); a lacuna
  confirmada é em elementos não-formulário (links de ação em tabela, ícones de navegação) — a
  regra passa a valer para **todo** controle interativo, sem exceção.
- **Áreas de toque**: ver seção "Touch target" abaixo.
- **Leitura em telas pequenas**: já coberto pela regra de responsividade por componente (seção
  seguinte) e pelas decisões mobile já tomadas na Etapa 2 (`TASK-0008` a `TASK-0014`, `TASK-0028`).
- **Estados não dependentes só de cor**: já resolvido na `TASK-0017` (badges sempre com texto) —
  reforçado aqui como regra transversal a todo componente novo, incluindo o calendário (a
  auditoria aponta que hoje a cor litúrgica da célula não tem texto/ícone alternativo — a
  aplicação visual da `TASK-0026` deve considerar isso ao vestir o calendário compacto já
  decidido na `TASK-0008`).

## Touch target (§49)

Área de toque mínima de **44×44px** (referência amplamente adotada — Apple HIG e próxima do
recomendado pela WCAG 2.5.5) para qualquer controle interativo, mesmo quando o elemento visual é
menor — usar padding para expandir a área de toque sem aumentar o tamanho visual do ícone/texto.
Resolve diretamente o achado da auditoria: hoje os links de ação em tabela (`Editar`/`Excluir`)
são texto simples sem padding próprio, adjacentes (`space-x-3`), com risco real de toque errado
— já mitigado estruturalmente para mobile pela decisão da `TASK-0012` ("Mais" agrupa as ações),
mas a regra de 44×44px vale como piso para **todo** controle, não só nesse caso específico.

## Responsividade por componente (§50)

Princípio: cada componente declara comportamento explícito para mobile/tablet/desktop — nunca
"aplicar classes responsivas e ver o que sobra". Exemplos já decididos nas tasks anteriores, que
servem de padrão para as que faltam (`TASK-0021` a `TASK-0025`):

```text
Card:      Desktop → pode ser horizontal | Mobile → vertical (padrão a definir por componente)
Tabela:    Desktop → tabela | Mobile → card (já decidido, TASK-0012)
Calendário: Desktop → grid mensal completo | Mobile → compacto + lista (já decidido, TASK-0008)
```

Este princípio vira critério obrigatório de conclusão em `TASK-0021` a `TASK-0025` — nenhum
componente é considerado especificado sem essa definição explícita.

## Critério de reutilização (§54)

Um componente novo só se justifica quando há repetição real, comportamento próprio, estado
próprio, ou necessidade de consistência — nunca só para abstrair HTML. Exemplos já identificados
pela auditoria que **passam** nesse critério (repetição real e confirmada, não hipotética):

- `Select`/`Textarea` — reescritos inline em quase todo formulário hoje, mesmo padrão visual
  repetido dezenas de vezes (`TASK-0021`).
- `TertiaryButton`/`HeaderButton` — a mesma classe Tailwind (`bg-gray-200 text-gray-700...`)
  copiada e colada em múltiplos cabeçalhos de tela (`TASK-0021`).
- `Calendar` — duas implementações quase idênticas hoje (Dashboard e Calendário Público),
  confirmadas pela auditoria (`TASK-0023`).
- `Modal`/`Drawer` — não existem hoje; a necessidade é criada pelas próprias decisões da Etapa 2
  (`TASK-0007`, `TASK-0009`, `TASK-0014`), não inventada aqui (`TASK-0022`).

Nenhum componente deve ser criado só porque "poderia existir" — cada um citado acima já tem
evidência de repetição real no código atual ou decisão explícita da Etapa 2 que o exige.

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §44, §45, §46, §47, §48, §49, §50, §54.
- `TASK-0016`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Confirmado por grep que `aria-label` só existe em
  2 arquivos e ícones inline em só 3 — base real para as regras de ícone e acessibilidade.
  Decisão de adotar Heroicons (`@heroicons/vue`) tomada e justificada explicitamente como não
  sendo a "biblioteca de UI desnecessária" que a SPEC-003 §59 proíbe (é só um conjunto de
  glifos, sem comportamento, feito pela própria Tailwind Labs). Duração de microinteração
  (150ms/200ms) extraída dos valores já usados no código (`duration-150`/`duration-200`), não
  inventada. Touch target fixado em 44×44px, resolvendo diretamente o achado de área de toque
  pequena em ações de tabela já identificado pela auditoria. Critério de reutilização aplicado
  com exemplos reais já confirmados pela auditoria (Select/Textarea/TertiaryButton/Calendar),
  não hipotéticos. Task marcada `concluida`. Próximo passo: TASK-0021 (componentes de controles
  interativos) já está elegível — é a primeira task de componente propriamente dita da Etapa 3.
