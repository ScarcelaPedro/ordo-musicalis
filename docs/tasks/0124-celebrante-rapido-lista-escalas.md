---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-05
---

# 0124 — Definir o celebrante direto na lista de escalas

**Task ID**: `TASK-0124`

**Prioridade**: P2 (pedido direto do usuário)

## Objetivo

Pedido do usuário (2026-10-05): definir o celebrante de uma escala sem precisar abrir "Editar",
porque salvar o formulário completo da escala demora muito.

## Implementação

- `src/pages/scales/Index.vue`: nova coluna "Celebrante" (desktop) e um seletor no card (mobile).
  Para admin/coordenador é um `<select>` com os celebrantes cadastrados; ao trocar, salva na hora
  com `PATCH /scales/:id` enviando só `{ celebranteId }`. Para os demais perfis, só exibe o nome.
- A atualização é otimista: a lista muda na hora e volta ao valor anterior se a API recusar
  (ex. coordenador sem posse da escala → 403), com toast de erro.
- Nenhuma mudança na API: o `PATCH /scales/:id` já aceita atualização parcial e, sem `servidores`
  no corpo, não mexe nos escalados nem dispara notificações.

## Progresso

- 2026-10-05: implementado, build ok. Concluída. Sem teste novo: não há lógica pura a extrair
  (só a chamada ao endpoint existente) e a suíte do frontend não tem ambiente de componente.
