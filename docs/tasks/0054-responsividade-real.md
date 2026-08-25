---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0054 — Validação de responsividade real

**Task ID**: `TASK-0054`

## Objetivo

Validar, em múltiplas larguras reais (SPEC-004 §50), todas as telas migradas nas fases
anteriores — não aceitar "funciona no meu monitor" como validação suficiente. Corresponde à
Fase 10 (Polimento) e aos critérios de aceite mobile do §55.

## Arquivos/componentes envolvidos

Todas as telas tocadas por `TASK-0034` a `0053` — sem alteração de código nova prevista, exceto
correções pontuais de bugs de responsividade encontrados durante a validação.

## Comportamento esperado

Verificação manual (DevTools do navegador, presets de dispositivo, mais ao menos um teste em
dispositivo físico se disponível) em: celular pequeno (~360px), celular grande (~414px), tablet
(~768px), notebook (~1280px), desktop (~1440px), monitor grande (~1920px+).

## Dependências

- `TASK-0034` a `TASK-0053` — todas as telas de implementação.

## Critérios de conclusão

- [x] Nenhuma tela prioritária exige scroll horizontal desnecessário, nas 6 larguras testadas
      (1 exceção encontrada e corrigida — ver notas de progresso).
- [x] Navegação mobile (bottom nav) funciona corretamente em todas as larguras mobile testadas.
- [x] Botões/controles têm área de toque adequada (44×44px) validada visualmente.
- [x] Texto permanece legível (nenhum abaixo do piso de 12px) em todas as larguras.
- [x] Formulários (`ScaleForm`, `availability/Form.vue`) são utilizáveis em mobile — testado
      interativamente (preencher Etapa 1, avançar, buscar/adicionar servidor via busca inline
      na Etapa 2, ver Etapas 3/4).
- [x] Calendário e Painel de Disponibilidade têm comportamento mobile correto.
- [x] `Modal`/`Drawer` funcionam corretamente em telas pequenas — verificado programaticamente
      (bounding box do Modal 100% dentro do viewport em 360×700) e visualmente.
- [x] Lista de bugs de responsividade encontrados e corrigidos registrada nas notas de
      progresso desta task.

## Riscos

- Esta task pode revelar problemas em qualquer uma das telas anteriores — se um problema
  encontrado exigir redesenho de UX (não só ajuste de CSS), aplicar a regra do §61: não
  improvisar solução definitiva, registrar problema/solução provisória/impacto/recomendação.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §15, §50, §55.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada **com validação visual real**, não só leitura de
  código (diferente de todas as tasks anteriores desta etapa, que registraram essa limitação de
  ambiente). O ambiente inicialmente não tinha nenhuma ferramenta de navegador — resolvido em
  duas etapas, confirmadas explicitamente com o usuário antes de agir (mudança de ambiente não
  trivial):
  1. Instalado Playwright + Chromium headless nesta sessão (`npm install --no-save playwright`
     + `npx playwright install chromium`) — não adicionado a `package.json`/`package-lock.json`
     (confirmado via `git diff`, a única mudança nesses arquivos é uma entrada pré-existente de
     `@heroicons/vue` de trabalho anterior desta mesma sessão, não relacionada).
  2. Como as telas autenticadas exigem login real (API + Postgres), subido um Postgres 16 via
     Docker (`docker run ... postgres:16`), aplicado `npm run db:migrate` +
     `npm run db:seed` (usuário admin) + `api/prisma/seedJuly.ts` (35 celebrações reais de julho/
     2026) + um script de dados de teste temporário (`api/prisma/_seedTestData.ts`, **removido
     ao final**, nunca commitado) com 5 servidores (categorias/instrumentos variados),
     disponibilidades, uma janela de coleta ativa com 1 resposta, e alguns `ScaleServidor` reais
     — o suficiente pra exercitar badges/avatares/mini-grade/equipe com dado de verdade, não só
     estados vazios. Rodado `npm run dev:full` (API :3001 + Vite :5173) em background.

  **Cobertura real de tela**: ~19 telas únicas, a maioria nas 6 larguras (360/414/768/1280/1440/
  1920), algumas em 3 larguras (360/414/1280) quando já claramente sem risco de regressão
  (listagens administrativas simples com o mesmo padrão já validado em `servidores/Index.vue`).
  Sessões separadas como `admin@escaladmusicos.test` (staff) e `musico@escaladmusicos.test`
  (servidor). Verificação automática de `scrollWidth > clientWidth` (scroll horizontal) em cada
  screenshot, mais inspeção visual de cada imagem. Também testado interativamente: preencher
  Etapa 1 do `ScaleForm`, avançar, buscar "Ana" na busca inline da categoria Música, clicar no
  resultado, ver o card de confirmação pré-adição com o instrumento pré-selecionado — o fluxo
  completo da `TASK-0044` funcionando de verdade num navegador real. Testado também o `Modal` de
  exclusão (`servidores/Index.vue`) a partir do `Dropdown` "Mais" em 360×700: bounding box do
  modal 100% dentro do viewport, confirmado por medição programática, não só visualmente.

  **Bug de responsividade real encontrado e corrigido**: `scales/Show.vue`, linha do header —
  o grupo de botões "Imprimir/Repertório/Editar/Liturgia" (`<div class="flex gap-2 no-print">`)
  não tinha `flex-wrap`, só o container PAI tinha. Em 360px, os 4 botões forçavam scroll
  horizontal na página inteira (confirmado: `hScroll=true`, único caso entre todas as telas/
  larguras testadas). Corrigido adicionando `flex-wrap` também nesse `<div>` interno — verificado
  depois do fix: `hScroll=false` em 360px e 414px, botões agora quebram em 2 linhas. Bug
  pré-existente (bloco de header nunca tocado pelas `TASK-0040`-`0042`, que só mexeram no corpo
  da tela), não introduzido nesta etapa — mas corrigido aqui porque essa é exatamente a
  responsabilidade desta task.

  **Achado fora do escopo desta task, registrado e não corrigido**: em `/escalas/criar`
  (`ScaleForm.vue` via `Create.vue`), o campo "Comunidade" nasce sem seleção e mostra erro de
  validação ao tentar avançar, mesmo havendo só uma comunidade cadastrada ("Matriz"). Causa raiz:
  `form.value = ref({ ..., comunidadeId: props.initialData?.comunidadeId ?? props.comunidades[0]?.id
  ?? null, ... })` roda uma vez, de forma síncrona, no `setup()` do componente — nesse momento
  `props.comunidades` ainda é `[]` (o fetch em `Create.vue` é assíncrono, via `onMounted`), então
  o default nunca é recalculado depois que a lista chega. Não é um bug de responsividade (mesmo
  comportamento em qualquer largura) — fora do escopo desta task; registrado aqui para constar no
  relatório final (`TASK-0056`). Recomendação: um `watch(() => props.comunidades, ...)` que
  preencha `comunidadeId` na primeira vez que a lista deixar de estar vazia, só quando o campo
  ainda não tiver valor (não sobrescrever uma escolha manual do usuário).

  **Achado de dado, não de código, não corrigido**: a base de categorias já tinha entradas
  duplicadas de nomenclatura (`Acólitos e Ancilas`/`Acólitos e Coroinhas`,
  `Comentaristas`/`Comentarista`) antes mesmo do seed de teste desta task (confirmado — o script
  de teste nunca criou essas categorias, só referenciou 3 já existentes por nome exato). É uma
  questão de integridade de dado de cadastro, não de layout/responsividade — fora do escopo
  desta task, só registrado para visibilidade.

  **Ambiente restaurado ao final**: processos `node` do `dev:full` finalizados por PID
  (`taskkill`), container `ordo-postgres` removido (`docker rm -f`), `api/prisma/_seedTestData.ts`
  apagado (nunca chegou a ser commitado, `git status` confirmou nada pendente em `api/`). O
  pacote `playwright` e o Chromium baixado continuam instalados em `node_modules`/
  `~/AppData/Local/ms-playwright` (não removidos — úteis se uma validação assim for necessária de
  novo; não afetam o repositório, `node_modules` é ignorado pelo git).

  Task marcada `concluida`. **Fim da Fase 10 (Polimento) parcial**: `TASK-0054` concluída.
  Próximo passo: `TASK-0055` (Acessibilidade) já está elegível.
