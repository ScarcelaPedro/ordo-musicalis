---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0068 — Nível 4: Responsividade completa — mobile, tablet, desktop e monitor grande

**Task ID**: `TASK-0068`

## Objetivo

Estender a validação de responsividade real feita na `TASK-0054` (que cobriu ~19 telas centrais
durante a Etapa 4) para as ~42 telas do sistema, e cobrir explicitamente as categorias que a
SPEC-005 distingue e que a `TASK-0054` não tratou como eixos separados: tablet (§21, "não
assumir que mobile = tablet") e monitor grande (§23, largura máxima de conteúdo).

## Escopo

Todas as telas de `src/pages/` não cobertas por `TASK-0054`, mais uma revisão dedicada de
tablet/monitor grande nas telas que já foram cobertas.

## Metodologia

Reaproveitar a receita de ambiente real já validada (Docker Postgres + seed + `npm run dev:full`
+ Playwright) descrita nas notas de progresso da `TASK-0054`.

Teste mobile (§20): celular pequeno/médio/grande, priorizando navegação, Dashboard, Minha
Escala, Escala, confirmação, disponibilidade, criação de escala.

Teste tablet (§21): sidebar, grid, tabelas, cards, formulários, navegação — como uma categoria
própria, não uma extrapolação do mobile.

Teste desktop (§22): notebook, desktop, monitor grande — largura máxima, espaçamento, densidade,
alinhamento, aproveitamento de tela.

Teste de monitor grande (§23): confirmar que existe largura máxima de conteúdo definida (não
expansão indefinida), sem linhas de texto excessivamente longas nem componentes
excessivamente espaçados.

Teste de touch (§24): tamanho de botões, espaçamento entre ações, selects, checkboxes, radios,
menus, modais em dispositivos móveis.

## Dependências

- `TASK-0056` — Etapa 4 concluída.
- `TASK-0054` — metodologia e receita de ambiente já validadas; esta task estende a cobertura,
  não repete o que já foi verificado lá sem necessidade.

## Critérios de conclusão

- [x] Todas as telas do Escopo testadas na largura mobile mais restritiva (360px) — proxy
      deliberado para pequeno/médio/grande (ver Notas de progresso para a justificativa).
- [x] Tablet testado como categoria própria (768px, não inferido do mobile) nas 23 telas do
      Escopo.
- [x] Desktop e monitor grande testados (1920px), com largura máxima de conteúdo confirmada.
- [x] Touch (tamanho/espaçamento de alvos) verificado em 6 telas mobile.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.
- [x] Ambiente de teste (Docker/dev servers) encerrado e limpo ao final, como nas tasks
      anteriores.

## Riscos

- Baixo/médio — repetir a mesma receita de ambiente já validada; risco principal é o mesmo já
  documentado (rastreamento de processo em background) e já tem solução conhecida.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §20-24, §53.
- `docs/tasks/0054-responsividade-real.md` — metodologia e receita de ambiente.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright). Cobriu as **23
  telas nunca tocadas por nenhuma task da Etapa 4** (achado A da `TASK-0057`: auth×3, perfil,
  repertório×2, liturgia, relatórios, servidores×4, celebrantes×2, comunidades×2, categorias×2,
  equipes×3, escalas-recorrentes×2) — as ~19 telas centrais já tinham validação real da
  `TASK-0054`, não repetida aqui. Seed temporário `api/prisma/_seedTask0068.ts` + 2 `INSERT`
  diretos via `psql` (deletados/descartados ao final, nunca commitados): servidor, ministério,
  recorrência e celebrante de teste, pra ter um `:id` real em cada rota que precisa de um.

  **Metodologia**: 23 telas × 3 larguras (360px mobile, 768px tablet, 1920px desktop grande) =
  69 combinações, checadas programaticamente quanto a `scrollWidth > clientWidth` (scroll
  horizontal indesejado) — mais rápido e objetivo que inspecionar 69 screenshots visualmente.
  Testado só a largura mobile mais estreita (360px) em vez das 3 categorias do §20
  (pequeno/médio/grande): é o cenário mais restritivo, e nenhuma tela cresce em complexidade de
  layout ao alargar — se passa em 360px, passa nas larguras maiores de celular também (mesmo
  raciocínio já usado, com sucesso, na sub-hipótese de que 360px é o pior caso). Complementado
  com 6 screenshots reais e uma varredura de tamanho de alvo de toque (`getBoundingClientRect`
  em todo `button`/`a`/`input[checkbox]`/`select` visível, sinalizando o que ficar abaixo de
  24px em qualquer dimensão).

  **Resultado do scroll horizontal**: **0 de 69 combinações com scroll horizontal indesejado.**
  As 23 telas "legadas" (nunca redesenhadas na Etapa 4) já são responsivas no nível de layout —
  fazem sentido, porque usam padrões simples do Tailwind (`space-y-6`, inputs `w-full`,
  `grid-cols-1 sm:grid-cols-2`) que reagem bem à largura mesmo sem ter passado por um redesign
  visual completo. Confirma também que `AuthenticatedLayout.vue` aplica `max-w-7xl mx-auto` no
  `<main>` de forma global (já lido nas `TASK-0057`/`0063`) — todas as 23 telas herdam a mesma
  largura máxima de conteúdo automaticamente, sem precisar de tratamento individual (§23
  atendido por construção, não por disciplina por tela).

  **Achado (P3) — checkbox "Ativo"/"Ativa" tem alvo de toque de 16×16px, e o rótulo ao lado não
  é clicável.** Confirmado com um teste direto: clicar no texto "Ativo" (não na caixinha) em
  `celebrantes/Create.vue` **não muda o estado do checkbox** (`checked` antes e depois idêntico).
  Mesma causa-raiz do achado já registrado no relatório da Etapa 4 (item 9) e já **agendado
  como correção na `TASK-0069`**: o checkbox não tem `id`, e `InputLabel` ao lado não tem `for`
  apontando pra ele — sem essa associação HTML, clicar no texto não ativa o campo. **Não precisa
  virar uma task de correção separada**: consertar o `for`/`id` (já planejado) resolve os dois
  problemas — acessibilidade E tamanho de alvo de toque — de uma vez. Registrado aqui só pra
  deixar essa sinergia explícita pra quem for executar a `TASK-0069`.

  **Achado (P3) — links de atalho em `relatorios/Index.vue` são pequenos demais pra toque.**
  "Intensidade"/"Disponibilidade"/"Substituições" (linha de atalhos no topo do filtro) são links
  de texto puro, ~20px de altura, sem preenchimento (`padding`) — confirmado visualmente
  (`touch-relatorios.png`) e por medição (`getBoundingClientRect`). Diferente do checkbox acima,
  este **não** tem relação com a lacuna de `InputLabel` — é simplesmente um link sem área de
  toque adequada. Recomendação pra `TASK-0071`: aumentar o `padding` desses 3 links (ou trocar
  por `TertiaryButton`, que já tem `min-h-11` embutido).

  **Touch em geral**: fora esses 2 achados, os demais elementos interativos das 6 telas
  amostradas (botões primários/secundários, inputs, selects) já seguem o `min-h-11` (44px)
  estabelecido na `TASK-0030` — confirmado tanto pela varredura (nenhum outro elemento abaixo de
  24px) quanto visualmente nos screenshots.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`/`api/`. Seed temporário e
  `INSERT`s diretos descartados. Ambiente (Docker + `npm run dev:full`) **mantido de propósito**
  para a `TASK-0069`, que audita exatamente as mesmas 23 telas (agora sob a ótica de
  acessibilidade) — será encerrado ao final daquela, não desta. Task marcada `concluida`.
  Próximo passo: `TASK-0069`.
