---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0074 — Correção: `Modal` não devolve o foco quando aberto a partir de um item de `Dropdown`

**Task ID**: `TASK-0074`

**Prioridade**: P2

## Descrição

Corrigir o retorno de foco de `Modal.vue` no caso específico em que ele é aberto a partir de um
item dentro de `Dropdown.vue` — hoje o foco se perde (cai em `document.body`) ao fechar o modal
com `Escape`, em vez de voltar para o elemento que o abriu.

## Problema

Causa-raiz já isolada com evidência comparativa real (`TASK-0065`): quando um modal é aberto por
um botão comum, `previouslyFocused?.focus()` funciona perfeitamente — o foco volta exatamente
para o botão que abriu o modal. Mas quando o modal é aberto a partir de um item dentro de um
`Dropdown` (ex.: "Mais" → "Excluir" nas listagens mobile), o `Dropdown` desmonta o item clicado
no mesmo ciclo de reatividade em que o `Modal` abre — então, quando o `Modal` tenta devolver o
foco ao fechar, o elemento que ele guardou como "previamente focado" já não existe mais no DOM, e
o foco cai em `document.body`.

## Impacto

Afeta todo fluxo de exclusão disparado a partir do menu "Mais" em telas mobile (pelo menos 8
listagens usam esse padrão: servidores, celebrantes, comunidades, categorias, equipes, modelos de
escala, escalas, substituições). Um usuário navegando só por teclado perde completamente a
referência de onde está depois de cancelar uma exclusão — precisa recomeçar a navegação do zero
pela página. Não é uma perda de dado nem impede a tarefa, mas é uma quebra real de acessibilidade
por teclado (SPEC-005 §26: "nunca permitir que o usuário perca completamente a referência de onde
está").

## Tela

Qualquer listagem que use `Dropdown` (menu "Mais") + `Modal` de confirmação em conjunto, em
largura mobile — reproduzido concretamente em `/servidores`.

## Componente

`src/components/Modal.vue` (armazena `previouslyFocused` e tenta `.focus()` nele ao fechar) e
`src/components/Dropdown.vue` (desmonta o item clicado antes de o `Modal` conseguir capturar uma
referência estável).

## Comportamento atual

`Modal.vue` captura `document.activeElement` no momento em que abre, mas se esse elemento for
removido do DOM antes do modal fechar (caso do item de `Dropdown`), `.focus()` nele não tem
efeito e o foco cai em `document.body`.

## Comportamento esperado

Ao fechar, o foco deve ir para um elemento válido e previsível — o próprio botão/trigger que
abriu o `Dropdown` (não necessariamente o item interno que foi clicado, já que esse pode não
sobreviver) é o candidato mais estável, já que o `Dropdown` sabe qual foi seu próprio elemento de
abertura.

## Critérios de aceite

- [x] Abrir "Mais" → "Excluir" em `/servidores` (mobile) via teclado, cancelar a exclusão com
      `Escape`: o foco volta para um elemento visível e sensato na página (idealmente o botão
      "Mais" que abriu o menu), não para `document.body`.
- [x] O caminho "limpo" já confirmado funcionando (`Modal` aberto por um botão comum, sem
      `Dropdown` no meio) continua funcionando sem regressão.
- [x] Testado em pelo menos 2 das 8 listagens afetadas (servidores e celebrantes).
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0065-ux-modais-drawers-notificacoes-escala.md` — reprodução comparativa
  (caminho limpo vs. via Dropdown), causa-raiz isolada.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.3, item 10
  (achado original, Etapa 4).
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §26, §39, §55 (regra de decisão: bug →
  corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  originalmente registrado no relatório da Etapa 4 e reconfirmado com evidência mais precisa na
  `TASK-0065`.
- 2026-08-25 — Task reivindicada e corrigida. **A primeira tentativa de correção não funcionou**,
  e a investigação de por quê revelou a causa-raiz real, mais sutil do que a hipótese original.

  Tentativa 1 (não funcionou): devolver o foco pro trigger dentro de `close()`, no handler
  `@click` normal (fase de bubble) do wrapper de itens — a mesma ideia registrada no
  "Comportamento esperado" desta task. Instrumentado com `console.log` + `performance.now()` em
  `Dropdown.vue`, `Modal.vue` e `servidores/Index.vue` pra medir a ordem real de execução, e os
  timestamps mostraram algo inesperado: o handler do item (`pedirExclusao`, que abre o Modal) e o
  watcher assíncrono do `Modal.vue` (que captura `previouslyFocused` e já move o foco pra dentro
  do modal via `nextTick()`) **completam inteiramente antes** do `close()` do Dropdown chegar a
  rodar — apesar de `close()` estar no mesmo elemento pai, ligado ao mesmo evento de clique que
  deveria borbulhar de forma síncrona. Ou seja: `close()` (fase de bubble) roda tarde demais —
  o Modal já tinha assumido o foco antes de o Dropdown ter a chance de agir.

  Tentativa 2 (funcionou): mover a lógica de devolução de foco para um listener **em fase de
  captura** (`@click.capture`) no wrapper de itens, em vez de depender do `@click` normal (fase
  de bubble). A fase de captura roda **antes** do handler do próprio item (inclusive antes do que
  abre o Modal), então o foco já está de volta no trigger do Dropdown no exato momento em que o
  item aciona sua própria ação — eliminando a corrida de vez, sem depender de nenhuma suposição
  frágil sobre timing relativo entre bubble e reatividade assíncrona do Vue.

  `Dropdown.vue`: adicionados `triggerWrapper`/`itemsWrapper` (refs), `onItemsClickCapture()`
  (novo handler, `@click.capture` no wrapper de itens) que devolve o foco pro primeiro elemento
  focável dentro do trigger **antes** de qualquer ação do item rodar, mas só quando o foco atual
  realmente está dentro do menu (não interfere com fechamento por clique fora). `close()` (fase
  de bubble, já existia) ficou só com a responsabilidade original de fechar o menu.

  `npm run build` passou sem erros; `dist/` revertido. **Testado com dado real e teclado real**
  (`Tab`/`Enter`/`Escape`, sem `.click()` sintético): reproduzido o cenário exato da `TASK-0065`
  em `/servidores` — foco no botão "Mais" → `Enter` abre o menu → 2× `Tab` até "Excluir" →
  `Enter` abre o modal → `Escape` fecha → **foco volta corretamente pro botão "Mais"**
  (antes: `BODY/nenhum`). Reconfirmado em `/celebrantes` (2ª das 8 listagens afetadas). Regressão
  verificada: o "caminho limpo" (modal aberto por um botão comum, sem `Dropdown`) continua
  devolvendo o foco corretamente; o link "Editar" dentro do `Dropdown` continua navegando
  normalmente; clicar fora do `Dropdown` continua fechando o menu sem efeito colateral.

  Nenhum seed temporário criado nesta task (reaproveitou dados já existentes + criados via UI
  durante o próprio teste). `git status` confirmado: só `Dropdown.vue` mudou de fato em
  `src/components/` — `Modal.vue` e `servidores/Index.vue` receberam `console.log` de depuração
  temporários durante a investigação, mas voltaram ao conteúdo original byte a byte depois de
  removidos (`git status` confirma 0 diff nos dois). Ambiente (Docker + `npm run dev:full`)
  **mantido de propósito** para a `TASK-0075` (P2, próxima por menor número), que também precisa
  de navegador real — será encerrado ao final daquela. Task marcada `concluida`.
