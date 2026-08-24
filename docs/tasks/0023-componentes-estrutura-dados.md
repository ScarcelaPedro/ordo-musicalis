---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0023 — Componentes base: estrutura e dados

**Task ID**: `TASK-0023`

## Objetivo

Especificar visualmente os componentes de estrutura e apresentação de dados do Design System:
Card (§31), Table para desktop (§32) e sua transformação para mobile (§33), Calendário (§34), e
os componentes de apoio Avatar, Pagination, Tabs, Dropdown, Breadcrumb (§52). A estratégia mobile
do calendário e das tabelas já foi decidida conceitualmente na Etapa 2 (`TASK-0008`,
`TASK-0012`) — o trabalho aqui é aplicar o Design System (cores, tipografia, espaçamento) a essa
decisão, não redecidi-la (SPEC-003 §1).

## Dependências

- `TASK-0017` — paleta de cores.
- `TASK-0018` — tipografia.
- `TASK-0019` — espaçamento, radius, elevação, grid.
- `TASK-0020` — diretrizes transversais.
- `docs/tasks/0008-wireframes-dashboard.md` (Etapa 2) — estratégia do calendário mobile já
  decidida.
- `docs/tasks/0012-wireframes-listagens-administrativas.md` (Etapa 2) — estratégia de listagem
  mobile já decidida.

## Critérios de conclusão

- [x] Card especificado com critério de uso (agrupar informações relacionadas — §31), evitando
      transformar toda informação em card e variando superfícies/hierarquias de forma
      controlada (resposta direta ao achado de "white + shadow + rounded" repetitivo, ver
      `TASK-0016`).
- [x] Tabela desktop especificada contemplando cabeçalho, ordenação, seleção, ações, estados,
      loading, vazio (§32).
- [x] Transformação da tabela para mobile especificada (cards / lista / accordion /
      agrupamento / tabela reduzida — §33), preservando as informações essenciais, aplicada à
      decisão já tomada na `TASK-0012` (Etapa 2) — não uma nova decisão de estrutura, só a
      aparência dela.
- [x] Padrão visual de calendário especificado: estado atual, dia selecionado, eventos, eventos
      importantes, navegação, estado vazio, loading (§34), com comportamento mobile próprio
      aplicado à decisão já tomada na `TASK-0008` (Etapa 2).
- [x] Avatar, Pagination, Tabs, Dropdown e Breadcrumb especificados (§52) — Breadcrumb com
      critério de quando usar (fluxos administrativos complexos, não em todas as telas — SPEC-002
      §19, já refletido na Etapa 2).
- [x] Cada componente com comportamento responsivo definido (§50), conforme `TASK-0020`.

## Estado atual (confirmações adicionais desta task)

- `reports/Index.vue`: já existe um padrão de alternância por botões-pílula
  ("Por Ministério"/"Por Categoria de Função", `agrupamento.value`) — a própria auditoria já
  observa que "poderia virar `Tabs.vue` se o padrão se repetir mais". É a única instância real
  hoje, mas a SPEC-003 §52 exige o componente `Tabs` na lista mínima de qualquer forma — a
  especificação abaixo generaliza esse padrão já existente em vez de inventar um visual novo.
- Nenhum padrão de avatar/inicial existe hoje — pessoas são identificadas só por nome + texto
  (`· Violão`), confirmado em `scales/Show.vue`/`MyScales.vue`/`substitutions/Index.vue`.
- Nenhuma tabela tem ordenação de coluna nem seleção de linha hoje — nenhuma lista tem
  paginação (achados já confirmados pela auditoria).

## Card (§31)

Critério de uso: agrupar informações relacionadas — não todo bloco de conteúdo precisa ser um
card. Aplicando a escala de elevação/superfície já definida na `TASK-0019`:

- Card padrão = `surface` + Elevation 1 (mantém o "cartão branco com sombra suave" que já
  funciona bem hoje, achado da `TASK-0016`) — para conteúdo que é o foco principal da tela.
- Conteúdo secundário/de apoio (ex. um filtro, uma nota) usa `surface-bordered` (sem sombra) em
  vez de repetir o mesmo card com sombra para tudo — resolve diretamente o achado quantificado
  na `TASK-0019` (114 ocorrências de `shadow-sm` sem hierarquia).
- Responsivo (§50): a orientação interna do card (horizontal/vertical) é decidida por conteúdo,
  não pelo componente Card em si — ex. os cards de listagem administrativa (`TASK-0012`) já
  preveem estrutura vertical no mobile.

## Tabela — desktop (§32)

Cabeçalho, ações e estados (loading/vazio) já existem e são consistentes hoje (achado da
`TASK-0012`) — a especificação aqui só aplica tokens visuais (cores, radius, espaçamento) ao
padrão já existente. **Ordenação de coluna e seleção de linha** são capacidades citadas pelo
§32 que **não existem em nenhuma tabela hoje** — esta task define como elas apareceriam
visualmente **se e quando** alguma tela precisar delas (seta de ordenação no cabeçalho da
coluna clicável; checkbox na primeira coluna para seleção), mas **não** determina que nenhuma
tabela existente passe a usá-las agora — isso seria introduzir uma funcionalidade nova, o que a
SPEC-003 §60 explicitamente exclui do escopo desta etapa ("novas funcionalidades"). A
especificação fica disponível para quando uma necessidade real de ordenação/seleção aparecer.

## Tabela — mobile (§33)

Aplica o padrão já decidido na `TASK-0012` (Etapa 2): card com `[Ver] [Mais]`, usando o
componente `Card` (`surface`, Elevation 1) especificado acima. Esta task não redecide a
estrutura — só define a aparência final (tokens de cor/espaçamento/radius sobre o wireframe já
aprovado).

## Calendário (§34)

Aplica a decisão já tomada na `TASK-0008` (calendário compacto + lista no mobile, grid completo
no desktop):

| Elemento | Especificação |
|---|---|
| Estado atual (hoje) | Contorno com `--color-accent` (dourado discreto, `TASK-0017`) — reserva o `Primary` para ações, não para marcação de data |
| Dia selecionado | Fundo com `--color-primary` (contraste garantido, texto branco) |
| Eventos | Ponto/marcador na célula, na cor litúrgica do dia (mantém `CORES_LITURGICAS_CLASSES` já existente — categoria de token separada da paleta semântica, `TASK-0017`) |
| Eventos "importantes" | Reaproveita sinalizadores já decididos nas Etapas 1–2 (pendência de confirmação, alteração recente — `TASK-0010`) em vez de criar um conceito novo de "importância" não suportado por dado algum hoje |
| Navegação | Setas anterior/próximo (Heroicons, `TASK-0020`, sempre com `aria-label` — resolve a lacuna confirmada de que as setas do Dashboard hoje não têm) |
| Estado vazio | "Nenhuma celebração neste mês" (mensagem já existente, mantida) |
| Loading | Skeleton do grid/lista (`TASK-0022`) em vez do spinner isolado atual |

Consolida também as **duas implementações quase idênticas** de calendário hoje (Dashboard e
Calendário Público, achado da auditoria) num único componente — critério de reutilização já
citado na `TASK-0020`.

## Avatar, Pagination, Tabs, Dropdown, Breadcrumb (§52)

- **Avatar**: não existe hoje. Especificado como círculo com iniciais (2 letras do nome) sobre
  fundo neutro fixo (não uma cor variável por pessoa) — mantém a sobriedade pedida em §2, evita
  transformar identidade de pessoa em mais uma camada de cor competindo com a paleta semântica
  de estado já definida (`TASK-0017`). Uso: `ScaleMember`/representação de servidor
  (`TASK-0025`), quando o Design System decidir usar avatar em vez de só nome + texto.
- **Pagination**: não existe hoje (nenhuma lista pagina). Especificado (botões
  anterior/próximo + indicador de página) para uso **futuro** — não é uma decisão de ativar
  paginação em nenhuma listagem agora (seria nova funcionalidade, fora do escopo, mesma lógica
  da ordenação/seleção acima).
- **Tabs**: generaliza o padrão pill-toggle já existente em `reports/Index.vue` — mesma
  estrutura visual (botões lado a lado, ativo com fundo `Primary`), formalizada como componente
  reutilizável.
- **Dropdown**: não existe como padrão de ações hoje (só como menu de navegação). Passa a
  existir porque a `TASK-0012` já decidiu que o "Mais" das listagens mobile precisa dele —
  necessidade real já criada por uma decisão anterior, não inventada aqui. Estrutura: abre ao
  clicar, lista de opções empilhadas, fecha ao clicar fora ou selecionar, Elevation 2
  (`TASK-0019`).
- **Breadcrumb**: critério de uso já definido na Etapa 2 (SPEC-002 §19: fluxos administrativos
  complexos, não em toda tela). Estrutura: itens separados por um ícone chevron (Heroicons),
  último item sem link (página atual) — ex. "Escalas → Escala de 23/08 → Editar".

## Responsividade (§50)

- **Card**: já coberto por cada uso específico (`TASK-0012`, `TASK-0025`).
- **Tabela**: desktop → tabela; mobile → card (`TASK-0012`, mantido).
- **Calendário**: desktop → grid completo; mobile → compacto + lista (`TASK-0008`, mantido).
- **Tabs**: rolagem horizontal só se o número de abas exceder a largura (raro no escopo atual do
  produto — só 1 uso real hoje, 2 abas).
- **Dropdown/dropdown de "Mais"**: em mobile, pode ocupar como um pequeno menu ancorado ao botão
  ou virar uma variação simplificada do `Drawer` (`TASK-0022`) quando o número de opções for
  maior — decisão fina de implementação, não bloqueante para esta especificação.
- **Breadcrumb**: em telas muito estreitas, colapsa mostrando só o item atual + um indicador de
  "voltar" para o nível anterior, em vez de truncar texto.

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §31, §32, §33, §34, §52 (Card, Table,
  Avatar, Pagination, Tabs, Dropdown, Breadcrumb).
- `TASK-0017`, `TASK-0018`, `TASK-0019`, `TASK-0020`.
- `docs/tasks/0008-wireframes-dashboard.md`, `docs/tasks/0012-wireframes-listagens-administrativas.md`
  (Etapa 2).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Confirmado que `reports/Index.vue` já tem um
  padrão de alternância por botões-pílula, único uso real hoje mas suficiente como base para
  generalizar o componente `Tabs` exigido pelo §52. Ponto importante resolvido explicitamente:
  ordenação/seleção de tabela e paginação são capacidades que o §32/§52 pedem no componente
  base, mas nenhuma tela usa hoje — especificada a aparência para uso **futuro**, deixando
  claro que ativar essas capacidades em qualquer tela existente agora seria "nova
  funcionalidade", excluída do escopo pela própria SPEC-003 §60. Calendário e tabela mobile
  aplicam as decisões já tomadas na Etapa 2 (`TASK-0008`/`TASK-0012`) sem redecidir estrutura.
  "Eventos importantes" do calendário reaproveita sinalizadores já decididos (pendência,
  alteração recente) em vez de inventar um conceito novo sem dado que o sustente. Avatar
  especificado com cor neutra fixa, não variável por pessoa, para não competir com a paleta
  semântica de estado. Task marcada `concluida`. Próximo passo: TASK-0024 (navegação visual)
  já está elegível.
