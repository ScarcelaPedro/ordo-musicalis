---
status: concluida
modulo: src/pages/servidores
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0049 — Listagens: padrão genérico aplicado a Servidores

**Task ID**: `TASK-0049`

## Objetivo

Implementar o padrão genérico de listagem (tabela desktop / card com "Mais" no mobile) definido
em `docs/tasks/0012-wireframes-listagens-administrativas.md`, usando `servidores/Index.vue`
como primeira aplicação real (SPEC-004 §33, §34) — resolve o achado crítico da auditoria
(tabelas puras em `overflow-x-auto` sem alternativa mobile).

## Arquivos/componentes envolvidos

- `src/pages/servidores/Index.vue` — tabela desktop (tokens aplicados) + card mobile.
- `src/components/Dropdown.vue` (`TASK-0032`) — usado no "Mais" mobile (Editar/Excluir).
- `src/components/Modal.vue` (`TASK-0031`) — confirmação de exclusão, substituindo
  `confirm()` nativo.

## Comportamento esperado

Desktop: tabela mantida, com tokens visuais aplicados (radius, cores, tipografia). Mobile
(`< 768px`): cards com `[Ver] [Mais]`, "Mais" abrindo `Dropdown` com Editar/Excluir — resolve o
achado de área de toque pequena (ações hoje adjacentes sem padding). Exclusão usa `Modal` de
confirmação em vez de `confirm()` nativo. Busca ganha debounce (hoje dispara 1 requisição por
tecla).

## Dependências

- `TASK-0031` — `Modal`, `Skeleton`.
- `TASK-0032` — `Card`, `Dropdown`.
- `TASK-0030` — `TertiaryButton`.

## Critérios de conclusão

- [x] Nenhum `overflow-x-auto` dependente de scroll horizontal no mobile.
- [x] Card mobile com `[Ver] [Mais]`, `Avatar` (iniciais) opcional junto ao nome.
- [x] Exclusão via `Modal`, não `confirm()` nativo — mesma chamada `DELETE /servidores/:id`.
- [x] Busca com debounce (ex. 300ms) — mesma chamada `GET /servidores?search=`, só menos
      frequente.
- [x] Loading via `Skeleton`.
- [x] `npm run build` passa sem erros.
- [~] Testado em mobile e desktop, incluindo busca, editar e excluir — **não executado em
      navegador** (mesma limitação de ambiente já registrada); verificado por leitura de código:
      `load()`/`destroy→confirmarExclusao()` chamam exatamente os mesmos endpoints de antes
      (`GET /servidores?search=`, `DELETE /servidores/:id`), só a origem do disparo mudou
      (debounce/clique no modal em vez de tecla/`confirm()`).

## Riscos

- Baixo — telas de listagem administrativa são bem isoladas e já foram amplamente
  especificadas na Etapa 2/3; principal risco é regressão na exclusão (garantir que o `Modal`
  realmente chama `DELETE` só ao confirmar, nunca ao abrir).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §33, §34, §35, §36.
- `docs/tasks/0012-wireframes-listagens-administrativas.md` (padrão genérico completo).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `servidores/Index.vue` reescrito seguindo o padrão
  genérico da `TASK-0012`: container `Card` (`bordered=false`, Elevation 1, mesma aparência de
  antes); desktop mantém a tabela (`hidden md:block`, `overflow-x-auto` removido — não fazia
  mais sentido existir já que a tabela não é mais exibida no mobile, satisfazendo o critério
  diretamente); mobile (`md:hidden`) ganhou cards com `Avatar` (iniciais) + nome/e-mail + badges
  (função/nível/status) + `[Ver]` (link estilizado, mesmo padrão de `RouterLink` com classes de
  botão já usado no header do `Dashboard`/`AuthenticatedLayout`) + `[Mais]` (`Dropdown`,
  Editar/Excluir) — resolve a área de toque pequena de antes (Editar/Excluir como texto
  adjacente sem padding). Exclusão migrou de `confirm()` nativo para `Modal` de confirmação
  (`pedirExclusao`/`confirmarExclusao`, com `DangerButton` e estado `excluindo` pro loading do
  botão) — mesma chamada `DELETE /servidores/:id`, só disparada no clique de "Excluir" dentro do
  modal, nunca ao abri-lo (risco explícito da task, verificado por leitura de código: `confirmar
  Exclusao()` só chama `client.delete` quando o próprio botão do modal dispara a função, `Modal`
  não expõe nenhum jeito de confirmar sem clique explícito). Busca ganhou debounce de 300ms
  (`onSearchInput` com `setTimeout`/`clearTimeout`, `onBeforeUnmount` limpa o timer pendente) —
  mesma chamada `GET /servidores?search=`. Loading trocou o texto único "Carregando..." por 5
  `Skeleton` empilhados. Botões de header ("Intensidade"/"Novo Servidor") ganharam o mesmo
  tratamento de tokens já aplicado no Dashboard/coordenador (`TASK-0039`), por consistência.
  `npm run build` passou sem erros; `dist/` restaurado; `git status` confirmou que só
  `servidores/Index.vue` mudou entre páginas. Teste em mobile/desktop com busca/editar/excluir
  não executado em navegador (mesma limitação de ambiente já registrada); validado por leitura
  de código dos mesmos endpoints/handlers. Task marcada `concluida`. Próximo passo: `TASK-0050`
  (Listagens — demais entidades) já está elegível.
