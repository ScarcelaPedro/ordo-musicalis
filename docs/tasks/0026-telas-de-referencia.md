---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0026 — Telas de referência

**Task ID**: `TASK-0026`

## Objetivo

Aplicar o Design System completo (paleta, tipografia, espaçamento, componentes base e de
domínio, navegação) aos wireframes mais importantes da Etapa 2, na ordem de prioridade definida
por [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) §57 (item 10): Dashboard, Escala
(Detalhes), Criar/Editar Escala, Minha Escala, Listagens. Não é necessário redesenhar todas as
telas do sistema nesta etapa — estas servem como referência para o restante.

## Dependências

- `TASK-0021`, `TASK-0022`, `TASK-0023`, `TASK-0024`, `TASK-0025` — todos os componentes que as
  telas de referência vão usar.
- `docs/tasks/0008-wireframes-dashboard.md` (Etapa 2).
- `docs/tasks/0010-wireframe-escala-detalhes.md` (Etapa 2).
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (Etapa 2).
- `docs/tasks/0011-wireframe-minha-escala.md` (Etapa 2).
- `docs/tasks/0012-wireframes-listagens-administrativas.md` (Etapa 2).

## Critérios de conclusão

- [x] Dashboard (servidor e coordenador) com o Design System aplicado sobre o wireframe da
      `TASK-0008`, incluindo o padrão visual de calendário da `TASK-0023`.
- [x] Escala — Detalhes com o Design System aplicado sobre o wireframe da `TASK-0010`, incluindo
      os componentes de domínio da `TASK-0025` (celebrante em destaque, situação da escala,
      função vazia, alteração recente).
- [x] Criar/Editar Escala com o Design System aplicado sobre o wireframe da `TASK-0009`,
      incluindo `ScaleMember`/`ScaleRole`/`ConflictAlert`/`EmptyRole` da `TASK-0025`.
- [x] Minha Escala com o Design System aplicado sobre o wireframe da `TASK-0011`.
- [x] Ao menos um exemplo de Listagem (ex. Servidores) com o Design System aplicado sobre o
      padrão genérico da `TASK-0012` (tabela desktop / cards mobile).
- [x] Cada tela de referência responde às perguntas do §62 de forma consistente: identidade
      visual, ação principal, componente a usar, espaçamento, cor por estado, comportamento
      mobile/desktop, comportamento em erro/carregamento/desabilitado.
- [x] Nenhuma tela fora dessa lista foi redesenhada nesta task (§57, item 10 — "não é necessário
      redesenhar todas as telas nesta etapa").

## Dashboard (servidor e coordenador)

- **Identidade visual**: cartões `surface` + Elevation 1 (`TASK-0019`); "Próxima celebração"
  usa `CelebrationHeader` simplificado, com o horário/comunidade em `Body Small`.
- **Ação principal**: "Confirmar presença" (servidor, `Primary`) embutida no bloco de próxima
  escala; "Nova Escala" (coordenador, `Primary`) no header — "Substituições"/"Relatórios"
  migram de classe inline copiada para o novo componente `Tertiary` (`TASK-0021`), resolvendo a
  repetição de código já identificada na `TASK-0016`.
- **Componentes usados**: `ScaleCard` (`TASK-0025`) para "Minhas próximas escalas"/"Pendências";
  Calendário compacto + lista (`TASK-0023`, aplicando a decisão da `TASK-0008`) — hoje=contorno
  `Accent`, dia selecionado=fundo `Primary`, eventos=ponto na cor litúrgica (mantendo
  `CORES_LITURGICAS_CLASSES`); `Display` (`TASK-0018`) nos números de estatística
  (total/confirmadas/rascunhos, já usados como `text-4xl` hoje).
- **Espaçamento**: `spacing-lg` entre blocos (já é `space-y-6` hoje, mantido).
- **Cor por estado**: pendências em `Warning`, confirmadas em `Success` (`STATUS_COLORS`
  preservado).
- **Mobile**: bottom nav (`TASK-0024`) substitui o dropdown atual; calendário compacto.
- **Desktop**: sidebar com hierarquia de domínios (`TASK-0024`); calendário em grid completo.
- **Erro/carregamento/desabilitado**: skeleton nos blocos principais (`TASK-0022`), substituindo
  o spinner isolado atual; erro humano via `Toast`/`Alert` conforme o caso.

## Escala — Detalhes

- **Identidade visual**: `CelebrationHeader` (`TASK-0025`) com celebrante em `Avatar` + `H4`,
  resolvendo o achado central desta tela (celebrante sem destaque, `TASK-0006`/`TASK-0010`).
- **Ação principal**: "Confirmar presença" (servidor, `Primary`, quando pendente); para staff,
  "Editar" (`Secondary`) — sem ação forçada única, conforme já decidido na `TASK-0010`.
- **Componentes usados**: faixa-resumo de situação da escala com `ConfirmationStatus` agregados;
  `ScaleRole` por categoria, com `ScaleMember` dentro e `EmptyRole` (`surface-bordered` âmbar)
  nas categorias sem ninguém — agora também na visualização, não só na edição; `RepertoireItem`
  na prévia de repertório; `LiturgicalInfo` se a decisão em aberto da `TASK-0010` (dado
  `scale.liturgia`) se confirmar viável.
- **Alteração recente**: indicador `Alert` tipo aviso próximo ao topo ("⚠ Horário alterado"),
  condicionado à disponibilidade de `updatedAt` (pendência já registrada na `TASK-0010`/
  `ux-wireframes-etapa2.md`) — o Design System já tem a peça pronta (`Alert`, `TASK-0022`) para
  quando o dado existir.
- **Breadcrumb**: não aplicado aqui — a regra da `TASK-0024` reserva breadcrumb para fluxos
  administrativos complexos; Detalhes é acessado de múltiplos pontos sem hierarquia linear
  única que justifique um.
- **Mobile/Desktop**: mantém o padrão de cartões empilhados já considerado funcional pela
  auditoria (`TASK-0010`) — só os tokens visuais mudam, não a estrutura responsiva.

## Criar/Editar Escala

- **Identidade visual**: as 4 etapas (`TASK-0009`) ganham um indicador de progresso **textual**
  simples ("Etapa 2 de 4 — Equipe", `Label`/`Caption`) em vez de um componente de stepper visual
  novo — usado só nesta tela, não passa o critério de reutilização (`TASK-0020`, §54) para
  justificar um componente dedicado.
- **Ação principal por etapa**: "Avançar" (`Primary`) / "Voltar" (`Tertiary`); na Etapa 4,
  "Publicar escala" (`Primary`) e "Salvar como rascunho" (`Secondary`) — aplica diretamente a
  decisão já tomada na `TASK-0009`/`TASK-0021`.
- **Componentes usados**: `ScaleRole` por categoria com busca inline (`TASK-0009`) dentro de
  cada bloco; `ScaleMember` nas linhas já adicionadas; `ConflictAlert` (`TASK-0025`) junto à
  pessoa em conflito, quando a detecção existir; `EmptyRole` nas categorias vazias (mantido).
- **Cor por estado**: campos obrigatórios não preenchidos usam a borda `Danger` do Input
  (`TASK-0021`) na validação da Etapa 3.
- **Mobile**: linhas de `ScaleMember` empilham campos verticalmente (`TASK-0009`, resolve o
  achado de linhas com 4 controles apertados).
- **Desktop**: mantém o formulário em grid 2 colunas na Etapa 1 (já é o padrão hoje).

## Minha Escala

- **Identidade visual**: `ScaleCard` (`TASK-0025`) para cada escala, com chevron de
  tappability reaproveitado do padrão já usado no Dashboard (`TASK-0011`).
- **Ação principal**: "Confirmar" (`Primary`, inline na linha, quando pendente).
- **Componentes usados**: `ConfirmationStatus` badge; função/instrumento exibido junto ao nome
  da celebração (dependente de dado, pendência já registrada na `TASK-0011`).
- **Estados**: empty state com título + explicação (`TASK-0007`/`TASK-0022`) já existente,
  mantido; loading passa de texto único para skeleton por linha (`TASK-0011`).
- **Mobile/Desktop**: já funciona bem em ambos hoje (achado da auditoria) — só tokens visuais.

## Listagem — exemplo Servidores

- **Identidade visual (desktop)**: tabela com cabeçalho `Label` uppercase (mantido), container
  `surface` + Elevation 1, `radius-lg` no container, `radius-sm` nos badges internos
  (`TASK-0019`).
- **Ação principal**: "Novo Servidor" (`Primary`) no header.
- **Componentes usados (mobile)**: `Card` com `[Ver] [Mais]` (`TASK-0012`/`TASK-0023`) —
  "Mais" abre `Dropdown` (`TASK-0023`) com Editar/Excluir, resolvendo o achado de área de toque
  pequena; `Avatar` (iniciais) opcional junto ao nome, reaproveitando o componente já
  especificado para `ScaleMember` mesmo fora do contexto de escala.
- **Exclusão**: usa o `Modal` de confirmação (`TASK-0022`), substituindo o `confirm()` nativo.
- **Busca**: campo de busca com debounce (comportamento já recomendado na `TASK-0012`).
- **Estados**: skeleton no loading (gap já preenchido pela `TASK-0012`); vazio já existente,
  mantido.

## Verificação das perguntas do §62

Confirmado, de forma consistente entre as 5 telas de referência acima: identidade visual (mesma
paleta/tipografia/espaçamento em todas), ação principal (sempre 1 `Primary` por tela, nunca
mais), componente a usar (cada elemento mapeado a um componente já especificado nas TASK-0021 a
0025, nenhum "solto"), espaçamento (escala única da `TASK-0019`), cor por estado (paleta
semântica única da `TASK-0017`), comportamento mobile/desktop (definido por tela acima),
comportamento em erro/carregamento/desabilitado (catálogo único da `TASK-0022`, aplicado sem
exceção).

Nenhuma tela fora desta lista de 5 foi redesenhada — as demais (Substituições, Disponibilidade,
Painel, cadastros administrativos) continuam com os wireframes da Etapa 2 como referência
estrutural, a receber o mesmo tratamento visual quando (e se) forem implementadas, seguindo os
mesmos tokens e componentes já especificados aqui.

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §57 (item 10), §62.
- `TASK-0021` a `TASK-0025`.
- `docs/tasks/0008-*.md`, `0009-*.md`, `0010-*.md`, `0011-*.md`, `0012-*.md` (Etapa 2).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Aplicado o Design System completo (TASK-0017 a
  0025) às 5 telas de referência do §57 item 10, sem redecidir nenhuma estrutura já fixada nas
  Etapas 1–2 — só aparência. Decisão pontual registrada: o indicador de progresso das 4 etapas
  do `ScaleForm` fica textual simples (`Etapa 2 de 4`), sem virar um componente de stepper
  visual novo, por não passar o critério de reutilização (uso único). Confirmado que as
  perguntas do §62 são respondidas de forma consistente entre as 5 telas — mesmo vocabulário
  visual, nenhum elemento "solto" fora dos componentes já especificados. Deixado explícito que
  nenhuma tela fora da lista de 5 foi redesenhada, conforme o próprio §57 permite. Task marcada
  `concluida`. Próximo passo: TASK-0027 (consolidação da Etapa 3) já está elegível — depende de
  TASK-0017 a 0026, todas concluídas.
