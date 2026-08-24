---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0013 — Wireframe do Painel de Disponibilidade

**Task ID**: `TASK-0013`

## Objetivo

Redesenhar o painel de disponibilidade
([`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §11) — hoje uma grade servidor × dia com
problemas de largura semelhantes aos do calendário do Dashboard —, priorizando leitura rápida,
identificação de quem respondeu/não respondeu, abertura/fechamento da coleta e filtros, com
estratégia mobile que não dependa de uma tabela horizontal gigantesca (§11.2).

## Dependências

- `TASK-0006` — estrutura real de `availability/Panel.vue` hoje.
- `TASK-0007` — padrões transversais a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe desktop documentado (pode manter estrutura tabular/grade quando favorecer
      comparação — §11.1).
- [x] Wireframe mobile documentado com estrutura alternativa à grade horizontal (ex.
      agrupamento por servidor/dia — §11.2), ou abordagem equivalente justificada no formato do
      §31 se houver mais de uma alternativa real.
- [x] Estados cobertos: quem respondeu, quem não respondeu, coleta aberta/fechada, filtros
      aplicados, vazio.
- [x] Critério de aceite "Mobile → nenhuma solução depende de scroll horizontal desnecessário"
      (§28) coberto para esta tela especificamente.

## Estrutura atual (releitura completa de `availability/Panel.vue`, 160 linhas)

- Bloco "Janela de coleta": se há janela ativa, mostra mês + prazo + botão "Fechar janela"
  (usa `confirm()` nativo — um dos 12 usos já mapeados na `TASK-0006`) + "Ainda não responderam
  (N)" com badges amarelas dos pendentes (ou "Todo mundo já respondeu 🎉"); se não há janela
  ativa, mostra formulário para abrir uma (mês + prazo). Este bloco **já não depende de largura
  fixa** — usa `flex-wrap`, funciona bem em qualquer tela.
- Bloco "Grade de disponibilidade": tabela Servidor × 7 dias da semana, cada célula lista os
  períodos (manhã/tarde/noite) em que aquele servidor está disponível **naquele dia da semana**
  — é a disponibilidade recorrente semanal. Este é o bloco com o problema de largura (mesma
  causa do calendário do Dashboard: uma tabela com 8 colunas dentro de `overflow-x-auto`).
- **Achado verificado nesta task**: a grade só usa entradas com `diaSemana !== null` — as
  exceções pontuais (data específica, cadastradas em `/disponibilidade`) **não aparecem no
  painel do coordenador**. Isso significa que uma indisponibilidade pontual (ex. "não posso no
  dia 25/12") não é visível aqui, só o padrão semanal recorrente. Este wireframe não resolve essa
  lacuna de dado/produto — fica registrada como decisão em aberto para uma etapa futura (não é
  um problema de layout, é uma limitação de dado assumida na etapa de implementação original).
- **Achado novo verificado nesta task** (não citado nominalmente pela auditoria original, que só
  apontava `teams/Index.vue`): este componente também não declara nenhum estado de `loading` —
  mesmo padrão de lacuna já visto em `TASK-0012` para `scales/Index.vue`.
- "Quem já respondeu" não tem uma seção própria hoje — só é dedutível olhando a grade abaixo (a
  ausência na lista de pendentes). O §11 pede "identificação de quem respondeu" como prioridade
  no mesmo nível de "quem não respondeu" — hoje só o segundo é explícito.

## Wireframe: Painel de Disponibilidade

- **Objetivo**: leitura rápida de quem respondeu/não respondeu, com controle da janela de
  coleta.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: quem ainda não respondeu (é o que exige ação do coordenador).
- **Ação principal**: abrir/fechar a janela de coleta.
- **Ações secundárias**: ver grade completa de disponibilidade; (implícito, fora do escopo desta
  tela) cobrar pendentes — depende de integração com notificação, já existente no sistema por
  outros meios.
- **Estrutura**:
  1. Janela de coleta — mantida como está (já funciona bem em qualquer largura).
  2. **Nova seção simétrica**: "Já responderam (M)" ao lado de "Ainda não responderam (N)" —
     hoje só o segundo existe; resolve a prioridade do §11 de identificar os dois grupos com o
     mesmo peso.
  3. Grade de disponibilidade — ver decisão de mobile abaixo.
- **Estados**: coleta aberta (banner indigo, já existe) / fechada (formulário de abertura, já
  existe); quem respondeu / quem não respondeu (badges, um already existe, um novo); vazio
  ("Nenhuma disponibilidade registrada", já existe); loading (**a adicionar** — gap confirmado
  nesta task); confirmação de "Fechar janela" usando o padrão da `TASK-0007` (substitui o
  `confirm()` nativo).

### Decisão: estrutura da grade no mobile (§11.2)

**Problema**: a grade Servidor × 7 dias força `overflow-x-auto` no mobile, mesma causa raiz do
calendário do Dashboard (`TASK-0008`).

**Alternativa A — Mockup literal do §11.2** (por servidor, expandir cada dia da semana com seus
períodos em lista)
- Vantagens: replica exatamente o exemplo da SPEC; nenhuma informação comprimida.
- Desvantagens: até 7 dias × 3 períodos = **21 linhas por servidor** — para uma paróquia com
  20+ servidores, isso é uma rolagem vertical extremamente longa, trocando um problema de
  largura por um problema de comprimento.

**Alternativa B — Card por servidor com mini-grade compacta 7×3 interna**
- Vantagens: cada card mostra a semana inteira num relance (igual à tabela do desktop, só que
  vertical e sem exigir largura mínima — 7 colunas de indicador compacto cabem em qualquer
  tela); muito mais curto que a Alternativa A.
- Desvantagens: precisa de uma legenda simples (✓/— por período) para ser autoexplicativa sem
  depender só de cor (reforça `TASK-0007`/acessibilidade).

**Recomendação**: Alternativa B. **Justificativa**: resolve o problema de largura (mesma
motivação da decisão do calendário, `TASK-0008`) sem trocar por um problema de comprimento de
rolagem — mantém a "leitura rápida" que o §11 pede como prioridade nº 1, o que a Alternativa A
comprometeria em qualquer paróquia com mais que um punhado de servidores.

- **Mobile**: cards por servidor (Alternativa B), com filtro/busca por nome quando a lista for
  longa (mesmo padrão de busca das listagens administrativas, `TASK-0012`).
- **Desktop**: mantém a tabela/grade atual (§11.1 permite explicitamente).
- **Navegação**: acessada pelo menu (staff, rótulo "Disponibilidade"); sem navegação de saída
  além do menu principal.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §11, §25 (Prioridade 6), §26, §28 (Mobile).
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `availability/Panel.vue`
  (160 linhas) revelou uma lacuna de produto não relacionada a layout: a grade só mostra
  disponibilidade recorrente semanal (`diaSemana !== null`) — exceções pontuais cadastradas em
  `/disponibilidade` não aparecem no painel do coordenador. Registrada como decisão em aberto
  para etapa futura, não resolvida aqui. Também confirmado que este componente não tem estado
  de loading (mesmo padrão de gap já visto em `scales/Index.vue`, `TASK-0012`). Decisão da
  estrutura mobile da grade registrada no formato §31: recomendado card por servidor com
  mini-grade compacta 7×3 em vez do mockup literal da SPEC (que geraria até 21 linhas por
  servidor) — prioriza "leitura rápida" (pedido explícito do §11) sobre fidelidade literal ao
  exemplo. Adicionada seção simétrica "Já responderam" ao lado de "Ainda não responderam", que
  hoje só existe num sentido. Task marcada `concluida`. Próximo passo: TASK-0014
  (Substituições) já está elegível.
