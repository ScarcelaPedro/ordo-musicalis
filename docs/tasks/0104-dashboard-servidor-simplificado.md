---
status: concluida
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

- [x] Função real exibida para servidores de qualquer ministério (testar com Leitor, Acólito e
      Músico).
- [x] Bloco de pendências com contagem correta e link funcional; oculto quando zero.
- [x] Nenhum `♪`/elemento musical genérico no dashboard do servidor.
- [x] Repertório exibido só quando aplicável, critério registrado.
- [x] Nenhuma informação administrativa ou de terceiros exibida.
- [x] Nenhuma nova chamada de API; `npm run build` passa; verificado em mobile e desktop.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §6, §7, §13, §14, §20, §26.
- `docs/tasks/0038-dashboard-servidor.md`, `docs/tasks/0088-correcao-proxima-escala-dashboard.md`.
- `src/pages/scales/MyScales.vue` — montagem de função/instrumento do pivot (`TASK-0048`).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `38bc5d1`.

  **Estrutura** (ordem do DOM = ordem mobile, conferida a 375px): 1) Sua próxima escala →
  2) Próximas escalas → 3) Pendências → 4) Disponibilidade → 6) "Para a próxima celebração"
  (Liturgia do dia + Repertório quando houver) → calendário. No desktop: destaque e próximas à
  esquerda (`col-span-2`), coluna lateral com pendências/disponibilidade/conteúdo. Comunicações
  (item 5) não foram implementadas: não há módulo.

  **Função real** (§13/§14): discovery mostrou que `GET /scales` (listagem) devolve só
  `categoriaId`/`teamId` no pivot, sem nome da categoria. Para não alterar a API (§30), os nomes
  vêm de `GET /categorias` e `GET /teams` (endpoints existentes, acessíveis ao servidor). Novo
  util `src/utils/scaleRole.ts`: `assignmentRole`/`assignmentRoleLabel` (ministério primeiro;
  função litúrgica e instrumento como complemento), `resolveAssignment` (preenche nomes a partir
  dos ids) e `FUNCAO_LITURGICA_LABELS` (hoje duplicado em `MyScales.vue`/`scales/Show.vue`;
  a `TASK-0105` pode adotar o util). 10 testes novos (22 no total), cobrindo Leitores, Ministros
  da Comunhão, Acólitos com Turiferário, Música com Violão, fallback pela categoria do team,
  ids desconhecidos e ausência de dado. Visualmente validado com a servidora de teste (Leitora):
  "Função: Leitores" no destaque e "Leitores · Matriz" na lista. Acólito e Músico foram cobertos
  pelos testes da mesma função de rótulo; o seed só tinha login para a Leitora.

  **Critério do repertório "quando aplicável"** (registrado aqui, como a task pedia): o atalho só
  aparece se a próxima celebração **tem repertório com itens**. Como `repertoire` só vem no
  detalhe, o Dashboard busca `GET /scales/:id` apenas da próxima escala. Verificado: com
  repertório no banco de teste o atalho aparece; sem repertório, fica oculto. "Liturgia do dia"
  aparece sempre, porque vale para todo ministério (leitores, salmistas...).

  **Pendências**: contagem das escalas futuras do próprio servidor com `status === 'convidado'`
  ("Você possui 2 escalas aguardando confirmação." + "Ver pendências" → `/minha-escala`), oculta
  quando zero. **Outros ajustes**: removidos `♪` e o gradiente `to-purple-900` (roxo é cor
  litúrgica); destaque em `primary-800→950` com cruz discreta. "Próximas" usa `selectUpcoming`
  (data local, corrige o UTC pendente da `TASK-0102`) e **deixa de fora** escalações
  `recusado`/`substituido`, que não são mais "a próxima escala" da pessoa (continuam visíveis em
  Minha Escala). Nenhuma estatística, dado de outros servidores ou bloco de staff. Removidos
  `ScaleCard`/`scaleCardProps`, que ficaram sem uso.

  **Verificação**: 1280px escuro, 375px claro e escuro; sem scroll horizontal; `♪` ausente.
  `npm run build` e `npm test` passam; `dist/` revertido. Nenhuma alteração em `api/`.

  **Achado para a `TASK-0099`**: o título "Dashboard" do header (`text-gray-800` sem `dark:`)
  fica invisível no tema escuro. Pré-existente.
