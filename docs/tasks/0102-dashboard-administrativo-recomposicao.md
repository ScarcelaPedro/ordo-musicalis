---
status: em-andamento
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0102 — Dashboard administrativo: recomposição na linguagem da referência

**Task ID**: `TASK-0102`

**Prioridade**: P1

## Objetivo

Recompor o Dashboard de staff (admin/coordenador — `auth.isStaff`) usando a referência como
direção de **proporção, densidade e hierarquia** (SPEC-003.1 §5, §7, §22, §27), com apenas dados
que o sistema realmente possui.

Blocos da referência → decisão com base no que existe hoje:

| Referência | Situação | Ação |
|---|---|---|
| Próxima missa (card destaque, status "Escala confirmada") | dado existe (`upcomingCelebrations[0]`, `status`, `comunidade`, `celebrante`) | implementar como card principal |
| Próximas celebrações (lista lateral) | existe (`upcomingCelebrations`) | lista compacta, "Ver todas" → `/escalas` |
| Calendário litúrgico | existe | integrar o componente da `TASK-0101`, sem dominar a tela |
| Cobertura dos ministérios | parcial (ver `TASK-0103`) | espaço reservado no layout, componente na `TASK-0103` |
| Avisos recentes / "Comunicação importante" | **não existe** módulo de comunicações | **não implementar** (§5) |
| — (não está na referência) | Pendências de confirmação, situação do mês (total/confirmadas/rascunhos) | manter, reestilizados (§7 "pendências", "situação das escalas") |

## Comportamento esperado

- Hierarquia (§22): contexto (saudação, `TASK-0099`) → informação principal (próxima
  celebração) → ação principal (Nova Escala) → secundárias (próximas celebrações, pendências,
  situação, cobertura) → calendário e auxiliares.
- Desktop: layout em 2 colunas inspirado na referência (principal à esquerda, lista/indicadores
  à direita). Tablet: adaptado. Mobile: coluna única **reordenada por prioridade**, não o desktop
  espremido (§28).
- Card de destaque sem ícone musical; símbolo litúrgico (cruz) discreto é permitido (§20).
- Nenhuma nova chamada de API além das já feitas (`/scales`, `/scales/pendentes`,
  `/comunidades`, `/liturgia`).
- O Dashboard do servidor (`!auth.isStaff`) não é tocado por esta task (`TASK-0104`).

## Dependências

- `TASK-0097` — tokens/linguagem visual.
- `TASK-0101` — calendário litúrgico reestilizado.

## Critérios de conclusão

- [ ] Card "Próxima celebração" com data, horário, celebração, local, celebrante e status via
      `Badge` (não cor litúrgica).
- [ ] Lista de próximas celebrações com link para a escala.
- [ ] Pendências e situação do mês preservadas.
- [ ] Nenhum bloco sem dado real (sem avisos/comunicações fictícios, sem placeholders
      prometendo recurso inexistente).
- [ ] Layout validado em mobile, tablet e desktop; claro e escuro.
- [ ] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §5, §7, §21, §22, §27, §28.
- `docs/tasks/0039-dashboard-coordenador.md` (lacunas de dado já registradas: funções sem
  servidor, conflitos).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
