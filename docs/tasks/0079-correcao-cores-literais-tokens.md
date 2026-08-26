---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0079 — Correção: cores literais em vez de tokens semânticos no Dashboard e Liturgia

**Task ID**: `TASK-0079`

**Prioridade**: P3

## Descrição

Trocar classes de cor Tailwind literais por tokens semânticos do Design System em pontos
específicos do Dashboard e da tela de Liturgia — fora as exceções já conscientes de cor
litúrgica.

## Problema

Confirmado por `grep` na `TASK-0057`: `dashboard/Dashboard.vue` usa `emerald-50/100/600/700`,
`amber-50/100/600/700/800` e `indigo-50/200/700` literais em pelo menos 4 pontos (badges de
status, stat cards "Confirmadas"/"Rascunhos", alerta de pendência, legenda do calendário) em vez
dos tokens `success`/`accent`/`primary` — introduzido durante a correção de contraste da
`TASK-0055`. `liturgia/Show.vue` usa `bg-indigo-100 text-indigo-800`/`bg-yellow-100
text-yellow-800` literais nos badges "Tem Glória"/"Tem Credo"/"Corrigido manualmente" em vez de
`primary`/`warning` (ou do componente `Badge.vue`, nunca importado nessa tela).

## Impacto

Visualmente idêntico hoje (as cores literais coincidem com os valores atuais dos tokens), mas
quebra o propósito de ter tokens semânticos — se a paleta for ajustada no futuro, esses pontos
não acompanham a mudança automaticamente. Baixo impacto imediato, por isso P3.

## Tela

`/dashboard` (perfil coordenador), `/escalas/:id/liturgia`.

## Componente

`src/pages/dashboard/Dashboard.vue`, `src/pages/liturgia/Show.vue`.

## Comportamento atual

Classes Tailwind literais (`emerald-*`, `amber-*`, `indigo-*`, `yellow-*`) usadas diretamente em
vez dos aliases semânticos definidos em `tailwind.config.js`.

## Comportamento esperado

Substituir pelos tokens equivalentes: `emerald-*` → `success-*`, `amber-*`/`indigo-*` conforme o
significado real de cada uso (`accent-*` para destaque/aviso, `primary-*` para ênfase padrão) no
Dashboard; no Liturgia, `indigo-*` → `primary-*`, `yellow-*` → `warning-*`, preferencialmente
usando o componente `Badge.vue` em vez de `<span>` com classes manuais.

## Critérios de aceite

- [x] Os 4 pontos do Dashboard identificados na `TASK-0057` usando tokens semânticos.
- [x] Os 3 badges de `liturgia/Show.vue` usando tokens semânticos (ou `Badge.vue`).
- [x] Nenhuma mudança visual perceptível (os valores de cor coincidem hoje) — só a classe
      utilizada muda.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0057-validacao-visual-design-system.md` — achados B e C, com linhas exatas.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §55 (regra de decisão: inconsistência
  visual → corrigir no Design System/componente).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achados
  registrados em `TASK-0057`.
- 2026-08-26 — Task reivindicada e corrigida.

  **`dashboard/Dashboard.vue`** (4 pontos, confirmados por `grep` antes de começar — nenhum
  ponto extra além dos já listados, exceto `CORES_LITURGICAS_CLASSES.Branco: 'bg-amber-100'`,
  que é a exceção de cor litúrgica já documentada em `docs/design-system.md` e explicitamente
  fora do escopo desta task — não tocada):
  1. `chipClass()` (função que colore os chips de celebração no calendário): `emerald-*` →
     `success-*`, `amber-*` → `accent-*`, `indigo-*` → `primary-*`.
  2. Cartões de estatística "Confirmadas" (`emerald-*` → `success-*`) e "Rascunhos" (`amber-*` →
     `accent-*`).
  3. Alerta "Pendências de confirmação" (`amber-*` → `accent-*`, 4 classes).
  4. Legenda do calendário (3 swatches: `amber`→`accent` "Manhã", `indigo`→`primary` "Tarde /
     Noite", `emerald`→`success` "Confirmada").

  Mapeamento de token seguido exatamente como a "Comportamento esperado" desta task descreve —
  importante notar que `accent` (não `warning`) é o token correto para `amber` neste projeto:
  `tailwind.config.js` mapeia `warning: colors.yellow` e `accent: colors.amber` como cores
  **diferentes**, então usar `warning-*` para os pontos `amber-*` teria introduzido uma mudança
  visual real (yellow ≠ amber), violando o próprio critério desta task.

  **`liturgia/Show.vue`** (3 badges): "Tem Glória"/"Tem Credo" (`indigo-*` → `primary-*`,
  mantidos como `<span>` com classes de token — `Badge.vue` não tem uma variante `indigo`/
  `primary` no seu conjunto de cores aceitas, e ampliar a API de um componente usado em muitos
  outros arquivos é uma mudança estrutural maior do que o escopo P3 desta task justifica);
  "Corrigido manualmente" (`yellow-*` → migrado pra `<Badge color="yellow">`, já que o Badge
  já suporta exatamente essa cor e seu resultado (`bg-warning-100 text-warning-800
  dark:bg-warning-900 dark:text-warning-200`) é idêntico byte a byte ao que estava hardcoded —
  essa migração cumpre a preferência "usando o componente Badge.vue" citada na task sem forçar
  os outros 2 badges que não se encaixam na API atual do componente).

  **Achado colateral, não corrigido (fora do escopo desta task)**: o bloco de cartões de
  estatística "Total"/"Confirmadas"/"Rascunhos" do Dashboard não tem nenhum tratamento de modo
  escuro (`bg-white`/`text-gray-600`/`text-gray-800` sem nenhum par `dark:`) — diferente do
  resto do Dashboard, que já foi migrado. Esta task pede só a troca de cor literal→token, "nenhuma
  mudança visual perceptível" — adicionar `dark:` seria uma mudança visual real e vai além do
  escopo pedido; registrado aqui como achado, não implementado.

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real, com verificação de cor computada (não só leitura de
  código), exatamente o método que o critério "nenhuma mudança visual perceptível" pede**: seed
  temporário `api/prisma/_seedTask0079.ts` (deletado ao final, nunca commitado) criou 3 escalas
  (confirmada de manhã, rascunho de manhã, rascunho à noite com 1 servidor pendente de
  confirmação) e 1 registro de `Liturgia` com os 3 badges ativos (`temGloria`/`temCredo`/
  `editadoManualmente`), pra exercitar todos os pontos corrigidos com dado real, não estado
  vazio. Login real via `/login`. `getComputedStyle` confirmou: "Confirmadas" →
  `rgb(21,128,61)` = `#15803d` = exatamente `success-700`/`green-700`; "Rascunhos" →
  `rgb(180,83,9)` = `#b45309` = exatamente `accent-700`/`amber-700` — confirma zero desvio de
  cor na substituição de token. Screenshots capturadas do Dashboard (calendário com os 3 chips
  coloridos batendo com a legenda) e da tela de Liturgia (badges "Tem Glória"/"Tem Credo"/
  "Corrigido manualmente") × 2 temas × 2 viewports (mobile 390px, desktop 1440px), inspecionadas
  visualmente — cores corretas e consistentes com a legenda em todas as combinações.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0080` (P3, seguinte na
  fila por número), ou qualquer outra das `TASK-0081`-`0087` (todas P3, sem dependência entre
  si conhecida).
