---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0008 — Wireframes do Dashboard (servidor e coordenador) + estratégia do calendário mobile

**Task ID**: `TASK-0008`

## Objetivo

Produzir os wireframes de baixa/média fidelidade do Dashboard para os dois perfis (servidor e
coordenador), seguindo a priorização de informação de
[`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §5.1/§5.2, e resolver a estratégia mobile do
calendário (§6) — apontado pela própria SPEC como "um dos principais problemas do sistema" e,
segundo a auditoria (a confirmar na TASK-0006), o problema mais grave de mobile hoje (largura
mínima de 560px). Cobre a Prioridade 1 de §25.

A decisão do calendário mobile precisa ser apresentada no formato explícito exigido pelo §31
(alternativas + recomendação + justificativa) — a SPEC-002 cita esse caso especificamente como
exemplo de decisão que não deve ser tomada silenciosamente.

## Dependências

- `TASK-0006` — evidências do Dashboard/calendário atuais.
- `TASK-0007` — padrões transversais (estados, ações primária/secundária) a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe Dashboard–Servidor documentado com todos os campos exigidos pelo §26 (objetivo,
      usuário, informação principal, ação principal, ações secundárias, estrutura, estados,
      mobile, desktop, navegação), priorizando a ordem do §5.1 (próxima escala não deve ser uma
      tabela/calendário grande como primeira informação).
- [x] Wireframe Dashboard–Coordenador documentado da mesma forma, priorizando a ordem do §5.2.
- [x] Decisão do calendário mobile (§6, §6.2) registrada explicitamente no formato do §31:
      alternativas (ex. calendário mensal adaptado / agenda vertical / calendário compacto +
      lista), vantagens, desvantagens, recomendação e justificativa — sem depender de scroll
      horizontal, zoom ou arraste lateral (§6.1).
- [x] Informação mínima por evento do calendário definida (data, horário, comunidade,
      celebração, situação relevante — §6.3) sem recorrer a texto ilegível, respondendo
      diretamente ao problema dos chips ~10px a confirmar na TASK-0006.
- [x] Nenhuma decisão de identidade visual incluída (§24).

## Decisão explícita: estratégia do calendário mobile (SPEC-002 §6, §31)

**Problema**: o calendário do Dashboard hoje força `min-w-[560px]` (`Dashboard.vue:335`,
confirmado na `TASK-0006`), obrigando rolagem horizontal em qualquer celular com menos de 560px
de largura útil (a maioria). É a tela mais usada do sistema e o problema de mobile mais grave
identificado pela auditoria.

**Alternativa A — Calendário mensal adaptado** (grid 7 colunas mantido, células encolhidas)
- Vantagens: mantém a forma visual do mês inteiro de uma vez; menor mudança em relação ao
  padrão atual.
- Desvantagens: em 360–414px de largura, 7 colunas sobram ~50px por célula — o texto dentro de
  cada célula (horário, celebração) fica ainda menor do que o problema já existente dos chips
  `text-[10px]` (achado da auditoria) e o problema de legibilidade não é resolvido, só
  redistribuído.

**Alternativa B — Agenda vertical** (lista de dias com evento, ordenada cronologicamente)
- Vantagens: nunca depende de largura de tela — cada linha ocupa 100% da largura disponível;
  leitura em ordem natural de rolagem (topo → baixo), que já é o padrão de leitura mobile do
  resto do sistema (`Minha Escala` já usa esse padrão hoje, achado positivo confirmado na
  `TASK-0006`); texto sempre no tamanho mínimo definido pela `TASK-0007`/Design System, nunca
  reduzido para caber em célula.
- Desvantagens: perde a percepção "forma do mês" (quais dias têm algo, quais não) — para ver um
  mês inteiro é preciso rolar por todos os dias com evento; menos útil para o coordenador que
  precisa avaliar "situação das escalas do mês" de forma agregada (§5.2, item 2).

**Alternativa C — Calendário compacto + lista** (grid do mês reduzido a marcadores por dia, sem
texto dentro da célula, seguido de uma lista com o detalhe completo dos próximos eventos)
- Vantagens: resolve o problema de largura por completo (nenhuma célula carrega texto, só um
  indicador visual de "tem evento" — sem `min-width` forçado); preserva a percepção de forma do
  mês (útil ao coordenador); a lista abaixo garante texto sempre legível e completo (data,
  horário, comunidade, celebração, situação — §6.3), sem nada escondido atrás de `hidden
  lg:inline` como hoje.
- Desvantagens: duas seções em vez de uma (mais altura de tela usada no total); leve aumento de
  complexidade de implementação futura (dois componentes coordenados em vez de um).

**Recomendação**: Alternativa C (calendário compacto + lista).

**Justificativa**: resolve o requisito não-negociável do §6.1 (nenhuma dependência de scroll
horizontal/zoom/arraste) sem abrir mão da utilidade do calendário para o coordenador (§5.2,
"situação das escalas" pede visão do mês). Também se encaixa na prioridade de informação já
definida: para o servidor, o calendário/agenda é o item 4 de 6 (§5.1) — não precisa ser o
elemento dominante da tela, então uma versão compacta que cede espaço vertical ao que vem antes
(próxima escala, pendências) é consistente com a própria priorização da SPEC. A decisão segue o
critério do §6.2: "baseada na compreensão e velocidade de consulta, não na obrigação de
preservar o formato atual".

### Informação mínima por evento (§6.3)

Aplicada à lista (não às células do calendário compacto, que só indicam presença de evento):

```text
Data · Horário · Comunidade
Celebração
[Situação relevante, quando houver: pendência / alteração recente / vaga]
```

Nenhum campo desta lista fica escondido por breakpoint (`hidden lg:inline` é eliminado) nem
reduzido a um tamanho abaixo do mínimo de legibilidade definido pela `TASK-0007`.

## Wireframe: Dashboard — Servidor

- **Objetivo**: responder "o que eu preciso saber/fazer?" sem exigir navegação adicional.
- **Usuário**: servidor comum (`musico`).
- **Informação principal**: próxima escala (data, horário, comunidade, celebração, função) —
  nunca uma tabela/calendário grande primeiro (§5.1, restrição explícita).
- **Ação principal**: confirmar presença, quando pendente (leva a `Escala — Detalhes`,
  `TASK-0010`).
- **Ações secundárias**: ver detalhes da próxima escala; ver repertório/liturgia da próxima
  celebração (link contextual — dado já existente, sem nova rota); ver disponibilidade.
- **Estrutura**, na ordem de prioridade do §5.1:
  1. Próxima escala (bloco de destaque).
  2. Confirmação pendente (ação embutida no bloco 1, quando aplicável — evita duplicar a
     informação em dois blocos).
  3. Alterações importantes (ex. "horário alterado" — reaproveita o indicador de alteração
     definido para `Escala — Detalhes`, `TASK-0010`).
  4. Próximas escalas (lista curta, 2–3 itens — já existe hoje como "Minhas próximas escalas").
  5. Disponibilidade (atalho/indicador de status — preenchida ou pendente).
  6. Repertório/liturgia relacionado à próxima celebração (link direto, contextual).
  7. Calendário/agenda compacto (Alternativa C acima) — deliberadamente por último, pois é
     informação de contexto, não de ação (achado da auditoria, `TASK-0006`: hoje o calendário é
     o maior elemento visual da tela sem ser o mais acionável).
- **Estados**: loading (skeleton nos blocos 1/4, `TASK-0007`); empty em "Próxima escala" (nenhuma
  escala futura — mensagem + nenhuma ação forçada, já que não é o servidor quem cria escalas);
  empty em "Alterações importantes" (bloco simplesmente não aparece, não é obrigatório).
- **Mobile**: blocos empilhados verticalmente na ordem acima; calendário compacto + lista
  (Alternativa C).
- **Desktop**: mesma ordem de blocos, calendário pode usar grid mensal completo (o problema de
  largura só existe no mobile — manter grid tradicional no desktop é aceitável, §6.2).
- **Navegação**: vem do login; leva a `Escala — Detalhes` (confirmar), `Minha Escala`
  (`/minha-escala`), `Disponibilidade`, `Repertório`/`Liturgia` contextuais.

## Wireframe: Dashboard — Coordenador

- **Objetivo**: identificar rapidamente o que exige ação nas escalas do mês.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: situação geral das escalas do período (quantas confirmadas, quantas
  com pendência).
- **Ação principal**: resolver a pendência mais urgente (pendência de confirmação, função sem
  servidor, ou substituição pendente — o que for mais crítico no momento).
- **Ações secundárias**: criar nova escala; ver relatórios; ver substituições.
- **Estrutura**, na ordem de prioridade do §5.2:
  1. Próximas celebrações (lista curta, com contagem de funções preenchidas — reaproveita o
     banner "próxima celebração" existente, estendido para mostrar preenchimento).
  2. Situação das escalas (stats já existentes hoje: total/confirmadas/rascunhos — mantidos,
     já é um acerto de hierarquia segundo a auditoria).
  3. Pendências (confirmações aguardando — já existe hoje como "Pendências de confirmação").
  4. Funções sem servidor (**dependência de dados a resolver na implementação**: o Dashboard
     hoje só recebe `servidores` por escala, não a lista completa de categorias esperadas por
     celebração — calcular "função vazia" agregado no Dashboard exige dado adicional que a API
     atual do Dashboard não retorna; o `ScaleForm` já calcula isso por escala individual,
     `TASK-0006`. Este wireframe define a necessidade de UX; a viabilidade de dado fica
     registrada como pendência para a Etapa de implementação, não resolvida aqui — SPEC-002
     §29 exclui alteração de API desta etapa).
  5. Conflitos (**mesma ressalva**: não existe hoje nenhuma detecção de conflito, nem em
     `ScaleForm` nem em nível de Dashboard — acompanha o mesmo gap já registrado na
     `TASK-0009`. Este bloco é desenhado como espaço reservado na hierarquia da tela; só
     aparece quando a detecção de conflito existir).
  6. Substituições pendentes (contagem + atalho para `/substituicoes`).
  7. Ações rápidas (criar/editar escala, já existente como botões de header).
- **Estados**: loading (skeleton nos blocos 1/2/3); empty em cada bloco de pendência (ex. "Nenhuma
  pendência de confirmação" — reforça positivamente que está tudo em dia, não é um erro).
- **Mobile**: blocos empilhados; calendário compacto + lista (mesma decisão da Alternativa C,
  compartilhada entre os dois wireframes de Dashboard).
- **Desktop**: blocos podem usar duas colunas (ex. Pendências + Funções sem servidor lado a
  lado) quando o espaço permitir — decisão de layout de grid, não de identidade visual (fica
  para a Etapa 3 aplicar).
- **Navegação**: vem do login; leva a `Escala — Detalhes`/`Editar`, `Substituições`,
  `Relatórios`, `Criar Escala`.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §4, §5, §6, §25 (Prioridade 1), §26, §31.
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Decisão do calendário mobile registrada no
  formato explícito do §31 (3 alternativas, recomendação: calendário compacto + lista).
  Wireframes de Dashboard–Servidor e Dashboard–Coordenador documentados com todos os campos do
  §26, seguindo a ordem de prioridade dos §5.1/§5.2. Dois itens do Dashboard–Coordenador
  ("Funções sem servidor" agregado e "Conflitos") foram desenhados como espaço reservado na
  hierarquia, mas registrados como dependentes de dado/lógica que não existe hoje (a API do
  Dashboard não retorna categorias esperadas por escala, e não existe detecção de conflito em
  lugar nenhum do sistema) — não inventei a funcionalidade nem escondi a lacuna; fica como
  pendência explícita para a etapa de implementação (fora do escopo desta etapa, SPEC-002 §29).
  Task marcada `concluida`. Próximo passo: TASK-0009 (Criar/Editar Escala) já está elegível.
