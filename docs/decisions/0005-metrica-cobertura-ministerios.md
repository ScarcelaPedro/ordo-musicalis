# 0005 — Métrica de "Cobertura dos Ministérios" no Dashboard

- **Data**: 2026-09-25
- **Status**: aceita
- **Validade**: enquanto o sistema não tiver vagas esperadas por celebração/categoria
- **ADR ID**: `ADR-0005`
- **Task relacionada**: `TASK-0103`

## Contexto

A referência visual da SPEC-003.1 mostra "Cobertura dos Ministérios" como frações do tipo
"12/16 escalados" com barra de progresso. A §15 aceita o componente, desde que represente os
ministérios reais com valores reais. O sistema tem o numerador (cada `ScaleServidor` traz
`categoriaId`, ou `teamId` → categoria do team), mas **não tem denominador**: não existe cadastro
de quantas vagas de cada categoria uma celebração precisa. A lacuna já tinha sido registrada na
`TASK-0039` ("funções sem servidor").

## Decisão

Por categoria ativa (`GET /categorias`, na ordem de `ordem`): **quantas celebrações do período
têm ao menos um servidor daquela categoria escalado com status `convidado` ou `confirmado`**,
dividido pelo **total de celebrações do período**. O período é o mesmo mês (e o mesmo filtro de
comunidade) exibido no calendário do Dashboard, e o card diz isso no subtítulo. O rótulo é
"N/M celebrações", nunca "escalados". Escalações `recusado`/`substituido` não cobrem a
celebração. Para cada escalação, a categoria vem do pivot e, se ausente, da categoria do team
(mesmo fallback de `scales/Show.vue`).

Cálculo em `src/utils/coverage.ts` (`computeCoverage`, `coveragePercent`), com testes. Nenhuma
mudança de API ou banco: usa `GET /scales?mes=` (já carregado), `GET /categorias` e `GET /teams`.

Muitas categorias (§16): a lista rola dentro do card a partir de 7 itens (`max-h-80`), sem
esticar o Dashboard. Barra em `primary` (nunca cor litúrgica, §24), com texto numérico ao lado e
`role="progressbar"` + `aria-label` completo (§25).

## Alternativas consideradas

- **(b) Total de escalados por categoria, sem fração nem barra**: descartada. Um número absoluto
  ("7 leitores escalados") não responde "a situação está coberta?", que é a necessidade do
  coordenador (§7, "cobertura").
- **(c) Criar vagas esperadas por categoria/celebração**: descartada nesta etapa. Exige mudança
  de modelo, API e fluxo de criação de escala, o que a §30 veda "apenas para reproduzir a
  referência". Se o produto quiser a fração "escalados/necessários", isso é uma decisão de
  escopo do usuário/time e vira uma nova SPEC. Esta ADR deve então ser substituída.
- **Contar só confirmados**: descartada como métrica principal. Uma celebração com convite
  enviado já está "encaminhada" para aquele ministério; confirmações pendentes já têm bloco
  próprio no Dashboard (Pendências de confirmação).

## Consequências

- A métrica mede presença do ministério na celebração, não suficiência. Duas pessoas numa
  função que exige quatro aparecem como "coberta". Isso é aceito conscientemente e explicado no
  subtítulo do card.
- Categorias que por natureza não servem em toda celebração (ex. uma equipe só de solenidades)
  terão cobertura baixa por definição. O card não julga isso (não há alerta ou cor de erro),
  apenas informa.
