---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0009 — Wireframes de Criar/Editar Escala (fluxo completo de montagem de equipe)

**Task ID**: `TASK-0009`

## Objetivo

Segundo a própria [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) (§7), esta é "a tela de maior
atenção da Etapa 2". Produzir o redesenho conceitual completo do fluxo de criação/edição de
escala como "montar uma equipe", não "preencher um formulário gigante" (§7.1): as quatro etapas
lógicas — Celebração, Equipe, Validação, Revisão (§7.2) —, o fluxo de adicionar servidor (§7.3),
a hierarquia entre sugestões e seleção manual (§7.4, apontada pela auditoria como fonte de
confusão hoje), a representação visual dos três tipos de conflito (§7.5) e o estado sem
sugestões explicando o motivo (§7.6).

Cobre a Prioridade 2 de §25 (Criar Escala, Editar Escala, Adicionar servidor, Validar conflitos,
Revisar escala) e o entregável "fluxo completo de criação/edição de escala" citado em §30 (item
9). O objetivo não é reorganizar campos — é repensar a interação (§7), preservando a
flexibilidade multi-categoria hoje existente (§32).

## Dependências

- `TASK-0006` — estrutura/campos reais do `ScaleForm.vue` atual.
- `TASK-0007` — padrões transversais (estados, confirmação, modal/drawer/página) a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe de cada uma das 4 etapas lógicas (Celebração, Equipe, Validação, Revisão)
      documentado com os campos do §26, preservando os dados/campos hoje existentes no
      `ScaleForm` (confirmados na TASK-0006) sem alterar regra de negócio (§32).
- [x] Fluxo de "Adicionar servidor" redesenhado (§7.3), com decisão explícita entre os padrões
      possíveis (autocomplete / seleção rápida / drawer / modal) no formato do §31.
- [x] Hierarquia entre sugestões e seleção manual definida claramente (§7.4): quando usar
      sugestão, como aceitar, como adicionar manualmente, como substituir uma sugestão, o que
      acontece quando não existem sugestões.
- [x] Representação visual definida para os três tipos de conflito citados: servidor
      indisponível, servidor já escalado, função incompatível (§7.5) — o objetivo é detectar o
      problema no momento da escalação.
- [x] Estado "sem sugestões" especificado explicando o motivo (indisponível / já escalado /
      categoria incompatível / nenhum cadastro correspondente) e oferecendo um próximo passo
      (§7.6) — nunca apenas "Nenhum servidor encontrado".
- [x] Critérios de aceite "Escala" do §28 cobertos por este wireframe: dados da celebração
      separados da montagem da equipe; categorias de equipe com agrupamento claro; adicionar
      servidor com fluxo definido; sugestões com hierarquia clara; conflitos com representação
      definida; funções vazias com representação definida (junto com TASK-0010); revisão da
      escala com fluxo definido.
- [x] Flexibilidade multi-categoria hoje existente preservada conceitualmente (§32) — nenhuma
      categoria/regra de negócio removida ou inventada.

## Estrutura de dados real a preservar (releitura completa de `ScaleForm.vue`, 430 linhas)

Confirmado nesta task (não apenas herdado da `TASK-0006`), para ancorar o redesenho em dados
reais, não em suposições:

- Campos de cabeçalho: `dataCelebracao`, `horario`, `celebracao`, `comunidadeId`,
  `celebranteId`, `observacoes`, `status` (rascunho/confirmada), `lembreteDiasAntes`.
- Cada pessoa escalada (`ScaleServidor`): `servidorId`, `categoriaId` (opcional — existe o balde
  "sem função definida"), `instrumentId` (só relevante se categoria = Música),
  `funcaoLiturgica` (só relevante se categoria = Acólitos e Ancilas), `teamId` (opcional, em
  qualquer categoria).
- Categorias são dinâmicas (`categoriasOrdenadas`, vindas de cadastro) — cada uma vira um bloco
  independente; nem toda celebração precisa de todas.
- Elegibilidade: só servidores com aquela categoria no próprio cadastro aparecem no seletor de
  cada bloco (`servidoresDaCategoria`) — **esse filtro já existe e já impede, na prática, boa
  parte do que seria "função incompatível"** (§7.5) contanto que o balde "sem função definida"
  não seja usado para contornar esse filtro.
- Sugestões (`GET /scales/sugestoes`, por data/horário): retorna `servidorId`, `nome`, `nivel`,
  `score`, `motivo` — já explica o motivo de cada sugestão **aceita**, mas não informa nada
  sobre quem foi excluído nem por quê (ver seção "Conflitos" abaixo).
- Divergência pontual com a SPEC: §7.2 lista "ministério, quando aplicável" como campo da Etapa
  1 (Celebração); no sistema real não existe um campo de ministério no cabeçalho — ministério é
  escolhido por pessoa, dentro de cada categoria, na Etapa 2. Mantido conforme o dado real, não
  inventado um campo de cabeçalho que não existe.

## Etapa 1 — Celebração

- **Objetivo**: registrar os dados que identificam a celebração.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: data, horário, celebração (nome do evento).
- **Ação principal**: avançar para "Equipe".
- **Ações secundárias**: cancelar (volta para `/escalas`).
- **Estrutura**: campos principais (data, horário, celebração, comunidade — todos obrigatórios
  hoje) + campos secundários (celebrante, observações, lembrete de dias antes — todos
  opcionais), seguindo a hierarquia de formulário da `TASK-0007` (§12).
- **Estados**: validação inline nos campos obrigatórios ao tentar avançar (não é preciso
  submeter o formulário inteiro para descobrir um campo faltando, como hoje).
- **Mobile**: campos empilhados, um por linha.
- **Desktop**: grid de 2 colunas (já é o padrão atual, mantido).
- **Navegação**: vem de `/escalas` (Nova Escala) ou de `Escala — Detalhes` (Editar); leva à
  Etapa 2.

## Etapa 2 — Equipe

- **Objetivo**: montar a equipe da celebração, por categoria de função.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: quais categorias já têm gente, quais estão vazias.
- **Ação principal**: adicionar servidor (ver decisão abaixo).
- **Ações secundárias**: remover servidor, adicionar equipe inteira (quando há ministério
  cadastrado na categoria), voltar para Etapa 1.
- **Estrutura**: um bloco por categoria (preserva a flexibilidade multi-categoria, §32); cada
  bloco mostra: nome da categoria, contagem/estado vazio (âmbar quando vazio — já existe hoje,
  mantido), lista de pessoas já adicionadas com os campos condicionais (instrumento só em
  Música, função litúrgica só em Acólitos), ação de adicionar.
- **Estados**: vazio (categoria sem ninguém — já existe, mantido); "nenhum servidor cadastrado
  com esta função" (já existe, mantido); loading ao buscar sugestões.
- **Mobile**: blocos de categoria empilhados; dentro de cada linha de pessoa, os campos
  condicionais empilham verticalmente em vez de `flex-wrap` apertado (achado da auditoria sobre
  linhas com até 4 controles ficarem repetitivas no celular, `TASK-0006`).
- **Desktop**: mesma estrutura, linha de pessoa em uma única linha horizontal.
- **Navegação**: volta para Etapa 1; avança para Etapa 3.

### Decisão explícita: fluxo de "Adicionar servidor" (§7.3, §31)

**Problema**: hoje adicionar uma pessoa exige abrir um `<select>` "Adicionar servidor..." e
clicar "Adicionar" (2 interações), repetido por pessoa, dentro de cada bloco de categoria —
somado ao bloco "Sugeridos" separado no topo, são facilmente 30+ interações discretas numa
escala comum (achado crítico da auditoria, `TASK-0006`).

**Alternativa A — Manter select nativo, só reorganizar layout**
- Vantagens: menor esforço de mudança; select nativo já é reconhecido como acessível (§17,
  reforçado por `TASK-0007`).
- Desvantagens: não resolve o problema real, que é o número de interações e a competição visual
  com "Sugeridos" — só reorganizar não ataca a causa apontada pela auditoria como severidade
  crítica.

**Alternativa B — Autocomplete/busca inline dentro do próprio bloco da categoria**
- Vantagens: reduz a ação a "digitar nome → clicar no resultado certo"; mantém o usuário dentro
  do contexto da categoria (sem abrir camada nova); combina naturalmente com a exibição de
  sugestões daquela categoria específica (ver hierarquia abaixo).
- Desvantagens: telas pequenas com muitas categorias abertas ao mesmo tempo podem ficar longas
  (mitigado pela Alternativa C a seguir).

**Alternativa C — Drawer/modal de seleção separado do fluxo principal**
- Vantagens: isola a busca visualmente, sem competir com o restante do formulário.
- Desvantagens: adiciona uma camada de navegação extra por pessoa adicionada (abrir → buscar →
  fechar) — na prática pode não reduzir o número de interações percebidas, só trocar "abrir
  select" por "abrir drawer", sem resolver a causa raiz identificada pela auditoria.

**Recomendação**: Alternativa B (busca inline dentro do bloco da categoria), com os campos
condicionais (instrumento/função litúrgica/ministério) aparecendo **durante** a busca, antes de
confirmar — não depois, como hoje (hoje: adicionar → editar select da linha já adicionada; novo
fluxo: buscar → escolher pessoa → preencher o que for aplicável → um único "Adicionar").

**Justificativa**: ataca diretamente a causa identificada como severidade crítica pela auditoria
(interações repetidas, uma por pessoa) sem introduzir uma camada de navegação nova (§20, critério
da `TASK-0007`: drawer é para "seleção contextual" quando compensa isolar — aqui o contexto já é
pequeno o bastante, um bloco de categoria, para não precisar de isolamento). Mantém "adicionar
equipe inteira" como está (já é uma interação única e eficiente).

## Hierarquia entre sugestões e seleção manual (§7.4)

**Problema identificado pela auditoria** (`TASK-0006`, achado crítico): hoje existem duas fontes
de "adicionar pessoa" — um bloco "Sugeridos" geral no topo do formulário e a busca manual dentro
de cada categoria — sem indicação de qual usar primeiro, e a sugestão nem sabe em que categoria
a pessoa vai servir (cai sempre em "sem função definida").

**Decisão**: sugestões deixam de ser um bloco único e global. A mesma chamada
(`GET /scales/sugestoes`, já existente, sem mudança de API) é feita uma vez, e o resultado é
**distribuído dentro de cada bloco de categoria**, cruzando `Suggestion.servidorId` com
`Servidor.categorias` (dado já presente na prop `servidores`, sem necessidade de nova consulta)
— cada bloco mostra suas próprias sugestões primeiro, seguidas da busca manual como alternativa
sempre visível, nunca escondida.

- **Quando usar sugestão**: sempre que a categoria tiver sugestões elegíveis — aparecem no topo
  do bloco, com o `motivo` já retornado pela API.
- **Como aceitar**: um clique em "Adicionar" na sugestão (igual ao fluxo atual, mantido).
- **Como adicionar manualmente**: busca inline (decisão acima), sempre disponível abaixo das
  sugestões, nunca oculta.
- **Como substituir uma sugestão**: remover a pessoa adicionada (ação já existente) e adicionar
  outra pela busca manual — não é uma operação especial.
- **O que acontece sem sugestões**: ver seção seguinte.

### Estado "sem sugestões" (§7.6)

Nunca apenas "Nenhum servidor encontrado". Motivos possíveis e o que já é computável hoje vs. o
que exige dado novo:

| Motivo | Computável hoje? |
|---|---|
| Nenhum cadastro correspondente àquela categoria | **Sim** — já existe a mensagem "Nenhum servidor com a função X cadastrado ainda" (`ScaleForm.vue:358-360`); só falta integrá-la ao mesmo componente de sugestões, em vez de ser um texto separado. |
| Categoria incompatível | Sim, pelo mesmo filtro acima — a lista de elegíveis já é filtrada por categoria. |
| Servidor indisponível naquele período | **Não** — não existe hoje cruzamento entre `Availability`/`AvailabilityWindow` e a busca de sugestões. Requer nova lógica de backend, fora do escopo desta etapa (SPEC-002 §29 exclui alteração de API). |
| Servidor já escalado no mesmo horário | **Não** — mesmo motivo acima; não existe verificação de conflito de horário hoje em nenhum endpoint. |

O wireframe define a experiência-alvo (mensagem explicando o motivo real, quando disponível, com
um próximo passo — ex. "Nenhum servidor com esta função cadastrado. [Adicionar manualmente]" ou,
quando a nova lógica existir, "3 servidores indisponíveis neste horário. [Ver disponibilidade]")
— os dois últimos motivos ficam registrados como pendência de implementação (mesma lacuna da
seção de Conflitos abaixo), não resolvidos silenciosamente nem inventados como já funcionando.

## Representação de conflitos (§7.5)

| Tipo de conflito | Detectável hoje? | Representação definida |
|---|---|---|
| Função incompatível | **Já prevenido estruturalmente** pelo filtro `servidoresDaCategoria` (a pessoa nem aparece como opção fora da sua categoria cadastrada) — o wireframe reforça esse filtro também na nova busca inline, para não regredir. Único ponto de atenção: o balde "sem função definida" continua sem esse filtro, por natureza (é a válvula de escape do sistema) — não é tratado como conflito ali. | Prevenção na origem, sem necessidade de alerta. |
| Servidor já escalado (outro horário/comunidade) | **Não existe hoje** nenhuma verificação cruzando as escalas de uma mesma pessoa por data/horário. | Alerta inline junto ao nome da pessoa no momento de adicionar (busca inline) e na linha já adicionada: "⚠ Conflito de horário — João já está escalado às 19:00 em outra comunidade. [Ver conflito]" (segue o exemplo do próprio SPEC-002 §7.5/§37, aplicado só como wireframe — a lógica de detecção é pendência de implementação, fora do escopo desta etapa). |
| Servidor indisponível | **Não existe hoje** cruzamento com `Availability`/exceções cadastradas. | Mesmo padrão de alerta inline: "⚠ Maria marcou este período como indisponível." — mesma ressalva de pendência de implementação. |

Este wireframe **não inventa** a lógica de detecção — define onde e como o resultado apareceria
na tela, para que a etapa de implementação (fora do escopo aqui) tenha um alvo de UX já definido
em vez de decidir isso ad-hoc depois.

## Etapa 3 — Validação

- **Objetivo**: revisar pendências antes de seguir para a revisão final.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: lista consolidada de pendências (campos obrigatórios faltando,
  categorias vazias, conflitos quando a detecção existir).
- **Ação principal**: avançar para Revisão (permitido mesmo com pendências não bloqueantes —
  ex. categoria vazia pode ser intencional; campo obrigatório ausente, não).
- **Ações secundárias**: voltar para Etapa 2 e corrigir um item específico (link direto ao
  bloco correspondente).
- **Estrutura**: checklist agrupado por tipo — "Obrigatórios" (bloqueante), "Categorias vazias"
  (informativo), "Conflitos" (quando existir a detecção — bloqueante ou de confirmação
  explícita, a decidir na etapa de implementação).
- **Estados**: tudo certo (mensagem positiva, sem itens pendentes) vs. lista de pendências.
- **Mobile/Desktop**: lista vertical em ambos — não há motivo para layout diferente aqui, é uma
  lista de texto curto.
- **Navegação**: volta para Etapa 2 (por item ou geral); avança para Etapa 4.

## Etapa 4 — Revisão

- **Objetivo**: confirmar que a celebração e a equipe estão corretas antes de salvar.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: resumo da celebração (dados da Etapa 1) + equipe completa agrupada
  por categoria (mesma organização da Etapa 2, agora só leitura).
- **Ação principal**: salvar/publicar a escala.
- **Ações secundárias**: salvar como rascunho; voltar para editar; cancelar.

### Decisão: o campo "Status" vira ação, não mais um `<select>`

Hoje `status` (rascunho/confirmada) é um dropdown no meio dos campos de cabeçalho — decidido
antes de a equipe estar montada, o que não faz sentido operacionalmente (o coordenador só sabe
se a escala está pronta para "confirmada" depois de montar a equipe). O padrão de ação
primária/secundária definido na `TASK-0007` (§13) já dá o exemplo pronto: "Salvar escala" como
ação primária, "Salvar rascunho" como ação secundária. Aplicado aqui: os dois botões da Etapa 4
substituem o `<select>` de status — `Publicar escala` (ação primária, grava `status:
confirmada`) e `Salvar como rascunho` (ação secundária, grava `status: rascunho`). Mesmo dado,
mesma regra de negócio (SPEC-002 §32) — só muda quando e como o coordenador o define.

- **Estados**: loading no submit (já existe); erro de submissão (mensagem humana, `TASK-0007`
  §7 sobre microcopy).
- **Mobile**: resumo em cartões empilhados.
- **Desktop**: resumo em duas colunas (dados da celebração + equipe).
- **Navegação**: volta para Etapa 3; ao salvar, leva a `Escala — Detalhes` (`TASK-0010`).

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §7, §25 (Prioridade 2), §26, §28 (Escala),
  §30, §31, §32.
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Releitura completa do `ScaleForm.vue` (430 linhas)
  para ancorar o redesenho em dados reais. As 4 etapas lógicas documentadas com os campos do
  §26. Decisão de "Adicionar servidor" registrada no formato §31 (recomendação: busca inline
  por categoria, campos condicionais preenchidos durante a busca). Hierarquia sugestões/manual
  resolvida distribuindo as sugestões (já retornadas pela API existente) dentro de cada bloco de
  categoria, cruzando com `Servidor.categorias` já disponível no frontend — sem exigir mudança
  de API. Conflitos e "sem sugestões" tiveram sua representação visual definida, mas com nota
  explícita de que 2 dos 3 tipos de conflito (já escalado, indisponível) e 2 dos 4 motivos de
  "sem sugestões" exigem lógica de detecção que não existe hoje em nenhum endpoint — registrado
  como pendência de implementação, não inventado nem escondido. "Função incompatível" já é
  prevenida estruturalmente pelo filtro existente, sem necessidade de nova lógica. Também
  registrada a decisão de o campo `status` (rascunho/confirmada) deixar de ser um `<select>` no
  cabeçalho e virar a ação final da Etapa 4 (Publicar vs. Salvar rascunho), mesma regra de
  negócio, seguindo o padrão de ação primária/secundária já definido na `TASK-0007`. Task
  marcada `concluida`. Próximo passo: TASK-0010 (Escala — Detalhes) já está elegível.
