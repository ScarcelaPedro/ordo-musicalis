---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0021 — Componentes base: controles interativos

**Task ID**: `TASK-0021`

## Objetivo

Especificar visualmente os componentes de controle/entrada de dados do Design System: Button
(com hierarquia — §21, §22), IconButton, Input (todas as variantes — §23), Select (§24),
Checkbox/Radio/Switch (§25). A SPEC-003 §24 é explícita: os selects nativos hoje usados são
considerados positivos para acessibilidade e usuários pouco técnicos, e **não devem** ser
substituídos por componente customizado apenas por estética.

## Dependências

- `TASK-0017` — paleta de cores (estados/variantes dos botões, cores semânticas de erro/sucesso
  nos inputs).
- `TASK-0018` — tipografia (labels, tamanhos de texto dos controles).
- `TASK-0019` — espaçamento, radius (aparência dos controles).
- `TASK-0020` — diretrizes transversais (ícones, acessibilidade, touch target, responsividade
  por componente).

## Critérios de conclusão

- [x] Botão especificado com as 5 variantes mínimas (Primary, Secondary, Tertiary/Ghost, Danger,
      Icon Button — §21) e os 6 estados obrigatórios (default, hover, active, focus, disabled,
      loading — §21.1).
- [x] Regra de hierarquia de botões por tela definida e exemplificada (§22): cada tela deve ter
      uma ação visualmente dominante — nunca vários botões com o mesmo peso.
- [x] Inputs especificados para as 8 variantes citadas (text, email, password, number, date,
      time, search, textarea — §23), cada um com label, placeholder quando necessário,
      descrição quando necessária, erro, sucesso quando aplicável, disabled, focus.
- [x] Decisão sobre Select documentada explicitamente respeitando a prioridade do §24
      (acessibilidade > facilidade de uso > consistência > comportamento previsível): mantém-se
      select nativo salvo onde houver benefício real comprovado para um customizado — qualquer
      exceção justificada no formato de decisão do SPEC-003 §58.
- [x] Checkbox, radio e switch especificados com a regra de uso de cada um (checkbox = múltipla
      escolha, radio = escolha única, switch = ativar/desativar configuração — §25).
- [x] Cada componente com comportamento responsivo definido (mobile/tablet/desktop — §50) e
      touch target adequado (§49), conforme os padrões da `TASK-0020`.
- [x] Nenhum componente criado sem justificar repetição/comportamento/estado próprio (critério
      de reutilização da `TASK-0020`, §54).

## Estado atual (releitura completa dos componentes existentes)

- `PrimaryButton.vue`: `bg-gray-800` (cinza-escuro/quase-preto) — **não** usa a cor `indigo` que
  na prática já é a cor interativa mais usada do sistema (achado da `TASK-0017`). Só o
  `focus:ring` é indigo. `px-4 py-2` com `text-xs` — altura aproximada de 34–36px, abaixo do
  piso de toque de 44px definido na `TASK-0020`.
- `SecondaryButton.vue`: branco, borda cinza, `shadow-sm` — já conceitualmente correto, mesma
  altura do Primary.
- `DangerButton.vue`: vermelho — já conceitualmente correto.
- Nenhum dos três tem spinner de loading — a troca é só de texto (`"Salvando..."`), feita
  manualmente em cada tela (achado já citado pela auditoria).
- `TextInput.vue`: um único componente parametrizado por `type`, sem estado de erro/sucesso
  próprio (sempre combinado com `InputError.vue` externo) — confirma exatamente o achado da
  auditoria.
- **Achado novo confirmado nesta task**: não existe nenhum componente de checkbox — os
  checkboxes da grade de disponibilidade (`availability/Form.vue`) são `<input type="checkbox">`
  nativo cru, sem wrapper de label formal. Não há uso de `radio` em lugar nenhum do sistema
  hoje. Não existe um `Switch`/toggle binário — a ativação de notificações (`profile/Edit.vue`)
  usa um botão de texto ("Ativar"/"Desativar notificações"), não um switch.

## Botão (§21, §21.1, §22)

| Variante | Base | Mudança em relação a hoje |
|---|---|---|
| Primary | Cor `--color-primary` (azul profundo, `TASK-0017`) | Migra de `bg-gray-800` — mudança real de aparência, resolve a divergência entre o botão "oficial" e o indigo já usado de fato em todo o resto do sistema |
| Secondary | Mantido (branco + borda) | Nenhuma mudança conceitual |
| Tertiary/Ghost | Novo componente | Formaliza o padrão hoje copiado inline em cabeçalhos (`bg-gray-200 text-gray-700 uppercase...`, repetido em múltiplas telas) — passa o critério de reutilização (`TASK-0020`) |
| Danger | Mantido (vermelho) | Nenhuma mudança conceitual |
| Icon Button | Novo componente | Ícone (Heroicons, `TASK-0020`) sempre com `aria-label`, área de toque mínima 44×44px mesmo com ícone visualmente menor |

**Estados obrigatórios** (§21.1): default, hover, active, focus (anel visível, já existe via
`focus:ring-indigo-500` — migra para `--color-primary`), disabled (opacidade reduzida, já
existe), **loading** (novo: spinner visual + texto de progresso, mantendo o padrão já bom de
trocar o texto — ex. "Salvando..." — mas acrescentando o indicador visual que falta hoje).

### Hierarquia de botões por tela (§22)

Regra já definida na Etapa 2 (`TASK-0007`): uma ação primária por tela, o resto secundário/
terciário. Exemplo aplicado — Etapa 4 (Revisão) do `ScaleForm`, já redesenhada na `TASK-0009`:
"Publicar escala" = `Primary`; "Salvar como rascunho" = `Secondary`; "Voltar"/"Cancelar" =
`Tertiary`. Esta task só define a aparência dessa hierarquia já decidida — não a redecide.

## Inputs (§23)

Mantém a abordagem já existente de **um componente parametrizado por `type`** (não 6
componentes separados) — já é assim hoje (`TextInput.vue`) e passa o critério de reutilização:
não há comportamento suficientemente distinto entre text/email/password/number/date/time/search
para justificar componentes separados.

| Aspecto | Especificação |
|---|---|
| Label | Sempre via `InputLabel` (mantido), com indicador de campo obrigatório quando aplicável (já existe) |
| Placeholder | Só quando o formato não for óbvio pelo label (ex. não usar em "Nome") |
| Descrição | Texto auxiliar abaixo do campo, quando o campo precisar de explicação (ex. resolve o achado da `TASK-0028` sobre a semântica do checkbox de disponibilidade, aplicável também a inputs) |
| Erro | **Novo**: borda com `--color-danger` diretamente no componente, além do texto do `InputError.vue` (hoje só o texto existe, sem reforço visual na borda — achado confirmado nesta task) |
| Sucesso | Borda com `--color-success`, quando aplicável (uso pontual, ex. campo validado em tempo real) |
| Disabled | Opacidade reduzida, cursor não permitido (mantido) |
| Focus | Anel visível (mantido, migra a cor para `--color-primary`) |

`Textarea` vira um componente próprio (`Textarea.vue`, já identificado como necessário na
`TASK-0020`) em vez de continuar reescrito inline — mesmo conjunto de estados do input de texto.

## Decisão: Select (§24, §58)

**Problema**: os selects nativos hoje são reescritos inline em cada formulário (mesma classe
Tailwind copiada repetidamente), mas a SPEC-003 §24 e a auditoria concordam que **não devem**
ser substituídos por um combobox customizado só por estética — a prioridade é acessibilidade >
facilidade de uso > consistência > comportamento previsível.

**Decisão** (sem alternativas reais aqui — a SPEC já resolve a questão de fundo, só falta a
aplicação): criar um componente `Select.vue` que **envolve** o `<select>` nativo do navegador
com a aparência visual já usada hoje (`border-gray-300 focus:border-indigo-500...`, migrada para
os tokens desta etapa), sem substituir o comportamento nativo por JavaScript customizado. Isso
resolve a repetição de código (critério de reutilização, `TASK-0020`) sem violar a regra de
prioridade do §24 — não é uma decisão entre alternativas reais de UX (não há disputa sobre isso
na SPEC), é a aplicação direta de uma regra já fixada, análoga a como o próprio §54 diferencia
"regra já prescrita" de "decisão a ser tomada".

## Checkbox, Radio, Switch (§25)

| Componente | Regra de uso | Situação hoje |
|---|---|---|
| `Checkbox` | Selecionar múltiplas opções (ex. grade de disponibilidade — cada período é independente) | **Não existe como componente** — `<input type="checkbox">` cru, sem wrapper de label formal (achado novo desta task). Vira componente, mantendo o elemento nativo por baixo (mesma lógica do Select — acessibilidade não se sacrifica por estética), só com label pareado e estilo consistente. |
| `Radio` | Escolher uma opção entre várias | Não há uso de radio em nenhuma tela hoje — padrão definido preventivamente, para quando a necessidade aparecer (não inventa um uso que não existe ainda). |
| `Switch` | Ativar/desativar uma configuração | Não existe hoje — a ativação de notificações (`profile/Edit.vue`) usa um botão de texto. Aplicação do `Switch` a esse caso específico é uma sugestão razoável (mais direto visualmente para "ligar/desligar"), não uma correção obrigatória — o botão de texto atual já funciona, não é um problema identificado pela auditoria. |

## Responsividade e touch target (§50, §49 — padrões da `TASK-0020`)

- **Botões**: mesma aparência em mobile/desktop; altura ajustada para garantir 44px de área de
  toque em qualquer contexto (hoje ~34–36px, pequeno ajuste necessário — não é uma mudança de
  variantes, só de padding vertical mínimo).
- **Inputs/Select/Textarea**: largura total (`w-full`) em mobile (já é o padrão hoje), largura
  conforme grid em desktop (já é o padrão hoje via `sm:grid-cols-2`).
- **Checkbox/Radio/Switch**: área de toque mínima 44×44px ao redor do controle visual (que pode
  continuar menor visualmente, ex. 20×20px), consistente com a regra geral da `TASK-0020`.

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §21, §21.1, §22, §23, §24, §25, §52
  (Button, IconButton, Input, Select, Textarea, Checkbox, Radio, Switch, Label).
- `TASK-0017`, `TASK-0018`, `TASK-0019`, `TASK-0020`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `PrimaryButton.vue`,
  `SecondaryButton.vue`, `DangerButton.vue` e `TextInput.vue` confirmou a divergência entre o
  `PrimaryButton` oficial (cinza-escuro) e o indigo já usado de fato no resto do sistema
  (achado da `TASK-0017`) — resolvida migrando `Primary` para a cor definitiva. Achado novo
  confirmado: não existe nenhum componente de checkbox (`<input type="checkbox">` cru em
  `availability/Form.vue`), nem uso de radio em nenhuma tela, nem switch binário (notificações
  usa botão de texto). Decisão do Select registrada como aplicação direta de regra já fixada
  pela SPEC (não uma escolha entre alternativas reais) — envolve o `<select>` nativo num
  componente, sem trocar o comportamento por JS customizado. Hierarquia de botões reaproveitou
  o exemplo já decidido na `TASK-0009` (Etapa 4 do ScaleForm) em vez de inventar um novo.
  Touch target de 44px aplicado a todos os controles, com nota de que os botões atuais
  (~34–36px) precisam de ajuste de padding. Task marcada `concluida`. Próximo passo:
  TASK-0022 (componentes de feedback e overlays) já está elegível.
