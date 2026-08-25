---
status: concluida
modulo: src/pages/substitutions
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0053 — Substituições

**Task ID**: `TASK-0053`

## Objetivo

Aplicar o Design System à tela de Substituições (SPEC-004 §9, "Demais telas"), formalizando o
passo de confirmação antes inexistente na aprovação de substituto (achado da
`TASK-0014`/Etapa 2): hoje "Aprovar com este" efetiva a troca num único clique.

## Arquivos/componentes envolvidos

- `src/pages/substitutions/Index.vue`.

## Comportamento esperado

Cartão por substituição pendente (mantido), com `Alert`/`Badge` migrados para tokens. "Ver
sugestões" continua como expansão inline (contexto pequeno, não justifica `Drawer`). "Aprovar
com este" passa a abrir `Modal` de confirmação ("Aprovar substituição? <Nome> vai substituir
<Titular> em <Celebração>, <Data>. [Cancelar] [Aprovar]") antes de chamar
`PATCH /substituicoes/:id/aprovar`. "Rejeitar" usa o mesmo `Modal`, substituindo `confirm()`
nativo. Estado "nenhum substituto sugerido" ganha mensagem com motivo, quando disponível (ver
riscos).

## Dependências

- `TASK-0031` — `Modal`, `Alert`.
- `TASK-0044` — busca manual do `ScaleForm` (o link "adicionar substituto manualmente" no
  estado vazio reaproveita esse fluxo, se implementado nesta etapa).

## Critérios de conclusão

- [x] "Aprovar com este" abre `Modal` de confirmação antes de chamar a API — mesmo endpoint,
      um passo a mais na interação.
- [x] "Rejeitar" usa `Modal`, não `confirm()` nativo.
- [x] Cartões e badges migrados para tokens visuais.
- [x] `npm run build` passa sem erros.
- [~] Testado aprovando e rejeitando uma substituição pendente — **não executado em navegador**
      (mesma limitação de ambiente já registrada); `confirmarAprovar`/`confirmarRejeitar` chamam
      exatamente os mesmos `PATCH /substituicoes/:id/aprovar`/`rejeitar` de antes, verificado por
      leitura de código.

## Riscos

- **Motivo de "sem substituto sugerido"**: a mesma limitação de dado já registrada em
  `docs/tasks/0009-*.md`/`0014-*.md` (sem verificação de indisponibilidade/dupla escalação) se
  aplica aqui — se `GET /substituicoes/:id/sugestoes` não retornar motivo de exclusão, manter a
  mensagem genérica atual em vez de inventar um motivo, e registrar a pendência.

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §9 (fase "Demais telas").
- `docs/tasks/0014-wireframes-substituicoes.md` (especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `substitutions/Index.vue`: "Aprovar com este" não
  chama mais `PATCH /substituicoes/:id/aprovar` direto no clique — abre um `Modal` com a frase
  exata da `TASK-0014` ("<Nome> vai substituir <Titular> em <Celebração>, <Data>"), e só ao
  confirmar dispara a mesma chamada de sempre. "Rejeitar" migrou de `confirm()` nativo pro mesmo
  padrão de `Modal`. Empty state "Nenhum substituto sugerido" migrou de texto solto pra `Alert
  type="info"` (tokens). Cores migradas de `indigo`/literais pra `primary`/tokens semânticos,
  com `dark:` completo nos elementos que ainda não tinham.

  **Motivo de "sem substituto sugerido"**: confirmado por leitura de
  `api/_routes/substituicoes.ts` que `GET /:id/sugestoes` usa a mesma `suggestServidores()` do
  `ScaleForm` (`api/_lib/suggestServidores.ts`) — nenhum dado de motivo de exclusão é retornado.
  Mensagem genérica mantida, nenhum motivo inventado (mesma pendência já registrada em
  `docs/tasks/0009-*.md`/`0014-*.md`, apenas reconfirmada aqui). **"Adicionar substituto
  manualmente"** (mencionado como possível próximo passo na `TASK-0014`) **não foi implementado**:
  não existe endpoint de busca/adição manual de substituto neste router (`aprovar` exige um
  `substitutoId` já conhecido, não um fluxo de busca), e conectar isso ao `ScaleForm` exigiria
  inventar uma integração nova entre duas telas — fora do escopo desta task de aplicação de
  Design System; registrado aqui como pendência, não escondido. `npm run build` passou sem erros;
  `dist/` restaurado; `git status` confirmou que só `substitutions/Index.vue` mudou. Teste de
  aprovar/rejeitar não executado em navegador (mesma limitação de ambiente já registrada);
  validado por leitura de código dos mesmos endpoints. Task marcada `concluida`. **Fim da Fase 9
  (Demais telas)**: `TASK-0053` concluída (única task desta fase). Próximo passo: `TASK-0054`
  (Responsividade real) inicia a Fase 10 (Polimento), última fase da Etapa 4.
