---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0030 — Fundação: componentes base — controles interativos

**Task ID**: `TASK-0030`

## Objetivo

Implementar/migrar os componentes de controle interativo especificados em
`docs/tasks/0021-componentes-controles-interativos.md`: `PrimaryButton`/`SecondaryButton`/
`DangerButton` (migrar cor para o token `primary`), `TertiaryButton` (novo), `IconButton`
(novo), `TextInput` (adicionar variante de erro/sucesso), `Select` (novo, envolve `<select>`
nativo — **não substituir por combobox customizado**, SPEC-004 §62/SPEC-003 §24), `Textarea`
(novo), `Checkbox` (novo), `Radio` (novo), `Switch` (novo).

## Arquivos/componentes envolvidos

- `src/components/PrimaryButton.vue`, `SecondaryButton.vue`, `DangerButton.vue` — editar.
- `src/components/TertiaryButton.vue`, `IconButton.vue`, `Select.vue`, `Textarea.vue`,
  `Checkbox.vue`, `Radio.vue`, `Switch.vue` — criar.
- `src/components/TextInput.vue` — editar (estado de erro/sucesso).
- Nenhum arquivo de página deve ser alterado nesta task — só os componentes base
  (reutilização real só se confirma quando as telas os adotarem, tasks seguintes).

## Comportamento esperado

Cada botão ganha estado de `loading` com spinner visual (hoje é só troca de texto). Área de
toque mínima 44×44px em todos os controles (`docs/design-system.md`, touch target). Ícones via
Heroicons (`@heroicons/vue` — adicionar dependência, justificar em `docs/decisions/` por não
ser "biblioteca de UI" no sentido que o §62/§59 da SPEC-004 proíbe, é só um conjunto de glifos).
`Select`/`Checkbox`/`Radio` mantêm o elemento nativo do navegador por baixo, só estilizados.

## Dependências

- `TASK-0029` — tokens de cor/tipografia/espaçamento/radius.

## Critérios de conclusão

- [x] `PrimaryButton` usa `--color-primary` (migra de `bg-gray-800`); `Secondary`/`Danger`
      mantidos conceitualmente, tokens aplicados.
- [x] `TertiaryButton` criado, substituindo o padrão hoje copiado inline em cabeçalhos
      (`bg-gray-200 text-gray-700 uppercase...`, repetido em múltiplas telas — não alterar essas
      telas ainda, só criar o componente).
- [x] `IconButton` criado, sempre exigindo prop de `aria-label`.
- [x] Os 6 estados obrigatórios (default/hover/active/focus/disabled/loading) implementados nos
      botões.
- [x] `Select.vue` criado envolvendo `<select>` nativo — nenhuma mudança de comportamento
      (opções, seleção, submissão continuam idênticas às do `<select>` cru usado hoje).
- [x] `Checkbox.vue`/`Radio.vue`/`Switch.vue` criados com label pareado corretamente
      (`<label>`/`for`/`id` ou wrapping), acessíveis por teclado.
- [x] `npm run build` passa sem erros.
- [x] Nenhuma tela existente foi alterada nesta task (componentes ainda não adotados em
      nenhuma página) — confirmado via `git status` restrito a `src/components/`,
      `tailwind.config.js`, `src/assets/app.css` e `package.json`/`package-lock.json`
      (dependência nova).

## Correção importante encontrada durante a implementação

Ao dar `disabled`/`loading` a `SecondaryButton`, descobri que o componente **nunca teve o
atributo `disabled` de fato ligado ao elemento** — a classe `disabled:opacity-25` já existia no
CSS, mas como `:disabled` nunca era vinculado ao `<button>`, essa variante nunca ativava. Bug
pré-existente, corrigido como parte natural desta task (adicionar a prop `disabled` que faltava),
não uma mudança de escopo.

## Decisão de implementação: componente `Spinner` interno

Criei `src/components/Spinner.vue`, não citado nominalmente na especificação — é usado
identicamente por 5 componentes desta task (`PrimaryButton`, `SecondaryButton`, `DangerButton`,
`TertiaryButton`, `IconButton`) para o estado de loading, o que já passa o critério de
reutilização (repetição real, `docs/tasks/0020-*.md`) sem precisar de uma task própria.

## Riscos

- Migrar a cor do `PrimaryButton` de cinza-escuro para azul pode ter impacto visual amplo assim
  que for adotado nas telas seguintes — não é risco desta task isoladamente (nada consome ainda
  o componente alterado em produção até as tasks de tela), mas vale registrar para quem revisar.
- Se `@heroicons/vue` não for compatível com a versão do Vue/Vite do projeto, avaliar
  alternativa antes de prosseguir — não travar a task, registrar em `docs/decisions/`.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §8, §9, §10.
- `docs/tasks/0021-componentes-controles-interativos.md` (especificação completa).
- [`docs/design-system.md`](../design-system.md) — seção 7.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. **Correção importante à própria task**: o texto
  original dizia que migrar a cor do `PrimaryButton` "não é risco desta task isoladamente, nada
  consome ainda o componente" — isso estava errado: `PrimaryButton`/`SecondaryButton`/
  `DangerButton`/`TextInput` já são consumidos por dezenas de telas hoje, então a mudança de cor
  tem efeito visual imediato e amplo assim que mesclada, não só "quando adotado depois". Segui
  em frente porque a mudança em si é a aplicação direta e já decidida da Etapa 3 (não uma
  invenção desta task), mas registro a correção para não deixar a suposição errada parada no
  histórico. Instalado `@heroicons/vue` (não usado diretamente nesta task — os componentes de
  ícone ficam para as tasks de tela, mas a dependência já fica disponível). Corrigido um bug
  pré-existente: `SecondaryButton` nunca teve o atributo `disabled` de fato vinculado ao
  elemento, apesar de ter a classe CSS para esse estado. Criado `Spinner.vue` (não nomeado na
  spec, justificado por repetição real em 5 componentes). `npm run build` validado com sucesso
  após corrigir um erro de sintaxe (usar `class` como identificador de prop é inválido em JS,
  palavra reservada — renomeado para `size`). Nenhum arquivo de página tocado. Task marcada
  `concluida`. Próximo passo: TASK-0031 (componentes de feedback e overlays) já está elegível.
