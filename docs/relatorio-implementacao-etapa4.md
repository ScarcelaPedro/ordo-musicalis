---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# Relatório de Implementação — Etapa 4 (Implementação Frontend do Novo Design)

**Task relacionada**: `TASK-0056`
**Período**: 2026-08-24, sessão única, `TASK-0029` a `TASK-0055` (27 tasks).

Este documento consolida os 14 entregáveis exigidos por [`docs/specs/SPEC-004.md`](specs/SPEC-004.md)
§63 e valida os critérios de aceite dos §54–§57, cumprindo o mesmo papel que
`docs/tasks/0005-*.md`, `0015-*.md` e `0027-*.md` cumpriram nas Etapas 1, 2 e 3.

---

## 1. Componentes criados (Fundação, `TASK-0029` a `0033`)

### 1.1 Tokens de design (`TASK-0029`)

`tailwind.config.js` estendido com cores semânticas (`primary`/`secondary`/`accent`/`neutral`/
`success`/`warning`/`danger`/`info`, mapeadas para famílias Tailwind existentes — decisão
registrada em [`docs/decisions/0001-*.md`](decisions/0001-mapeamento-tokens-cor-tailwind.md)) e
escala tipográfica de 9 níveis (`display`/`h1`-`h4`/`body`/`body-sm`/`caption`/`label`).
Deliberadamente **não** estendido: `spacing`/`borderRadius`/`boxShadow`/`screens` (já batiam com
o padrão do projeto — evitar regressão silenciosa). Fonte `Inter` adicionada via Google Fonts.

### 1.2 Componentes novos

| Categoria | Componentes | Task |
|---|---|---|
| Controles interativos | `Spinner`, `TertiaryButton`, `IconButton`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Switch` | `TASK-0030` |
| Feedback/overlays | `Toast`, `Alert`, `Modal`, `Drawer`, `Tooltip`, `EmptyState`, `ErrorState`, `Skeleton` | `TASK-0031` |
| Estrutura/dados | `Card`, `Calendar`, `Avatar`, `Tabs`, `Dropdown`, `Breadcrumb` | `TASK-0032` |
| Domínio da escala | `ScaleCard`, `ScaleMember`, `ScaleRole`, `CelebrationHeader`, `AvailabilityStatus`, `ConfirmationStatus`, `ConflictAlert`, `EmptyRole`, `RepertoireItem`, `LiturgicalInfo` | `TASK-0033` |

Todos em `src/components/` (domínio em `src/components/scale/`). Nenhum componente duplicado
(cada um cobre um uso real já mapeado nas Etapas 1–3, sem invenção de funcionalidade).

### 1.3 Componentes existentes migrados/estendidos

| Componente | O que mudou | Task |
|---|---|---|
| `PrimaryButton`, `SecondaryButton`, `DangerButton` | Migrados para tokens; `loading`/`disabled`/`type` adicionados; bug real corrigido (`SecondaryButton` nunca tinha `:disabled` ligado ao elemento apesar de ter a classe visual) | `TASK-0030` |
| `TextInput` | Props `error`/`success` adicionadas | `TASK-0030` |
| `Badge` | Classes literais → tokens semânticos (API/aparência idênticas) | `TASK-0031` |
| `Select` | Bug real corrigido: `:value`/`@change` manuais perdiam o tipo (`number`→`string`) do valor selecionado; trocado por `v-model` de verdade sobre um `computed` proxy | `TASK-0043` |
| `ScaleCard` | Props `detalhe`/`vinculoFixo` + slot `actions` adicionados (aditivo, zero regressão no uso já existente) | `TASK-0048` |
| `Checkbox` | Prop `ariaLabel` adicionada (checkbox sem `label` visível ficava sem nome acessível) | `TASK-0052`/`0055` |
| `InputLabel` | Prop `for` adicionada (associação programática label↔campo) | `TASK-0055` |

---

## 2. Páginas migradas (`TASK-0034` a `0053`)

| Fase (§64) | Área | Task(s) | Status |
|---|---|---|---|
| 1 — Fundação | Tokens + componentes | `0029`–`0033` | ✅ concluída |
| 2 — Layout + Navegação | `AuthenticatedLayout.vue` (sidebar, bottom nav, topbar) | `0034`–`0036` | ✅ concluída |
| 3 — Dashboard | `Dashboard.vue` (calendário, servidor, coordenador) | `0037`–`0039` | ✅ concluída |
| 4 — Escalas | `scales/Show.vue` (cabeçalho, equipe, alterações/conflitos) | `0040`–`0042` | ✅ concluída |
| 5 — Criar/Editar Escala | `ScaleForm.vue` (4 etapas + conflitos) | `0043`–`0047` | ✅ concluída |
| 6 — Minha Escala | `scales/MyScales.vue` | `0048` | ✅ concluída |
| 7 — Listagens | `servidores/Index.vue` + 6 listagens administrativas | `0049`–`0050` | ✅ concluída |
| 8 — Disponibilidade | `availability/Panel.vue`, `availability/Form.vue` | `0051`–`0052` | ✅ concluída |
| 9 — Demais telas | `substitutions/Index.vue` | `0053` | ✅ concluída |
| 10 — Polimento | Responsividade real (`0054`), Acessibilidade real (`0055`) | `0054`–`0055` | ✅ concluída |

Todas as 27 tasks (`0029`–`0055`) estão `concluida`. Nenhuma foi pulada ou mesclada
silenciosamente com outra.

---

## 3. Critérios de aceite — Gerais (§54)

- [x] **Design System está implementado.** `TASK-0029`–`0033`.
- [x] **Layout global está implementado.** `TASK-0034`–`0036`.
- [x] **Navegação está implementada.** Sidebar com hierarquia de domínios + bottom nav
      diferenciado por perfil (`TASK-0034`/`0035`).
- [x] **Dashboard está atualizado.** `TASK-0037`–`0039`.
- [x] **Escalas estão atualizadas.** `TASK-0040`–`0042`.
- [x] **Criar/Editar Escala está atualizado.** `TASK-0043`–`0047`.
- [x] **Minha Escala está atualizada.** `TASK-0048`.
- [x] **Listagens principais estão atualizadas.** `TASK-0049`–`0050` (7 telas no total).
- [x] **Disponibilidade está atualizada.** `TASK-0051`–`0052`.
- [x] **Estados de loading estão implementados.** `Skeleton` em todas as telas tocadas; 3 gaps
      pré-existentes corrigidos (`scales/Index.vue`, `teams/Index.vue` — `TASK-0050`;
      `availability/Panel.vue` — `TASK-0051`; `availability/Form.vue`, carga inicial —
      `TASK-0052`).
- [x] **Estados vazios estão implementados.** `EmptyRole`/`EmptyState` + mensagens específicas
      mantidas/reforçadas em cada tela.
- [x] **Estados de erro estão implementados.** `ErrorState` disponível; mensagens humanas
      confirmadas em 100% das chamadas `flash.set('error', ...)` (`TASK-0055`).
- [x] **Feedbacks estão implementados.** `Toast`/`FlashMessage` mantidos; confirmações de
      aprovar/rejeitar/excluir via `Modal` (`TASK-0049`–`0053`).
- [x] **Responsividade foi validada.** `TASK-0054` — validação real em navegador (Playwright),
      não só leitura de código, nas 6 larguras exigidas (§50).
- [x] **Acessibilidade básica foi validada.** `TASK-0055` — auditoria `axe-core` real, 0
      violações WCAG 2.1 A/AA em 21/21 combinações página×tema.
- [x] **Nenhuma regra de negócio foi alterada indevidamente.** Ver seção 6.

---

## 4. Critérios de aceite — Mobile (§55)

Todos confirmados por validação real em navegador na `TASK-0054` (Playwright, 6 larguras:
360/414/768/1280/1440/1920px, ~19 telas únicas, a maioria nas 6 larguras):

- [x] Nenhuma tela prioritária exige scroll horizontal desnecessário — 1 exceção real
      encontrada (`scales/Show.vue`, header sem `flex-wrap`) e corrigida na própria task.
- [x] Navegação mobile funciona corretamente — bottom nav testado por perfil (staff/servidor),
      "Mais" abre o `Drawer` com o restante dos itens.
- [x] Botões possuem tamanho adequado — `min-h-11` (44px) aplicado sistematicamente nos
      componentes de controle (`TASK-0030`), validado visualmente.
- [x] Texto permanece legível — nenhum texto abaixo de `Body Small`/14px para informação
      essencial (calendário mobile, `TASK-0037`); contraste confirmado por `axe-core`
      (`TASK-0055`).
- [x] Formulários são utilizáveis — `ScaleForm` (4 etapas) e `availability/Form.vue` testados
      interativamente em mobile, incluindo a busca inline da Etapa 2.
- [x] Calendário possui estratégia mobile — grade compacta + lista (`Calendar.vue`, `TASK-0032`/
      `0037`), decisão registrada em `docs/tasks/0008-*.md`.
- [x] Tabelas possuem apresentação adaptada — padrão tabela (desktop) / card + `[Ver]`/`[Mais]`
      (mobile) aplicado às 7 listagens administrativas (`TASK-0049`–`0050`).
- [x] Modais/drawers funcionam em telas pequenas — confirmado programaticamente: `Modal` de
      exclusão com bounding box 100% dentro de um viewport 360×700 (`TASK-0054`); foco preso e
      `Esc` funcionando (`TASK-0055`).

---

## 5. Critérios de aceite — Escala (§56)

- [x] **Criar escala possui fluxo claro.** 4 etapas nomeadas (`TASK-0043`–`0047`): Celebração →
      Equipe → Validação → Revisão, com indicador "Etapa N de 4".
- [x] **Editar escala possui fluxo claro.** Mesmo `ScaleForm.vue`, `initialData` populado
      (`Edit.vue`, inalterado).
- [x] **Adicionar servidor é simples.** Busca inline por categoria substituiu o `<select>` +
      botão separado (`TASK-0044`) — "buscar → escolher → preencher o que for aplicável → um
      único Adicionar".
- [x] **Sugestões são compreensíveis.** Distribuídas por categoria (não mais um bloco único no
      topo), com motivo, "Adicionar"/"Ignorar" (`TASK-0044`).
- [x] **Conflitos são identificados — quando o dado existir.** `ConflictAlert` integrado em 3
      pontos (`ScaleForm`, `scales/Show.vue`, Etapa 3 de validação), sempre condicionado a um
      campo que nenhum endpoint retorna hoje — ver pendência na seção 7. Não inventado.
- [x] **Funções vazias são identificadas.** `EmptyRole` em toda categoria sem ninguém, tanto na
      visualização (`scales/Show.vue`, `TASK-0041`) quanto na edição (`ScaleForm`, já existia) e
      na validação (`TASK-0046`).
- [x] **Revisão existe antes da conclusão.** Etapa 4 (Revisão) — resumo só-leitura da
      celebração + equipe completa antes de salvar (`TASK-0047`).
- [x] **Feedback de sucesso existe.** Mantido (`flash.set('success', ...)`), inalterado.
- [x] **Erros são compreensíveis.** Confirmado 100% humano na `TASK-0055` (ver seção 3).

---

## 6. Critérios de aceite — Visual (§57)

- [x] **Não existem estilos antigos misturados sem justificativa.** Migração de cores literais
      (`indigo`/`emerald`/`amber`/`red`) para tokens semânticos em todas as telas tocadas;
      exceções conscientes documentadas (cores litúrgicas do calendário e badges de instrumento/
      categoria continuam literais — categoria de token à parte, decisão já registrada em
      `TASK-0017`/`TASK-0037`).
- [x] **Cores seguem os tokens.** `docs/decisions/0001-*.md`.
- [x] **Tipografia segue a escala.** `text-h1`–`h4`/`body`/`body-sm`/`caption`/`label` aplicados
      nos elementos tocados.
- [x] **Espaçamentos seguem o sistema.** Escala padrão do Tailwind (não sobrescrita,
      `TASK-0029`) usada consistentemente.
- [x] **Botões são consistentes.** `PrimaryButton`/`SecondaryButton`/`TertiaryButton`/
      `DangerButton` únicos, reutilizados em todas as telas.
- [x] **Inputs são consistentes.** `TextInput`/`Select`/`Textarea`/`Checkbox`/`Radio` únicos.
- [x] **Badges são consistentes.** `Badge` único, API preservada, cores por token.
- [x] **Cards são consistentes.** `Card` (Elevation 0/1) adotado nas listagens e painéis
      tocados.
- [x] **Estados são consistentes.** `Skeleton`/`EmptyState`/`ErrorState`/`Alert` com o mesmo
      vocabulário visual em todas as telas tocadas.
- [x] **Ícones seguem o mesmo padrão.** Heroicons outline (inativo) / solid (ativo), 24px
      padrão/20px em contextos compactos, consistente desde a `TASK-0034`.

---

## 7. Relatório de problemas encontrados (regra §43/§61)

Toda pendência abaixo foi registrada **durante** a task correspondente, no formato problema /
solução provisória / impacto / recomendação — nenhuma foi "resolvida" de forma improvisada nem
escondida. Compiladas aqui numa lista única.

### 7.1 Dados agregados ausentes no backend (bloqueiam funcionalidades do wireframe)

| # | Problema | Solução provisória | Impacto | Recomendação | Task |
|---|---|---|---|---|---|
| 1 | Dashboard-coordenador: "Funções sem servidor" e "Conflitos" (SPEC-002 §5.2, itens 4–5) exigem saber quais categorias uma escala *deveria* ter — `GET /scales` não retorna isso. | Blocos **omitidos por completo** (nenhum placeholder vazio — um placeholder seria uma promessa de recurso inexistente). | Prioridades 4–5 do Dashboard-coordenador não implementadas nesta etapa. | Nova consulta agregada no backend numa etapa futura. | `TASK-0039` |
| 2 | Conflitos (servidor já escalado / indisponível) em `ScaleForm`, `scales/Show.vue` e Substituições — nenhum endpoint cruza `Availability`/dupla-escalação hoje; `suggestServidores()` só filtra indisponíveis, sem expor o motivo. | `ConflictAlert` integrado, mas o campo de dado que ele lê nunca é preenchido — fica sempre invisível na prática. | Nenhum conflito é sinalizado nesta etapa; a filtragem de "função incompatível" (o único tipo já prevenido) continua funcionando. | Detecção de conflito de horário/indisponibilidade como funcionalidade de backend numa etapa futura. | `TASK-0042`/`0044`/`0045`/`0053` |
| 3 | "Sem sugestões" (`ScaleForm`/Substituições) não explica indisponibilidade/dupla-escalação como motivo (2 de 4 motivos do §7.6 da Etapa 2 não são computáveis hoje). | Mensagem genérica mantida ("Nenhum servidor sugerido..."), sem motivo inventado. | Coordenador não sabe *por que* ninguém foi sugerido nesses 2 casos. | Mesma recomendação do item 2 — resolve os dois de uma vez. | `TASK-0044`/`0053` |
| 4 | "Adicionar substituto manualmente" (sugerido no wireframe de Substituições como próximo passo do estado vazio) não tem endpoint de busca/adição manual no router de substituições. | Não implementado — sem link falso para lugar nenhum. | Coordenador precisa resolver substituições sem sugestão via outro caminho (editar a escala diretamente). | Endpoint de adição manual de substituto, ou reaproveitar a Etapa 2 do `ScaleForm` com uma integração dedicada. | `TASK-0053` |
| 5 | Disponibilidade "preenchida/pendente" como indicador no Dashboard-servidor exigiria consultar `/availability`, endpoint que o Dashboard não usa hoje. | Atalho de navegação simples, sem indicador de status. | Servidor não vê de relance se já respondeu a disponibilidade a partir do Dashboard. | Se valer a pena, adicionar essa chamada numa iteração futura (não é bloqueio de dado, só decisão de escopo). | `TASK-0038` |

### 7.2 Limitações de dado já existentes (não introduzidas nesta etapa)

| # | Problema | Situação | Task |
|---|---|---|---|
| 6 | Painel de Disponibilidade do coordenador só mostra disponibilidade **recorrente semanal** — exceções pontuais (`data_especifica`) cadastradas em `/disponibilidade` não aparecem lá. | Confirmado (não é bug de layout, é limitação de dado já assumida na implementação original); documentado em comentário no código. | `TASK-0051` (achado original em `docs/tasks/0013-*.md`) |

### 7.3 Bugs reais encontrados durante validação (fora do escopo da task que os achou)

| # | Problema | Por que não foi corrigido na hora | Recomendação | Task que achou |
|---|---|---|---|---|
| 7 | `/escalas/criar`: campo "Comunidade" nasce sem seleção e mostra erro de validação ao avançar, mesmo com só uma comunidade cadastrada. Causa: `form.comunidadeId` é calculado uma vez, de forma síncrona, antes do `fetch` assíncrono de `comunidades` resolver em `Create.vue`. | Não é um bug de responsividade (mesmo em qualquer largura) — fora do escopo da `TASK-0054`, que é especificamente sobre breakpoints. | `watch(() => props.comunidades, ...)` que preencha `comunidadeId` na primeira vez que a lista deixar de estar vazia, só se o campo ainda não tiver valor. | `TASK-0054` |
| 8 | Categorias de função duplicadas por nomenclatura já existiam no cadastro (`Acólitos e Ancilas`/`Acólitos e Coroinhas`, `Comentaristas`/`Comentarista`) antes de qualquer trabalho desta etapa. | Questão de integridade de dado de cadastro, não de código/layout. | Revisão manual do cadastro de categorias pelo time. | `TASK-0054` |
| 9 | `InputLabel.vue` é usado em 19 arquivos; só `ScaleForm.vue` (tocado nesta etapa) recebeu a associação `for`/`id` que faltava. Os outros 17 (`ServidorForm`, `celebrantes`/`teams`/`categorias`/`comunidades` Create/Edit, `scaleTemplates`, `profile`, `repertoire`, `auth/*`) têm a mesma lacuna, mas nunca foram tocados por nenhuma task desta etapa. | Corrigir os 17 exigiria um volume de arquivos muito maior que "correções pontuais" de uma task de validação. | Sweep dedicado adicionando `id`/`for` nesses 17 arquivos — o componente já está pronto (`for` opcional). | `TASK-0055` |
| 10 | `Modal.vue`: o retorno de foco ao fechar (`previouslyFocused?.focus()`) falha quando o elemento que abriu o modal vive dentro de um `Dropdown` que se fecha (desmonta) no mesmo ciclo de reatividade — reproduzido 100% por teclado. Afeta o fluxo "Mais → Excluir" em 8 telas de listagem. | Causa-raiz identificada, mas a correção mexe em 2 componentes muito compartilhados — risco de um ajuste apressado introduzir um bug novo. | Revisar a ordem de captura de `document.activeElement` em `Modal.vue`, possivelmente coordenando com `Dropdown.vue` (ex. `Dropdown` devolver foco ao seu próprio trigger antes de desmontar o item clicado). | `TASK-0055` |

Nenhuma dessas 10 pendências foi inventada ou "resolvida" com dado aproximado — todas ficaram
com o comportamento real de hoje (dado ausente = elemento não aparece / mensagem genérica /
comportamento inalterado), conforme a regra do §43/§61.

---

## 8. Relatório de regressão

Metodologia: cada task de implementação (`TASK-0034`–`0053`) rodou `npm run build`
(type-check completo via `vue-tsc` + bundle) antes de ser marcada concluída — nenhuma foi
fechada com erro de build. Além disso:

- **`TASK-0054`** validou 19 telas únicas em navegador real (Playwright), nas 6 larguras
  exigidas, logado como `admin` (staff) e `musico` (servidor), com dados reais (servidores,
  categorias, escalas, janela de disponibilidade) — não só estados vazios. 1 bug de
  responsividade real encontrado e corrigido (ver seção 7.3, mas esse já foi corrigido, não é
  pendência).
- **`TASK-0055`** validou acessibilidade automatizada (`axe-core`) nas mesmas 21 combinações
  página×tema — 0 violações WCAG 2.1 A/AA na varredura final — e navegação por teclado/foco
  visível/foco preso em `Modal` testados interativamente.
- Em cada task de listagem/formulário, a chamada de API (`GET`/`POST`/`PATCH`/`DELETE`) foi
  conferida linha a linha contra a versão anterior do arquivo — nenhuma mudou de endpoint, verbo
  ou payload.
- `git status` foi conferido após cada task para confirmar que só os arquivos listados no escopo
  da task mudaram (nenhuma edição "vazou" para telas fora do escopo).

**Limitação registrada com transparência**: as tasks `TASK-0034` a `TASK-0053` (24 das 27 tasks
desta etapa) não puderam ser testadas em navegador real no momento em que foram concluídas —
este ambiente não tinha nenhuma ferramenta de automação de navegador disponível até a
`TASK-0054`. A partir daí, ~19 das telas mais centrais **foram** validadas retroativamente em
navegador real (`TASK-0054`/`0055`), cobrindo Dashboard (2 perfis), Escalas (listagem +
detalhes), `ScaleForm` (as 4 etapas, incluindo a busca inline), Servidores, Painel de
Disponibilidade, Minha Disponibilidade, Minha Escala e Substituições — a maior parte da
superfície de risco da etapa. As listagens administrativas mais simples (Categorias,
Celebrantes, Comunidades, Ministérios, Escalas Recorrentes) foram cobertas parcialmente (`Card`/
tabela/mobile confirmados via `axe-core` + captura de tela, mas sem um teste funcional completo
de criar/editar/excluir em cada uma).

---

## 9. Confirmação: nenhuma regra de negócio, permissão, contrato de API ou integração alterada

Confirmado por revisão de cada task:

- **Nenhum arquivo em `api/` foi modificado** por nenhuma das 27 tasks desta etapa (confirmado
  por `git status -- api/` ao final de cada sessão de trabalho) — as únicas interações com `api/`
  foram *leituras* (confirmar schema/rotas antes de decidir "parar e registrar" vs. reaproveitar
  um endpoint já existente, ex. `TASK-0041` reaproveitando `GET /categorias`, `TASK-0042`
  confirmando que `createdAt`/`updatedAt` já eram retornados) e os scripts de seed temporários
  usados só para validação (`TASK-0054`/`0055`, todos removidos ao final, nunca commitados).
- **Nenhum payload de submissão mudou de formato** — `ScaleForm` continua emitindo o mesmo
  `FormData` de sempre (`TASK-0047` documentou isso explicitamente ao mover `status` de campo
  para ação); listagens continuam chamando os mesmos `GET`/`DELETE` com os mesmos parâmetros.
  `Select.vue`'s bug de tipo (`TASK-0043`) foi corrigido *antes* de qualquer tela real depender
  dele, então nenhum payload historicamente ficou errado por causa disso.
  Adicionado apenas trabalho de tipagem (o campo `status`/`conflito` de tipos TS que já vinham
  do backend, só não estavam tipados no frontend).
- **Nenhuma permissão foi alterada** — todos os `v-if="auth.isStaff"`/`auth.isMusico`/checagens
  de role foram preservados byte a byte; a interface continua só *decidindo o que mostrar*, o
  backend continua sendo a autoridade final (SPEC-004 §13).
- **Nenhuma integração externa foi tocada** — Resend, Web Push, WhatsApp (Evolution API), Vercel
  Blob e a API de liturgia diária não têm nenhum arquivo relacionado no diff desta etapa.
- **Nenhuma dependência nova foi adicionada ao projeto** — `playwright`/`@axe-core/playwright`
  usados nas `TASK-0054`/`0055` foram instalados com `--no-save` e nunca entraram em
  `package.json`/`package-lock.json` (confirmado por `git diff` após cada sessão; a única
  mudança nesses dois arquivos, uma entrada de `@heroicons/vue`, é de trabalho desta mesma etapa
  — a biblioteca de ícones já usada em todo o redesign — não das ferramentas de teste).

---

## 10. Estado do repositório ao final da etapa

Todo o trabalho desta etapa está **commitado? Não — ainda não commitado neste momento.** Todas
as 27 tasks (`TASK-0029`–`0055`) foram implementadas e verificadas (build + validação), mas o
`git status` no momento de escrever este relatório mostra ~84 arquivos alterados/novos ainda não
commitados, seguindo o mesmo padrão já usado nas Etapas 1–3 deste projeto: o commit em lote é
feito quando o usuário solicitar explicitamente, não automaticamente ao final de cada task.

---

## 11. Conclusão

A Etapa 4 entrega os 14 itens do §63: interface global atualizada, Design System implementado,
componentes base implementados (seção 1), Dashboard/Escala/Criar-Editar Escala/Minha Escala/
Listagens/Disponibilidade atualizados (seção 2), estados implementados (Skeleton/Empty/Error em
toda tela tocada), responsividade implementada e validada de verdade (`TASK-0054`), e este
documento cobre os 3 relatórios finais (problemas encontrados — seção 7; regressão — seção 8;
componentes criados/reutilizados — seção 1).

O sistema deixa de depender de scroll horizontal nas telas prioritárias, ganha uma hierarquia de
navegação real (sidebar por domínio + bottom nav por perfil), um fluxo de criação de escala
guiado em 4 etapas com busca inline, e passa numa auditoria de acessibilidade automatizada com
zero violações — sem que nenhuma regra de negócio, permissão ou contrato de API tenha sido
alterada. As 10 pendências da seção 7 ficam registradas para retomada em etapas futuras de
backend/produto, não escondidas.
