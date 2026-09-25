---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0106 — Detalhes da escala: hierarquia Celebração → Funções → Servidores

**Task ID**: `TASK-0106`

**Prioridade**: P2

## Objetivo

Aplicar a nova linguagem visual à tela de detalhes (`src/pages/scales/Show.vue`) reforçando a
escala como objeto multiministério (SPEC-003.1 §17, §18): Celebração → Escala → Funções →
Servidores, sem priorizar a informação musical.

## Comportamento esperado

- Topo (contexto + informação principal): celebração, data, horário, local/comunidade,
  celebrante, status da escala (`Badge`), informações litúrgicas (`LiturgicalInfo`, usando o
  mapeamento da `TASK-0100`).
- Corpo: seção de equipe agrupada por categoria (`gruposPorCategoria` — já existe, inclusive
  categorias vazias), cada servidor com status de confirmação; nenhuma categoria tratada como
  principal.
- Repertório e demais conteúdos musicais como seção **secundária**, após a equipe.
- Observações e demais informações existentes preservadas.
- Ações (editar, excluir, confirmar, substituir) mantidas com as mesmas regras de permissão.
- Mobile: mesma ordem de prioridade em coluna única.

## Dependências

- `TASK-0097` — tokens/linguagem visual.
- `TASK-0100` — mapeamento litúrgico centralizado.

## Critérios de conclusão

- [x] Ordem visual: contexto → equipe por função → repertório/auxiliares.
- [x] Todas as informações hoje presentes continuam acessíveis (nenhuma removida).
- [x] Nenhuma mudança de regra de permissão, API ou fluxo de confirmação/substituição.
- [x] Verificado com escala multiministério real (≥ 3 categorias, uma vazia), mobile e desktop,
      claro e escuro.
- [x] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §17, §18, §22.
- `docs/tasks/0040-escala-detalhes-cabecalho.md`, `docs/tasks/0041-escala-detalhes-situacao-equipe.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `a10bcb9`.

  **Ordem da tela** (`scales/Show.vue`): 1) card de contexto (`CelebrationHeader` com
  celebração, data, horário, comunidade e celebrante, **+ Liturgia do dia** via `LiturgicalInfo`
  com o mapeamento da `TASK-0100`, alteração recente, status legível "Confirmada"/"Rascunho",
  ministério responsável e observações) → conflitos (quando a API um dia preencher) → 2) "Minha
  participação" (só servidor escalado: **Função real** via `assignmentRoleLabel`, status,
  Confirmar/Não posso ir) → 3) Equipe da celebração (faixa-resumo + grupos por categoria,
  inclusive vazias, sem categoria privilegiada) → 4) Repertório como card secundário.

  **Liturgia**: o componente `LiturgicalInfo` existia (`TASK-0040`), mas esta tela não buscava a
  liturgia. Agora usa `GET /liturgia?data=` (mesmo endpoint da página Liturgia), carregado à
  parte, para nunca atrasar a escala; se não houver liturgia, a linha não aparece.

  **Ações do header**: `PrimaryButton`/`SecondaryButton` com `to` (`TASK-0099`) e
  `DangerButton`, antes `RouterLink`/`button` com classes cruas sem dark. Uma única primária por
  perfil: staff → "Editar". Para o servidor não há primária no header, porque a ação principal
  (confirmar) está no card "Minha participação". "Repertório" deixou de ser a segunda ação e
  virou uma secundária entre outras. Mesmas regras de visibilidade (`auth.isStaff`) de antes.

  **Dark mode**: os cards "Minha confirmação" e "Repertório" e o título do header não tinham
  variante escura. Todas as seções passaram a usar `Card`. `isFuture` usa data local
  (`localDateKey`) em vez de UTC.

  **Nada removido**: todos os campos anteriores continuam na tela. Nenhuma mudança de permissão,
  API ou fluxo de confirmação/recusa/exclusão.

  **Verificação** (escala real multiministério do seed: Música com Violão, Ministros da
  Comunhão, Acólitos com Turiferário, Leitores, além das categorias vazias): admin a 1280px claro
  (5 ações, liturgia "Verde · Dia de semana do Tempo Comum", "9 vagas" contando as categorias
  vazias) e Leitora a 375px escuro ("Função: Leitores", só Liturgia/Imprimir no header, sem
  scroll horizontal). `npm run build` e `npm test` passam; `dist/` revertido.
