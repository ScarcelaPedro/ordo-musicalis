---
status: concluida
modulo: src/pages
owner: Pedro Scarcela
criado-em: 2026-10-02
---

# 0116 — Criação de escala, Etapa 2 (Equipe): cards no padrão do dashboard e modo escuro

**Task ID**: `TASK-0116`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-02): na Etapa 2/4 da criação de escala, os cards estavam feios e sem
semelhança com o dashboard, principalmente no modo escuro (blocos com `bg-white`/`bg-amber-50`,
selects nativos e bordas sem variante `dark:`, que ficavam claros sobre o fundo escuro).

## Critérios de conclusão

- [x] Cards de categoria com a linguagem visual do dashboard (`rounded-xl`, `shadow-card` no
      claro, superfícies cinza em camadas no escuro).
- [x] Todos os elementos da etapa com variante escura (linhas, selects, busca, sugestões,
      candidato, rodapé de equipe, "Outras pessoas").
- [x] Nenhuma mudança de comportamento (mesmas funções, mesmo payload).
- [x] Mobile 375px sem scroll horizontal; claro e escuro.
- [x] `npm run build` e `npm test` passam.

## Referências

- `docs/decisions/0002-scaleform-migracao-incremental-4-etapas.md`, `docs/tasks/0115-calendario-desktop-card-do-dia.md`.

## Notas de progresso

- 2026-10-02 — Task criada, reivindicada e executada. Commit: `3f1cd72`.

  **`ScaleForm.vue` (só a Etapa 2)**: cabeçalho com título/descrição no estilo das seções do
  dashboard e "Buscar sugestões" com ícone (o botão empilha abaixo do texto no mobile). Cada
  categoria virou card `rounded-xl` com `Badge` de contagem ("N escalado(s)" cinza / "Ninguém
  escalado" amarelo) e borda tracejada de aviso quando vazia, em vez do fundo âmbar inteiro.
  Pessoas escaladas com `Avatar`, linha em superfície própria (`gray-50` / `gray-800`) e
  remover como botão-ícone (lixeira) com `aria-label`. Sugestões num bloco `primary` suave com
  avatar e motivo. Busca com ícone de lupa e resultados em lista com avatar. Os selects inline
  usam a constante `COMPACT_SELECT_CLASS` (com `dark:`), e "Ignorar"/"Cancelar" usam
  `QUIET_BUTTON_CLASS`. Botões de navegação com `flex-wrap` (o "Cancelar" estourava a 375px).

  **Correções que já existiam e apareceram na verificação**: (1) o select de ministério da
  pessoa escalada e o "Adicionar equipe inteira" apareciam **vazios** em vez de "Sem
  ministério"/"Selecione o ministério", porque `null`/`undefined` não casava com nenhuma
  `<option>`. Agora usam `value=""` ↔ `null`. (2) O título "Nova Escala"/"Editar Escala" ficava
  invisível no modo escuro (`text-gray-800` sem `dark:`). (3) Padding do container do
  formulário reduzido para `p-4` no mobile.

  **Verificação**: Vite com a API mockada no navegador (Playwright, sem banco): Etapa 2 com
  pessoas escaladas, sugestões, candidato em edição e categoria vazia, a 1280px e 375px, nos
  temas claro e escuro, sem scroll horizontal. `npm run build` e `npm test` passam; `dist/`
  revertido.

  **Fora do escopo**: `src/pages/scales/MyScales.vue` ainda tem `<h2 ... text-gray-800">` sem `dark:` (achado via
  grep, não corrigida aqui).
