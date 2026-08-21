---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0004 — Recomendações desktop/tablet/mobile e estratégia de navegação mobile

**Task ID**: `TASK-0004`

## Objetivo

Produzir o entregável 4 da [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) (seção 21, item 4):
recomendações estruturais de como cada área do mapa de navegação (TASK-0002) será acessada em
desktop, tablet e mobile, incluindo a estratégia de navegação mobile (seção 7.1), sem depender de
`overflow-x-auto`/scroll horizontal — problema identificado na auditoria de UX e citado
explicitamente na SPEC-001 (seção 7) como contrário ao requisito mobile-first do projeto.

## Dependências

- `TASK-0002` — mapa de navegação, necessário para atribuir uma recomendação de acesso a cada
  área nos três breakpoints.

## Critérios de conclusão

- [x] Recomendação estrutural de acesso definida para cada área do mapa de navegação (TASK-0002),
      nos três contextos: desktop, tablet e mobile.
- [x] Estratégia de navegação mobile documentada (ex. navegação inferior com opções principais +
      acesso secundário organizado), coerente com a direção estrutural da seção 7.1.
- [x] Critérios de aceite "Mobile" da seção 20 confirmados: arquitetura não depende de navegação
      horizontal; existe estratégia definida para navegação mobile; ações principais continuam
      acessíveis em telas pequenas.
- [x] Nenhuma decisão de identidade visual (paleta, tipografia, ícones, sombras, animações)
      incluída — apenas estrutura, reforçando o que a seção 1 e a seção 22 da SPEC-001 excluem
      explicitamente desta etapa.

## Estado real hoje (evidência de código, base para as recomendações)

- `AuthenticatedLayout.vue` já divide o comportamento em **dois** contextos, não três: abaixo
  de `md` (768px) mostra um dropdown de hambúrguer com a lista de itens; a partir de `md`
  mostra uma sidebar off-canvas (aberta por um botão, nunca fixa/pinada) com a mesma lista.
  Não existe hoje um tratamento distinto para tablet — o breakpoint `md` já entrega o
  comportamento "desktop" a partir de 768px.
- O menu atual (a lista `navItems`) não reflete os domínios do mapa da TASK-0002 — é uma lista
  achatada (Dashboard, Escalas, e para staff: Servidores, Ministérios, Disponibilidade,
  Comunidades, Categorias, Celebrantes; para servidor: Minha Escala, Disponibilidade), sem
  agrupamento por domínio nem os itens hoje só indiretos (Relatórios, Substituições,
  Recorrências, Intensidade).
- O problema citado na SPEC-001 §7 (`overflow-x-auto` como solução de responsividade) está
  presente em 12 telas de listagem hoje: `dashboard/Dashboard.vue`, `servidores/Index.vue`,
  `celebrantes/Index.vue`, `reports/Index.vue`, `scales/Index.vue`, `teams/Index.vue`,
  `categorias/Index.vue`, `comunidades/Index.vue`, `availability/Panel.vue`,
  `servidores/Intensity.vue`, `scaleTemplates/Index.vue`, `availability/Form.vue`. Confirma o
  diagnóstico da SPEC — corrigir essas telas é implementação frontend, fora do escopo desta
  etapa (SPEC-001 §22); fica registrado aqui como pendência concreta para a etapa de
  implementação.

## Recomendação estrutural por breakpoint (navegação, não conteúdo das telas)

Aplicando a distinção Principal/Secundária/Perfil da SPEC-001 §6, diferenciada por perfil
(§3.3), sem prescrever componente visual específico:

### Desktop (≳ 1024px)

Toda a hierarquia do mapa de navegação (TASK-0002) fica acessível a partir de um único painel
de navegação persistente ou sob demanda (a decisão entre sidebar sempre visível vs. off-canvas
por toggle é uma escolha de componente/visual — Etapa 3, não esta). Estruturalmente:

- Nível 1 (domínios): Dashboard, Escalas, Pessoas, Conteúdo, Análises, Configurações — sempre
  visíveis nesse painel.
- Nível 2 (sub-itens de cada domínio, ex. Escalas → Substituições/Recorrências/Disponibilidade):
  visíveis simultaneamente ao nível 1 (não exigem duas navegações separadas) — desktop tem
  espaço horizontal suficiente para isso sem esconder nada.
- Perfil: separado do restante, associado à identidade do usuário (hoje já é assim — link
  "Perfil" fora da lista de `navItems`, no cabeçalho).

### Tablet (~768–1024px)

A SPEC-001 pede recomendação própria para tablet, mas a evidência de código (seção acima)
mostra que hoje esse intervalo já herda o comportamento "desktop" (painel off-canvas com a
hierarquia completa) a partir de `md` (768px). Recomendação: **manter esse alinhamento
estrutural** — tablet usa a mesma hierarquia completa do desktop (nível 1 + nível 2
simultâneos), sem reduzir itens, mas sem exigir um painel sempre fixo (o toggle já é aceitável
em telas menores que desktop). Não é necessário — nem esta etapa cobre — desenhar um terceiro
padrão visual dedicado a tablet; a diferença tablet→desktop fica só em como o painel se abre
(toggle vs. fixo), decisão de componente para a Etapa 3.

### Mobile (< 768px)

Direção estrutural (SPEC-001 §7.1), diferenciada por perfil conforme §3.3 — poucas opções
principais sempre visíveis, resto sob um agrupamento secundário:

**Servidor** — principal (ex. navegação inferior fixa):
```text
┌─────────────────────────────┐
│           Conteúdo           │
├─────────────────────────────┤
│ Início │ Minha Escala │ Disponibilidade │ Mais │
└─────────────────────────────┘
```
Secundário, sob "Mais": Perfil (Minha conta), acesso de leitura a Repertório/Liturgia da
próxima celebração (contextual, a partir do próprio Dashboard/Minha Escala — não precisa de
item de menu dedicado, ver TASK-0003 sobre acesso contextual).

**Coordenador/Admin** — principal:
```text
┌─────────────────────────────┐
│           Conteúdo           │
├─────────────────────────────┤
│ Início │ Escalas │ + (Nova escala) │ Mais │
└─────────────────────────────┘
```
Secundário, sob "Mais": Pessoas (Servidores/Intensidade), Substituições, Recorrências,
Disponibilidade (painel), Análises (Relatórios), Configurações (Ministérios/Categorias/
Comunidades/Celebrantes), Perfil.

Justificativa da diferença: a lista "frequente" de cada perfil na SPEC-001 §3.3 já não cabe
inteira em 3–4 posições fixas — coordenador tem 8 itens frequentes citados, servidor tem 5.
Cada bottom nav prioriza os 2–3 mais usados por perfil (Escalas/Nova escala para coordenador;
Minha Escala/Disponibilidade para servidor) e agrupa o resto sob "Mais", em vez de tentar caber
tudo ou esconder algo sem alternativa — consistente com a regra de acesso contextual vs. global
já validada na TASK-0003.

Isso é só uma **direção estrutural** (mockup em texto, sem cor/ícone/tipografia definidos),
igual ao que a própria SPEC-001 apresenta em §7.1 — a implementação de componente visual fica
para uma etapa posterior (`docs/specs/SPEC-003.md`, Etapa 3 — Design System, Identidade Visual e
Interface), não para esta.

## Recomendação por área do mapa (TASK-0002)

| Área | Desktop | Tablet | Mobile |
|---|---|---|---|
| Dashboard | Painel nível 1 | Igual ao desktop | Item principal ("Início") |
| Escalas → Visão geral/lista | Painel nível 1 | Igual ao desktop | Item principal ("Escalas", coordenador) / dentro de "Início" (servidor) |
| Escalas → Minha escala | Painel nível 2 | Igual ao desktop | Item principal (servidor) |
| Escalas → Substituições | Painel nível 2 | Igual ao desktop | "Mais" (coordenador) |
| Escalas → Recorrências | Painel nível 2 | Igual ao desktop | "Mais" (coordenador) |
| Escalas → Disponibilidade | Painel nível 2 | Igual ao desktop | Item principal (servidor) / "Mais" (coordenador, painel) |
| Pessoas → Servidores / Intensidade | Painel nível 1/2 | Igual ao desktop | "Mais" (coordenador) |
| Conteúdo → Repertórios / Liturgia | Contextual (dentro da tela de escala) em todos os breakpoints — não depende de item de menu dedicado | Igual ao desktop | Igual ao desktop |
| Análises → Relatórios | Painel nível 1 | Igual ao desktop | "Mais" (coordenador) |
| Configurações (Ministérios/Categorias/Comunidades/Celebrantes) | Painel nível 1/2 | Igual ao desktop | "Mais" (coordenador) |
| Perfil → Minha conta | Separado, ligado à identidade do usuário | Igual ao desktop | "Mais", em todos os perfis |

## Verificação dos critérios de aceite "Mobile" (SPEC-001 §20)

- **Arquitetura não depende de navegação horizontal**: a estratégia de bottom nav + "Mais"
  cobre a navegação entre áreas sem scroll horizontal. O `overflow-x-auto` encontrado em 12
  telas (seção "Estado real hoje") é um problema de **conteúdo de tabela**, não de navegação
  entre áreas — continua sendo dívida a resolver na etapa de implementação, mas não invalida a
  arquitetura de navegação proposta aqui.
- **Existe estratégia definida para navegação mobile**: sim, ver "Mobile" acima, diferenciada
  por perfil.
- **Ações principais continuam acessíveis em telas pequenas**: sim — os itens mais frequentes
  por perfil (SPEC-001 §3.3) ficam nos slots principais do bottom nav; nenhum fica só
  acessível via caminho indireto/escondido.

## Referências

- [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) — seções 1, 7, 7.1, 20, 21 (item 4), 22.
- `TASK-0002`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-001.
- 2026-08-21 — Task reivindicada e executada. Recomendações estruturais produzidas para
  desktop/tablet/mobile, com evidência real de código (`AuthenticatedLayout.vue` hoje só
  distingue dois contextos, não três — `md`/768px já entrega o comportamento "desktop"; 12
  telas de listagem ainda usam `overflow-x-auto`, confirmando o diagnóstico da SPEC-001 §7).
  Estratégia de navegação mobile diferenciada por perfil (bottom nav com "Início/Escalas/+/Mais"
  para coordenador; "Início/Minha Escala/Disponibilidade/Mais" para servidor), coerente com a
  lista de itens frequentes por perfil da SPEC-001 §3.3. Nenhuma decisão de identidade visual
  (cor, ícone, tipografia) incluída — apenas estrutura; correção do `overflow-x-auto` e escolha
  de componente (sidebar fixa vs. off-canvas, bottom nav real) ficam registradas como pendência
  de implementação para etapa futura (`docs/specs/SPEC-003.md`), não resolvidas aqui. Task
  marcada `concluida`. Próximo passo: TASK-0005 (consolidação final) já está elegível — suas
  três dependências (TASK-0002, TASK-0003, TASK-0004) estão concluídas.
