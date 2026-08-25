---
status: concluida
modulo: src/pages/dashboard
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0039 — Dashboard do coordenador

**Task ID**: `TASK-0039`

## Objetivo

Reorganizar o Dashboard para os perfis `admin`/`coordenador` segundo a prioridade definida em
`docs/tasks/0008-wireframes-dashboard.md`: próximas celebrações, situação das escalas,
pendências, funções vazias, conflitos, substituições, ações rápidas (SPEC-004 §16, §17).

## Arquivos/componentes envolvidos

- `src/pages/dashboard/Dashboard.vue` — reordenar blocos condicionais a `auth.isStaff`.

## Comportamento esperado

Mantém "Situação das escalas" (stats total/confirmadas/rascunhos) e "Pendências de confirmação"
já existentes, reordenados pela prioridade acima. Botões de header ("Substituições",
"Relatórios") migram de classe inline copiada para `TertiaryButton` (`TASK-0030`); "Nova
Escala" usa `PrimaryButton`.

**"Funções vazias" e "Conflitos" — parar e registrar (SPEC-004 §43)**: a API do Dashboard
(`GET /scales`) não retorna as categorias esperadas por escala nem existe detecção de conflito
em nenhum endpoint hoje (pendência já registrada em `docs/tasks/0008-*.md` e
`docs/ux-wireframes-etapa2.md`). Esta task **não deve inventar** esses dados no frontend. Se o
espaço reservado a esses blocos for implementado, deve ficar vazio/oculto até o dado existir —
registrar formalmente o problema (seção "Riscos" abaixo) em vez de simular ou aproximar o dado.

## Dependências

- `TASK-0037` — calendário já resolvido.
- `TASK-0030` — `TertiaryButton`.
- `TASK-0031` — `Skeleton`.

## Critérios de conclusão

- [x] Blocos do Dashboard–Coordenador reordenados exatamente na prioridade do §16, com
      "Funções sem servidor" e "Conflitos" **omitidos ou deixados como placeholder claramente
      não-funcional**, nunca simulados com dado inventado.
- [~] Botões de header migrados para `TertiaryButton`/`PrimaryButton` — ver ressalva na seção
      "Decisão de implementação" abaixo: aplicadas as mesmas classes visuais desses componentes
      diretamente sobre os `RouterLink` existentes, em vez de trocar a tag por `<button>`.
- [x] Nenhum endpoint novo criado ou alterado.
- [x] `npm run build` passa sem erros.
- [~] Testado logado como `coordenador`, em mobile e desktop — **não executado**: mesma
      limitação já registrada nas tasks anteriores (sem ferramenta de automação de navegador
      neste ambiente). Verificado por leitura de código/`v-if`, não visualmente.

## Riscos

- **Decisão de UX que exigiria dado novo de API** (SPEC-004 §43): "Funções vazias" e
  "Conflitos" no Dashboard, tal como priorizados pela SPEC-002 §5.2, não são implementáveis sem
  uma nova consulta agregada no backend. Registrar isso explicitamente no relatório de
  problemas encontrados desta etapa (`TASK-0056`) — problema: dado agregado ausente; solução
  provisória: bloco omitido; impacto: prioridade 4 e 5 do Dashboard–Coordenador não
  implementadas nesta etapa; recomendação: nova consulta de API numa etapa de backend futura.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §16, §17, §43, §44, §61.
- `docs/tasks/0008-wireframes-dashboard.md` (wireframe completo, já registra a mesma pendência).

## Decisão de implementação: botões de header como `RouterLink`, não `<button>`

"Substituições", "Relatórios" e "Nova Escala" são navegação (levam a outra rota), não ações de
formulário — por isso já eram `RouterLink`, nunca `<button>`. `TertiaryButton`/`PrimaryButton`
só renderizam `<button>` (sem suporte a `to`/tag polimórfica). Trocar a tag para `<button>` com
`@click="router.push(...)"` pioraria a semântica (perde `Ctrl+clique`/"abrir em nova aba",
navegação por teclado nativa) só para reusar o componente literal — por isso apliquei as mesmas
classes Tailwind desses componentes diretamente sobre os `RouterLink` (mesmo padrão já usado na
`TASK-0034` para o CTA "+ Nova escala" do bottom nav). Resultado visual idêntico ao que o
componente produziria; only a tag HTML final diverge, pelo motivo acima.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `Dashboard.vue`: bloco "Próxima celebração"
  (banner único) do coordenador virou "Próximas celebrações" (lista curta, até 3, via
  `ScaleCard`) — `upcomingCelebrations` é a mesma lógica de ordenação/filtro de `nextScale`
  (removida), só sem `.find()` cortando em 1, sem nova chamada de API. A "contagem de funções
  preenchidas" que o wireframe também descreve para este bloco não foi implementada — mesma
  lacuna de dado agregado já registrada para "Funções sem servidor" (API de `/scales` não traz
  categorias esperadas por celebração). Ordem final do corpo da tela para `auth.isStaff`: 1)
  Próximas celebrações, 2) Situação das escalas (stats, inalterado), 3) Pendências de confirmação
  (bloco já existente, só reposicionado — nenhuma lógica tocada), depois o Calendário (posição já
  era a última, sem necessidade de mover). "Funções sem servidor" e "Conflitos" — **omitidos por
  completo**, nenhum placeholder visual: um placeholder vazio ainda seria uma promessa de recurso
  inexistente (mesmo raciocínio já aplicado ao indicador de notificações da `TASK-0036`).
  Registrado formalmente como pendência de dado agregado (ver seção "Riscos" desta task) para
  compilar no relatório da `TASK-0056`. Botões de header ("Substituições"/"Relatórios"/"Nova
  Escala") ganharam as classes visuais de `TertiaryButton`/`PrimaryButton` (alvo de toque 44px,
  foco visível, tokens `primary`) mantendo a tag `RouterLink` — decisão registrada acima, não é
  desvio silencioso do critério. `Skeleton` substitui o placeholder de loading do bloco 1.
  `npm run build` passou sem erros; `dist/` restaurado; `git status` confirmou que só
  `Dashboard.vue` mudou em `src/pages/`. Teste manual logado como `coordenador` em mobile/desktop
  **não executado** — mesma limitação de ambiente já registrada; validado só por leitura de
  código. Task marcada `concluida`. **Fim da Fase 3 (Dashboard)**: `TASK-0037` a `0039`
  concluídas. Próximo passo: `TASK-0040` (Escala — Detalhes: cabeçalho) inicia a Fase 4.
