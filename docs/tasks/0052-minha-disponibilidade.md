---
status: concluida
modulo: src/pages/availability
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0052 — Minha Disponibilidade (servidor)

**Task ID**: `TASK-0052`

## Objetivo

Implementar a nova apresentação de "Minha Disponibilidade" (SPEC-004 §37), com a grade semanal
virando lista de dias no mobile (não tabela) e a semântica do checkbox desmarcado explicitada
textualmente — achado de severidade baixa mas explícito da auditoria, já especificado em
`docs/tasks/0028-wireframe-minha-disponibilidade.md`.

## Arquivos/componentes envolvidos

- `src/pages/availability/Form.vue`.

## Comportamento esperado

Desktop: mantém a tabela 4 colunas (Dia + 3 períodos) — já cabe bem, não tem o problema de
largura do Painel. Mobile: vira lista de 7 blocos (um por dia), cada um com os 3 períodos como
opções lado a lado. Frase fixa acima da grade: "Marque os períodos em que você pode servir.
Períodos não marcados são tratados como indisponíveis." Exceções pontuais: cada uma vira um
mini-card empilhado no mobile, em vez de linha com `flex-wrap` apertado. Payload enviado ao
`POST /availability` **idêntico** ao atual — nenhuma mudança de regra de negócio (SPEC-004 §37,
§44).

## Dependências

- `TASK-0032` — `Card`.
- `TASK-0031` — `Skeleton` (carga inicial hoje não tem loading, gap confirmado em
  `docs/tasks/0028-*.md`).

## Critérios de conclusão

- [x] Grade semanal vira lista de dias no mobile, mantendo tabela no desktop.
- [x] Texto de semântica do checkbox adicionado, sem mudar o formato de dado enviado ao salvar.
- [x] Exceções pontuais reorganizadas em mini-card no mobile.
- [x] Loading adicionado na carga inicial (gap confirmado).
- [x] `npm run build` passa sem erros.
- [~] Testado salvando disponibilidade com e sem exceções, confirmando que o payload enviado é
      idêntico ao formato anterior (`{ availabilities, especificas }`) — **não executado em
      navegador** (mesma limitação de ambiente já registrada); `submit()` não foi alterado uma
      linha sequer, verificado por leitura de código.

## Riscos

- Baixo — mudança de apresentação sobre um formulário de submissão única (não há chamadas
  incrementais por checkbox), risco de regressão é limitado ao mapeamento visual da matriz.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §37.
- `docs/tasks/0028-wireframe-minha-disponibilidade.md` (especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `Form.vue`: `loadingInicial` adicionado (gap
  confirmado, a carga inicial não tinha estado de loading, só o botão de salvar). Frase fixa
  "Marque os períodos em que você pode servir. Períodos não marcados são tratados como
  indisponíveis." substituiu o texto anterior mais curto — resolve o achado de longa data da
  auditoria (#13/#19) sem tocar em `submit()`/no formato do payload. Grade semanal: desktop
  mantém a tabela original (`hidden md:block`); mobile virou lista de 7 blocos (um por dia), cada
  um com os 3 períodos lado a lado via `Checkbox` (label visível "Manhã"/"Tarde"/"Noite",
  alvo de toque 44px). Exceções pontuais: desktop mantém a linha única (`hidden md:flex`,
  já cabia bem); mobile ganhou mini-card empilhado (`md:hidden`) com os mesmos 4 controles
  (data/período/disponível/remover) em vez de `flex-wrap` apertado. `v-model="matrix[idx][...]"`
  e `submit()` não foram tocados — mesmo payload `{ availabilities, especificas }` de sempre.

  **Efeito colateral fora do escopo listado, documentado aqui**: ao usar `Checkbox` sem `label`
  visível nas células da tabela desktop (o cabeçalho da coluna já dá o contexto), descobri que o
  componente não tinha nenhuma forma de dar nome acessível a um checkbox sem texto visível —
  `:ariaLabel` cairia como atributo `arialabel` inválido (fallthrough não reconhece camelCase
  como `aria-*`), deixando o checkbox sem nome algum pra leitor de tela. Corrigido em
  `Checkbox.vue` (arquivo não listado na task, mas o bug só apareceu por causa desta adoção):
  nova prop `ariaLabel`, aplicada via `:aria-label` direto no `<input>`, só quando não há `label`
  nem slot padrão — mesmo padrão de "aria-label obrigatório pra controle sem texto" já usado em
  `IconButton`. `npm run build` passou sem erros; `dist/` restaurado; `git status` confirmou que
  só `Form.vue` (entre páginas) e `Checkbox.vue` mudaram. Teste de salvar com/sem exceções não
  executado em navegador (mesma limitação de ambiente já registrada); payload verificado por
  leitura de código — `submit()` idêntico ao anterior. Task marcada `concluida`. **Fim da Fase 8
  (Disponibilidade)**: `TASK-0051`/`0052` concluídas. Próximo passo: `TASK-0053`
  (Substituições) inicia a Fase 9.
