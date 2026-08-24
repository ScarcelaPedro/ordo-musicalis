---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0006 — Levantamento de evidências para a Etapa 2 (auditoria UX + telas atuais)

**Task ID**: `TASK-0006`

## Objetivo

A [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) se apoia fortemente em achados de uma
auditoria de UX (referenciada por notas de rodapé ao longo de todo o documento — largura mínima
de 560px no calendário do Dashboard, 30+ interações discretas para montar uma escala no
`ScaleForm`, uso do `confirm()` nativo do navegador, textos/chips de ~10px, sugestões que
competem visualmente com a seleção manual, ausência de detecção de conflitos, celebrante sem
destaque visual, ausência de indicação de função vazia) e na arquitetura definida na Etapa 1
(`docs/arquitetura-interface.md`, já concluída — SPEC-002 §1: "Transformar a arquitetura
definida na Etapa 1 em uma experiência de usuário").

Antes de desenhar qualquer wireframe (TASK-0008 a TASK-0014), é preciso confirmar essas
afirmações contra o estado real do código — o arquivo `auditoria-ux.md` (raiz do repositório) e
as telas Vue reais — para que os wireframes partam de premissas verificadas, não de suposições
herdadas cegamente da SPEC. Mesmo princípio já aplicado com sucesso na Etapa 1 (ver
`TASK-0001`).

## Dependências

- `TASK-0005` — Etapa 1 concluída (mapa de navegação e arquitetura de interface), base que esta
  etapa transforma em experiência de usuário.

## Critérios de conclusão

- [x] Conteúdo de `auditoria-ux.md` (raiz do repo) lido e resumido nos pontos citados por
      SPEC-002 (calendário 560px, ScaleForm 30+ interações, `confirm()` nativo, chips ~10px,
      sugestões concorrentes, ausência de detecção de conflitos, celebrante sem destaque,
      ausência de indicação de função vazia).
- [x] Cada afirmação da auditoria confirmada (ou contestada, se divergente da realidade atual do
      código) contra as telas envolvidas: `dashboard/Dashboard.vue`, `scales/ScaleForm.vue`,
      `scales/Show.vue`, listagens administrativas (`servidores/Index.vue` etc.),
      `availability/Panel.vue`, `scales/MyScales.vue`.
- [x] Estrutura atual de cada tela prioritária (SPEC-002 §4) documentada o suficiente para
      servir de ponto de partida às tasks de wireframe (campos existentes, dados exibidos,
      interações atuais) — sem redesenhar nada ainda, só descrever o estado real.
- [x] Resultado registrado de forma reutilizável pelas TASK-0007 a TASK-0015.

## Resumo de `auditoria-ux.md` nos pontos citados pela SPEC-002

Auditoria feita por leitura completa do código-fonte (53 telas Vue, 9 componentes, 2 layouts,
schema Prisma completo), sem navegação ao vivo no app — toda afirmação vem de classes
Tailwind/template, marcadas como [Observado] ou [Inferido] no próprio documento.

| Achado citado pela SPEC-002 | O que a auditoria diz | Severidade (auditoria §13) |
|---|---|---|
| Calendário 560px | `Dashboard.vue:335`, `<div class="min-w-[560px]">`, força rolagem horizontal em celulares de 360–414px | Crítico (#1) |
| ScaleForm 30+ interações | `ScaleForm.vue` tem 430 linhas — o maior arquivo do frontend; para cada pessoa adicionada são 2+ interações (select + clique), multiplicado por ~16 pessoas numa missa dominical típica | Crítico (#2) |
| `confirm()` nativo | Toda exclusão (servidor, ministério, categoria, celebrante, comunidade, escala, template, vínculo, janela, substituição) usa `window.confirm()` | Médio (#9) |
| Chips ~10px | `Dashboard.vue:381-382`, `text-[10px]` no horário e no nome do celebrante do chip do calendário; celebrante some totalmente abaixo de `lg:` (`hidden lg:inline`) | Médio (#13) |
| Sugestões concorrentes | `ScaleForm.vue` tem um bloco "Sugeridos" geral (linha ~287) e, separadamente, seleção manual por categoria — duas fontes de "adicionar pessoa" sem indicação de qual usar primeiro | Crítico (#2, mesma raiz) |
| Ausência de detecção de conflitos | Nada na tela avisa escalação dupla ou indisponibilidade — requisito documentado, não implementado | Alto (#5) |
| Celebrante sem destaque | `scales/Show.vue:151-158`, celebrante no mesmo `<dl>` com o mesmo peso visual de Data/Horário/Status, apesar do requisito de negócio pedir destaque | Médio (#8) |
| Função vazia sem indicação | Tratada só na tela de edição (fundo âmbar + "Ninguém escalado", `ScaleForm.vue:312-323`); na tela de visualização (`Show.vue`) uma categoria vazia simplesmente não aparece | Médio (#10) |

## Confirmação contra o código real (spot-check desta task)

Todos os achados acima foram reverificados diretamente nos arquivos-fonte (não apenas aceitos da
auditoria):

- `Dashboard.vue:335` — `min-w-[560px]` confirmado byte a byte.
- `Dashboard.vue:381-382` — `text-[10px]` no horário e `hidden lg:inline text-[10px]` no
  celebrante, confirmado.
- `window.confirm(` — confirmado em exatamente 12 arquivos (`teams/Index.vue`,
  `availability/Panel.vue`, `substitutions/Index.vue`, `scaleTemplates/Index.vue`,
  `scaleTemplates/Edit.vue`, `comunidades/Index.vue`, `servidores/Index.vue`,
  `celebrantes/Index.vue`, `scales/Index.vue`, `profile/Edit.vue`, `repertoire/Edit.vue`,
  `categorias/Index.vue`).
- `ScaleForm.vue` — confirmado com exatamente 430 linhas (`wc -l`).
- `ScaleForm.vue:287-299` — bloco "Sugeridos" (busca geral + botão "Adicionar" por sugestão)
  confirmado, coexistindo com a seleção manual por categoria mais abaixo no mesmo arquivo.
- `ScaleForm.vue:85-90` — comentário no código confirmando que a categoria de uma escalação
  independe de haver Ministério cadastrado (hoje só Música costuma ter).
- Nenhuma divergência encontrada entre a auditoria e o código atual nos pontos verificados — a
  auditoria está factualmente precisa nos itens citados pela SPEC-002.

## Estrutura atual das telas prioritárias (SPEC-002 §4)

Resumo operacional para as tasks de wireframe (detalhe completo em `auditoria-ux.md` §2, §3, §8,
§9, §11, §12 — não duplicado aqui por extenso):

1. **Dashboard** (`dashboard/Dashboard.vue`, 426 linhas) — calendário mensal em grid (min-w-560px,
   problema crítico de mobile), banners condicionais (próxima celebração, minhas próximas
   escalas, pendências de confirmação só para staff), stats (total/confirmadas/rascunhos),
   botões de atalho no header (Substituições/Relatórios/Nova Escala, staff).
2. **Criar/Editar Escala** (`scales/ScaleForm.vue`, 430 linhas, compartilhado por `Create.vue`/
   `Edit.vue`) — 8 campos de cabeçalho + bloco "Sugeridos" geral + blocos por categoria de
   função (cada um com select servidor + select instrumento/função quando aplicável + botão
   adicionar, ou "adicionar equipe inteira" quando há Ministério cadastrado) + campo Status
   (Rascunho/Confirmada). Sem validação de conflito. Função vazia sinalizada só aqui (fundo
   âmbar).
3. **Escala — Detalhes** (`scales/Show.vue`, 249 linhas) — agrupado por categoria de função,
   celebrante sem destaque visual próprio, sem indicação de categoria vazia, sem indicação de
   alteração recente, seção "Minha confirmação" para o servidor.
4. **Listagens administrativas** (`servidores/Index.vue` e demais 7 telas Index) — todas usam
   `<table>` HTML dentro de `overflow-x-auto`, sem alternativa em cartão para mobile; busca (só
   em Servidores) é `@input` sem debounce.
5. **Painel de Disponibilidade** (`availability/Panel.vue`, 160 linhas) — mistura gestão da
   janela de coleta (abrir/fechar) com a grade servidor × dia numa mesma tela, sem separação
   visual forte; grade é tabela ampla, mesmo problema de largura do calendário.

Adicional (fora da lista de 5 prioridades do §4, mas relevante às TASK-0011/0014 da Etapa 2):
`scales/MyScales.vue` (146 linhas) já usa lista cronológica em cartões (não calendário) — mais
legível no celular que o padrão do Dashboard, ponto positivo a preservar; `substitutions/Index.vue`
já cria a substituição automaticamente quando um servidor recusa (não exige "pedido" explícito),
mas não mostra ao servidor que a substituição foi aberta em seu nome.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — todo o documento, especialmente as notas de
  rodapé (`contentReference`) que citam a auditoria.
- `auditoria-ux.md` (raiz do repositório).
- [`docs/arquitetura-interface.md`](../arquitetura-interface.md).
- `docs/tasks/0001-auditoria-rotas-funcionalidades-existentes.md` (mesmo tipo de levantamento,
  aplicado à Etapa 1).
- Código-fonte das telas citadas acima.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. `auditoria-ux.md` lido por completo (915 linhas) e
  resumido nos pontos citados pela SPEC-002. Todos os achados relevantes reverificados
  diretamente no código-fonte (grep/wc -l/leitura de trecho) — nenhuma divergência encontrada; a
  auditoria está factualmente precisa em todos os pontos checados (min-w-560px, 12 usos de
  `confirm()`, chips `text-[10px]`, 430 linhas do ScaleForm, bloco "Sugeridos" concorrente com
  seleção manual). Estrutura atual das 5 telas prioritárias do §4 documentada em nível
  operacional para as tasks de wireframe seguintes. Task marcada `concluida`. Próximo passo:
  TASK-0007 (padrões transversais de UX) já está elegível.
