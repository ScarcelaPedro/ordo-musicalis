---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0018 — Tipografia

**Task ID**: `TASK-0018`

## Objetivo

Definir a família tipográfica principal e a escala tipográfica completa do Design System
([`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) §10, §11, §51 categoria Typography),
respondendo diretamente ao problema de legibilidade já identificado na auditoria (textos/chips
~10px, confirmado na `TASK-0016`) — §12.

## Dependências

- `TASK-0016` — achados de legibilidade da auditoria.

## Critérios de conclusão

- [x] Família tipográfica principal definida, avaliada contra os critérios do §10: legibilidade,
      boa aparência em português (acentuação), boa leitura em mobile, pesos disponíveis, boa
      distinção títulos/corpo, carregamento razoável — evitando fontes decorativas.
- [x] Se houver mais de uma fonte candidata real, decisão apresentada no formato do §58
      (alternativas, vantagens/desvantagens, recomendação, justificativa).
- [x] Escala tipográfica completa definida: Display, H1, H2, H3, H4, Body, Body Small, Caption,
      Label (§11) — tamanho, peso e line-height para cada nível.
- [x] Regra de legibilidade mínima aplicada: nenhum tamanho ~10px usado para informação
      relevante; textos pequenos reservados só a informação auxiliar (§12).
- [x] Tokens de tipografia nomeados (font family, size, weight, line height — §51).

## Estado atual (confirmado nesta task)

`tailwind.config.js` não estende `fontFamily` — todo o sistema usa a stack `sans` padrão do
Tailwind (system-ui) hoje, com uma única exceção: `liturgia/Show.vue` importa Google Fonts
(EB Garamond + Playfair Display) para imitar um missal impresso — achado já trazido pela
`TASK-0016`, resolvido nesta task (ver seção "Ilha tipográfica" abaixo). O padrão de rótulo
"eyebrow" (`text-xs font-semibold uppercase tracking-widest`, ex. "PRÓXIMA CELEBRAÇÃO" no
Dashboard) já existe em 4 arquivos — reaproveitado como base do nível `Label` da escala.

## Decisão explícita: família tipográfica principal (SPEC-003 §10, §58)

**Problema**: qual família substitui a stack `system-ui` padrão do Tailwind, cumprindo os
critérios do §10 (legibilidade, acentuação em português, leitura em mobile, variedade de pesos,
distinção títulos/corpo, carregamento razoável), sem ser decorativa.

**Alternativa A — Inter** (Google Fonts, variable font, auto-hospedável)
- Vantagens: desenhada especificamente para telas e tamanhos pequenos de UI — resolve
  diretamente o problema de legibilidade que motivou esta task (§12); suporte completo a
  diacríticos latinos/português; um único arquivo variável cobre toda a faixa de pesos
  necessária (carregamento leve, sem múltiplas requisições por peso); ampla distinção óptica
  entre pesos (permite hierarquia títulos/corpo só por peso, sem depender só de tamanho);
  auto-hospedável, sem dependência de CDN externo em runtime.
- Desvantagens: é uma das fontes de interface mais usadas do mercado atualmente — sozinha, não
  contribui muito para uma identidade "exclusiva" do produto.

**Alternativa B — Manter a stack `system-ui` atual**
- Vantagens: zero mudança, zero custo de carregamento adicional, cada usuário já vê a fonte
  nativa do próprio sistema operacional (familiaridade).
- Desvantagens: aparência varia entre plataformas (o mesmo texto parece diferente no Android,
  iOS, Windows) — vai contra a consistência visual entre dispositivos que um Design System
  próprio busca (§4.2); nenhuma fonte de sistema foi desenhada especificamente para o tipo de
  legibilidade em tamanhos pequenos que o problema identificado (§12, chips ~10px) exige
  resolver bem.

**Recomendação**: Alternativa A (Inter).

**Justificativa**: atende de forma direta e comprovada os critérios do §10 — em particular,
"boa leitura em mobile" e "boa distinção entre títulos e corpo", que são exatamente os dois
pontos fracos identificados na auditoria (chips ilegíveis no calendário, hierarquia tipográfica
"rasa" hoje, texto secundário indistinguível do texto sem importância — achados da
`TASK-0006`/`auditoria-ux.md`). A identidade "própria" do produto, como a SPEC-003 já
antecipa em §46, vem principalmente do conjunto completo do Design System (cor, espaçamento,
componentes, iconografia) e não da fonte isoladamente — sacrificar legibilidade por uma fonte
mais "exclusiva" contrariaria a regra fundamental do §61.

### Ilha tipográfica: `liturgia/Show.vue` (EB Garamond + Playfair Display)

Decisão: **manter, como exceção deliberada e documentada**, não como inconsistência acidental.
A própria auditoria já classifica essa escolha como "bonita e defensável isoladamente" — a
tela de Liturgia existe para apresentar um texto sagrado, e uma tipografia editorial serifada
reforça exatamente o contexto litúrgico que a SPEC-003 pede para aparecer "de maneira sutil e
elegante" (§3), sem se espalhar por telas operacionais onde atrapalharia a leitura rápida
(listas, formulários, badges). Formalizada como um token secundário (`--font-family-serif` ou
equivalente), de uso restrito a conteúdo litúrgico apresentado como texto corrido — não deve
migrar para títulos de tela, botões ou dados operacionais.

## Escala tipográfica (§11)

| Nível | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| Display | 2.25rem (36px) | 700 (bold) | 1.2 | Números de destaque (ex. stats do Dashboard, já usados como `text-4xl font-extrabold` hoje) |
| H1 | 1.875rem (30px) | 700 | 1.25 | Título de página |
| H2 | 1.5rem (24px) | 600 | 1.3 | Título de seção/card principal |
| H3 | 1.25rem (20px) | 600 | 1.35 | Subtítulo de bloco |
| H4 | 1.125rem (18px) | 600 | 1.4 | Título de item/subseção |
| Body | 1rem (16px) | 400 | 1.5 | Texto padrão |
| Body Small | 0.875rem (14px) | 400 | 1.5 | Texto secundário, legendas |
| Caption | 0.75rem (12px) | 400 | 1.4 | Metadado auxiliar — **piso mínimo de tamanho**, nunca menor |
| Label | 0.75rem (12px) | 600, uppercase, tracking ampliado | 1.4 | Rótulo "eyebrow" (reaproveita o padrão já existente em 4 arquivos, ex. "PRÓXIMA CELEBRAÇÃO") |

## Regra de legibilidade mínima (§12)

`Caption` (0.75rem/12px) é o **piso absoluto** de tamanho em todo o sistema — elimina
diretamente o `text-[10px]` encontrado no chip do calendário do Dashboard (achado da
`TASK-0006`). Nenhuma informação essencial (nome do celebrante, status, dado de decisão) pode
usar um tamanho abaixo de `Body Small` (14px); `Caption`/12px fica reservado só para metadado
verdadeiramente auxiliar (ex. um timestamp discreto), nunca para informação que o usuário
precisa para agir — resposta direta ao achado de que o nome do celebrante ficava, no chip atual,
tanto pequeno demais quanto escondido (`hidden lg:inline`).

## Tokens (§51, categoria Typography)

```text
--font-family-base     Inter, system-ui, sans-serif   (fallback seguro, sem depender só de CDN)
--font-family-serif    EB Garamond, Georgia, serif    (uso restrito: conteúdo litúrgico em texto corrido)

--font-size-display / --font-size-h1 ... --font-size-label   (valores da tabela acima)
--font-weight-regular (400) / --font-weight-semibold (600) / --font-weight-bold (700)
--line-height-tight (1.2–1.3) / --line-height-normal (1.4–1.5)
```

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §10, §11, §12, §51 (Typography), §58.
- `TASK-0016`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Confirmado que `tailwind.config.js` não estende
  `fontFamily` hoje (só a stack `system-ui` padrão). Decisão de família tipográfica registrada
  no formato §58: recomendado Inter, justificado pelos dois critérios do §10 que respondem
  diretamente aos achados da auditoria (legibilidade em mobile, distinção títulos/corpo).
  Resolvida a "ilha tipográfica" já sinalizada pela `TASK-0016`: `liturgia/Show.vue` mantém EB
  Garamond/Playfair Display como exceção deliberada e documentada (token serif de uso
  restrito), não como inconsistência a eliminar. Escala tipográfica completa definida (9
  níveis), reaproveitando o padrão "eyebrow" (`uppercase tracking-widest`) já usado em 4
  arquivos como base do nível `Label`. `Caption`/12px fixado como piso mínimo absoluto do
  sistema, eliminando o `text-[10px]` do chip do calendário. Task marcada `concluida`. Próximo
  passo: TASK-0019 (espaçamento, radius, elevação e grid) já está elegível.
