---
status: concluida
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0088 — Correção: "Sua próxima escala" no Dashboard ignora escalas fora do mês em exibição

**Task ID**: `TASK-0088`

**Prioridade**: P1

## Descrição

Corrigir `Dashboard.vue` para que o bloco "Sua próxima escala" (prioridade #1 do Dashboard do
servidor, definida na `TASK-0038`) encontre a próxima escala do servidor de verdade, independente
de qual mês o calendário do Dashboard esteja exibindo no momento.

## Problema

Confirmado com screenshot e reprodução real na `TASK-0060`: `Dashboard.vue` (`load()`, linha
~74) busca `GET /scales` com `params: { mes: currentYear-currentMonth }` — sempre o mês
atualmente exibido no calendário (por padrão, o mês corrente real). `myNextScales` (linha 176)
filtra esse mesmo array já restrito por `dataCelebracao >= hoje`. Resultado: uma escala real,
futura, já confirmada no sistema, mas fora do mês em exibição (ex.: mês seguinte), **não aparece
de jeito nenhum** no bloco "Sua próxima escala" — o card inteiro desaparece e vira o estado vazio
"Nenhuma escala sua neste período.", na posição mais proeminente da tela, logo abaixo do
"Bem-vindo". `scales/MyScales.vue` não tem esse problema (busca sem o parâmetro `mes`).

## Impacto

**P1, não P0**, porque existe um caminho alternativo funcional (`Minha Escala`, 1 toque na bottom
nav mobile) — mas é crítico porque o caminho quebrado é exatamente o que a Etapa 4 desenhou para
ser o principal ponto de entrada do servidor, e a mensagem que mostra ("nenhuma escala") é
**ativamente enganosa**, não neutra: um servidor que confie só no Dashboard concluiria — errado —
que não tem nada agendado, podendo perder o prazo de confirmar presença numa escala real.

## Tela

`/dashboard` (perfil servidor).

## Componente

`src/pages/dashboard/Dashboard.vue` — `load()` e `myNextScales` (computed).

## Comportamento atual

```js
const mes = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2,'0')}`
const { data } = await client.get('/scales', { params: { mes, comunidadeId: ... } })
scales.value = data
// myNextScales filtra scales.value (já restrito ao mês do calendário)
```

## Comportamento esperado

`myNextScales` (perfil servidor) deve ser calculado a partir de uma consulta própria, sem o
filtro de `mes` — mesmo padrão que `MyScales.vue` já usa com sucesso — independente do mês que o
calendário do coordenador (elemento visual não relacionado à prioridade #1) está exibindo. O
calendário em si pode continuar respeitando o filtro de mês normalmente; só o bloco "Sua próxima
escala" precisa de uma fonte de dado sem essa restrição.

## Critérios de aceite

- [x] Um servidor com uma escala futura confirmada em qualquer mês (não só o mês corrente) vê
      essa escala corretamente no bloco "Sua próxima escala" do Dashboard, sem precisar navegar
      o calendário até o mês certo.
- [x] Nenhuma chamada de API nova além da já usada por `MyScales.vue` (reaproveitar o mesmo
      padrão, não inventar endpoint).
- [x] O calendário do Dashboard (coordenador) continua funcionando por mês normalmente — esta
      correção não deve alterar esse comportamento.
- [x] Testado com dado real (não só leitura de código) — escala futura fora do mês corrente
      aparecendo corretamente no bloco de destaque.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0060-ux-fluxos-servidor.md` — achado original (P1), com screenshot
  (`01-dashboard-mobile.png`) e causa-raiz precisa.
- `docs/tasks/0063-ux-hierarquia-navegacao.md` — confirmação de que o widget "Pendências de
  confirmação" do coordenador (que usa `/scales/pendentes`, sem filtro de mês) **não** tem o
  mesmo problema — evidência de que o bug é específico do card do servidor, não sistêmico.
- `docs/tasks/0008-wireframes-dashboard.md` — prioridade original (§5.1) que este bloco deveria
  cumprir.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §53, §55 (regra de decisão: bug → corrigir).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir do achado mais
  crítico de toda a etapa (único P1 registrado), da `TASK-0060`.
- 2026-08-25 — Task reivindicada e corrigida. `Dashboard.vue`: adicionado `myScalesAll` (novo
  `ref`) + `loadMyScales()` (novo `GET /scales?mine=true`, sem `mes` — mesmo endpoint e parâmetro
  já usados por `MyScales.vue`, nenhum endpoint novo criado), chamado em `onMounted` só quando
  `!auth.isStaff`. `myNextScales` (computed) passou a filtrar `myScalesAll.value` em vez de
  `scales.value` (que continua existindo, sem alteração, só para o calendário mês-a-mês). O
  `v-if` de loading do bloco "Sua próxima escala" trocou de `loading` (compartilhado com o
  calendário) para um `loadingMyScales` próprio, para não ficar preso ao ciclo de carregamento
  de um dado que não é mais a fonte usada ali.

  `npm run build` passou sem erros; `dist/` revertido. **Testado com dado real**, não só leitura
  de código: seed temporário `api/prisma/_seedTask0088.ts` (deletado ao final, nunca commitado)
  recriou exatamente o cenário que reproduziu o bug original na `TASK-0060` — `musico` com uma
  escala confirmada em setembro/2026 (mês seguinte ao calendário, que mostra agosto/2026 por
  padrão). Antes da correção, o Dashboard mostrava "Nenhuma escala sua neste período."; depois,
  mostra corretamente o card "Sua próxima escala" com a celebração de setembro, botão "Confirmar
  presença", e os links contextuais de repertório/liturgia — confirmado por screenshot
  (`dashboard-corrigido.png`) e por asserções de texto na página (não inferência de código).
  Regressão verificada: Dashboard do coordenador carrega normalmente ("Pendências de
  confirmação" segue mostrando a mesma escala corretamente, como já fazia antes — endpoint
  `/scales/pendentes` não foi tocado), e a navegação do calendário por mês (agosto → setembro)
  continua funcionando sem alteração de comportamento.

  Ambiente (Docker + `npm run dev:full`) encerrado ao final: dev servers finalizados, container
  Postgres removido, seed temporário apagado. `git status` confirmado: só `Dashboard.vue` mudou
  em `src/pages/dashboard/`, nenhum outro arquivo tocado além do já esperado (os 20 arquivos das
  `TASK-0069`/`0070`, que seguem intocados por esta task). Task marcada `concluida`. Próximo
  passo: `TASK-0073` (próxima P2 elegível — comunidade vazia ao criar escala) ou, se a execução
  autônoma preferir seguir a ordem numérica das tasks de correção restantes, qualquer uma das
  `TASK-0073`-`0078` (P2), todas elegíveis e sem dependência entre si.
