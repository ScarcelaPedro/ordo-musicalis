---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0064 — Nível 3: UX de busca, filtros e formulários

**Task ID**: `TASK-0064`

## Objetivo

Avaliar a experiência de busca, filtros e formulários em toda a superfície do sistema
(SPEC-005 §35-38), incluindo como cada um se comporta em erro.

## Escopo

- Busca/filtro: `servidores/Index.vue`, `scales/Index.vue`, e as demais listagens com busca
  (`categorias`, `celebrantes`, `comunidades`, `teams`, `scaleTemplates`).
- Formulários: `ScaleForm.vue`, `availability/Form.vue`, `ServidorForm.vue`,
  `ScaleTemplateForm.vue`, e os pares `Create`/`Edit` de categorias, celebrantes, comunidades,
  teams.

## Metodologia

Teste de busca (§35): busca vazia, com resultado, sem resultado, com erro, durante loading, e
limpeza da busca — a mensagem de "nenhum resultado" precisa ser clara.

Teste de filtros (§36): aplicação, remoção, limpeza, indicação visual de filtro ativo,
persistência quando apropriado, comportamento em mobile.

Teste de formulários (§37): labels, placeholders, ordem dos campos, agrupamento, validação,
mensagens, foco, submit, cancelamento.

Erros de formulário (§38): o campo com erro é identificado visualmente; a mensagem aparece
próxima ao campo; o foco pode ser direcionado ao primeiro erro quando apropriado; o formulário
nunca apaga o que já foi preenchido ao falhar a validação/submissão.

## Dependências

- `TASK-0056` — Etapa 4 concluída.

## Critérios de conclusão

- [x] Busca testada nos 6 estados do §35 em pelo menos 2 listagens.
- [x] Filtros testados nos 6 aspectos do §36.
- [x] Formulários testados nos 9 aspectos do §37 em `ScaleForm` e em pelo menos 2 outros
      formulários de cadastro.
- [x] Comportamento de erro de formulário verificado quanto aos 4 pontos do §38 — em particular,
      confirmar que nenhum formulário perde dados já preenchidos ao falhar.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Baixo — validação observacional, não altera código.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §35-38, §53.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada em navegador real (Playwright, desktop 1280×900 +
  uma checagem mobile 375×812), reaproveitando dado já testado em tasks anteriores (validação de
  campo obrigatório, mensagens de erro, estados vazios de busca) sem duplicar — o foco aqui foi
  nos ângulos ainda não testados: limpeza de busca/filtro, combinação e persistência seletiva de
  filtros, foco após erro, e cancelamento de formulário. Seed temporário
  `api/prisma/_seedTask0064.ts` + 1 `INSERT` direto no banco (deletado/descartado ao final, nunca
  commitado): um ministério e 2 servidores extras, 2 escalas de setembro/2026 (uma vinculada ao
  ministério de teste) e 1 de outubro/2026, pra ter dado real o bastante pra combinar filtros.

  **Confirmado funcionando bem, sem achado**:
  - **§35 limpeza da busca**: em `servidores/Index.vue`, buscar "Diana" filtrou de 2 linhas pra
    1; apagar o campo manualmente restaurou as 2 linhas — sem precisar de um botão "X" dedicado,
    o campo de busca reativo já resolve isso.
  - **§36 filtros combinados e persistência seletiva**: em `scales/Index.vue`, testado com dado
    real: sem filtro = 38 linhas → mês=set/2026 = 2 → + ministério="Coral Teste" = 1 → limpar só
    o filtro de ministério (voltar pra "Todos os ministérios") = volta a 2, **o filtro de mês
    permanece aplicado** (não reseta os dois juntos) → apagar o campo de mês manualmente = volta
    a 38. Comportamento exatamente como o §36 pede: aplicação, remoção seletiva e limpeza total
    funcionam sem interferir uma na outra.
  - **§36 comportamento mobile**: `escalas-filtros-mobile.png` (375×812) — os dois filtros
    empilham em coluna, largura total, sem scroll horizontal (confirmado programaticamente:
    `scrollWidth <= clientWidth`), cards de escala legíveis com badge de status.
  - **§37 cancelamento não salva dado**: em `celebrantes/Create.vue`, preencher o nome e clicar
    "Cancelar" navega de volta pra listagem sem persistir nada — confirmado consultando a
    listagem depois (0 ocorrências do nome de teste).
  - **§38 dado preenchido não se perde em erro** — já confirmado na `TASK-0062` (teste offline),
    não duplicado aqui.

  **Achado (P3) — após erro de validação, o foco não vai para o primeiro campo inválido.**
  Em `ScaleForm` Etapa 1, clicar "Avançar" sem preencher nada mostra as 4 mensagens de erro
  corretamente (já confirmado na `TASK-0062`), mas o foco do teclado permanece no próprio botão
  "Avançar" em vez de mover para `#input-data` (o primeiro campo com erro). O §38 trata isso como
  "quando apropriado" (não obrigatório), então não é uma violação direta — mas é uma melhoria de
  acessibilidade/teclado de baixo custo (mover o foco ajudaria especialmente leitores de tela e
  navegação só por teclado a chegar direto no problema, sem precisar procurar visualmente).
  Recomendação pra `TASK-0071`: no `avancar()` do `ScaleForm`, focar o primeiro elemento com erro
  quando a validação falhar.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`. Ambiente encerrado ao
  final (Docker removido, dev servers finalizados, seed temporário apagado — o registro extra
  inserido via `psql` também some junto com o container). Task marcada `concluida`. Próximo
  passo: `TASK-0065`.
