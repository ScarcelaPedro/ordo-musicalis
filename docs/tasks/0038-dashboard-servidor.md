---
status: concluida
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0038 — Dashboard do servidor

**Task ID**: `TASK-0038`

## Objetivo

Reorganizar o Dashboard para o perfil servidor (`musico`) segundo a prioridade definida em
`docs/tasks/0008-wireframes-dashboard.md`: próxima escala, confirmação pendente, alterações
importantes, próximas escalas, disponibilidade, repertório/liturgia (SPEC-004 §16, §17). Hoje o
calendário é o maior elemento visual sem ser o mais acionável — a próxima escala não deve ser
uma tabela/calendário grande como primeira informação.

## Arquivos/componentes envolvidos

- `src/pages/dashboard/Dashboard.vue` — reordenar blocos condicionais a `!auth.isStaff`.
- `src/components/scale/ScaleCard.vue` (`TASK-0033`) — usado no bloco "Minhas próximas escalas".

## Comportamento esperado

Ordem vertical (mobile) e por prioridade visual (desktop): 1) próxima escala em destaque
(usando `CelebrationHeader` simplificado ou `ScaleCard` em destaque); 2) confirmação pendente
embutida no mesmo bloco; 3) alterações importantes (se houver indicador disponível — ver
`TASK-0041`, pendência de dado); 4) lista "Minhas próximas escalas" (`ScaleCard`); 5) status de
disponibilidade; 6) link para repertório/liturgia da próxima celebração (contextual, rota já
existente). Calendário (`TASK-0037`) fica por último — é contexto, não ação.

## Dependências

- `TASK-0037` — calendário já resolvido.
- `TASK-0033` — `ScaleCard`.
- `TASK-0031` — `Skeleton` para loading.

## Critérios de conclusão

- [x] Blocos do Dashboard–Servidor reordenados exatamente na prioridade do §16.
- [x] "Minhas próximas escalas" usa `ScaleCard`.
- [x] Nenhum dado novo consultado — mesmos endpoints (`/scales`) já usados hoje.
- [x] Loading via `Skeleton` nos blocos principais, substituindo o texto/spinner genérico atual.
- [x] `npm run build` passa sem erros.
- [~] Testado logado como `musico`, em mobile e desktop — **não executado**: mesma limitação já
      registrada nas tasks anteriores da Fase 2/3 (sem ferramenta de automação de navegador
      neste ambiente). Verificado por leitura de código/lógica dos `v-if`, não visualmente.

## Riscos

- Baixo/médio — é reordenação de blocos já existentes, não criação de funcionalidade nova. O
  risco principal é quebrar alguma condição `v-if` durante a reorganização do template.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §16, §17.
- `docs/tasks/0008-wireframes-dashboard.md` (wireframe completo).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `Dashboard.vue` agora bifurca claramente por
  perfil: Stats/banner "Próxima celebração" (globais, conteúdo do coordenador — §5.2) migraram
  para `v-if="auth.isStaff"`, preservados sem nenhuma alteração de lógica interna; para
  `!auth.isStaff`, novo bloco segue a ordem exata do §5.1 — 1) "Sua próxima escala" em destaque
  (`myNextScale`, primeiro item de `myNextScales`, já computado, sem nova chamada), com data/
  horário/comunidade/função (`instrument.nome` do próprio pivot); 2) confirmação pendente
  embutida no mesmo card — botão "Confirmar presença" só aparece quando
  `myNextScalePivot.status === 'convidado'` (mesmo campo `status` que `MyScales.vue` já lê do
  mesmo endpoint `/scales`, só agora tipado também no Dashboard); 3) "Alterações importantes"
  deliberadamente **não implementado** — depende do indicador de alteração que só existirá na
  `TASK-0041`, pendência de dado já registrada na própria `TASK-0008`, não inventada aqui; 4)
  "Próximas escalas" (resto de `myNextScales`) agora renderiza via `ScaleCard` (`TASK-0033`) em
  vez do card manual anterior; 5) atalho de Disponibilidade — só navegação, sem indicador de
  status "preenchida/pendente" (exigiria consultar `/availability`, fora do escopo de "nenhum
  dado novo"); 6) links contextuais de Repertório/Liturgia da próxima celebração (rotas já
  existentes, `/escalas/:id/repertorio` e `/escalas/:id/liturgia`), só aparecem quando há
  `myNextScale`. Calendário permanece por último (posição já era a última do arquivo, nenhuma
  movimentação necessária). `Skeleton` substitui o antigo texto "Carregando..." no bloco de
  destaque. Nenhuma chamada de API nova — mesmos `client.get('/scales', ...)` de sempre.
  `npm run build` passou sem erros; `dist/` restaurado; `git status` confirmou que só
  `Dashboard.vue` mudou em `src/pages/`. Teste manual logado como `musico` em mobile/desktop
  **não executado** — mesma limitação de ambiente já registrada nas tasks anteriores; validado só
  por leitura de código/`v-if`. Task marcada `concluida`. Próximo passo: `TASK-0039` (Dashboard —
  coordenador) já está elegível.
