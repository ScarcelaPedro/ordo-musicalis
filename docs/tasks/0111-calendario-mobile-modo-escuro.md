---
status: em-andamento
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

- [ ] Modo escuro + mobile (< 768px): células em bloco neutro com ponto litúrgico no canto,
      indicador de "dia com celebração" que não se confunda com o ponto litúrgico, e hoje
      destacado como no desktop.
- [ ] Modo claro + mobile: sem mudança.
- [ ] Legenda explica o indicador de celebração no modo em que ele aparece.
- [ ] Rótulos acessíveis mantidos; sem scroll horizontal a 360px.
- [ ] `npm run build` e `npm test` passam.

## Referências

- `docs/tasks/0101-calendario-liturgico-linguagem-visual.md`, `docs/tasks/0037-dashboard-calendario.md`.
- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §9, §11, §25.

## Notas de progresso

- 2026-09-25 — Task criada e reivindicada a pedido do usuário.
