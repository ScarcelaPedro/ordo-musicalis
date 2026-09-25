---
status: em-andamento
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0104 — Dashboard do servidor: simplificado e multiministério

**Task ID**: `TASK-0104`

**Prioridade**: P1

## Objetivo

Aplicar a linguagem visual ao Dashboard do usuário comum (`!auth.isStaff`) mantendo-o
**simplificado** e focado em "o que eu preciso saber ou fazer agora?" (SPEC-003.1 §6, §7, §26),
e corrigir as suposições musicais que ele tem hoje.

Problemas atuais:

- Card "Sua próxima escala" usa o símbolo `♪` como marca-d'água e mostra só o **instrumento** —
  um Leitor ou Acólito não vê a própria função.
- Não existe bloco de pendências do próprio servidor ("Você possui 1 escala aguardando
  confirmação") — hoje só há o botão "Confirmar presença" na próxima escala.
- Atalhos "Repertório da celebração" e "Liturgia do dia" aparecem para qualquer servidor, mesmo
  quando repertório não se aplica.

## Comportamento esperado

Ordem de prioridade (§6):

1. **Próxima escala** — celebração, data, horário, local e **Função** (categoria real da
   escalação — `categoria`/`team.categoria` — e `funcaoLiturgica` quando houver; instrumento
   apenas como complemento quando existir). Ação "Ver escala" e, se `status === 'convidado'`,
   "Confirmar presença". Sem `♪`; símbolo litúrgico discreto permitido (§20).
2. **Próximas escalas** — lista compacta (data em bloco "24 AGO", horário, celebração, função).
3. **Pendências** — contagem das escalas do próprio servidor com `status === 'convidado'`,
   derivada de `myScalesAll` (já carregado via `GET /scales?mine=true`), com link para
   `/minha-escala`.
4. **Disponibilidade** — atalho existente.
5. **Comunicações** — **não implementar** (não há módulo; §5).
6. **Repertório/liturgia** — só "quando aplicável" (§6): definir na implementação o critério com
   base em dado existente (ex. escala possui repertório vinculado, ou função pertence à categoria
   de música) e registrar a escolha nas notas.

Não exibir estatísticas, dados de outros servidores ou informações de gestão (§26). Mobile:
coluna única na ordem acima.

## Dependências

- `TASK-0097` — tokens/linguagem visual.

## Critérios de conclusão

- [ ] Função real exibida para servidores de qualquer ministério (testar com Leitor, Acólito e
      Músico).
- [ ] Bloco de pendências com contagem correta e link funcional; oculto quando zero.
- [ ] Nenhum `♪`/elemento musical genérico no dashboard do servidor.
- [ ] Repertório exibido só quando aplicável, critério registrado.
- [ ] Nenhuma informação administrativa ou de terceiros exibida.
- [ ] Nenhuma nova chamada de API; `npm run build` passa; verificado em mobile e desktop.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §6, §7, §13, §14, §20, §26.
- `docs/tasks/0038-dashboard-servidor.md`, `docs/tasks/0088-correcao-proxima-escala-dashboard.md`.
- `src/pages/scales/MyScales.vue` — montagem de função/instrumento do pivot (`TASK-0048`).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
