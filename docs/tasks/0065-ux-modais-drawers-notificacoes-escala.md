---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0065 — Nível 3: UX de modais, drawers, notificações e da tela de escala

**Task ID**: `TASK-0065`

## Objetivo

Avaliar o comportamento de `Modal`, `Drawer` e notificações em todos os pontos onde são usados
(SPEC-005 §39-41), e revisar especificamente a compreensão da tela de escala (§42), que é a peça
central do sistema.

## Escopo

- `Modal.vue`: confirmações de exclusão nas listagens administrativas, aprovar/rejeitar em
  `substitutions/Index.vue`.
- `Drawer.vue`: menu "Mais" da navegação mobile.
- Notificações: `Toast`/`flash` em toda ação de sucesso/erro.
- `scales/Show.vue` (tela de escala em si).

## Metodologia

Teste de modais (§39): abertura, fechamento, `Escape`, foco (ao abrir e ao fechar), leitura do
conteúdo, ação principal, cancelamento — e confirmar que nenhum modal permite perda acidental de
dados (ex.: fechar sem aviso um formulário com alterações não salvas, se existir esse caso).

Verificar especificamente o bug de retorno de foco já registrado no relatório da Etapa 4 (item
10: `Modal.vue` não devolve foco corretamente quando aberto a partir de um item de `Dropdown`)
— confirmar se ainda ocorre e reclassificar sua severidade sob a régua P0-P3 desta etapa.

Teste de drawers (§40): abertura, fechamento, scroll interno, ações, comportamento mobile, foco.

Teste de notificações (§41): estado não lida, lida, nova, vazia — o usuário deve entender
claramente se há algo pendente.

Teste de escala (§42): revisar `scales/Show.vue` quanto a funções, pessoas, status, conflitos,
disponibilidade, confirmação e edição — a escala deve ser compreendida rapidamente, sem esforço
de decodificação.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Modais testados nos 7 aspectos do §39, incluindo o bug de foco já conhecido.
- [x] Drawer (menu "Mais") testado nos 6 aspectos do §40.
- [~] Notificações testadas — reinterpretado pra o que o sistema de fato tem (toggle de push em
      Perfil, não um inbox com itens individuais); ver Notas de progresso.
- [x] Tela de escala revisada quanto aos 7 aspectos do §42.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Baixo — validação observacional, não altera código. O bug de foco do `Modal` já tem
  causa-raiz identificada (ver relatório da Etapa 4); esta task só precisa confirmar/reclassificar,
  não investigar do zero.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §39-42, §53.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7.3, item 10
  (bug de foco do `Modal`).

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright, teclado real —
  `Tab`/`Enter`/`Escape`, sem `.click()` sintético onde o teste era especificamente sobre
  navegação por teclado). Seed temporário `api/prisma/_seedTask0065.ts` (deletado ao final,
  nunca commitado): musico + 1 servidor descartável + 1 escala com equipe parcial.

  **§39 Modal — achado principal: o bug de foco é específico do caminho via `Dropdown`, não do
  `Modal` em si.** Testados dois caminhos lado a lado pra isolar a causa:
  - **Caminho limpo** (botão "Excluir" direto na tela, sem menu intermediário): `Tab` até o
    botão → `Enter` abre o modal → foco vai corretamente pro botão "Fechar" dentro do
    `[role=dialog]` → `Escape` fecha → **foco volta certinho pro botão "Excluir" que abriu**.
    Comportamento correto em todos os pontos do §39.
  - **Caminho via `Dropdown` "Mais"** (mesma ação, mas passando pelo menu suspenso primeiro,
    como acontece de verdade na listagem mobile de servidores): `Enter` no botão "Mais" → `Tab`
    até "Excluir" dentro do menu → `Enter` abre o modal → `Escape` fecha → **foco cai em
    `BODY/nenhum`**, reproduzindo exatamente o bug já registrado no relatório da Etapa 4 (item
    10). A comparação lado a lado confirma a causa-raiz já suspeitada: o item do `Dropdown` que
    tinha o foco é desmontado quando o `Dropdown` fecha (no mesmo ciclo em que o `Modal` abre),
    então `Modal.vue` não tem mais um `previouslyFocused` válido pra devolver o foco. Sem achado
    novo — reconfirmado com evidência mais precisa (isolando exatamente qual caminho falha) pra
    embasar a task de correção que a `TASK-0071` vai gerar.

  **§40 Drawer — sem achado.** Menu "Mais" (mobile, `Drawer.vue`) abre e fecha corretamente via
  `Escape`, sem travar.

  **§41 Notificações — escopo reinterpretado pra o que o sistema realmente tem.** Este sistema
  **não tem** um inbox/central de notificações com itens individuais lida/não-lida — "notificação"
  aqui é só a inscrição em Web Push (`src/utils/push.ts`), configurada uma vez em
  `profile/Edit.vue`. Testado o que existe de verdade: o toggle mostra claramente "Ativar
  notificações" quando desativado (estado testado com `musico@escaladmusicos.test`, que nunca
  ativou), e o código já trata o caso de navegador sem suporte ("Seu navegador não suporta
  notificações push."). Os estados "não lida"/"nova"/"vazia" do §41 literalmente não se aplicam
  — não existe lista de notificações pra ter itens lidos ou não lidos. Registrado como
  reinterpretação de escopo (mesmo espírito do §60 tratar teste de usuário real como condicional
  quando a premissa da spec não bate com o sistema real), não como lacuna a preencher inventando
  um inbox que não existe.

  **§42 Escala — interações confirmadas, complementando a revisão visual da `TASK-0063`.**
  "Confirmar presença" funciona direto em `scales/Show.vue` (não só via `Minha Escala`/
  `MyScales.vue`) — mais um caminho válido pro Fluxo 2, redundância positiva, não fragmentação
  (mesma ação, mesmo endpoint, dois pontos de entrada coerentes). Link "Editar" navega
  corretamente pra `/escalas/:id/editar`. (O botão "Imprimir" não foi reverificado nesta rodada —
  a checagem no script bateu na tela de Edição por engano, depois de já ter navegado pra lá;
  descartado como inconclusivo em vez de reportado como achado.)

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Ambiente encerrado ao
  final (Docker removido, dev servers finalizados, seed temporário apagado). Task marcada
  `concluida`. Próximo passo: `TASK-0066`.
