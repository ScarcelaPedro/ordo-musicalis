---
status: concluida
modulo: src/pages/scaleTemplates
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0086 — Correção: permitir configurar vínculos fixos já na criação de uma recorrência

**Task ID**: `TASK-0086`

**Prioridade**: P3

## Descrição

Levar a seção "Vínculos fixos" (hoje só em `scaleTemplates/Edit.vue`) também para
`scaleTemplates/Create.vue`, evitando o passo extra de "criar → salvar → editar → configurar".

## Problema

Confirmado por comparação de código na `TASK-0066`: `scaleTemplates/Edit.vue` tem uma seção
inteira ("Vínculos fixos" — servidores escalados automaticamente sempre que a recorrência gerar
uma celebração) que `scaleTemplates/Create.vue` não tem de jeito nenhum. Diferente do padrão já
usado em `teams/Create.vue`, que permite adicionar servidores durante a própria criação (mesmo
formulário, sem passo extra).

## Impacto

Baixo — a funcionalidade existe e é alcançável, só exige um passo extra não óbvio: criar a
recorrência, salvar, e só depois voltar e editar para configurar quem sempre vai.

## Tela

`/escalas-recorrentes/criar`.

## Componente

`src/pages/scaleTemplates/Create.vue` (não tem a seção); `src/pages/scaleTemplates/Edit.vue`
(já tem, serve de referência de implementação).

## Comportamento atual

`Create.vue` só renderiza `<ScaleTemplateForm>` dentro de um card; a seção de vínculos fixos
(listagem + adicionar/remover) só existe em `Edit.vue`, e depende de um `scaleTemplateId` já
existente (`POST /vinculos-fixos` recebe `scaleTemplateId` no corpo).

## Comportamento esperado

Avaliar a abordagem mais simples: (a) permitir adicionar vínculos fixos como parte do mesmo
formulário de criação, enviados junto no `POST /scale-templates` inicial (exigiria mudança na
API), ou (b) manter a criação em duas etapas visíveis ao usuário — salvar a recorrência primeiro
e, na mesma tela (sem navegação), liberar a seção de vínculos fixos assim que o
`scaleTemplateId` existir (abordagem sem mudar a API, mais simples). A opção (b) é a recomendada,
por não exigir alteração de contrato de API.

## Critérios de aceite

- [x] `scaleTemplates/Create.vue` permite configurar vínculos fixos sem precisar navegar
      separadamente para `Edit.vue` depois de salvar.
- [x] Nenhuma alteração no contrato da API (`POST /scale-templates`, `POST /vinculos-fixos`) a
      menos que a abordagem (a) seja escolhida deliberadamente, com justificativa registrada.
- [x] `npm run build` passa sem erros.

## Dependências

- Nenhuma.

## Referências

- `docs/tasks/0066-ux-densidade-consistencia-linguagem.md` — achado original.
- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §45, §55 (regra de decisão: problema de UX →
  avaliar o fluxo).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0071` (consolidação da Etapa 5), a partir de achado
  registrado em `TASK-0066`.
- 2026-08-26 — Task reivindicada e corrigida, seguindo a abordagem (b) já recomendada no texto
  da própria task — sem alteração de contrato de API. `scaleTemplates/Create.vue` ganhou um
  estado `criado` (a recorrência recém-criada, com `id` real do banco): antes de existir,
  renderiza só o `<ScaleTemplateForm>` de sempre; depois do `POST /scale-templates` ter sucesso,
  em vez de navegar embora imediatamente, a mesma tela passa a mostrar um card de confirmação +
  a seção "Vínculos fixos" completa (listagem, adicionar, remover) — lógica copiada quase
  literalmente de `scaleTemplates/Edit.vue` (a própria task aponta como referência de
  implementação), só trocando a origem do `scaleTemplateId` de `route.params.id` (Edit) para
  `criado.value.id` (Create, o id que acabou de voltar do POST). Um botão "Concluir" novo navega
  pra `/escalas-recorrentes` só quando o usuário decidir que terminou — nada força a navegação
  antes disso.

  `POST /vinculos-fixos` já aceita qualquer `scaleTemplateId` válido existente no momento da
  chamada (confirmado lendo `api/_routes/vinculosFixos.ts`) — não faz diferença nenhuma pra API
  se esse id tem 2 segundos ou 2 meses de existência, então **nenhuma rota precisou mudar**: o
  mesmo `POST /scale-templates` e o mesmo `POST /vinculos-fixos` que já existiam continuam
  exatamente iguais, só a sequência de telas no frontend mudou.

  `npm run build` passou sem erros; `dist/` revertido.

  **Ambiente teve uma interrupção real durante o teste, documentada por transparência**: no meio
  da primeira tentativa de verificação, o container `ordo-postgres` caiu sozinho (`docker ps`
  mostrou `Exited (255)`, sem nenhum erro nos logs do Postgres em si que explicasse — aparenta
  ter sido o Docker Desktop reiniciando sob carga do sistema, não relacionado a esta task; o
  ambiente como um todo esteve visivelmente mais lento a sessão inteira, builds levando minutos
  em vez de segundos). Resolvido descartando e recriando o container do zero (dado de teste é
  sempre descartável, sem motivo pra tentar recuperar), re-rodando migração + seed, confirmado
  reconectado com um login real bem-sucedido antes de repetir o teste.

  **Testado com dado real e navegação real, o fluxo completo ponta a ponta**: seed temporário
  `api/prisma/_seedTask0086.ts` (deletado ao final, nunca commitado) criou 1 servidor. Fluxo
  real via UI: `/escalas-recorrentes/criar` → preencher e salvar → confirmado que a URL **não
  muda** (`staysOnCreatePage: true`, sem navegação, exatamente o que a abordagem (b) pede) e que
  a seção "Vínculos fixos" aparece na mesma tela → selecionar "Ana Souza" no `Select` → "Adicionar
  vínculo" → confirmado na tela. E o teste que realmente prova que não é só um efeito visual:
  **checagem direta via API** (`fetch` real, não suposição) depois de clicar "Concluir" e navegar
  pra `/escalas-recorrentes`, confirmando que o vínculo fixo foi persistido de verdade no banco
  (`GET /vinculos-fixos?scaleTemplateId=...` retornou 1 registro, servidor "Ana Souza"), não só
  que apareceu na tela. Screenshots das 2 etapas (seção liberada vazia; vínculo já adicionado)
  inspecionadas visualmente.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0087` (P3, última da
  fila por número da consolidação original da Etapa 5).
