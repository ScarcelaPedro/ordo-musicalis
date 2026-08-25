---
status: concluida
modulo: src/pages/scales
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0047 — Criar/Editar Escala: Etapa 4 (revisão e ação final)

**Task ID**: `TASK-0047`

## Objetivo

Implementar a Etapa 4 (Revisão) do `ScaleForm.vue`: resumo da celebração e equipe, com o campo
`status` deixando de ser um `<select>` no cabeçalho e virando a ação final — "Publicar escala"
(`PrimaryButton`, grava `status: confirmada`) e "Salvar como rascunho" (`SecondaryButton`,
grava `status: rascunho`) — SPEC-004 §29.

## Arquivos/componentes envolvidos

- `src/pages/scales/ScaleForm.vue` — nova seção/etapa de revisão; remoção do `<select>` de
  `status` da Etapa 1 (movido para cá como ação, não mais campo).
- `src/pages/scales/Create.vue`, `Edit.vue` — confirmar que o `submit` continua enviando
  `status` no payload exatamente como hoje (`'rascunho' | 'confirmada'`) — só muda **quando** e
  **como** o valor é definido, não o formato de dado enviado à API.

## Comportamento esperado

Resumo em duas colunas (desktop) / cartões empilhados (mobile): dados da celebração (Etapa 1) +
equipe completa por categoria (somente leitura, reaproveitando `ScaleRole`/`ScaleMember` com
`editable: false`). Dois botões de ação final, substituindo o `<select>` de status. Mesma
requisição HTTP (`POST`/`PUT /scales`) e mesmo payload — só a origem do valor `status` muda de
"campo preenchido antes" para "botão clicado no fim".

## Dependências

- `TASK-0033` — `ScaleRole`/`ScaleMember` em modo somente leitura.
- `TASK-0046` — Etapa 3 (validação) implementada, antecede a revisão.

## Critérios de conclusão

- [x] `<select>` de `status` removido da Etapa 1 (já tinha saído na `TASK-0043`) e agora também
      da Etapa 4; ação "Publicar"/"Salvar rascunho" implementada na Etapa 4, gravando o mesmo
      valor de `status` que o select gravava antes.
- [x] Resumo de revisão mostra celebração, horário, comunidade, celebrante, equipe e problemas
      (se a validação da Etapa 3 tiver algum pendente e o usuário optar por avançar mesmo
      assim).
- [x] Payload enviado ao backend idêntico em formato ao payload atual — **nenhuma mudança de
      contrato de API** (SPEC-004 §2, §62). Confirmado por leitura de `Create.vue`/`Edit.vue`:
      `submit(data)` continua enviando o `form` inteiro (`POST`/`PATCH /scales`) sem nenhuma
      transformação — `FormData`/`ScaleServidor` não mudaram de forma, só `status` passou a ser
      atribuído no `@click` do botão em vez de vir de um `v-model`.
- [x] `npm run build` passa sem erros.
- [~] Testado criando uma escala como rascunho e publicando uma escala, confirmando no backend —
      **não executado** (sem backend/DB rodando nesta sessão, mesma limitação já registrada em
      tasks anteriores); verificado por leitura de código: `Edit.vue` já popula
      `initialData.status` com o status real da escala carregada, e `form.status` só muda quando
      o usuário clica um dos dois botões — editar uma escala `confirmada` sem clicar em nada
      preserva o valor certo até o clique explícito.

## Riscos

- Mudar onde/quando o `status` é definido é uma mudança de **interação**, não de regra de
  negócio — mas é fácil introduzir um bug sutil (ex. esquecer de inicializar `form.status`
  corretamente ao editar uma escala já existente, que já tem um status prévio a preservar até o
  usuário decidir mudá-lo). Testar edição de escala já `confirmada` com cuidado.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §29.
- `docs/tasks/0009-wireframes-criar-editar-escala.md` (decisão completa: "campo Status vira
  ação").

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. Etapa 4 substituída inteiramente: o `<select>` de
  `status` (que a `TASK-0043` já tinha movido pra cá, mas ainda como campo) virou dois botões de
  ação — `PrimaryButton type="submit"` "Publicar escala" (`@click="form.status = 'confirmada'"`)
  e `SecondaryButton type="submit"` "Salvar como rascunho" (`@click="form.status = 'rascunho'"`).
  Como o `@click` roda antes do evento `submit` do `<form>` disparar (mesmo tick, atualização
  reativa síncrona), `form.status` já está correto quando `emit('submit', form)` executa —
  confirmado por leitura do fluxo de eventos do Vue/DOM, não alterei `Create.vue`/`Edit.vue`.
  Resumo em grid de 2 colunas (desktop)/empilhado (mobile, `grid-cols-1 lg:grid-cols-2`): dados
  da celebração num `<dl>` só-leitura (celebração/data e horário formatados/comunidade/
  celebrante quando houver/observações quando houver) + equipe completa via `ScaleRole`/
  `ScaleMember` com `editable="false"` — a leitura certa para esses componentes, ao contrário da
  Etapa 2 (edição multi-select, onde decidi não usar `ScaleMember` na `TASK-0044`). Bloco de
  "Sem função definida" também aparece quando há alguém lá. Se o usuário chegou à Etapa 4 mesmo
  com pendência da Etapa 3 (a Etapa 3 é quem bloqueia; nada impede tecnicamente pular pra frente
  clicando direto no indicador de etapa — não há tal indicador clicável, então na prática só
  aconteceria se a Etapa 3 fosse burlada por engano de estado, mas o aviso fica registrado por
  segurança), um aviso vermelho lista os campos faltando com atalho de volta à Etapa 1. Badge
  "Situação atual" mostra o `form.status` corrente antes de qualquer clique, resolvendo o risco
  registrado na task (editar uma escala já `confirmada` não perde esse valor até o usuário agir).
  Nenhuma mudança em `Create.vue`/`Edit.vue` — confirmado que ambos continuam enviando o `form`
  inteiro sem transformação, `FormData` não mudou de forma. `npm run build` passou sem erros;
  `dist/` restaurado; `git status` confirmou que só `ScaleForm.vue` mudou entre páginas. Teste
  real de publicar/salvar rascunho e conferir no backend não executado (sem backend/DB rodando
  nesta sessão); validado por leitura de código do fluxo de atribuição de `status`. Task marcada
  `concluida`. **Fim da Fase 5 (Criar/Editar Escala)**: `TASK-0043` a `0047` concluídas. Próximo
  passo: `TASK-0048` (Minha Escala) inicia a Fase 6.
