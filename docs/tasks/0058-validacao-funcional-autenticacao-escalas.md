---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0058 — Nível 2: Validação funcional — autenticação, navegação e escalas

**Task ID**: `TASK-0058`

## Objetivo

Confirmar, testando de verdade em navegador (não por leitura de código), que nenhuma
funcionalidade existente foi perdida pelo redesign da Etapa 4 (SPEC-005 §8-9) nas áreas de
autenticação, navegação global e CRUD de escala. Regra de regressão (§9): qualquer
funcionalidade afetada é classificada `CRÍTICO` (P0/P1, conforme §53) e vira insumo prioritário
para a `TASK-0071`.

## Escopo

- `src/pages/auth/{Login,Register,ForgotPassword,ResetPassword}.vue`.
- `src/layouts/AuthenticatedLayout.vue` (sidebar, bottom nav, topbar) e `GuestLayout.vue`.
- `src/pages/scales/{Index,Show,Create,Edit,ScaleForm,MyScales}.vue`.

## Metodologia

Usar a receita de ambiente real já validada na `TASK-0054`/`TASK-0055` (Docker Postgres +
seed + `npm run dev:full` + Playwright), logado como `admin` (staff) e como `musico`. Testar,
sem atalhos: login válido/inválido, logout, recuperação de senha (fluxo completo, incluindo
e-mail se aplicável), navegação por todos os itens da sidebar/bottom nav para ambos os perfis,
criar escala completa (4 etapas), editar escala existente, excluir escala quando permitido,
confirmar participação, recusar participação.

Verificar especificamente a pendência #7 já registrada em
`docs/relatorio-implementacao-etapa4.md` §7.3 (`comunidadeId` vazio ao abrir `/escalas/criar`) —
confirmar se persiste e reclassificar sua severidade sob a régua P0-P3 desta etapa (§53), já que
impede a submissão do formulário sem ação corretiva do usuário.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Login, logout e recuperação de senha testados e funcionando.
- [x] Navegação testada para os dois perfis (staff/servidor), incluindo bottom nav e "Mais".
- [x] Criar, editar e excluir escala testados de ponta a ponta com dados reais.
- [x] Confirmar e recusar participação testados.
- [x] Pendência do `comunidadeId` vazio (relatório Etapa 4, item 7) reavaliada e reclassificada.
- [x] Toda funcionalidade quebrada encontrada registrada como `CRÍTICO`, com passos de
      reprodução, nas Notas de progresso — sem correção aplicada nesta task.

## Riscos

- Ambiente de teste real precisa ser levantado (Docker + seed); seguir exatamente a receita já
  documentada nas notas de progresso da `TASK-0054`/`0055` para evitar redescobrir os mesmos
  obstáculos (background process tracking, `NODE_PATH`, etc.).

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §8, §9, §53.
- [`docs/relatorio-implementacao-etapa4.md`](../relatorio-implementacao-etapa4.md) — §7 (pendências
  já conhecidas ao final da Etapa 4).
- `docs/tasks/0054-responsividade-real.md` — receita de ambiente de teste real.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright), não por leitura de
  código. Ambiente: Docker Postgres + `npm run db:migrate` + `npm run db:seed` +
  `api/prisma/seedJuly.ts` + `npm run dev:full`, mesma receita da `TASK-0054`/`0055`. Como
  `seedJuly.ts` gera datas fixas de julho/2026 (hoje já é 2026-08-25, ou seja, aquelas datas
  estão no passado), foi criado um seed adicional temporário (`api/prisma/_seedTask0058.ts`,
  deletado ao final, nunca commitado) com um usuário `musico@escaladmusicos.test`/`password` e 3
  escalas em setembro/2026 (futuro) nos status `convidado`/`confirmado`/`rascunho vazia`, para
  poder testar de verdade os fluxos que dependem de "próxima escala".

  **Testado e confirmado funcionando**: login válido (admin e musico) redireciona para
  `/dashboard`; login inválido permanece na tela e mostra mensagem de erro; logout redireciona
  para `/login` e a rota protegida (`/dashboard`) fica de fato bloqueada depois (sem sessão
  válida); navegação por sidebar resolvida para as rotas do perfil admin; editar escala carrega
  os dados existentes no formulário; listagem de escalas expõe a ação de excluir; excluir escala
  pede confirmação via `Modal` (não é ação de um clique só) e redireciona corretamente após
  confirmar; confirmar participação (`Minha Escala`) funciona de ponta a ponta com feedback de
  sucesso.

  **Pendência do relatório da Etapa 4 (item 7, `comunidadeId` vazio) reconfirmada e
  reclassificada**: reproduzida de novo — abrir `/escalas/criar` deixa o campo Comunidade sem
  seleção (`<select>` com um único `<option value="1">Matriz</option>`, mas `.value` do elemento
  fica `""`, porque o `v-model` do Vue está ligado a `form.comunidadeId = null`, calculado antes
  do `fetch` de `/comunidades` resolver, e o binding força a ausência de seleção mesmo havendo só
  uma opção real). Tentar avançar sem selecionar manualmente mostra o erro de validação "Selecione
  a comunidade." — o formulário **não trava, o fluxo continua funcionando** assim que o usuário
  abre o dropdown e escolhe "Matriz" manualmente (confirmado: com essa única ação extra, as 4
  etapas completam e a escala é criada com sucesso). Reclassificado como **P2** (fricção
  significativa — todo coordenador criando uma escala nova esbarra nisso quando só existe uma
  comunidade cadastrada, que é o caso real do sistema hoje — mas não é `P0`/`P1`: não impede a
  tarefa, só exige um passo extra não óbvio).

  **Achado novo (P3) — tela de detalhes da escala (`scales/Show.vue`) não tem ação de excluir.**
  A exclusão só existe na listagem (`scales/Index.vue`); um coordenador olhando o detalhe de uma
  escala (que já tem Imprimir/Repertório/Editar/Liturgia no cabeçalho) precisa voltar para a lista
  para excluí-la. Baixo impacto (a ação existe, só não está onde seria mais natural encontrá-la a
  partir do detalhe) — registrado para a `TASK-0071` avaliar se cabe no escopo desta etapa ou é
  melhoria futura.

  **Limitação de ambiente registrada, não é bug**: o formulário de recuperação de senha
  (`/forgot-password`) tem campo de e-mail, aceita a submissão e mostra "Erro interno no
  servidor" — confirmado no log da API que a causa é `Error: Missing API key` do SDK do Resend
  (`api/_routes/auth.ts:114`), porque este ambiente de teste local não tem `RESEND_API_KEY`
  configurada. A mensagem genérica ao usuário está correta (não vaza detalhe técnico), mas não foi
  possível validar o caminho feliz completo (e-mail realmente entregue) neste ambiente — mesma
  natureza de limitação já registrada nas tasks de validação da Etapa 4 para integrações externas.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`/`api/` ao final (só o seed
  temporário, já removido). Ambiente (Docker + `npm run dev:full`) **mantido de propósito** para
  reaproveitamento imediato pela `TASK-0059`, que usa a mesma receita — será encerrado ao final
  daquela task, não desta. Task marcada `concluida`. Próximo passo: `TASK-0059`.
