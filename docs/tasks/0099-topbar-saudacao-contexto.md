---
status: backlog
modulo: src/layouts
owner:
criado-em: 2026-09-25
---

# 0099 — Topbar: contexto e saudação na nova linguagem visual

**Task ID**: `TASK-0099`

**Prioridade**: P2

## Objetivo

Aplicar à topbar e ao cabeçalho de página a linguagem da referência — saudação personalizada
("Bom dia, {nome}!"), subtítulo curto, data atual e ações compactas à direita — atendendo ao
item "1. contexto" da hierarquia de tela (SPEC-003.1 §22).

## Comportamento esperado

- Saudação calculada pelo horário local (Bom dia / Boa tarde / Boa noite) + primeiro nome de
  `auth.user`. Aplicada no Dashboard (ambos os perfis); demais telas mantêm título de página.
- Data atual por extenso (pt-BR). A referência mostra a data como dropdown — **não** transformar
  em seletor se não houver função real associada; texto estático é suficiente.
- Ícones de ação na topbar (sino, calendário) **somente** se levarem a funcionalidade existente.
  Discovery obrigatório: verificar se existe feed de notificações in-app (hoje só há Web Push em
  `src/utils/push.ts`) — se não existir, o sino não entra (SPEC-003.1 §5 "não inventar").
- Ações de staff hoje no header do Dashboard (Substituições, Relatórios, Nova Escala) mantidas,
  reestilizadas com os componentes de botão do Design System (hoje são `RouterLink` com classes
  inline).
- Mobile: saudação encurtada/sem subtítulo quando faltar espaço; sem scroll horizontal.

## Dependências

- `TASK-0097` — tokens/linguagem visual.

## Critérios de conclusão

- [ ] Saudação e data exibidas corretamente (testar horários limite 11:59/12:00/17:59/18:00).
- [ ] Nenhum ícone/ação sem destino real.
- [ ] Ações de staff funcionando e visíveis só para staff.
- [ ] Teste unitário da função de saudação por horário (se `TASK-0096` já concluída; caso
      contrário registrar e cobrir na validação final).
- [ ] `npm run build` passa; verificado em mobile e desktop, claro e escuro.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §5, §22, §23, §28.
- `docs/tasks/0036-topbar.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
