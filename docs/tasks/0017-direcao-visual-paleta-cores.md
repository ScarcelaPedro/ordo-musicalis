---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0017 — Direção visual e paleta de cores

**Task ID**: `TASK-0017`

## Objetivo

Definir a direção visual do Ordo Musicalis (conceito, personalidade, princípios — SPEC-003 §2,
§3, §4, §61) e a paleta de cores semântica completa, com tokens prontos para um futuro dark mode
(§6, §8, §9, §51 categoria Colors). A direção cromática (§7) é citada pela própria SPEC como
exemplo do tipo de decisão que não pode ser tomada silenciosamente — precisa ser apresentada com
alternativas reais, vantagens/desvantagens, recomendação e justificativa (§58).

Esta é a decisão-base da identidade visual: as demais tasks de componentes (TASK-0021 a
TASK-0025) dependem da paleta aqui definida.

## Dependências

- `TASK-0016` — contexto/stack e achados relevantes de `auditoria-ux.md`.

## Critérios de conclusão

- [x] Documento de direção visual: conceito, referências, personalidade e princípios (§2, §3,
      §4.1–4.3, §4.5) — sem ainda aplicar a componentes.
- [x] Direção cromática (§7) apresentada no formato de decisão explícita do §58: pelo menos duas
      alternativas reais (ex. azul litúrgico vs. tons naturais vs. dourado discreto), vantagens,
      desvantagens, recomendação e justificativa.
- [x] Paleta semântica completa definida: Primary, Secondary, Accent, Neutral (fundo, superfície,
      texto, bordas, desabilitado), Success, Warning, Danger, Info (§6).
- [x] Regra de uso semântico das cores aplicada e exemplificada (§8) — verde=sucesso,
      amarelo=atenção, vermelho=erro/destrutivo, azul=informação/ação principal — com nota
      explícita de que a cor nunca é o único meio de comunicação (reforça também §48).
- [x] Tokens de cor nomeados semanticamente (ex. `--color-background`, `--color-surface`,
      `--color-text-primary`, `--color-text-secondary`, `--color-border`, `--color-primary` —
      §9), estruturados de forma que uma implementação futura de dark mode seja possível **sem
      implementá-la nesta etapa** (§9, §60).
- [x] Nenhum valor hexadecimal solto fora dos tokens — todas as referências de cor passam pelo
      token semântico (§9).

## Direção visual

### Conceito

O Ordo Musicalis organiza o serviço litúrgico de uma paróquia — pessoas reais se comprometendo,
semana após semana, a servir numa celebração. A interface deve parecer uma **ferramenta de
sacristia bem cuidada**, não um sistema administrativo genérico: confiável o suficiente para o
coordenador se apoiar nela toda semana, simples o suficiente para um servidor pouco familiarizado
com tecnologia usar sem hesitar, e discretamente digna do contexto religioso que serve — sem
nunca competir visualmente com esse conteúdo (SPEC-003 §3: "a identidade religiosa deve aparecer
de maneira sutil e elegante", "não transformar a interface em uma página decorativa").

### Referências (direção, não cópia literal)

- Aplicativos de produtividade modernos com identidade sóbria (ex. linguagem visual tipo
  Linear/Notion: hierarquia tipográfica forte, espaçamento generoso com função, pouquíssima
  decoração) — pelo lado "moderno, limpo".
- Missais e material litúrgico impresso bem tipografado — pelo lado "contexto litúrgico",
  já presente isoladamente em `liturgia/Show.vue` (tipografia serifada EB Garamond/Playfair
  Display, achado da `TASK-0016`) — referência de tom, não de aplicação literal em toda a UI.
- Sistemas de agenda/escala com foco em clareza operacional — pelo lado "confiança, organização".

O sistema **não** deve parecer: ERP corporativo genérico, sistema administrativo datado, template
Bootstrap, interface ornamentada ou cheia de efeitos visuais (SPEC-003 §2).

### Personalidade

Simplicidade, organização, confiança, acolhimento, elegância, sobriedade, contexto litúrgico,
modernidade (SPEC-003 §2) — nesta ordem de prioridade quando dois valores competirem entre si
(ex. entre "elegância" e "acolhimento", prevalece o que mantiver a interface mais clara e
utilizável, nunca o inverso — §61, "não sacrificar facilidade de uso pela estética").

### Princípios aplicáveis à paleta e à direção visual como um todo

- **Clareza** (§4.1): cor, tipografia e espaçamento sempre a serviço de "onde estou / o que
  vejo / o que posso fazer" — nunca decorativos sem função.
- **Consistência** (§4.2): mesma cor, mesmo significado, em qualquer lugar do sistema — reforça
  diretamente a regra semântica da seção seguinte.
- **Hierarquia visual** (§4.3): informação principal > secundária > auxiliar > metadado, tratada
  também por cor (saturação/contraste), não só por tamanho de fonte.
- **Simplicidade** (§4.5): nenhum elemento visual (incluindo cor) sem contribuir para
  compreensão, orientação, ação, feedback ou identidade.

## Decisão explícita: direção cromática (SPEC-003 §7, §58)

**Problema**: qual cor de marca (`Primary`) expressa a identidade do Ordo Musicalis sem
competir com o sistema de cores litúrgicas que **já existe** no código — o calendário do
Dashboard já usa `Verde`/`Roxo`/`Branco`(âmbar)/`Vermelho`/`Rosa` para representar o tempo
litúrgico do dia (`CORES_LITURGICAS_CLASSES`, `Dashboard.vue`) —, e que já reflita, mesmo que
sutilmente, o achado de que `indigo` é hoje, na prática, a cor interativa de fato do sistema
(160 ocorrências em 35 arquivos — foco de campos via `@tailwindcss/forms`, links, item ativo do
menu, botão "Nova Escala"), apesar do componente `PrimaryButton` em si ser cinza-escuro.

**Alternativa A — Azul profundo / azul mariano**
- Vantagens: azul **não é** uma das cinco cores litúrgicas tradicionais (Verde/Roxo/Branco/
  Vermelho/Rosa) — zero colisão semântica com o calendário; tem forte ressonância católica
  própria (azul mariano) sem ser "a cor de um tempo litúrgico específico", o que evita a
  interface parecer estar "sempre em Advento" ou "sempre em Páscoa"; transmite
  confiança/organização/sobriedade diretamente; já é, na prática, a cor mais usada do sistema
  hoje (indigo, achado acima) — menor ruptura visual para quem já usa o sistema.
- Desvantagens: azul é uma escolha comum em produtos de software em geral — exige que a
  tipografia/tom/iconografia carreguem mais peso na diferenciação de identidade, já que a cor
  sozinha não é exclusiva do produto.

**Alternativa B — Tons naturais (terrosos)**
- Vantagens: reforça "acolhimento" e "humano" de forma tátil; foge do azul-corporativo comum.
- Desvantagens: tons terrosos tendem a ser dessaturados, exigindo cuidado extra para manter
  contraste AA em texto/ação sobre fundo claro; mais difícil de gerar uma escala de estados
  (hover/active/focus) que pareça "viva" sem perder a sobriedade; nenhuma base no sistema atual
  (nem em `indigo`, nem nas cores litúrgicas) — maior ruptura visual.

**Alternativa C — Dourado discreto como cor principal**
- Vantagens: forte ressonância litúrgica (ouro = solenidade, festas).
- Desvantagens: dourado/branco **é** uma das cinco cores litúrgicas tradicionais — usá-lo como
  `Primary` colidiria diretamente com o significado que o calendário já usa para representar
  "hoje é dia de festa" (`Branco` em `CORES_LITURGICAS_CLASSES`); dourado como cor de ação
  principal (botões, links) tende a ler como "premium/luxo" mais do que "confiável/organizado",
  fora do tom pedido pelo §2; risco real de contraste insuficiente em texto sobre fundo claro.

**Recomendação**: Alternativa A (azul profundo / mariano), com o dourado discreto da Alternativa
C reaproveitado como `Accent` — não como `Primary` — para destaques pontuais (ex. o bloco de
celebrante em destaque já decidido na `TASK-0010`, badges de vínculo fixo/celebração especial),
onde sua conotação de solenidade é um acerto em vez de uma colisão semântica.

**Justificativa**: evita o único erro estruturalmente irreversível entre as alternativas —
colidir com um sistema de cores que já existe e já significa algo específico no produto
(litúrgico) — e aproveita uma evidência real de uso já presente no código (indigo como cor
interativa de fato) em vez de partir do zero. Atende à personalidade pedida (§2) sem depender de
a cor "parecer católica" sozinha — a identidade litúrgica continua vindo, como a SPEC-003 pede
em §46, do Design System como um todo (tipografia, iconografia, detalhes), não da cor de marca
isolada.

## Paleta semântica (SPEC-003 §6, §8)

| Grupo | Papel | Direção de valor (base Tailwind, ponto de partida — refinamento fino fica para implementação) |
|---|---|---|
| **Primary** | Marca e ações principais | Azul profundo (família `indigo`/`blue` escura, ex. próximo de `indigo-700`/`indigo-800`) — mais escuro e saturado que o `Info` abaixo, para os dois continuarem distinguíveis mesmo sendo da mesma família cromática. |
| **Secondary** | Apoio | Neutro morno (cinza com leve viés quente, não cinza frio puro) — reforça "acolhimento" sem competir com `Primary`. |
| **Accent** | Destaque pontual | Dourado discreto (ex. próximo de `amber-600`/tons terrosos dourados) — uso pontual (celebrante em destaque, vínculo fixo, celebração especial), nunca como cor de botão de ação recorrente. |
| **Neutral** | Fundo, superfície, texto, bordas, desabilitado | Escala de cinza morno (`stone`/`neutral` em vez de `gray` frio) — pequena mudança de tom que já empurra a interface para "acolhedora" sem custo de legibilidade. |
| **Success** | Estados positivos | Verde (mantido — já consistente e correto hoje, achado da `TASK-0016`/auditoria). |
| **Warning** | Atenção | Âmbar/amarelo (mantido). |
| **Danger** | Erro / ação destrutiva | Vermelho (mantido). |
| **Info** | Informação | Azul mais claro/brilhante que o `Primary` (ex. próximo de `blue-500`) — mesma família, luminosidade diferente, para não se confundir com ação principal. |

**Importante**: as cinco cores litúrgicas do calendário (`Verde`/`Roxo`/`Branco`/`Vermelho`/
`Rosa`, já implementadas em `Dashboard.vue`) permanecem uma categoria de token **separada**
("cor de conteúdo litúrgico do dia"), não fazem parte da paleta semântica de UI acima e não
devem ser reaproveitadas como `Primary`/`Success`/`Warning`/`Danger` — são conceitos diferentes
(o que o calendário representa vs. o que a interface comunica sobre uma ação/estado). Reforça
por que `Danger` continua vermelho mesmo `Vermelho` também sendo uma cor litúrgica (Pentecostes/
mártires): o significado dentro de cada sistema é local a esse sistema, não compartilhado.

## Regra de uso semântico (§8)

Mantida a regra já validada como acerto pela auditoria (`STATUS_COLORS`/`Badge`, achado da
`TASK-0016`): verde = sucesso/confirmado, amarelo = atenção/pendente, vermelho = erro/ação
destrutiva, azul = informação/ação principal. Reforço explícito: nenhum estado depende só de
cor — todo uso de `Success`/`Warning`/`Danger`/`Info` é acompanhado de texto, ícone ou forma
(já é prática no sistema via `Badge` com texto — achado positivo a preservar; reforça também a
`TASK-0020`, §48).

## Tokens de cor (§9)

Nomes semânticos, sem valor hexadecimal solto fora deles — prontos para uma implementação futura
de dark mode (não implementado nesta etapa, SPEC-003 §9/§60), aproveitando que o chrome do
sistema (navbar/sidebar) já tem classes `dark:` parciais hoje (achado da `TASK-0016`):

```text
--color-background          fundo geral da página
--color-surface             superfície padrão (cards, painéis)
--color-surface-elevated    superfície com mais destaque (ver TASK-0019, elevação)
--color-surface-bordered    superfície demarcada só por borda, sem sombra
--color-border              bordas e divisores
--color-text-primary        texto principal
--color-text-secondary      texto secundário/legendas
--color-text-disabled       texto de controle desabilitado

--color-primary             ação principal, marca
--color-primary-hover
--color-primary-active
--color-secondary
--color-accent

--color-success
--color-warning
--color-danger
--color-info
```

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §2, §3, §4, §6, §7, §8, §9, §51 (Colors),
  §58, §61.
- `TASK-0016`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Verificado por grep que `indigo` já aparece 160
  vezes em 35 arquivos como cor interativa de fato (focus ring do `@tailwindcss/forms`, links,
  item ativo do menu, CTA "Nova Escala"), apesar do `PrimaryButton` em si ser cinza-escuro —
  evidência real usada para fundamentar a decisão cromática, em vez de partir do zero. Direção
  cromática registrada no formato §58: recomendado azul profundo/mariano como `Primary`,
  justificado principalmente por não colidir com as cinco cores litúrgicas que o calendário do
  Dashboard já usa (`Verde`/`Roxo`/`Branco`/`Vermelho`/`Rosa`, `CORES_LITURGICAS_CLASSES`) — o
  dourado discreto cotado como alternativa vira `Accent` em vez de `Primary`, evitando colidir
  com `Branco` (uma das cores litúrgicas). Paleta semântica completa definida preservando a
  regra de cores de estado já validada como acerto pela auditoria (verde/amarelo/vermelho/azul).
  Registrada explicitamente a separação entre a paleta semântica de UI e o sistema de cores
  litúrgicas do calendário — são categorias de token distintas, não intercambiáveis. Tokens
  nomeados sem hex solto, prontos para dark mode futuro. Task marcada `concluida`. Próximo
  passo: TASK-0018 (tipografia) já está elegível.
