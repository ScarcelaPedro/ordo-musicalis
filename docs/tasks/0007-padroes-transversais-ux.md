---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0007 — Padrões transversais de UX

**Task ID**: `TASK-0007`

## Objetivo

Definir, uma única vez, os padrões de interação que [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md)
exige que **todos** os wireframes sigam de forma consistente: hierarquia de formulários (§12),
ações primárias/secundárias (§13), catálogo de estados de tela (§14, incluindo empty states,
§14.1), padrão de confirmação substituindo o `confirm()` nativo (§15), critério de escolha entre
modal/drawer/página (§20), prevenção de carga cognitiva (§21), diretrizes para usuários não
técnicos (§22) e regras de conteúdo/microcopy (§23).

Definir isso antes das tasks de tela por tela (TASK-0008 a TASK-0014) evita que cada wireframe
invente seu próprio padrão de estado/confirmação/ação — o que quebraria exatamente a consistência
que a SPEC-002 pede (princípios §3.1–3.2).

## Dependências

- `TASK-0006` — evidências do estado atual (ex. onde `confirm()` nativo é usado hoje, quais
  telas têm mais campos por formulário), necessárias para os padrões partirem da realidade.

## Critérios de conclusão

- [x] Hierarquia padrão de formulário definida: título, breve explicação, campos principais,
      campos secundários, ações, feedback (§12).
- [x] Convenção de ação primária vs. secundária definida, com pelo menos um exemplo aplicado a
      uma tela real do sistema (§13).
- [x] Catálogo dos 10 estados de tela (Loading, Empty, Error, Success, Disabled, Selected,
      Active, Focus, Validation, Confirmation — §14) com um padrão de representação definido
      para cada um, incluindo a estrutura de empty state: o que está vazio / por que pode estar
      vazio / o que o usuário pode fazer (§14.1).
- [x] Padrão de confirmação definido para substituir o `confirm()` nativo do navegador, com
      exemplo de conteúdo (título, explicação da consequência, ações — §15). Não inclui decidir
      reversibilidade/exclusão física, apenas a experiência (SPEC-002 §15, último parágrafo).
- [x] Critério de escolha entre modal, drawer e página definido, com pelo menos um exemplo real
      de cada aplicado a uma tela do sistema (§20) — reforçando que a montagem completa de uma
      escala não deve ser comprimida em modal.
- [x] Diretrizes de prevenção de carga cognitiva (§21) e de design para usuários não técnicos
      (§22) consolidadas num checklist reutilizável pelas tasks de wireframe.
- [x] Regras de conteúdo/microcopy definidas com pelo menos um par de exemplo bom/ruim (§23).
- [x] Nenhuma decisão de identidade visual (cor, fonte, ícone definitivo, sombra, borda)
      incluída — reforça SPEC-002 §24/§29.

## Princípio geral: reaproveitar o que já funciona

A auditoria (`TASK-0006`) já identificou padrões que funcionam bem hoje e não deveriam ser
reinventados (`auditoria-ux.md` §14): botões `PrimaryButton`/`SecondaryButton`/`DangerButton`
consistentes, empty states com mensagem específica em quase toda tela, badges com semântica de
cor coerente, `<select>` nativo (positivo para acessibilidade). Os padrões abaixo formalizam e
estendem o que já existe, em vez de propor um vocabulário novo do zero.

## 1. Hierarquia de formulário (§12)

Estrutura padrão para todo formulário do sistema:

```text
1. Título           — o que esta tela/seção faz.
2. Breve explicação  — 1 frase, só quando o objetivo não é óbvio pelo título (opcional).
3. Campos principais — dados que toda instância precisa ter.
4. Campos secundários — dados opcionais/avançados, visualmente menos destacados.
5. Ações             — primária + secundária(s), nunca mais de uma com peso visual dominante.
6. Feedback          — inline (erro de campo) + global (sucesso/erro da operação).
```

Aplicado a um caso real: a Etapa 1 do `ScaleForm` (dados da celebração, `TASK-0006`) já separa
campos principais (data, horário, comunidade) de secundários (observações, lembrete) — falta
formalizar isso como padrão explícito e adicionar o item "2. Breve explicação", ausente hoje em
todos os formulários do sistema (nenhuma tela teria motivo forte para adicionar uma, exceto
onde o objetivo realmente não for óbvio — ex. "Disponibilidade": explicar a semântica do
checkbox desmarcado, gap já registrado pela auditoria, §12 é o padrão que resolve isso).

## 2. Ação primária vs. secundária (§13)

O sistema já tem a base certa: `PrimaryButton` (ação principal), `SecondaryButton` (ação
secundária) e `DangerButton` (ação destrutiva) — três componentes consistentes (confirmado pela
auditoria, `TASK-0006`). O padrão a formalizar é de **uso**, não de componente novo:

- Cada tela tem exatamente **uma** ação primária (`PrimaryButton`).
- Ações secundárias (`Cancelar`, `Voltar`) usam `SecondaryButton`.
- Ações destrutivas usam `DangerButton`, nunca `PrimaryButton`.
- Nenhuma tela deve ter dois `PrimaryButton` competindo por atenção.

Exemplo real já correto a preservar: no header do Dashboard (`Dashboard.vue:209-224`), "Nova
Escala" já usa destaque de ação principal (fundo `indigo-600`) enquanto "Substituições" e
"Relatórios" já usam um estilo secundário mais discreto (`bg-gray-200`) — um acerto de
hierarquia existente que os wireframes das próximas tasks devem manter, não redesenhar do zero.

## 3. Catálogo de estados de tela (§14)

| Estado | Padrão definido | Base existente (confirmar/estender) |
|---|---|---|
| Loading | Skeleton quando a estrutura é previsível (lista, card); texto "Carregando..." aceitável em telas simples | Presente na maioria dos `Index`; ausente em `teams/Index.vue` (achado da auditoria) — corrigir na TASK-0012 |
| Empty | Título + por que pode estar vazio + ação, quando aplicável (§14.1) | Já forte no sistema — "Nenhum(a) X encontrado(a)" está presente na maioria; falta em `Escala (Show)` para categoria sem ninguém (corrigir na TASK-0009/0010) |
| Error | Mensagem humana + próximo passo, nunca erro cru da API | Hoje mistura os dois: formulários de auth/servidor têm erro de campo (`InputError`); ações rápidas mostram erro cru vindo da API em alguns pontos (achado da auditoria) — padronizar |
| Success | Feedback objetivo, de vida curta | `FlashMessage` já cobre bem, mas sem timeout automático nem fechamento manual (achado da auditoria) — considerar timeout/dismiss na TASK-0022 (Etapa 3) |
| Disabled | Controle claramente indisponível, com indicação visual, não só ausência de clique | Já consistente (`:disabled="loading"` durante submits) |
| Selected/Active | Indicação por mais de um sinal (não só cor) | Sidebar desktop já destaca item ativo; dropdown mobile hoje **não** destaca (achado da auditoria) — corrigir na TASK-0008/consolidação de navegação |
| Focus | Anel de foco visível em todo controle interativo | Consistente nos campos via Tailwind Forms; links de ação em tabela não têm foco diferenciado (achado da auditoria) — corrigir na TASK-0012 |
| Validation | Erro por campo, mensagem específica, no momento do blur/submit | Já presente em formulários com `InputError`; estender aos que só mostram flash genérico |
| Confirmation | Ver padrão dedicado, seção 4 abaixo | Hoje é só `confirm()` nativo — substituído por este padrão |

### Estrutura de empty state (§14.1)

```text
1. O que está vazio      — ex. "Você ainda não possui escalas."
2. Por que pode estar vazio — ex. "Quando uma escala for atribuída a você, ela aparecerá aqui."
3. Ação, quando aplicável — ex. [Ver todas as escalas] / [Criar escala], conforme o perfil.
```

## 4. Padrão de confirmação (§15)

Substitui `confirm()` nativo, hoje usado em 12 arquivos (`TASK-0006`). Estrutura fixa:

```text
Título: <Ação>?                         ex. "Excluir servidor?"
Explicação: <consequência específica>    ex. "Esta ação removerá o servidor da escala e
                                              poderá afetar registros relacionados."
Ações: [Cancelar] [<Ação> — DangerButton quando destrutivo]
```

Esta task define só a **experiência** — não decide se a exclusão passa a ser reversível/soft
delete (isso é regra de negócio, fora do escopo de UX/wireframe, SPEC-002 §15 último parágrafo,
§29).

## 5. Critério modal / drawer / página (§20)

O sistema hoje **não tem nenhum componente de modal/drawer** (achado da auditoria, `TASK-0006`)
— toda ação secundária é página inteira ou `confirm()` nativo. O critério a partir de agora:

| Padrão | Quando usar | Exemplo real do sistema |
|---|---|---|
| Modal | Confirmação, ação rápida, tarefa contextual pequena | O novo padrão de confirmação (seção 4) — ex. confirmar exclusão de um servidor |
| Drawer | Filtros, detalhes rápidos, seleção contextual, edição simples | Candidato natural: o fluxo de "Adicionar servidor" ao `ScaleForm` (TASK-0009 decide o padrão exato) |
| Página | Tarefa complexa, que exige concentração | `ScaleForm` inteiro (Criar/Editar Escala) — já é página hoje, e deve **continuar** sendo (§20, último parágrafo: "a montagem completa de uma escala não deve ser comprimida em modal") |

## 6. Prevenção de carga cognitiva e design para não técnicos (§21, §22)

Checklist reutilizável pelas TASK-0008 a TASK-0014:

- [ ] Existe só **um** caminho principal para cada ação (ex. resolver a competição visual entre
      "Sugeridos" e seleção manual por categoria no `ScaleForm` — achado crítico da auditoria,
      `TASK-0006` — é o caso mais urgente de aplicação deste item).
- [ ] Nenhum campo irrelevante ao contexto atual aparece antes de ser necessário.
- [ ] Nenhum controle duplicado para a mesma ação.
- [ ] Nenhum termo técnico desnecessário (linguagem de usuário final, não de banco de dados —
      ex. "Ministérios" na UI, não "Teams", já correto hoje).
- [ ] Nenhuma ação importante está escondida sem alternativa visível.
- [ ] `<select>` nativo é mantido onde já está — não substituir por combobox customizado só por
      estética (SPEC-002 §17, reforçado pelo achado da auditoria de que isso já é um acerto).
- [ ] Consequências de ações são explicadas antes de o usuário confirmar (ver padrão de
      confirmação, seção 4).

## 7. Regras de conteúdo / microcopy (§23)

Textos curtos, claros, objetivos, orientados à ação. Exemplo real do sistema (achado da
auditoria, `TASK-0006`):

```text
Ruim (hoje, em alguns pontos):  "Erro ao..." + mensagem crua vinda da API
                                 (e.response?.data?.message ?? 'Erro ao salvar')
Bom (já usado em outros pontos, generalizar): "Não foi possível salvar a escala.
                                 Verifique os campos destacados e tente novamente."
```

Regra: nunca expor mensagem de erro técnica da API diretamente na tela — sempre traduzir para
uma frase humana + próximo passo, mesmo quando a API não fornecer isso pronto.

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §12–23, §24.
- `TASK-0006`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Padrões definidos para formulário, ações
  primária/secundária, os 10 estados de tela, confirmação (substituindo `confirm()` nativo),
  critério modal/drawer/página, carga cognitiva/usuários não técnicos e microcopy — todos
  fundamentados nos achados reais da `TASK-0006`, reaproveitando o que a auditoria já identificou
  como acerto existente (botões primário/secundário/destrutivo, empty states, badges, select
  nativo) em vez de propor vocabulário novo do zero. Cada padrão aponta explicitamente para qual
  task de wireframe (TASK-0008 a 0014) vai aplicá-lo/corrigi-lo. Nenhuma decisão de identidade
  visual incluída. Task marcada `concluida`. Próximo passo: TASK-0008 (wireframes do Dashboard)
  já está elegível.
