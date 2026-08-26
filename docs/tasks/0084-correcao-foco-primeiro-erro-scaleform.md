---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0084 — Correção: foco não vai para o primeiro campo inválido após erro de validação

**Task ID**: `TASK-0084`

**Prioridade**: P3

## Descrição

Mover o foco do teclado para o primeiro campo com erro quando a validação da Etapa 1 do
`ScaleForm` falhar.

## Problema

Confirmado na `TASK-0064`: em `ScaleForm.vue` Etapa 1, clicar "Avançar" sem preencher nada mostra
corretamente as 4 mensagens de erro (já validado como claras e específicas na `TASK-0062`), mas o
foco do teclado permanece no próprio botão "Avançar" em vez de mover para `#input-data` (o
primeiro campo com erro).

## Impacto

Baixo — o §38 trata isso como "quando apropriado" (não obrigatório), e o erro já é visível
visualmente. Mas é uma melhoria de acessibilidade de baixo custo: ajuda especialmente leitores de
tela e navegação só por teclado a chegar direto no problema, sem precisar procurar visualmente
pela tela.

## Tela

`/escalas/criar`, `/escalas/:id/editar` (Etapa 1 do `ScaleForm`).

## Componente

`src/pages/scales/ScaleForm.vue` (função `avancar()`/`validarEtapa1()`).

## Comportamento atual

Após validação falhar, o foco permanece no botão que disparou a validação.

## Comportamento esperado

Quando `validarEtapa1()` encontrar erros, mover o foco para o primeiro campo inválido (na ordem
em que aparecem no formulário: data → horário → celebração → comunidade).

## Critérios de aceite

- [x] Clicar "Avançar" na Etapa 1 sem preencher nada move o foco para `#input-data`.
- [x] Se só um campo específico estiver inválido (ex.: só a comunidade), o foco vai direto para
      ele, não necessariamente para o primeiro campo do formulário.
- [x] Navegação por teclado no restante do formulário não é afetada.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0064-ux-busca-filtros-formularios.md` — achado original.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §38, §55 (regra de decisão: problema de UX →
  avaliar o fluxo).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0064`.
- 2026-08-26 — Task reivindicada e corrigida. Nova função `focarPrimeiroErroEtapa1()`, chamada
  de dentro de `avancar()` quando `validarEtapa1()` retorna `false`: percorre os 4 campos na
  mesma ordem em que `validarEtapa1()` já os checa (data → horário → celebração → comunidade,
  a mesma ordem em que aparecem no formulário), encontra o primeiro com `etapa1Erros[chave]`
  verdadeiro, e chama `.focus()` nele via `document.getElementById(id)` — mesmo padrão de acesso
  a elemento já usado em `irPara()` (poucas linhas acima no mesmo arquivo, TASK-0042), só que
  focando em vez de `scrollIntoView`. Envolvido em `await nextTick()` pelo mesmo motivo que
  `irPara()` já usa: garante que o DOM já refletiu a mudança de estado antes de tentar
  manipulá-lo (ainda que, neste caso específico, os campos da Etapa 1 já estejam sempre
  montados quando `avancar()` roda, então o `nextTick` é mais uma garantia defensiva que uma
  necessidade estrita).

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com navegação real e verificação de foco real via teclado** (`document.activeElement`,
  não suposição): (1) `/escalas/criar`, clicar "Avançar" com todos os campos vazios → foco
  confirmado em `#input-data` (primeiro campo, "dd" do seletor nativo de data destacado no
  navegador, visível no screenshot); (2) preencher Data e Horário mas deixar só Celebração vazia
  (Comunidade já vem auto-preenchida pela `TASK-0073`, sempre válida com pelo menos 1 comunidade
  cadastrada) → foco vai direto pra `#input-celebracao`, pulando os campos já válidos — confirma
  o critério "vai direto pro campo específico, não necessariamente o primeiro"; (3) navegação Tab
  normal a partir de `#input-data` — descoberta lateral do próprio teste: `<input type="date">`
  nativo tem 3 segmentos internos (dia/mês/ano) que o Tab percorre antes de sair do campo
  (confirmado testando 4 Tabs seguidos: os 3 primeiros mantêm o foco reportado em `#input-data`,
  só o 4º move pra `#input-horario`) — comportamento nativo do navegador, sem nenhuma relação
  com esta correção, só uma particularidade que quase gerou um falso positivo no teste até eu
  investigar por que o 1º Tab "não movia" o foco.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido (nenhum seed
  extra precisou ser criado — a comunidade já seedada por padrão bastou). Task marcada
  `concluida`. Próximo passo: `TASK-0085` (P3, seguinte na fila por número).
