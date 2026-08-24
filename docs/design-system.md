# Design System — Etapa 3

Consolida os entregáveis da Etapa 3 do redesign (`docs/specs/SPEC-003.md`): identidade visual,
paleta, tipografia, escalas de espaçamento/radius/elevação, componentes base e de domínio,
catálogo de estados, e a aplicação de tudo isso às telas de referência. Produzido por
`TASK-0016` a `TASK-0026` (`docs/tasks/`), transformando os wireframes da Etapa 2
(`docs/ux-wireframes-etapa2.md`) numa linguagem visual completa.

**Escopo desta etapa**: "como isso parece" — identidade, cor, tipografia, componentes,
consistência visual. Não inclui implementação de código, componentes Vue reais, alteração de
banco/API/regra de negócio, nem novas funcionalidades (ver "Confirmação de escopo" ao final).

---

## 1. Direção visual

**Conceito**: o Ordo Musicalis deve parecer uma "ferramenta de sacristia bem cuidada" —
confiável, simples para quem não é técnico, discretamente digna do contexto religioso que serve,
sem nunca competir visualmente com esse conteúdo. Não deve parecer ERP genérico, sistema
administrativo datado, template Bootstrap ou interface ornamentada.

**Personalidade** (ordem de prioridade quando dois valores competem): clareza e usabilidade
primeiro; dentro disso, simplicidade, organização, confiança, acolhimento, elegância,
sobriedade, contexto litúrgico, modernidade.

**Princípios**: clareza (cor/tipografia/espaço sempre a serviço de orientação), consistência
(mesmo elemento, mesmo significado, em qualquer tela), hierarquia visual (principal > secundária
> auxiliar > metadado), simplicidade (nenhum elemento sem função). Detalhe completo:
`docs/tasks/0017-direcao-visual-paleta-cores.md`.

## 2. Paleta

Direção cromática decidida no formato de decisão explícita (§58): **azul profundo/mariano**
como `Primary`, recomendado por não colidir com as cinco cores litúrgicas que o calendário do
Dashboard já usa (`Verde`/`Roxo`/`Branco`/`Vermelho`/`Rosa`) e por já ser, na prática, a cor
interativa mais usada do sistema hoje (indigo — 160 ocorrências verificadas em 35 arquivos).
Dourado discreto vira `Accent` (uso pontual), não `Primary` — evita colidir com `Branco`
(também cor litúrgica).

| Grupo | Papel |
|---|---|
| Primary | Azul profundo — marca, ações principais |
| Secondary | Neutro morno — apoio |
| Accent | Dourado discreto — destaque pontual (celebrante, vínculo fixo) |
| Neutral | Cinza morno — fundo, superfície, texto, bordas, desabilitado |
| Success / Warning / Danger / Info | Verde / âmbar / vermelho / azul claro — mantidos, já validados como acerto pela auditoria |

**Regra semântica**: nenhum estado depende só de cor — sempre texto/ícone/forma junto. As cores
litúrgicas do calendário são uma categoria de token **separada**, não fazem parte da paleta
semântica de UI. Tokens nomeados (`--color-primary`, `--color-surface`, `--color-text-primary`
etc.) prontos para dark mode futuro, sem valor hexadecimal solto. Detalhe completo:
`docs/tasks/0017-*.md`.

## 3. Tipografia

Família principal decidida no formato de decisão explícita (§58): **Inter**, escolhida pelos
critérios de legibilidade em mobile e distinção títulos/corpo — exatamente os dois pontos
fracos que a auditoria identificou (chips ilegíveis, hierarquia tipográfica "rasa"). A "ilha
tipográfica" de `liturgia/Show.vue` (EB Garamond/Playfair Display) foi mantida como **exceção
deliberada e documentada** — token serif de uso restrito a conteúdo litúrgico em texto corrido.

Escala de 9 níveis (Display/H1/H2/H3/H4/Body/Body Small/Caption/Label), com `Caption`/12px como
piso mínimo absoluto — elimina o `text-[10px]` do chip do calendário. Nível `Label` reaproveita
o padrão "eyebrow" (`uppercase tracking-widest`) já usado em 4 arquivos. Detalhe completo:
`docs/tasks/0018-tipografia.md`.

## 4. Espaçamento

Escala de 8 valores (`spacing-xs` a `spacing-2xl`, 4px a 64px), mapeada diretamente sobre os
valores já dominantes no código (`p-6`/`space-y-6`, confirmados por 75+ ocorrências) — sem
introduzir números novos sem necessidade. Cada valor tem função declarada (§4.4): nenhum é
"espaço a mais para parecer premium". Detalhe completo: `docs/tasks/0019-*.md`.

## 5. Radius

4 níveis (`radius-sm` a `radius-full`), correspondendo ao `rounded-md`/`rounded-lg` já usados
hoje (88 e 75 ocorrências respectivamente) — a mudança é de **regra** (hierarquia declarada:
elemento pequeno → radius menor, superfície grande → radius maior), não de valor técnico novo.
Detalhe completo: `docs/tasks/0019-*.md`.

## 6. Elevação

4 níveis (Elevation 0 a 3), resolvendo o achado quantificado de que `shadow-sm` domina hoje de
forma esmagadora (114 ocorrências) contra 1 único uso de um nível mais alto (`shadow-xl`, menu
lateral). Elevation 1 (equivalente a `shadow-sm`) é mantida como base — já funciona bem para
cards; os níveis 0/2/3 dão profundidade a elementos que hoje competem visualmente com o mesmo
peso (dropdown vs. card vs. modal). Superfícies diferenciadas em 4 camadas (`background`,
`surface`, `surface-elevated`, `surface-bordered`) para evitar que tudo pareça "white card sobre
gray background". Grid mantém `max-w-7xl` já em uso, sem introduzir um sistema formal de 12
colunas sem necessidade real. Detalhe completo: `docs/tasks/0019-*.md`.

## 7. Componentes base

**Diretrizes transversais** (`TASK-0020`): ícones via Heroicons (não conta como "biblioteca de
UI desnecessária" — é um conjunto de glifos sem comportamento); regra de ícone com `aria-label`
obrigatório em todo controle ícone-apenas (hoje só 2 de N têm); microinterações de 150ms/200ms
(valores já usados no código, não inventados); touch target mínimo 44×44px; contraste mínimo
WCAG 2.1 AA.

**Controles interativos** (`TASK-0021`): Button com 5 variantes (Primary migra de cinza-escuro
para a nova cor de marca — resolve a divergência com o indigo já usado de fato) e 6 estados
(loading ganha spinner visual, hoje é só troca de texto); Input parametrizado por `type` (mantém
a abordagem já existente, ganha borda de erro/sucesso própria); Select **mantido nativo**
(aplicação direta da regra do §24, não uma escolha nova); Checkbox/Radio/Switch — achado novo:
não existe nenhum componente de checkbox hoje (`<input>` cru), nem radio, nem switch binário.

**Feedback e overlays** (`TASK-0022`): Badge (mantém `Badge.vue`, já maduro — pill + dark mode
completo); Alert (novo, persistente); Toast — **correção a um achado incerto da auditoria**: o
`FlashMessage` já tem auto-dismiss (4s, confirmado em `stores/flash.ts`), a auditoria só não
tinha verificado isso em detalhe; a especificação reaproveita a store existente, só muda a
posição de inline para flutuante; Modal (novo, reaproveita o overlay já usado no menu lateral);
Drawer (generaliza o mecanismo de slide-in que o menu lateral **já implementa**, em vez de
propor um do zero).

**Estrutura e dados** (`TASK-0023`): Card (Elevation 1, resolve a repetição de sombra
quantificada); Table (ordenação/seleção especificadas para uso **futuro** — nenhuma tela ganha
essas capacidades agora, seria nova funcionalidade fora do escopo); Calendário (consolida as
duas implementações quase idênticas hoje — Dashboard e Calendário Público — num componente
único); Avatar (novo, cor neutra fixa, não variável por pessoa); Pagination (especificado para
uso futuro, nenhuma lista pagina hoje); Tabs (generaliza o único padrão pill-toggle já existente
em `reports/Index.vue`); Dropdown (novo, necessário pela decisão já tomada de "Mais" nas
listagens mobile); Breadcrumb (critério já definido na Etapa 2 — só fluxos complexos).

**Navegação visual** (`TASK-0024`): Sidebar com página ativa indicada por 4 sinais combinados
(hoje é só cor, violando §18 diretamente) — indicador lateral, peso tipográfico,
ícone solid/outline, além do fundo; Bottom nav mobile substitui o dropdown atual (elimina também
a duplicação de lista de navegação que o próprio código reconhecia como problema); reduz de 3
padrões de navegação coexistentes hoje para 2 claros (Sidebar desktop, Bottom nav mobile);
Topbar mantém o padrão de título por página já existente, reserva espaço para notificações
futuras sem criar uma central agora.

## 8. Componentes de domínio

`ScaleCard`, `ScaleMember`, `ScaleRole`, `CelebrationHeader`, `AvailabilityStatus`,
`ConfirmationStatus`, `ConflictAlert`, `EmptyRole`, `RepertoireItem`, `LiturgicalInfo`
(`TASK-0025`) — cada um justificado por evidência real de repetição, não abstração
especulativa (ex. `ScaleCard` unifica 3 lugares que já mostram a mesma informação de formas
ligeiramente diferentes hoje). Decisão de design própria: `EmptyRole` usa um tratamento
discreto (`surface-bordered`), não o `Alert` cheio — evita pesar visualmente quando várias
categorias vazias aparecem juntas na mesma tela.

## 9. Estados

Catálogo único (Loading/Empty/Error/Success/Disabled/Selected/Active/Focus/Validation/
Confirmation), herdado e estendido da Etapa 2 (`TASK-0007`), com a aparência real definida nesta
etapa: skeleton (blocos pulsantes no formato do conteúdo esperado) priorizado sobre spinner
quando a estrutura é previsível; erro sempre com mensagem humana + próximo passo; confirmação
via `Modal` padronizado, substituindo os 12 usos de `confirm()` nativo já mapeados.

## 10. Telas de referência

Dashboard (servidor/coordenador), Escala — Detalhes, Criar/Editar Escala, Minha Escala, e um
exemplo de Listagem (Servidores) — todas com o Design System aplicado (`TASK-0026`), sem
redecidir nenhuma estrutura já fixada nas Etapas 1–2. As 10 perguntas do §62 respondem de forma
consistente entre as 5 telas — mesmo vocabulário visual, nenhum elemento fora dos componentes
já especificados. Nenhuma tela fora dessa lista foi redesenhada, conforme o §57 permite.

---

## 11. Lista de decisões explícitas (formato §58)

| # | Decisão | Recomendação | Task |
|---|---|---|---|
| 1 | Direção cromática (`Primary`) | Azul profundo/mariano — evita colidir com as 5 cores litúrgicas já usadas no calendário; dourado vira `Accent`, não `Primary` | `TASK-0017` |
| 2 | Família tipográfica | Inter — resolve diretamente os dois pontos fracos de legibilidade já identificados pela auditoria | `TASK-0018` |

Cada decisão está documentada por extenso (problema, alternativas reais, vantagens/
desvantagens, recomendação, justificativa) no arquivo de task correspondente.

## 12. Verificação dos critérios de aceite (SPEC-003 §56)

### Identidade

- [x] Existe uma direção visual definida — seção 1, `TASK-0017`.
- [x] A identidade litúrgica está presente de maneira sutil — cores litúrgicas mantidas como
      categoria separada (não decorativas em toda tela), tipografia serif reservada só à
      Liturgia, `Accent` dourado de uso pontual (`TASK-0017`, `TASK-0018`, `TASK-0020` §46).
- [x] O sistema não parece um template genérico — direção cromática evita a paleta 100% padrão
      do Tailwind de hoje; personalidade e princípios declarados (seção 1).
- [x] A interface mantém aparência profissional e moderna — tipografia Inter, escala de
      elevação com hierarquia real, componentes consistentes (seções 3, 6, 7).

### Cores

- [x] Existe paleta semântica — seção 2.
- [x] Estados possuem cores consistentes — regra semântica mantida de `STATUS_COLORS`
      (`TASK-0017`).
- [x] Cores não são utilizadas como único meio de comunicação — reforçado em `TASK-0017`
      (badges sempre com texto) e `TASK-0020`/§48 (checklist de acessibilidade).
- [x] Tokens foram definidos — seção 2, `--color-*` nomeados (`TASK-0017`).

### Tipografia

- [x] Existe família tipográfica definida — seção 3, Inter (`TASK-0018`).
- [x] Existe escala tipográfica — 9 níveis (`TASK-0018`).
- [x] Tamanhos são consistentes — escala única aplicada em todas as telas de referência
      (`TASK-0026`).
- [x] Legibilidade foi validada em mobile — `Caption`/12px como piso, elimina `text-[10px]`
      (`TASK-0018`).

### Componentes

- [x] Componentes base possuem especificação — `TASK-0021`, `TASK-0022`, `TASK-0023`.
- [x] Estados estão definidos — seção 9, `TASK-0022`.
- [x] Botões possuem hierarquia — `TASK-0021` (uma ação primária por tela, exemplo aplicado).
- [x] Inputs possuem estados — `TASK-0021` (label/placeholder/descrição/erro/sucesso/
      disabled/focus).
- [x] Badges possuem padrões — `TASK-0022` (9 estados especificados).
- [x] Alertas possuem padrões — `TASK-0022` (4 tipos, Alert e Toast distintos).
- [x] Modais possuem padrões — `TASK-0022`.
- [x] Tabelas possuem padrões — `TASK-0023`.
- [x] Calendário possui padrão — `TASK-0023`, aplicando a decisão da `TASK-0008`.

### Responsividade

- [x] Componentes possuem comportamento mobile definido — critério obrigatório em todas as
      tasks de componente (`TASK-0020` a `TASK-0025`).
- [x] Não existem componentes críticos dependentes de scroll horizontal desnecessário — herdado
      da Etapa 2 (`TASK-0007`/§29) e reforçado componente a componente.
- [x] Touch targets são adequados — 44×44px definido na `TASK-0020`, aplicado em `TASK-0021`.
- [x] A hierarquia permanece clara em telas pequenas — verificado nas telas de referência
      (`TASK-0026`).

### Acessibilidade

- [x] Contraste foi considerado — WCAG 2.1 AA definido na `TASK-0020`.
- [x] Foco foi considerado — regra de foco visível em todo controle interativo (`TASK-0020`).
- [x] Ícones não são utilizados como única informação quando isso prejudica entendimento —
      regra do §45 aplicada (`TASK-0020`).
- [x] Estados não dependem exclusivamente de cor — `TASK-0017`, `TASK-0020`.
- [x] Textos são legíveis — piso de 12px, família Inter (`TASK-0018`).

## 13. Confirmação de escopo (SPEC-003 §59, §60)

Nenhuma das ações proibidas foi realizada: não foram implementadas telas, não foram criados
componentes Vue reais, não houve alteração de regra de negócio, banco, API, nem troca de
framework. Nenhuma biblioteca de UI desnecessária foi adicionada — a única adição proposta
(Heroicons) é um conjunto de ícones sem comportamento, explicitamente diferenciada de uma
biblioteca de componentes (`TASK-0020`). Nenhuma animação excessiva, gradiente/glassmorphism
indiscriminado ou sombra exagerada foi proposta — a escala de elevação (seção 6) é
deliberadamente contida. Nenhuma dezena de variações de componente foi criada — cada variante
tem justificativa de uso real. Nenhuma informação foi transformada em card indiscriminadamente
(seção 6, `surface-bordered` como alternativa deliberada). Nenhum ícone decorativo sem função foi
proposto (`TASK-0020`, §45). Acessibilidade nunca foi sacrificada pela estética — ao contrário,
várias decisões (Select nativo mantido, contraste AA, touch target 44px) priorizaram
explicitamente acessibilidade sobre preferência visual.

Capacidades citadas pela SPEC-003 mas que exigiriam funcionalidade nova (ordenação/seleção de
tabela, paginação, detecção de conflito, central de notificações) tiveram sua aparência
especificada para uso **futuro**, sem serem ativadas em nenhuma tela existente — registradas
explicitamente como fora do escopo desta etapa (`TASK-0023`, `TASK-0024`), nunca implementadas
nem inventadas como já funcionando.

## 14. Resultado esperado (SPEC-003 §62)

Para as 5 telas de referência, as 10 perguntas do §62 são respondidas de forma consistente (ver
seção "Verificação das perguntas do §62" em `TASK-0026`): identidade visual, ação principal,
componente a usar, espaçamento, cor por estado, comportamento mobile/desktop, comportamento em
erro/carregamento/desabilitado — todas mapeadas ao mesmo vocabulário visual único definido nas
seções 1–9 deste documento.

## 15. Regra fundamental (§61)

Confirmado: nenhuma decisão desta etapa sacrifica facilidade de uso pela estética. Evidências
diretas — Select nativo mantido mesmo sendo "menos bonito" que um combobox customizado, porque é
mais acessível; contraste AA como piso não-negociável; touch target de 44px aplicado mesmo onde
o elemento visual é menor; `Caption`/12px como piso de legibilidade absoluto; nenhuma cor usada
como único meio de comunicação. O objetivo declarado desde a `TASK-0017` foi sempre "o sistema
parecer simples porque é bem organizado", não "o sistema parecer bonito".

---

## Referências

- [`docs/specs/SPEC-003.md`](specs/SPEC-003.md) — spec de origem.
- [`docs/arquitetura-interface.md`](arquitetura-interface.md) — Etapa 1.
- [`docs/ux-wireframes-etapa2.md`](ux-wireframes-etapa2.md) — Etapa 2.
- `docs/tasks/0016-*.md` a `docs/tasks/0027-*.md`.
