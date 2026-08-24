---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0015 — Consolidação da Etapa 2: mapa de fluxos, decisões para a Etapa 3 e validação dos critérios de aceite

**Task ID**: `TASK-0015`

## Objetivo

Consolidar os wireframes das TASK-0008 a TASK-0014 num documento único da Etapa 2, montando os
quatro fluxos prioritários completos ([`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §27 — A:
Servidor, B: Coordenador, C: Substituição, D: Disponibilidade) a partir das telas já desenhadas,
compilando a lista de decisões que precisam ser levadas para a Etapa 3 (§31, §30 item 10),
validando integralmente os critérios de aceite do §28 (UX, Mobile, Escala, Servidor) e
confirmando que a etapa não ultrapassou o escopo do §29 (nenhuma implementação frontend,
componente Vue, alteração de banco/API/regra de negócio, Design System ou identidade visual).

Mesmo papel que a `TASK-0005` cumpriu para a Etapa 1.

## Dependências

- `TASK-0008` — wireframes do Dashboard.
- `TASK-0009` — wireframes de Criar/Editar Escala.
- `TASK-0010` — wireframe de Detalhes da Escala.
- `TASK-0011` — wireframe de Minha Escala.
- `TASK-0012` — wireframes de listagens administrativas.
- `TASK-0013` — wireframe do Painel de Disponibilidade.
- `TASK-0014` — wireframes de Substituições.
- `TASK-0028` — wireframe de Minha Disponibilidade (formulário do servidor), criada durante a
  execução desta task para fechar a cobertura do Fluxo D (§27) — a mesma lacuna que a
  `TASK-0014` já havia resolvido para o Fluxo C.

## Critérios de conclusão

- [x] Documento único consolidando os 10 entregáveis do §30: mapa dos principais fluxos;
      wireframes das telas prioritárias; wireframes mobile; wireframes desktop; estados
      principais de cada tela; descrição das decisões de UX; relação entre telas; regras de
      comportamento responsivo; fluxo completo de criação/edição de escala; lista de decisões
      que deverão ser levadas para a Etapa 3 — publicado em `docs/` (ex.
      `docs/ux-wireframes-etapa2.md`), referenciado a partir de
      [`docs/arquitetura.md`](../arquitetura.md).
- [x] Fluxo A (Servidor), Fluxo B (Coordenador), Fluxo C (Substituição) e Fluxo D
      (Disponibilidade) documentados de ponta a ponta (§27), cada passo apontando para o
      wireframe de tela correspondente já produzido nas tasks anteriores.
- [x] Lista de decisões explícitas (formato do §31: problema, alternativas, vantagens/
      desvantagens, recomendação, justificativa) compilada a partir de todas as tasks
      anteriores, marcada como entrada para a Etapa 3 (`docs/specs/SPEC-003.md`).
- [x] Todos os itens da checklist do §28 (UX, Mobile, Escala, Servidor) revisados e marcados
      como atendidos, cada um com referência ao wireframe/seção que o satisfaz.
- [x] Confirmação explícita registrada de que nada do §29 (implementação frontend, componentes
      Vue, banco, API, regra de negócio, Design System, identidade visual) foi produzido durante
      a etapa.
- [x] Resultado esperado do §33 (as 10 perguntas — "o que aparece nesta tela", "o que aparece
      primeiro", "qual é a ação principal", etc.) verificável para cada tela prioritária
      diretamente no documento consolidado.

## Achado durante a execução: lacuna de cobertura (Fluxo D)

Ao montar o Fluxo D (Disponibilidade, §27), percebi que nenhuma das tasks 0006–0014 cobria a
tela "Minha Disponibilidade" (formulário do servidor, `/disponibilidade`) — só o Painel do
coordenador (`TASK-0013`) tinha task própria. É exatamente a mesma situação já identificada e
corrigida para Substituições (`TASK-0014`): a SPEC-002 exige a tela via Fluxo C/D (§27), mas não
a lista entre as prioridades numeradas do §25/§4. Criei e executei `TASK-0028` na mesma sessão
para fechar essa lacuna antes de finalizar esta consolidação, em vez de ignorá-la ou inventar
uma cobertura superficial dentro deste próprio documento.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §27, §28, §29, §30, §31, §33.
- `TASK-0008` a `TASK-0014`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Documento consolidado publicado em
  `docs/ux-wireframes-etapa2.md`, referenciado em `docs/arquitetura.md` (seção 9). Durante a
  montagem do Fluxo D, identificada e corrigida uma lacuna de cobertura não percebida durante a
  decomposição original da SPEC-002: criada e executada `TASK-0028` (Minha Disponibilidade) na
  mesma sessão, mesma natureza da lacuna já tratada pela `TASK-0014` (Substituições). Todos os
  itens da checklist §28 (UX, Mobile, Escala, Servidor) confirmados. Confirmação de escopo §29
  registrada — nenhuma implementação de código, só documentos Markdown. Task marcada
  `concluida`.
  **Encerramento do programa (Etapa 2 / SPEC-002)**: TASK-0006 a 0015 e TASK-0028 estão todas
  `concluida`, nenhuma `adiada` ou `parcialmente-concluida` pendente — a Etapa 2 está encerrada
  sem exceção pendente. A Etapa 3 (`docs/specs/SPEC-003.md`, já com TASK-0016 a 0027 criadas)
  passa a ter sua primeira dependência satisfeita.
