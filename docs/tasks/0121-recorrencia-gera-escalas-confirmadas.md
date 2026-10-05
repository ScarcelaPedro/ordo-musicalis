---
status: concluida
modulo: api
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0121 — Celebrações geradas por recorrência já nascem confirmadas

**Task ID**: `TASK-0121`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): todas as celebrações criadas a partir das recorrências devem ser
confirmadas automaticamente, sem passar por "rascunho".

## Implementação

- `POST /scale-templates/generate` cria a escala com `status: 'confirmada'` (antes ficava no
  default do banco, `rascunho`). Os dados da escala gerada foram extraídos para
  `buildGeneratedScale` em `api/_lib/recurrence.ts`, testado em `recurrence.test.ts`.
- Só o status da celebração (`Scale.status`) muda. O status de cada servidor escalado
  (`ScaleServidor.status`) continua `convidado`: cada pessoa ainda confirma a própria presença.
- Mudar o status não dispara notificação; nada muda em push/WhatsApp.
- Escalas já geradas antes desta mudança não foram alteradas (não há marca no banco que separe
  com segurança as geradas das manuais).
- Texto de ajuda da tela de recorrências avisa que as escalas geradas já ficam confirmadas.

## Progresso

- 2026-10-05: implementado, testes e type-check ok. Concluída.
