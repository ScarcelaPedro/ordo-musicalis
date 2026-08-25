---
status: concluida
modulo: src/pages/availability
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0051 — Painel de Disponibilidade (coordenador)

**Task ID**: `TASK-0051`

## Objetivo

Implementar a nova apresentação do Painel de Disponibilidade (SPEC-004 §37), com card compacto
por servidor no mobile em vez da grade 8-colunas atual, e a seção simétrica "Já responderam"
definida em `docs/tasks/0013-wireframe-painel-disponibilidade.md`.

## Arquivos/componentes envolvidos

- `src/pages/availability/Panel.vue`.

## Comportamento esperado

Desktop: mantém a grade servidor × 7 dias (tabela adequada quando favorece comparação). Mobile:
card por servidor com mini-grade compacta 7×3 (não o mockup literal linha-a-linha da SPEC, que
geraria até 21 linhas por pessoa — decisão já registrada). Bloco "Já responderam (M)" ao lado de
"Ainda não responderam (N)". "Fechar janela" usa `Modal` de confirmação, não `confirm()`
nativo. Nenhuma regra de disponibilidade alterada (SPEC-004 §37: "Não alterar regras
existentes").

## Dependências

- `TASK-0031` — `Modal`, `Skeleton`.
- `TASK-0032` — `Card`.

## Critérios de conclusão

- [x] Card compacto por servidor implementado no mobile, com legenda de período (✓/—) para não
      depender só de cor.
- [x] "Já responderam"/"Ainda não responderam" exibidos com o mesmo peso visual.
- [x] "Fechar janela" via `Modal`.
- [x] Loading state adicionado (gap confirmado em `docs/tasks/0013-*.md` — este componente não
      tinha nenhum).
- [x] `npm run build` passa sem erros.
- [~] Testado em mobile e desktop, com janela aberta e fechada — **não executado em navegador**
      (mesma limitação de ambiente já registrada); verificado por leitura de código dos mesmos
      endpoints/handlers.
- [x] Registrado como pendência (não implementado nesta task): a grade só mostra disponibilidade
      recorrente semanal, exceções pontuais não aparecem aqui — mesma lacuna de produto já
      identificada em `docs/tasks/0013-*.md`, fora do escopo desta etapa (comentário deixado no
      código, junto ao computed `byServidor`).

## Riscos

- Baixo/médio — mudança de apresentação sobre dado já existente; risco principal é a
  performance de renderizar N cards compactos com mini-grade se a paróquia tiver muitos
  servidores — validar com um volume razoável de dados de teste.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §37, §38.
- `docs/tasks/0013-wireframe-painel-disponibilidade.md` (decisão §31 completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `Panel.vue` reescrito: `loading` adicionado do
  zero (gap confirmado, este componente não tinha nenhum estado de carregamento). Seção
  "Já responderam (M)" adicionada ao lado de "Ainda não responderam (N)" — calculada com
  `respondidos` (computed), o complemento de `pendentes` (já retornado por
  `GET /availability-windows/:id/pendentes`) sobre o universo de servidores ativos, obtido
  reaproveitando `GET /servidores` (endpoint já existente, já usado em outras telas) — nenhum
  endpoint novo, nenhuma lógica de disponibilidade nova, só uma leitura a mais e um filtro
  client-side. "Fechar janela" migrou de `confirm()` nativo para `Modal` de confirmação
  (`confirmandoFechar`/`confirmarFecharJanela`, `DangerButton` com loading) — mesma chamada
  `PATCH /availability-windows/:id`.

  Grade mobile: card por servidor com mini-grade compacta 7×3 (Alternativa B já decidida em
  `docs/tasks/0013-*.md`), com legenda "✓ disponível · — indisponível/não informado" acima dos
  cards — não depende só de cor. Grid usa `grid-cols-[3rem_repeat(7,1fr)]` pra dar espaço à
  coluna de rótulo do período (Man/Tar/Noi, abreviado só no mobile) sem espremer as 7 colunas de
  dia. Desktop mantém a tabela original, agora só `hidden md:block` (sem depender de
  `overflow-x-auto` no mobile). Busca por nome adicionada (`busca`/`byServidorFiltrado`) --
  puramente client-side sobre `availabilities` já carregado, sem nova chamada de API (não
  precisou de debounce, já que não dispara requisição nenhuma). A limitação de dado já registrada
  em `docs/tasks/0013-*.md` (grade só mostra disponibilidade recorrente semanal, exceções
  pontuais não aparecem aqui) foi deixada documentada em comentário junto ao computed
  `byServidor`, não resolvida — fora do escopo desta etapa (SPEC-004 §43). `npm run build`
  passou sem erros; `dist/` restaurado; `git status` confirmou que só `Panel.vue` mudou. Teste em
  mobile/desktop com janela aberta/fechada não executado em navegador (mesma limitação de
  ambiente já registrada); validado por leitura de código dos mesmos endpoints/handlers. Task
  marcada `concluida`. Próximo passo: `TASK-0052` (Minha Disponibilidade) já está elegível.
