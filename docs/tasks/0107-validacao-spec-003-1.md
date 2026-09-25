---
status: backlog
modulo: geral
owner:
criado-em: 2026-09-25
---

# 0107 — Validação final da SPEC-003.1 (responsividade, a11y, critérios de aceite)

**Task ID**: `TASK-0107`

**Prioridade**: P1 (fecha a SPEC-003.1)

## Objetivo

Validar ponta a ponta os critérios de aceite da SPEC-003.1 (§31) com dado real e navegação real,
cobrindo responsividade (§28) e acessibilidade das cores (§25), e registrar o resultado.

## Escopo

- Seed temporário (não commitado) com várias categorias (Leitores, Acólitos, Ministros da
  Eucaristia, Música, …), celebrações no mês com cores litúrgicas diferentes, escalas em
  rascunho/confirmadas e servidores com confirmação pendente.
- Percorrer como **admin/coordenador** e como **servidor**: Dashboard, calendário, detalhes da
  escala, sidebar/navegação mobile.
- Viewports: 360px, 414px, tablet (768px), desktop (1440px); temas claro e escuro.

## Critérios de conclusão

Checklist da §31, cada item com evidência (tela/viewport) nas notas:

- [ ] O sistema representa diferentes ministérios.
- [ ] A interface não assume que o sistema é exclusivamente musical.
- [ ] A sidebar mantém a ordem atual.
- [ ] O Dashboard administrativo possui maior densidade de informações.
- [ ] O Dashboard do usuário comum é simplificado.
- [ ] O calendário respeita a experiência Mobile First existente.
- [ ] O calendário não é confundido com o Dashboard.
- [ ] Os indicadores coloridos são tratados como Tempo Litúrgico.
- [ ] Cores litúrgicas não são usadas como status administrativo.
- [ ] A cobertura representa diferentes ministérios.
- [ ] A interface continua responsiva (sem scroll horizontal em 360px).
- [ ] O Design System permanece consistente.
- [ ] Nenhuma regra de negócio foi alterada (`git diff` de `api/` vazio desde o início da SPEC,
      salvo decisão registrada em ADR).
- [ ] `npm run build` e `npm test` passam.
- [ ] Achados não resolvidos viram tasks novas (não corrigidos silenciosamente aqui).

## Dependências

- `TASK-0098`, `TASK-0099`, `TASK-0101`, `TASK-0102`, `TASK-0103`, `TASK-0104`, `TASK-0105`,
  `TASK-0106` (as demais tasks da SPEC entram transitivamente).

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §25, §28, §31.
- `docs/tasks/0072-relatorio-final-etapa5.md` (formato de validação usado anteriormente).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
