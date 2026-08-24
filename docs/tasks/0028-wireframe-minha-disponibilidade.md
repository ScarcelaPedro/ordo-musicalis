---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0028 — Wireframe de Minha Disponibilidade (formulário do servidor)

**Task ID**: `TASK-0028`

## Objetivo

Assim como "Substituições" (`TASK-0014`), a tela "Minha Disponibilidade" (`/disponibilidade`,
formulário do servidor) é exigida pelo Fluxo D de
[`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §27 ("Minha disponibilidade → Selecionar
disponibilidade → Adicionar exceção → Salvar → Feedback de sucesso"), mas **não** está listada
entre as prioridades numeradas do §25/§4 (que só citam o Painel de Disponibilidade do
coordenador, `TASK-0013`). Esta task foi criada durante a execução da `TASK-0015`
(consolidação), ao perceber que o conjunto de tasks de wireframe (`TASK-0008` a `TASK-0014`)
tinha essa lacuna de cobertura — mesma natureza da lacuna já tratada na `TASK-0014`, não uma
prioridade nova inventada agora.

Também resolve, na experiência, um achado de severidade baixa mas explicitamente citado pela
auditoria (`TASK-0006`/`auditoria-ux.md` §3.5, achado #13/#19): a semântica do checkbox
desmarcado na grade semanal não é explicada em lugar nenhum hoje.

## Dependências

- `TASK-0006` — evidências do estado atual.
- `TASK-0007` — padrões transversais (estados, confirmação) a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe documentado com os campos do §26 (objetivo, usuário, informação principal, ação
      principal, ações secundárias, estrutura, estados, mobile, desktop, navegação).
- [x] Grade semanal (7 dias × 3 períodos) redesenhada para não depender de `overflow-x-auto` no
      mobile, mesmo sendo uma tabela menor que a do Painel de Disponibilidade (`TASK-0013`).
- [x] Semântica do checkbox desmarcado explicitada textualmente (achado da auditoria) — sem
      mudar o dado/regra de negócio (§32), só a comunicação.
- [x] Exceções pontuais redesenhadas para empilhar verticalmente no mobile, em vez de depender
      de `flex-wrap` apertado.
- [x] Fluxo D (§27) documentado de ponta a ponta, cada passo apontando para este wireframe.

## Estrutura atual (releitura completa de `availability/Form.vue`, 158 linhas)

- Banner de janela ativa (quando existe), mesma informação do Painel do coordenador
  (`TASK-0013`), reaproveitável.
- Grade semanal: tabela "Dia" + 3 colunas de período (Manhã/Tarde/Noite) = 4 colunas, 21
  checkboxes — dentro de `overflow-x-auto` (um dos 12 arquivos já mapeados na `TASK-0006`),
  embora menos crítica que a grade do coordenador (8 colunas) por ter menos colunas.
- Exceções pontuais: lista de linhas (data + período + checkbox "Disponível" + "Remover"),
  botão "Adicionar" insere uma linha em branco; texto explicativo já existe ("datas específicas
  em que você foge do seu padrão semanal") — ponto positivo a preservar.
- Um único botão "Salvar disponibilidade" no fim, envia a matriz inteira + exceções de uma vez
  (`POST /availability`).
- **Achado verificado nesta task**: não há estado de loading na carga inicial (`onMounted`) —
  só o botão de salvar tem `loading`. Mesmo padrão de gap já visto em `scales/Index.vue`
  (`TASK-0012`) e `availability/Panel.vue` (`TASK-0013`).
- **Achado da auditoria não resolvido até aqui** (`auditoria-ux.md` §3.5, achado #13/#19): não
  há texto explicando o que significa deixar um checkbox desmarcado — ambíguo para usuário
  pouco técnico.

## Wireframe: Minha Disponibilidade

- **Objetivo**: informar disponibilidade regular e exceções pontuais de forma compreensível.
- **Usuário**: servidor (`musico`).
- **Informação principal**: o que já está marcado como disponível esta semana.
- **Ação principal**: salvar disponibilidade.
- **Ações secundárias**: adicionar/remover exceção pontual.
- **Estrutura**: banner de janela ativa (mantido) + grade semanal + exceções pontuais + ação de
  salvar — mesma composição de hoje, com um acréscimo textual: uma frase fixa acima da grade
  explicitando a semântica ("Marque os períodos em que você **pode** servir. Períodos não
  marcados são tratados como indisponíveis.") — resolve o achado da auditoria só com
  comunicação, sem alterar o formato de dado enviado ao salvar (§32).
- **Estados**: loading a adicionar na carga inicial (gap confirmado nesta task); loading já
  existente no submit; sucesso (flash, já existe); erro (flash, já existe, mensagem já
  razoavelmente humana); vazio em exceções (já existe, mantido).
- **Mobile**: grade semanal deixa de ser tabela e passa a ser uma lista de 7 blocos (um por
  dia), cada um com os 3 períodos como opções lado a lado (checkbox/toggle rotulado, não
  precisa de tabela para só 3 colunas) — elimina o `overflow-x-auto` também aqui, mesmo sendo
  uma grade menor que a do coordenador. Exceções pontuais: cada exceção vira um mini-card
  (data, período, disponível, remover empilhados), em vez de uma linha com `flex-wrap` apertado.
- **Desktop**: mantém a tabela atual (4 colunas cabem bem, sem necessidade de mudança).
- **Navegação**: acessada pelo menu (servidor, rótulo "Disponibilidade"); sem navegação de
  saída além do menu principal — tela autocontida.

## Fluxo D — Disponibilidade (§27), de ponta a ponta

```text
1. Minha disponibilidade   → /disponibilidade (este wireframe)
2. Selecionar disponibilidade → marcar/desmarcar períodos na grade semanal (mobile: lista de
     dias; desktop: tabela)
3. Adicionar exceção        → botão "Adicionar" na seção de exceções pontuais (já existente)
4. Salvar                   → botão único "Salvar disponibilidade" (já existente)
5. Feedback de sucesso      → flash "Disponibilidade salva com sucesso!" (já existente)
```

Todos os passos já existem funcionalmente hoje — o fluxo em si já está correto e enxuto; o
wireframe ajusta comunicação (semântica do checkbox) e responsividade (grade/exceções no
mobile), sem alterar a sequência de ações.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §26, §27 (Fluxo D), §32.
- `auditoria-ux.md` §3.5, achado #13/#19.
- `TASK-0006`, `TASK-0007`, `TASK-0013` (painel equivalente do coordenador), `TASK-0014`
  (mesma natureza de lacuna).

## Notas de progresso

- 2026-08-21 — Task criada durante a execução da `TASK-0015`, ao identificar lacuna de
  cobertura no conjunto de wireframes da Etapa 2 (mesma natureza da lacuna já tratada na
  `TASK-0014` para Substituições).
- 2026-08-21 — Task reivindicada e executada na mesma sessão. Releitura completa de
  `availability/Form.vue` (158 linhas) confirmou o achado da auditoria sobre a semântica do
  checkbox desmarcado nunca ter sido explicada — resolvido só com texto, sem alterar o dado
  enviado ao salvar. Confirmado também que a carga inicial não tem estado de loading (mesmo
  padrão de gap já visto em outras 2 tasks). Fluxo D documentado de ponta a ponta — todos os
  passos já existem funcionalmente hoje, o wireframe ajusta comunicação e responsividade, não a
  sequência de ações. Task marcada `concluida`. TASK-0015 pode retomar a consolidação com o
  Fluxo D agora coberto.
