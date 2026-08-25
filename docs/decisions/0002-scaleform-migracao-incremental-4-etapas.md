# 0002 — ScaleForm: manter o formulário funcional de ponta a ponta durante a migração para 4 etapas

- **Data**: 2026-08-24
- **Status**: aceita
- **Validade**: até a `TASK-0047` concluir a Etapa 4 (Revisão) — este ADR pode ser arquivado depois.
- **ADR ID**: `ADR-0002`
- **Task relacionada**: `TASK-0043`

## Contexto

`docs/tasks/0009-wireframes-criar-editar-escala.md` define 4 etapas lógicas para o `ScaleForm`
(Celebração, Equipe, Validação, Revisão), decompostas em 5 tasks de implementação separadas
(`TASK-0043` a `0047`), uma por etapa (mais uma para conflitos). A `TASK-0043` cobre só a Etapa 1
(Celebração) — mas o `ScaleForm.vue` é o formulário mais usado e mais denso do sistema (430
linhas, único ponto de criação/edição de escala), e a própria task exige "testado criando e
editando uma escala até o fim" como critério de conclusão, mesmo com só 1 das 4 etapas
redesenhada nesta rodada.

A seção "Riscos" da `TASK-0043` já antecipa esse impasse e propõe duas saídas: (a) implementar as
4 etapas como navegação real desde já, mantendo o conteúdo das etapas 2-4 como está hoje até cada
task correspondente redesenhá-lo; ou (b) aceitar um formulário funcionalmente incompleto entre
tasks, em um branch não mesclado. Como este projeto não trabalha com branches de longa duração
(cada task é concluída e o estado fica sempre consistente em `main`), a opção (b) não se aplica.

## Decisão

Implementar a navegação por 4 etapas completa nesta task, mas com profundidade de redesenho
diferente por etapa:

- **Etapa 1 (Celebração)** — redesenho real: campos principais (data/horário/celebração/
  comunidade) separados dos secundários (celebrante/observações/lembrete), com validação inline
  antes de avançar. Esse é o escopo de fato da `TASK-0043`.
- **Etapa 2 (Equipe)** — conteúdo de hoje preservado sem nenhuma alteração funcional (blocos
  "Sugeridos" + "Equipe da celebração" por categoria, exatamente como já funcionam). A busca
  inline por categoria (decisão já registrada na `TASK-0009`) é o escopo da `TASK-0044`, não
  desta.
- **Etapa 3 (Validação)** — não existe hoje como tela separada. Em vez de inventar uma checklist
  de pendências sem lógica real por trás (o que pareceria uma funcionalidade que não existe —
  mesmo risco já evitado no indicador de notificações da `TASK-0036` e nos blocos "Funções
  vazias"/"Conflitos" da `TASK-0039`), esta etapa mostra só uma ponte mínima e honesta ("revise a
  equipe antes de continuar") com Voltar/Avançar. A checklist real é o escopo da `TASK-0046`.
- **Etapa 4 (Revisão)** — mantém o `<select>` de `status` exatamente como está hoje (migrado
  visualmente para o componente `Select`, sem mudar a regra de negócio) e os botões finais
  Salvar/Cancelar reais, já que a troca por "Publicar escala"/"Salvar como rascunho" é o escopo
  da `TASK-0047`.

Resultado: o usuário consegue navegar 1 → 2 → 3 → 4 → Salvar e criar/editar uma escala de ponta a
ponta hoje, com exatamente o mesmo comportamento de antes — só reorganizado em telas. Nenhuma
etapa fica vazia ou quebrada; as que ainda não foram redesenhadas simplesmente carregam o
conteúdo real de hoje, sem regressão e sem funcionalidade simulada.

## Alternativas consideradas

- **Big-bang**: implementar as 5 tasks (`0043`–`0047`) de uma vez, numa sessão só. Descartada —
  contraria o padrão de tasks pequenas e verificáveis já estabelecido no projeto
  (`docs/AGENTS.md`), e aumenta o raio de risco de uma mudança no formulário mais usado do
  sistema sem checkpoints intermediários.
- **Manter tudo numa tela só até a última task** (não introduzir navegação por etapas ainda).
  Descartada — a própria `TASK-0043` pede a estrutura de navegação como critério de conclusão, e
  adiar isso empurraria o mesmo problema para a `TASK-0047` sem necessidade.

## Consequências

- As `TASK-0044` a `0047` herdam uma estrutura de navegação já pronta — cada uma só precisa
  substituir o conteúdo da sua etapa, sem tocar no mecanismo de `etapaAtual`/Avançar/Voltar.
- Até a `TASK-0047` concluir, a Etapa 4 ainda mostra um `<select>` de status em vez dos botões
  Publicar/Salvar rascunho descritos na `TASK-0009` — divergência temporária e esperada, não um
  bug.
- A Etapa 3 fica visualmente "fraca" (só uma frase-ponte) até a `TASK-0046` — aceitável porque é
  honesto sobre o que ainda não existe, em vez de fingir uma validação que não roda.
