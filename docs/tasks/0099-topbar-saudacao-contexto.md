---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
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

- [x] Saudação e data exibidas corretamente (testar horários limite 11:59/12:00/17:59/18:00).
- [x] Nenhum ícone/ação sem destino real.
- [x] Ações de staff funcionando e visíveis só para staff.
- [x] Teste unitário da função de saudação por horário (se `TASK-0096` já concluída; caso
      contrário registrar e cobrir na validação final).
- [x] `npm run build` passa; verificado em mobile e desktop, claro e escuro.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §5, §22, §23, §28.
- `docs/tasks/0036-topbar.md`.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `a65ea26`.

  **Saudação** (Dashboard, ambos os perfis): "{Bom dia|Boa tarde|Boa noite}, {primeiro nome}!" em
  `H2`, com uma linha de propósito por perfil ("Visão geral das escalas da paróquia." / "Suas
  escalas e o que precisa da sua atenção."). Util `src/utils/greeting.ts` (`greetingFor`,
  `firstName`, `longDate`) com 3 testes, incluindo os limites 11:59/12:00/17:59/18:00 (25 testes
  no total). Também corrige o título do header, que era invisível no tema escuro (achado da
  `TASK-0104`).

  **Data**: texto estático na topbar em `md+` ("Sexta-feira, 25 de setembro de 2026"). Não virou
  dropdown, porque não há o que selecionar. **Sino**: não entrou. O discovery confirmou que não
  existe feed de notificações in-app (só Web Push em `src/utils/push.ts` e preferências em
  `profile/Edit.vue`), e um ícone sem destino viola a §5.

  **Ações de staff**: `PrimaryButton`/`SecondaryButton` ganharam a prop opcional `to` (renderiza
  `RouterLink` com o mesmo visual; sem `to`, continua `<button>` com o mesmo `type` padrão,
  retrocompatível). As 3 ações do header (antes `RouterLink` com classes inline copiadas) usam
  os componentes e ficam ocultas abaixo de `md`: no mobile, "Nova escala" é o botão central da
  bottom nav e Substituições/Relatórios estão em "Mais" (antes as três quebravam em duas linhas
  no celular). Continuam visíveis só para staff.

  **Verificação**: admin a 1280px claro (saudação + data + ações; clique em "Nova escala" →
  `/escalas/criar`), 375px escuro (título legível, ações ocultas, sem scroll horizontal);
  `Entrar` do login continua `type="submit"`. `npm run build` e `npm test` passam; `dist/`
  revertido.
