# UX e Wireframes — Etapa 2

Consolida os entregáveis da Etapa 2 do redesign (`docs/specs/SPEC-002.md`): fluxos principais,
wireframes das telas prioritárias (+ duas lacunas cobertas), padrões transversais, decisões
explícitas para a Etapa 3 e validação dos critérios de aceite. Produzido por `TASK-0006` a
`TASK-0014` e `TASK-0028` (`docs/tasks/`), transformando a arquitetura da Etapa 1
(`docs/arquitetura-interface.md`) numa experiência de usuário definida.

**Escopo desta etapa**: "como o usuário deve realizar cada tarefa" — estrutura de telas,
hierarquia, ações, estados, comportamento responsivo. Não inclui cores, tipografia, componentes
Vue ou qualquer implementação de código (ver "Confirmação de escopo" ao final). Isso fica para a
Etapa 3 (`docs/specs/SPEC-003.md`).

---

## 1. Mapa dos principais fluxos (SPEC-002 §27)

### Fluxo A — Servidor

```text
Login → Dashboard (TASK-0008, bloco "Minhas próximas escalas")
      → Minha Escala (TASK-0011) ou clique direto na próxima escala
      → Escala — Detalhes (TASK-0010)
      → Confirmar presença (ação inline em "Minha confirmação", interação preservada como está)
```

### Fluxo B — Coordenador

```text
Login → Dashboard (TASK-0008, versão coordenador)
      → Escalas (listagem, padrão genérico da TASK-0012)
      → Criar Escala
      → Etapa 1: Dados da celebração (TASK-0009)
      → Etapa 2: Montar equipe (TASK-0009 — busca inline por categoria, sugestões
        distribuídas por categoria)
      → Etapa 3: Validar (TASK-0009 — pendências, funções vazias, conflitos quando existirem)
      → Etapa 4: Revisar (TASK-0009 — resumo + ação final "Publicar"/"Salvar rascunho",
        substitui o antigo campo Status)
      → Escala — Detalhes (TASK-0010)
```

### Fluxo C — Substituição

```text
Escalas → Substituições (TASK-0014)
        → Solicitação (já existe automaticamente ao servidor recusar — não é uma ação do
          coordenador)
        → Ver sugestões (expansão inline)
        → Selecionar substituto ("Aprovar com este")
        → Confirmar (novo passo: modal de confirmação da TASK-0007, antes inexistente)
```
Estado "nenhum substituto encontrado" especificado na `TASK-0014`, reaproveitando a mesma
tabela de motivos da `TASK-0009`.

### Fluxo D — Disponibilidade

```text
Minha disponibilidade (TASK-0028)
      → Selecionar disponibilidade (grade semanal, semântica do checkbox agora explicada)
      → Adicionar exceção (já existente)
      → Salvar (já existente)
      → Feedback de sucesso (já existente)
```

**Nota sobre cobertura**: os Fluxos C e D exigem telas (Substituições, Minha Disponibilidade)
que a própria SPEC-002 não lista entre as prioridades numeradas do §25/§4 — uma divergência
interna da SPEC entre a seção de prioridades e a seção de fluxos. `TASK-0014` e `TASK-0028`
foram criadas especificamente para fechar essa lacuna, sem inventar prioridade nova além do que
o §27 já exige textualmente.

## 2. Wireframes das telas prioritárias

| Tela | Prioridade (§25) | Task | Resumo do redesenho |
|---|---|---|---|
| Dashboard — Servidor | P1 | `TASK-0008` | Próxima escala em destaque; calendário compacto + lista no lugar do grid de 560px |
| Dashboard — Coordenador | P1 | `TASK-0008` | Situação/pendências em destaque; 2 blocos (funções vazias, conflitos) registrados como dependentes de dado ainda não existente |
| Criar/Editar Escala | P2 | `TASK-0009` | 4 etapas (Celebração/Equipe/Validação/Revisão); busca inline por categoria; sugestões distribuídas por categoria; conflitos e "sem sugestões" com representação definida (2/3 motivos dependem de detecção ainda não implementada) |
| Escala — Detalhes | P3 | `TASK-0010` | Celebrante em destaque; situação da escala agregada; categorias vazias agora listadas (hoje somem por completo) |
| Minha Escala | P4 | `TASK-0011` | Função/instrumento na linha (dependente de dado); chevron de tappability reaproveitado do Dashboard |
| Listagens administrativas | P5 | `TASK-0012` | Padrão genérico tabela (desktop) / card com "Mais" (mobile), aplicado a Servidores/Escalas/Comunidades e verificado nas demais 5 |
| Painel de Disponibilidade | P6 | `TASK-0013` | "Já responderam" simétrico a "Ainda não responderam"; grade mobile vira card compacto por servidor |
| Substituições (lacuna §25/§27) | — | `TASK-0014` | Passo "Confirmar" formalizado antes da aprovação; estado "sem substituto" reaproveita a tabela de motivos do ScaleForm |
| Minha Disponibilidade (lacuna §25/§27) | — | `TASK-0028` | Semântica do checkbox explicada; grade e exceções sem tabela no mobile |

## 3. Wireframes mobile e desktop

Cada task acima define comportamento mobile e desktop específico (campo "Mobile"/"Desktop" do
§26, em cada arquivo `docs/tasks/000N-*.md`). Resumo das decisões de maior impacto:

- **Calendário do Dashboard** (`TASK-0008`): calendário compacto (sem texto em célula) + lista
  detalhada abaixo — decisão explícita no formato §31.
- **Grade de Disponibilidade do coordenador** (`TASK-0013`): card por servidor com mini-grade
  7×3, em vez do mockup literal do §11.2 (que geraria até 21 linhas por pessoa) — decisão
  explícita no formato §31.
- **Listagens administrativas** (`TASK-0012`): tabela (desktop) → card com `[Ver] [Mais]`
  (mobile), aplicado a 8 telas.
- **`ScaleForm`** (`TASK-0009`): linhas de servidor escalado empilham verticalmente no mobile em
  vez do `flex-wrap` apertado atual.
- **Minha Disponibilidade** (`TASK-0028`): grade semanal vira lista de 7 blocos por dia no
  mobile, mesmo sendo uma tabela pequena (4 colunas).

## 4. Estados principais de cada tela

Catálogo consolidado na `TASK-0007` (10 estados: Loading, Empty, Error, Success, Disabled,
Selected, Active, Focus, Validation, Confirmation), aplicado tela a tela nas TASK-0008 a 0014 e
0028. Achados de gaps de loading verificados nesta etapa (além do já conhecido em
`teams/Index.vue`): `scales/Index.vue` (`TASK-0012`), `availability/Panel.vue` (`TASK-0013`) e a
carga inicial de `availability/Form.vue` (`TASK-0028`) não têm estado de loading hoje.

## 5. Descrição das decisões de UX

Ver seção 7 (Lista de decisões explícitas) para as decisões no formato §31. Decisões estruturais
sem alternativas reais (aplicação direta de um padrão já definido, não uma escolha entre
opções):

- Sugestões do `ScaleForm` deixam de ser um bloco único e passam a ser distribuídas por
  categoria, cruzando dado já disponível no frontend (`TASK-0009`) — resolve a "competição
  visual" apontada como achado crítico da auditoria.
- Campo `status` do `ScaleForm` deixa de ser um `<select>` e vira a ação final da Etapa 4
  (`TASK-0009`), aplicando o padrão ação-primária/secundária da `TASK-0007`.
- Ações "Editar"/"Excluir" das listagens administrativas deixam de ficar adjacentes e passam
  para trás de "Mais" no mobile (`TASK-0012`), resolvendo o achado de área de toque pequena.
- Aprovação de substituto ganha uma etapa de confirmação explícita antes inexistente
  (`TASK-0014`).

## 6. Relação entre telas (navegação)

Documentada nos Fluxos A–D (seção 1) e em cada wireframe individual (campo "Navegação" do §26).
Resumo da regra de acesso contextual vs. global, já estabelecida na Etapa 1 (`TASK-0003`) e
reafirmada aqui: Repertório/Liturgia continuam contextuais a uma escala; Substituições/
Recorrências/Relatórios/Intensidade continuam de acesso global via menu (implementação do menu
em si é Etapa de código, fora desta etapa).

## 7. Regras de comportamento responsivo

Formalizadas na `TASK-0007` (princípio: cada componente/tela define comportamento explícito para
mobile/tablet/desktop, não apenas classes responsivas genéricas) e aplicadas em todas as tasks de
wireframe. Regra geral confirmada nesta etapa: **nenhuma tela prioritária depende de
`overflow-x-auto`** na versão redesenhada — as 4 ocorrências mais críticas (calendário do
Dashboard, `ScaleForm`, 8 listagens administrativas, Painel de Disponibilidade) têm alternativa
mobile definida; a correção em código é trabalho da etapa de implementação (fora do escopo
desta etapa, SPEC-002 §29).

## 8. Fluxo completo de criação/edição de escala

Documentado integralmente na `TASK-0009` — as 4 etapas lógicas (Celebração, Equipe, Validação,
Revisão), o redesenho de "Adicionar servidor" (decisão explícita, seção 7), a hierarquia
sugestões/manual, a representação de conflitos e o estado sem sugestões. É o entregável mais
extenso desta etapa, consistente com a própria SPEC-002 chamar essa tela de "a de maior atenção
da Etapa 2" (§7).

## 9. Lista de decisões explícitas (formato §31) — entrada para a Etapa 3

| # | Decisão | Recomendação | Task de origem |
|---|---|---|---|
| 1 | Estratégia do calendário mobile (Dashboard) | Calendário compacto (sem texto em célula) + lista detalhada abaixo | `TASK-0008` |
| 2 | Fluxo de "Adicionar servidor" no `ScaleForm` | Busca inline dentro de cada bloco de categoria, campos condicionais preenchidos durante a busca | `TASK-0009` |
| 3 | Estrutura da grade de disponibilidade no mobile (Painel) | Card por servidor com mini-grade compacta 7×3, em vez do mockup literal do §11.2 | `TASK-0013` |

Cada decisão está documentada por extenso (problema, alternativas, vantagens/desvantagens,
recomendação, justificativa) no arquivo de task correspondente — não duplicado aqui por
extenso, conforme a própria convenção de referência do projeto. A Etapa 3 (`SPEC-003.md`) deve
tratar essas recomendações como ponto de partida para a aplicação visual, não reabri-las como
decisão de arquitetura/UX (SPEC-003 §1).

## 10. Pendências de dado/lógica registradas (não resolvidas nesta etapa)

Esta etapa é só de UX/documentação — nenhuma delas foi implementada, mas todas foram
identificadas e documentadas explicitamente, para não serem confundidas com "já resolvido":

- Detecção de conflito de escalação (servidor já escalado / indisponível) — `TASK-0009`,
  `TASK-0008`, `TASK-0014`. Não existe hoje em nenhum endpoint.
- Motivo de "função incompatível" já é prevenido estruturalmente (filtro existente) — não
  precisa de nova lógica.
- Agregação de "funções sem servidor" no nível do Dashboard — `TASK-0008`. A API do Dashboard
  não retorna categorias esperadas por escala hoje.
- Indicação de "escala alterada recentemente" — `TASK-0010`. Depende de `updatedAt` já vir na
  resposta da API (a confirmar).
- Prévia inline de Liturgia na tela de Detalhes, simétrica ao Repertório — `TASK-0010`. Depende
  de `scale.liturgia` já vir na resposta (a confirmar).
- Função/instrumento na linha de "Minha Escala" — `TASK-0011`. Depende de
  `/scales?mine=true` já retornar esses campos no pivot (a confirmar).

---

## 11. Verificação dos critérios de aceite (SPEC-002 §28)

### UX

- [x] Cada tela prioritária possui objetivo definido — campo "Objetivo" (§26) em todas as
      TASK-0008 a 0014 e 0028.
- [x] Cada tela possui ação principal definida — campo "Ação principal" (§26), idem.
- [x] A hierarquia de informações está definida — Dashboard (§5.1/§5.2), Escala-Detalhes (§8.1),
      todas seguidas nos wireframes correspondentes.
- [x] Os principais fluxos estão documentados — seção 1 (Fluxos A–D).
- [x] O fluxo de criação de escala foi simplificado conceitualmente — seção 8, `TASK-0009`
      (busca inline substitui select+clique repetido; sugestões deixam de competir com seleção
      manual).
- [x] O fluxo de servidor foi separado da experiência administrativa — `TASK-0011` (Minha
      Escala) e Fluxo A permanecem distintos do Fluxo B/telas administrativas.
- [x] Os principais estados das telas estão especificados — seção 4, catálogo da `TASK-0007`
      aplicado em cada wireframe.

### Mobile

- [x] Cada tela prioritária possui comportamento mobile definido — campo "Mobile" (§26) em
      todas as tasks.
- [x] Nenhuma solução depende de scroll horizontal desnecessário — seção 7; toda ocorrência de
      `overflow-x-auto` identificada na `TASK-0006` tem alternativa definida numa das tasks de
      wireframe.
- [x] Tabelas possuem estratégia alternativa para mobile — `TASK-0012` (padrão genérico card),
      `TASK-0013`/`TASK-0028` (grades viram cards/listas).
- [x] O calendário possui estratégia mobile definida — `TASK-0008`, decisão explícita.
- [x] Áreas de toque e legibilidade foram consideradas — `TASK-0007` (checklist §21/§22),
      `TASK-0012` ("Mais" resolve ações adjacentes), `TASK-0008` (chips ilegíveis substituídos
      por lista com texto completo).

### Escala

- [x] Dados da celebração estão separados da montagem da equipe — `TASK-0009`, Etapa 1 vs.
      Etapa 2.
- [x] Categorias de equipe possuem agrupamento claro — `TASK-0009` (mantido do sistema atual,
      já era um acerto).
- [x] Adicionar servidor possui fluxo definido — `TASK-0009`, decisão explícita (seção 9, #2).
- [x] Sugestões possuem hierarquia clara — `TASK-0009` (distribuídas por categoria, sempre
      visíveis, nunca competindo com a seleção manual).
- [x] Conflitos possuem representação definida — `TASK-0009` (representação visual definida;
      lógica de detecção é pendência registrada, seção 10).
- [x] Funções vazias possuem representação definida — `TASK-0009` (Etapa 2, mantido) e
      `TASK-0010` (Escala-Detalhes, agora também visível fora da edição).
- [x] Revisão da escala possui fluxo definido — `TASK-0009`, Etapa 4.

### Servidor

- [x] Minha Escala possui experiência própria — `TASK-0011`.
- [x] Próxima escala é facilmente identificável — `TASK-0008` (Dashboard-Servidor, item 1 de 6)
      e `TASK-0011`.
- [x] Confirmação de presença é clara — `TASK-0010`/`TASK-0011`, interação preservada (já era
      um acerto, achado da auditoria) e reforçada visualmente.
- [x] Alterações importantes são perceptíveis — `TASK-0010` (indicador de alteração recente,
      dependente de dado — seção 10) e `TASK-0008` (bloco "Alterações importantes" no
      Dashboard-Servidor).

## 12. Confirmação de escopo (SPEC-002 §29)

Nenhuma das ações listadas como fora do escopo foi realizada: não houve implementação de
frontend, criação de componentes Vue, alteração de banco de dados, alteração de API, alteração
de regras de negócio, criação de Design System, definição de identidade visual (cores,
tipografia), implementação de telas ou refatoração de código. Todo o trabalho desta etapa
(`TASK-0006` a `TASK-0014`, `TASK-0015`, `TASK-0028`) resultou exclusivamente em documentos
Markdown sob `docs/`. Onde uma funcionalidade exigiria dado ou lógica ainda não existente
(detecção de conflito, agregações de dashboard, etc.), isso foi registrado como pendência
(seção 10), nunca implementado nem inventado como já funcionando.

## 13. Resultado esperado (SPEC-002 §33)

Para cada tela prioritária (Dashboard, Criar/Editar Escala, Escala-Detalhes, Minha Escala,
Listagens, Painel de Disponibilidade, Substituições, Minha Disponibilidade), as 10 perguntas do
§33 são respondidas diretamente no campo correspondente do wireframe (§26): "o que aparece" →
Estrutura; "o que aparece primeiro" → Informação principal; "o que o usuário pode fazer" → Ação
principal/secundárias; "qual a ação principal" → idem; "o que acontece depois" → Navegação; "como
funciona no celular/desktop" → Mobile/Desktop; "o que acontece quando algo dá errado/não há
dados" → Estados (Error/Empty); "onde clicar para continuar" → Ação principal + Navegação.

---

## Referências

- [`docs/specs/SPEC-002.md`](specs/SPEC-002.md) — spec de origem.
- [`docs/arquitetura-interface.md`](arquitetura-interface.md) — arquitetura da Etapa 1.
- `docs/tasks/0006-*.md` a `docs/tasks/0015-*.md`, `docs/tasks/0028-*.md`.
