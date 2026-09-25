---
status: concluida
modulo: src/components
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0111 — Calendário mobile no modo escuro: grade em blocos, como no desktop

**Task ID**: `TASK-0111`

**Prioridade**: P1 (pedido direto do usuário, antes das demais tasks)

## Objetivo

Pedido do usuário (2026-09-25): no **modo escuro**, a grade compacta do calendário no mobile
(células com fundo tingido pela cor litúrgica + ponto de evento) fica de difícil entendimento.
Nesse modo, especificamente, o calendário mobile deve seguir o desenho das telas maiores
(`TASK-0101`): dia em bloco neutro, cor litúrgica como ponto no canto, hoje em destaque. Deve
ser simplificado para caber no mobile. No modo claro, o mobile continua como está.

Continua sendo a lógica mobile própria (SPEC-003.1 §11): grade compacta + lista detalhada abaixo.
Muda só a apresentação das células no escuro.

## Critérios de conclusão

- [x] Modo escuro + mobile (< 768px): células em bloco neutro com ponto litúrgico no canto,
      indicador de "dia com celebração" que não se confunda com o ponto litúrgico, e hoje
      destacado como no desktop.
- [x] Modo claro + mobile: sem mudança.
- [x] Legenda explica o indicador de celebração no modo em que ele aparece.
- [x] Rótulos acessíveis mantidos; sem scroll horizontal a 360px.
- [x] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0101-calendario-liturgico-linguagem-visual.md`, `docs/tasks/0037-dashboard-calendario.md`.
- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §9, §11, §25.

## Notas de progresso

- 2026-09-25 — Task criada e reivindicada a pedido do usuário.
- 2026-09-25 — Executada. Commit: `7bf988f`.

  `Calendar.vue` ganhou a prop opcional `compactVariant` (`'tint'` padrão | `'tiles'`). Em
  `'tiles'` (exige `cellMarker`), a grade compacta mobile vira uma versão simplificada do tile do
  desktop, com altura de 48px:
  - bloco neutro com borda e número centralizado;
  - ponto litúrgico no canto superior direito (mesmo `cellMarker` do desktop);
  - **traço curto** embaixo para "dia com celebração". É um traço, e não um ponto, para não se
    confundir com o marcador litúrgico;
  - hoje com número em círculo `primary` e bloco destacado;
  - dias fora do mês com o mesmo estilo de célula vazia do desktop.

  O Dashboard passa `theme.isDark ? 'tiles' : 'tint'` (`useThemeStore().isDark`, reativo), então
  a troca acontece na hora ao alternar o tema. A lista detalhada abaixo da grade e o desktop não
  mudaram. A legenda "Escalas" ganhou "▬ Dia com celebração", visível só no mobile escuro
  (`max-md:dark:flex`), que é onde o traço existe. `aria-label` de cada dia mantido.

  Não virou ADR: é pedido direto do usuário, limitado a um modo, e registrado aqui; a decisão
  mobile da `TASK-0008` §31 (grade compacta + lista) continua valendo.

  **Verificação** (banco temporário com escalas e liturgia de setembro): escuro a 375px e 360px
  (tiles, pontos, traços nos dias 20/27/30, hoje 25 destacado, sem scroll horizontal, legenda
  visível) e claro a 360px (grade tingida original, legenda do traço oculta). `npm run build` e
  `npm test` passam; `dist/` revertido.
