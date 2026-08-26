---
status: concluida
modulo: src/pages/servidores
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0092 — Design System: Servidores (Create/Edit/Show/Intensidade/ServidorForm)

**Task ID**: `TASK-0092`

**Prioridade**: P2 (herdada da `TASK-0077`)

## Objetivo

Migrar `servidores/{Create,Edit,Show,Intensity,ServidorForm}.vue` para os componentes/tokens do
Design System — parte 4 de 10 do desmembramento da `TASK-0077`.

## Escopo

- `src/pages/servidores/Create.vue`, `Edit.vue` (finos, delegam pro `ServidorForm`)
- `src/pages/servidores/ServidorForm.vue` (formulário real — maior volume de trabalho deste grupo)
- `src/pages/servidores/Show.vue` (já ganhou modo escuro na `TASK-0078`, se já concluída — não
  desfazer aquela correção)
- `src/pages/servidores/Intensity.vue` (já ganhou `ErrorState`/`SecondaryButton` na `TASK-0076`)

## Comportamento esperado

`ServidorForm.vue`: trocar `<select>`/`<textarea>` crus (nível, observações) pelos componentes
`Select.vue`/`Textarea.vue`; título/cartões pelo padrão de tipografia e `<Card>` já usado nos
formulários migrados na Etapa 4. `Show.vue`: revisar tipografia e uso de `<Card>`. `Intensity.vue`:
tabela pro padrão visual já usado nas listagens migradas, mais o `<select>` de período pelo
`Select.vue`. Preservar os pills de seleção múltipla de função/instrumento/ministério em
`ServidorForm.vue` (`toggleCategoria`/`toggleInstrument`/`toggleTeam`) — são um padrão de
interação específico, não um `<select>`, e já funcionam bem (confirmado em várias tasks da
Etapa 5); não force isso pra um componente que não se aplica.

## Dependências

- Nenhuma (mas coordenar com `TASK-0078`/`0076` se ainda não tiverem rodado, pra não conflitar
  editando os mesmos arquivos ao mesmo tempo — checar `git status`/estado das tasks antes de
  começar).

## Critérios de conclusão

- [x] `ServidorForm.vue` usando `Select`/`Textarea` nos campos aplicável.
- [x] `Show.vue` e `Intensity.vue` revisados quanto a `Card`/tipografia/tabela.
- [x] Pills de seleção múltipla preservados sem alteração de comportamento.
- [x] Nenhuma mudança de campo, validação ou regra de negócio.
- [x] `npm run build` passa sem erros.
- [x] Testado visualmente (mobile e desktop), incluindo o caso "Música" (mostra
      instrumentos/ministérios) e não-"Música" (esconde), com dado real.

## Referências

- `docs/tasks/0077-correcao-design-system-telas-restantes.md` — task-mãe.
- [`docs/design-system.md`](../design-system.md).

## Notas de progresso

- 2026-08-25 — Task criada pela `TASK-0077` (desmembramento). Confirmado antes de começar:
  `TASK-0078` (modo escuro em `Show.vue`) e `TASK-0076` (`ErrorState`/`SecondaryButton` em
  `Intensity.vue`) já estavam `concluida` — nenhum conflito, correções preservadas.
- 2026-08-25 — Task reivindicada e corrigida.

  **`ServidorForm.vue`**: campo "Nível" trocado de `<select>` cru pra `<Select>` (ganha
  `dark:`/`min-h-11` de brinde, já embutidos no componente); checkbox "Ativo" trocado do par
  solto `<input type="checkbox"> + <InputLabel>` pra `<Checkbox v-model="form.ativo"
  label="Ativo" />` (associação label/controle implícita via `<label>` envolvente, em vez de
  depender de `id`/`for` combinarem — mesmo espírito da correção da `TASK-0069`, só que via
  componente em vez de atributo manual); "Observações" trocado de `<textarea>` cru pra
  `<Textarea>`. Os 3 grupos de pills de seleção múltipla (Função/Instrumentos/Ministérios) foram
  **preservados exatamente como pediu a task** — mesma função `toggle*`, mesma cor de destaque
  por grupo (`purple`/`indigo`/`green`, decisão de design já existente pra diferenciar os 3
  grupos visualmente, não mexida) — só ganharam o par `dark:` que faltava por completo no estado
  inativo (`bg-white text-gray-700 border-gray-300` sem nenhum `dark:`, o que deixava um pill
  branco cru sobre cartão escuro).

  **`Create.vue`/`Edit.vue`**: wrapper `bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800` →
  `<Card>` (mesmo padrão já aplicado a `profile/Edit.vue` na `TASK-0090`); cabeçalho `<h2>` sem
  `dark:` → corrigido (gap sistêmico já visto em toda task anterior desta família).

  **`Show.vue`**: já estava com tratamento de modo escuro completo desde a `TASK-0078` — única
  mudança real aqui foi trocar os 2 `div`s crus (que já tinham `dark:bg-gray-800` correto) pelo
  componente `<Card>`, por consistência de manutenção, sem alterar nada visualmente.

  **`Intensity.vue`**: maior volume de mudança do grupo — o `<select>` de período virou
  `<Select>` (com `class="!w-auto"` pra não herdar o `w-full` que o componente aplica por
  padrão, que quebraria o layout compacto original; adicionado `aria-label="Período"` já que o
  campo nunca teve rótulo visível nem acessível) e ganhou `aria-label` como melhoria adicional de
  a11y; o container da tabela (`bg-white shadow-sm rounded-lg overflow-hidden`, sem nenhum
  `dark:`) virou `<Card :bordered="false" class="!p-0 overflow-hidden">`; a tabela ganhou o
  tratamento `dark:` completo mais o split responsivo `hidden md:block`/`md:hidden` já usado nas
  listagens migradas (`teams/Index.vue`) — a versão original só tinha `overflow-x-auto` (scroll
  horizontal em mobile, não o padrão de lista empilhada já estabelecido).

  `npm run build` passou sem erros; `dist/` revertido.

  **Testado com dado real e navegação real**: Docker Desktop precisou ser reiniciado no meio do
  processo (backend retornando 500 em `docker info` por ~5 minutos após o primeiro
  `Start-Process`, resolvido com `taskkill` + relançar). Seed temporário
  `api/prisma/_seedTask0092.ts` (deletado ao final, nunca commitado) criou 1 servidor músico
  (função Música + instrumento Violão + ministério Coral Paroquial, pra exercitar o caso
  `isMusica === true`), 1 servidor leitor (função Leitores, sem instrumento/ministério, pra
  exercitar `isMusica === false`), 1 servidor sem nenhum histórico (linha "Possível ociosidade"
  na Intensidade), e histórico de 3 escalas confirmadas pro músico + 1 pro leitor. Login real via
  `/login`, navegação real por `/servidores/criar` (com clique real no pill "Música" pra revelar
  Instrumentos/Ministérios — confirmado que a lógica `isMusica`/`watch` não foi afetada),
  `/servidores/1` (Show, com Badges/histórico reais), `/servidores/1/editar` (confirma
  `initialData` populando corretamente os componentes novos — nível, observações, pills e função
  do ministério todos pré-preenchidos), `/servidores/intensidade` (tabela com os 3 servidores e
  os 2 estados de destaque, "Possível sobrecarga"/"Possível ociosidade"). Playwright cobrindo
  tudo isso × 2 temas × 2 viewports (mobile 390px, desktop 1440px). Screenshots inspecionadas
  visualmente: pills legíveis nos dois temas, `Select`/`Textarea`/`Checkbox` com contraste
  correto, `Edit.vue` reconstruindo o estado completo de um servidor músico sem nenhuma perda de
  dado, tabela de Intensidade com split mobile/desktop funcionando.

  Ambiente encerrado ao final: dev servers finalizados, container Postgres removido, seed
  temporário apagado. Task marcada `concluida`. Próximo passo: `TASK-0093` (Design System:
  cadastros simples — celebrantes/comunidades/categorias), P2, desmembrada da `TASK-0077`.
