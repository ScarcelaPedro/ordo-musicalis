---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0022 — Componentes base: feedback e overlays

**Task ID**: `TASK-0022`

## Objetivo

Especificar visualmente os componentes de feedback e sobreposição do Design System: Badge (§26),
Alert (§27), Toast (§28), Modal (§29), Drawer (§30), e os estados globais que esses componentes
expressam — Loading/Skeleton, Empty, Error, Success, Disabled (§39–42) — incluindo o padrão de
confirmação que substitui o `confirm()` nativo do navegador (§43), já apontado como inconsistente
pela auditoria de UX.

## Dependências

- `TASK-0017` — paleta semântica (cores de sucesso/aviso/erro/informação usadas nesses
  componentes).
- `TASK-0018` — tipografia.
- `TASK-0019` — espaçamento, radius, elevação (modal/drawer usam elevação 2–3, §15).
- `TASK-0020` — diretrizes transversais (ícones, microinterações, acessibilidade).

## Critérios de conclusão

- [x] Badge especificado para os 9 estados citados (Confirmado, Pendente, Recusado, Publicado,
      Rascunho, Disponível, Indisponível, Ativo, Inativo — §26), cada um com cor + texto +
      eventual ícone — nunca dependendo só da cor (§8, §48).
- [x] Alert especificado para os 4 tipos (informação, sucesso, aviso, erro — §27), com exemplo
      de conteúdo para cada.
- [x] Toast especificado com critério de quando usar (ações concluídas, alterações salvas,
      operações rápidas) e quando não usar (mensagens que exigem leitura prolongada ou decisão
      — §28).
- [x] Modal especificado com critério de uso (confirmação, ações rápidas, tarefas contextuais
      pequenas — §29) e o que NÃO deve ir em modal (fluxos complexos, ex. montagem completa de
      escala).
- [x] Drawer especificado com critério de uso (filtros, detalhes rápidos, seleção contextual,
      edição simples — §30).
- [x] Estados globais documentados: Loading (skeleton priorizado quando a estrutura é
      previsível, spinner para o resto — §39, §40), Empty (título + explicação + ação — §39,
      §41), Error (mensagem humana + próximo passo, nunca "Error 422"/"Failed to fetch" — §39,
      §42), Success (feedback objetivo — §39), Disabled (controle claramente indisponível —
      §39).
- [x] Padrão de confirmação definido substituindo o `confirm()` nativo (título da ação,
      explicação da consequência, ação de cancelar e ação de confirmar — §43).
- [x] Cada componente com comportamento responsivo definido (§50) e considerando acessibilidade
      (§48), conforme `TASK-0020`.

## Estado atual (releitura completa de `Badge.vue`, `FlashMessage.vue`, `stores/flash.ts`)

- `Badge.vue`: já usa `rounded-full` (pill) e já tem 6 cores com par `dark:` completo — mais
  maduro do que os achados de conteúdo geral da `TASK-0016` sugeririam (componentes reutilizáveis
  já têm dark mode; é o conteúdo de página que não tem). Confirma que `radius-full` para badges,
  já antecipado na `TASK-0019`, é o padrão real.
- `FlashMessage.vue`/`stores/flash.ts`: **correção a um achado da auditoria** — o relatório
  dizia "sem timer de auto-dismiss observado... não lido em detalhe". A releitura completa desta
  task mostra que **existe sim** um `setTimeout` de 4000ms no `flash.ts` (`set(type, message,
  duration = 4000)`) — o achado da auditoria estava certo em ser cauteloso (marcou como não
  verificado), e a verificação aqui corrige a informação: o auto-dismiss já existe.
- `FlashMessage` só suporta 3 tipos (`success`/`error`/`info`) — **falta "aviso"** (warning),
  um dos 4 tipos que a SPEC-003 §27 pede.
- `FlashMessage` renderiza inline no fluxo do conteúdo (`mb-4`, dentro do `<main>`), não
  flutuante — mas se comporta como um toast (some sozinho em 4s). Isso é uma mistura dos dois
  conceitos que a SPEC-003 separa em `Alert` (persistente, em contexto) e `Toast` (temporário,
  flutuante) — resolvido explicitamente abaixo.
- Só 1 mensagem por vez (`flash` é um valor único, não uma fila) — uma segunda chamada
  substitui a anterior e reinicia o timer.

## Badge (§26)

| Estado | Cor (token, `TASK-0017`) | Texto | Ícone (opcional, Heroicons) |
|---|---|---|---|
| Confirmado | Success | "Confirmado" | check |
| Pendente | Warning | "Pendente" | clock |
| Recusado | Danger | "Recusado" | x |
| Publicado | Success | "Publicado" | — |
| Rascunho | Neutral | "Rascunho" | — |
| Disponível | Success | "Disponível" | — |
| Indisponível | Neutral/Danger (a decidir na aplicação — indisponibilidade não é necessariamente "erro") | "Indisponível" | — |
| Ativo | Success | "Ativo" | — |
| Inativo | Neutral | "Inativo" | — |

Mantém a base já existente (`Badge.vue`, `STATUS_COLORS`) — pill shape, texto sempre visível
junto da cor (nunca só cor, reforça §8/§48), tipografia `Label`/`Caption` (`TASK-0018`).

## Alert (§27) — novo, distinto do Toast

4 tipos: informação, sucesso, aviso, erro. Renderizado **inline, no fluxo do conteúdo**,
**sem auto-dismiss** — permanece visível até a condição que o gerou mudar ou o usuário
dispensar. Usado para mensagens que precisam continuar visíveis enquanto o usuário trabalha —
ex. "⚠ Existem funções sem servidor" dentro da Etapa 3 (Validação) do `ScaleForm`, já desenhada
conceitualmente na `TASK-0009`.

```text
[✓] Escala salva com sucesso.
[!] Existem funções sem servidor.
[×] Não foi possível salvar a escala.
```

## Toast (§28) — reaproveita o `FlashMessage` existente, muda a posição

**Decisão**: o `FlashMessage`/`flash.ts` atual já implementa o comportamento correto de um
Toast (auto-dismiss em 4s, um por vez) — a mudança necessária é só de **posicionamento**: passa
de inline (`mb-4` dentro do conteúdo) para flutuante (posição fixa, ex. canto inferior direito
ou superior), mantendo a mesma lógica de store (`flash.ts`) sem reescrevê-la. Acrescenta o 4º
tipo (`aviso`) que falta hoje.

- **Quando usar**: ações concluídas, alterações salvas, operações rápidas (ex. "Presença
  confirmada!", "Comunidade excluída.") — exatamente os usos já existentes de `flash.set(...)`
  em todo o sistema hoje.
- **Quando não usar**: mensagens que exigem leitura prolongada ou decisão do usuário — esses
  casos usam `Alert` (persistente) ou o `Modal` de confirmação, não `Toast`.
- Fila: mantém o comportamento atual de uma mensagem por vez (substituição) — nenhuma evidência
  de necessidade real de múltiplos toasts simultâneos (critério de reutilização, `TASK-0020`,
  não construir complexidade sem necessidade comprovada).

## Modal (§29)

Não existe nenhum componente de modal hoje (achado confirmado na `TASK-0016`/auditoria).
Especificação:

- **Estrutura**: overlay escurecido (`bg-black/30`, reaproveitando exatamente o padrão já usado
  no overlay do menu lateral em `AuthenticatedLayout.vue`) + painel centralizado, Elevation 3
  (`TASK-0019`), `radius-lg`, largura máxima conforme o conteúdo (ex. `max-w-md` para
  confirmações).
- **Fechamento**: botão fechar, clique fora do painel, tecla Esc.
- **Microinteração**: fade + leve escala de entrada/saída, 200ms (`TASK-0020`).
- **Quando usar**: confirmação, ações rápidas, tarefas contextuais pequenas — é exatamente o
  novo padrão de confirmação (§43, seção abaixo) e o passo "Confirmar" já formalizado na
  `TASK-0014` (aprovação de substituto).
- **Quando NÃO usar**: fluxos complexos — a montagem completa de uma escala (`ScaleForm`,
  `TASK-0009`) continua sendo página, nunca comprimida em modal (regra já reforçada desde a
  `TASK-0007`, Etapa 2).

## Drawer (§30)

Também não existe como componente genérico hoje — **mas o mecanismo técnico já existe**: o
menu lateral deslizante de `AuthenticatedLayout.vue` (`-translate-x-full` → `translate-x-0`,
200ms, `shadow-xl`, overlay `bg-black/30`) já é, na prática, um drawer, só aplicado
especificamente à navegação. A especificação aqui generaliza esse mecanismo já comprovado em vez
de propor um novo:

- **Estrutura**: painel deslizante a partir de uma borda da tela (direita, para conteúdo
  contextual — evita competir com a navegação, que desliza da esquerda), Elevation 3, overlay
  escurecido igual ao Modal.
- **Quando usar**: filtros (quando não couberem inline, ex. em listagens com muitos filtros),
  detalhes rápidos, seleção contextual, edição simples (§30). Nenhuma tela já desenhada nas
  Etapas 1–2 exige um drawer obrigatoriamente hoje (o candidato cogitado na `TASK-0007` para
  "Adicionar servidor" foi decidido de outra forma na `TASK-0009` — busca inline); o componente
  fica disponível para uso futuro, sem forçar uma aplicação artificial agora.

## Estados globais (§39–42)

- **Loading**: skeleton (blocos cinza pulsantes, no formato do conteúdo esperado — linha de
  lista, retângulo de card) priorizado quando a estrutura é previsível — é o padrão que
  `TASK-0008`, `TASK-0011`, `TASK-0012`, `TASK-0013` e `TASK-0028` já pediram para os gaps de
  loading encontrados; esta task define a aparência real do skeleton que essas tasks só citaram
  pelo nome. Spinner reservado para carregamentos sem forma previsível (ex. submit de
  formulário — já usado hoje nos botões).
- **Empty**: título + explicação + ação (§14.1 da `TASK-0007`, já aplicado consistentemente).
- **Error**: mensagem humana + próximo passo (regra já definida na `TASK-0007`), nunca "Error
  422"/"Failed to fetch" cru — achado da auditoria sobre erro cru vazando em alguns pontos.
- **Success**: via `Toast` (acima) — feedback objetivo, mantendo os textos já bons do sistema
  hoje.
- **Disabled**: já consistente (`:disabled="loading"` durante submits) — mantido.

## Confirmação (§43)

Aplicação direta do `Modal` já especificado acima — não é um componente novo, é um uso
específico do Modal com conteúdo padronizado (já definido conceitualmente na `TASK-0007`,
Etapa 2):

```text
Excluir servidor?
"Essa ação não poderá ser desfeita."
[Cancelar]  [Excluir]
```

Substitui os 12 usos de `confirm()` nativo já mapeados (`TASK-0006`). Botão de confirmação usa
a variante `Danger` do botão (`TASK-0021`) quando a ação é destrutiva.

## Responsividade (§50)

- **Alert/Badge**: mesma aparência em qualquer largura, texto que quebra naturalmente.
- **Toast**: posição fixa se adapta — canto da tela em desktop, largura quase total (com margem)
  em mobile.
- **Modal**: `max-w-md` centralizado em desktop; ocupa quase toda a largura (com margem) em
  mobile, sem alterar a estrutura.
- **Drawer**: painel de largura fixa (ex. 320–400px) em desktop; largura total da tela em
  mobile (mesmo padrão já usado pelo menu lateral hoje).

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §26, §27, §28, §29, §30, §39, §40, §41,
  §42, §43, §52 (Badge, Alert, Toast, Modal, Drawer, EmptyState, Loading/Skeleton, ErrorState).
- `TASK-0017`, `TASK-0018`, `TASK-0019`, `TASK-0020`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `Badge.vue`,
  `FlashMessage.vue` e `stores/flash.ts` **corrigiu** um achado incerto da auditoria: o
  relatório dizia não ter verificado se existe auto-dismiss no flash; a releitura completa
  confirma que existe sim, um `setTimeout` de 4000ms já implementado em `flash.ts`. Decisão
  central da task: o `FlashMessage` atual já se comporta como um Toast (auto-dismiss, um por
  vez) apesar de renderizar inline — em vez de criar um Toast do zero, a especificação reaproveita
  a store `flash.ts` como está e só muda o posicionamento visual para flutuante, junto de
  acrescentar o 4º tipo (`aviso`) que falta. `Alert` (persistente, sem auto-dismiss) fica como
  componente novo e distinto, para os casos que o Toast não cobre. Para o Drawer, identificado
  que o menu lateral de `AuthenticatedLayout.vue` já é, na prática, um drawer funcional — a
  especificação generaliza esse mecanismo já comprovado em vez de propor um novo do zero. Task
  marcada `concluida`. Próximo passo: TASK-0023 (componentes de estrutura e dados) já está
  elegível.
