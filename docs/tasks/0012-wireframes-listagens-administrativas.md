---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0012 — Wireframes de listagens administrativas

**Task ID**: `TASK-0012`

## Objetivo

Definir o comportamento genérico de listagem administrativa em desktop (tabela, quando favorecer
comparação de dados) e mobile (cards/listas/agrupamentos/ações contextuais — nunca redução de
tabela via scroll horizontal), conforme
[`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §10, aplicando aos exemplos citados pela SPEC
(Servidores, Escalas, Comunidades), mas de forma reutilizável pelas demais listagens
administrativas já mapeadas na Etapa 1 (Categorias, Celebrantes, Ministérios/Equipes, Escalas
Recorrentes — ver `TASK-0002`), sem precisar redesenhar cada uma individualmente.

## Dependências

- `TASK-0006` — estrutura real das listagens (`servidores/Index.vue` e demais).
- `TASK-0007` — padrões transversais a aplicar aqui.

## Critérios de conclusão

- [x] Padrão desktop definido (tabela) e padrão mobile definido (estrutura de card, §10.1), com
      os campos do §26 preenchidos para o padrão genérico.
- [x] Exemplo aplicado a pelo menos as 3 listagens citadas pela SPEC (Servidores, Escalas,
      Comunidades — §10).
- [x] Padrão verificado como aplicável, sem alteração adicional, às demais listagens
      administrativas mapeadas na `TASK-0002` da Etapa 1 (Categorias, Celebrantes,
      Ministérios/Equipes, Escalas Recorrentes) — ou exceções registradas explicitamente, se
      alguma não se encaixar no padrão genérico.
- [x] Critério de aceite "Mobile → Tabelas possuem estratégia alternativa para mobile" (§28)
      coberto.

## Estrutura atual (releitura de `servidores/Index.vue`, `scales/Index.vue`,
`comunidades/Index.vue`, mais contagem de colunas nas demais)

| Tela | Colunas (`<th>`) | Filtro/busca | Loading? |
|---|---|---|---|
| Servidores | 5 (Nome+e-mail, Função(ões), Nível, Status, ações) | Busca por nome, `@input` **sem debounce** — 1 requisição por tecla (achado da auditoria, `TASK-0006`) | Sim |
| Escalas | 6 (Data, Celebração+horário, Comunidade, Ministério, Status, ações) | 3 filtros (mês, ministério, comunidade) | **Não** — não há `loading.value` neste componente; achado novo, verificado nesta task (o achado original da auditoria só citava `teams/Index.vue` por nome) |
| Comunidades | 4 (Nome, Endereço, Status, ações) | Nenhum | Sim |
| Categorias, Celebrantes | 5 `<th>` cada | A confirmar caso a caso na implementação | A confirmar |
| Ministérios (Equipes), Escalas Recorrentes | 7 `<th>` cada | A confirmar | A confirmar |

Todas usam `<table>` dentro de `overflow-x-auto`, sem alternativa mobile (achado crítico da
auditoria, `TASK-0006`) — confirmado estruturalmente idêntico entre as telas: cabeçalho +
linhas + coluna final de ações (Editar/Excluir, texto simples adjacente, área de toque pequena
— achado da auditoria, seção 9 item 4).

## Padrão genérico

- **Objetivo**: listar registros de um cadastro, permitindo localizar, ver detalhe e (para
  staff) editar/excluir.
- **Usuário**: leitura para todos os perfis com acesso à área (ver matriz de acesso,
  `docs/arquitetura-interface.md`); ações de escrita só para staff.
- **Informação principal**: o identificador do registro (nome/celebração) + o dado mais
  relevante para diferenciá-lo dos demais (função, comunidade, data — varia por tela).
- **Ação principal**: abrir o detalhe (quando existir rota própria) ou editar diretamente
  (quando não existir tela de detalhe separada, como em Comunidades/Categorias/Celebrantes).
- **Ações secundárias**: editar, excluir (agrupadas, ver decisão abaixo), filtros/busca.
- **Estrutura**:
  - **Desktop**: tabela (mantém o padrão atual — já funciona bem nesse breakpoint, achado da
    auditoria confirma que o problema é só no mobile).
  - **Mobile**: card por registro, seguindo o padrão do §10.1:
    ```text
    ┌─────────────────────────────┐
    │ <Identificador principal>    │
    │ <metadado secundário>        │
    │ <badges de status/categoria> │
    │                             │
    │ [Ver/Detalhe]  [Mais ▾]      │
    └─────────────────────────────┘
    ```
    "Mais" agrupa Editar/Excluir — resolve diretamente o achado da auditoria sobre ações
    adjacentes com área de toque pequena (§9, item 4: risco de tocar em "Excluir" por engano ao
    tentar "Editar"). O mecanismo exato de exposição ("Mais" — dropdown, inline reveal) é
    decisão de componente, fora do escopo desta etapa (Etapa 3).
- **Estados** (catálogo da `TASK-0007`): loading (skeleton de cards/linhas — deve existir em
  **todas** as listagens, corrigindo tanto o gap já conhecido de `teams/Index.vue` quanto o novo
  achado desta task em `scales/Index.vue`); empty (já forte em todo o sistema — mensagens
  específicas como "Nenhum servidor encontrado" — mantido); confirmação de exclusão usando o
  padrão definido na `TASK-0007` (substitui os 12 usos de `confirm()` nativo, incluindo os das
  três listas de exemplo).
- **Busca/filtros**: mantidos onde já existem (Servidores: busca por nome; Escalas: mês +
  ministério + comunidade); a busca de Servidores deve aplicar um pequeno atraso antes de
  disparar a requisição (debounce) em vez de uma requisição por tecla — comportamento de
  interação esperado do campo de busca, não uma feature nova.
- **Navegação**: cada listagem já é acessada pelo menu (staff) ou por rota direta; leva ao
  detalhe/edição do registro.

## Aplicação aos 3 exemplos citados (§10)

- **Servidores** (5 colunas → card): nome + e-mail (identificador), função(ões) em badges,
  nível em badge, status em badge, `[Ver] [Mais]`.
- **Escalas** (6 colunas → card): celebração + horário (identificador), data + comunidade
  (metadado secundário), ministério e status em badges, `[Ver] [Mais]` — reaproveita o mesmo
  padrão de card já usado em `Minha Escala`/Dashboard (`TASK-0008`/`TASK-0011`), consistência
  entre telas que já mostram dados de escala de formas parecidas.
- **Comunidades** (4 colunas → card): nome (identificador), endereço (metadado secundário),
  status em badge, `[Mais]` só (sem "Ver" — não existe tela de detalhe separada, o próprio card
  já mostra tudo; "Mais" leva a Editar/Excluir).

## Verificação de aplicabilidade às demais listagens (Etapa 1, `TASK-0002`)

Categorias, Celebrantes, Ministérios (Equipes) e Escalas Recorrentes têm a mesma estrutura de
base (tabela + colunas de dado + coluna de ações) confirmada pela contagem de `<th>` desta task
— nenhuma tem uma estrutura fundamentalmente diferente (ex. nenhuma tem gráficos, mapas, ou
dados que não caibam no modelo identificador+metadado+badges+ações). O padrão genérico se
aplica a todas sem exceção. `Relatórios` (`reports/Index.vue`, 9 colunas) e o `Painel de
Disponibilidade` (grade servidor×dia) **não** entram neste padrão — o primeiro é uma tela de
agregação/KPI, o segundo já tem task própria (`TASK-0013`) por ser uma grade bidimensional, não
uma listagem simples.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §10, §25 (Prioridade 5), §26, §28 (Mobile).
- `docs/tasks/0002-mapa-navegacao-matriz-acesso-perfil.md` (SPEC-001) — inventário das demais
  listagens administrativas.
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `servidores/Index.vue`,
  `scales/Index.vue` e `comunidades/Index.vue`, mais contagem de colunas nas demais 5 listagens
  administrativas. Achado novo verificado nesta task (além do já conhecido em
  `teams/Index.vue`): `scales/Index.vue` também não tem estado de loading — não estava citado
  nominalmente pela auditoria original, mas confirmado agora por leitura direta do código.
  Padrão genérico definido (tabela no desktop, card com "Mais" agrupando Editar/Excluir no
  mobile — resolve o achado de área de toque pequena da auditoria) e aplicado aos 3 exemplos da
  SPEC. Verificado que o padrão se aplica sem exceção às demais listagens administrativas
  mapeadas na Etapa 1 (mesma estrutura de base em todas); Relatórios e Painel de Disponibilidade
  ficaram explicitamente fora deste padrão (agregação/KPI e grade bidimensional,
  respectivamente — este último já tem task própria). Task marcada `concluida`. Próximo passo:
  TASK-0013 (Painel de Disponibilidade) já está elegível.
