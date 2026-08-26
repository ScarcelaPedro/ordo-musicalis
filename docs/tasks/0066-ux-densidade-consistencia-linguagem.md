---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0066 — Nível 3: UX de densidade, scannability, consistência entre telas e linguagem

**Task ID**: `TASK-0066`

## Objetivo

Avaliar equilíbrio de densidade de informação (SPEC-005 §43), capacidade de "passar o olho" e
localizar o essencial (§44), consistência entre telas estruturalmente semelhantes (§45), e a
qualidade da linguagem/microcopy da interface (§46-47).

## Escopo

Pares de telas semelhantes: `scales/Create.vue` vs. `scales/Edit.vue`; e os mesmos pares em
`categorias`, `celebrantes`, `comunidades`, `teams`, `scaleTemplates`. Todo texto de interface
(botões, labels, mensagens, confirmações, empty states, erros) nas telas já revisadas nas
tasks `TASK-0057` a `TASK-0065`.

## Metodologia

Teste de densidade (§43): para as telas mais carregadas (`ScaleForm` Etapa 2, `scales/Show.vue`)
e as mais vazias (listagens com poucos itens), perguntar se há informação demais ou espaço
demais — sem reduzir informação só para parecer minimalista.

Teste de scannability (§44): verificar uso de títulos, agrupamentos, badges, hierarquia,
espaçamento e alinhamento para permitir localizar informação rapidamente, evitando blocos
homogêneos de texto.

Teste de consistência (§45): comparar cada par Criar/Editar — devem compartilhar componentes,
estrutura, linguagem e ações; qualquer divergência não justificada por uma diferença real de
regra de negócio é um achado.

Linguagem (§46) e microcopy (§47): revisar se os textos são simples, diretos, humanos,
consistentes e adequados ao contexto — evitando jargão técnico; para cada texto de botão, label,
mensagem, confirmação, empty state ou erro, perguntar "esse texto ajuda o usuário a tomar uma
decisão?"; se não, é um achado de simplificação.

## Dependências

- `TASK-0056` — Etapa 4 concluída.
- `TASK-0057` — inconsistências visuais já levantadas ajudam a evitar duplicar achados aqui.

## Critérios de conclusão

- [x] Densidade avaliada em pelo menos 2 telas carregadas e 2 telas esparsas.
- [x] Scannability avaliada nas listagens principais.
- [x] Todos os pares Criar/Editar comparados quanto a componentes, estrutura, linguagem e ações.
- [x] Linguagem/microcopy revisada nos botões, labels, mensagens, confirmações, empty states e
      erros das telas já cobertas por `TASK-0057`-`0065`.
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- Baixo — validação observacional, não altera código.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §43-47, §53.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada por **comparação direta de código-fonte** entre os
  pares Criar/Editar, não em navegador — metodologia deliberada aqui: §45 pede consistência
  estrutural/textual, algo totalmente verificável e mais preciso lendo os dois arquivos lado a
  lado (mesmos componentes? mesma ordem de campo? mesmo texto?) do que inferindo de screenshots.
  Densidade (§43) e scannability (§44) reaproveitam evidência visual já coletada nas `TASK-0061`
  (`ScaleForm` Etapa 2) e `TASK-0063` (`scales/Show.vue`, com screenshot real inspecionado), sem
  repetir a captura.

  **Pares comparados**: `categorias`, `comunidades`, `celebrantes`, `teams` (`Create.vue` vs.
  `Edit.vue`, arquivos próprios e paralelos) e `scales`, `servidores`, `scaleTemplates`
  (`Create.vue`/`Edit.vue` finos, ambos delegando pro mesmo formulário compartilhado —
  `ScaleForm.vue`, `ServidorForm.vue`, `ScaleTemplateForm.vue` — consistência garantida por
  construção, não por disciplina manual).

  **Confirmado consistente, sem achado**: os 4 pares "arquivo duplicado" (`categorias`,
  `comunidades`, `celebrantes`, `teams`) são estruturalmente idênticos — mesma ordem de campo,
  mesmos componentes (`InputLabel`/`TextInput`/`PrimaryButton`/`SecondaryButton`), mesmo padrão
  de card (`bg-white shadow-sm rounded-lg p-6` → `space-y-6`), mesmos rótulos de botão ("Salvar"/
  "Cancelar"). Os 3 pares com formulário compartilhado herdam a mesma consistência
  automaticamente. `scaleTemplates` também tem uma boa microcopy inline: "Ativa (gera escalas
  automaticamente)" no checkbox e "Servidores escalados automaticamente sempre que essa
  recorrência gerar uma nova celebração" na seção de vínculos fixos — respondem "o que isso faz"
  sem exigir que o usuário pergunte.

  **Achado (P3) — mensagem de sucesso muda de fórmula entre Criar e Editar, sistematicamente.**
  Em **5 dos 6 pares** (celebrantes, categorias, comunidades, teams, scaleTemplates — todos
  exceto o par escalas, que usa texto próprio via `ScaleForm`), o `Create.vue` sempre usa
  "X criado(a) **com sucesso**!" e o `Edit.vue` correspondente sempre usa só "X atualizado(a)!"
  — sem o "com sucesso" (`celebrantes/Create.vue:21` vs. `celebrantes/Edit.vue:32`, e o mesmo
  padrão exato se repete nos outros 4). Não confunde o usuário (ambas comunicam sucesso
  claramente), mas é uma inconsistência de fórmula fácil de perceber se alguém usar os dois
  fluxos em sequência, e sistemática o bastante (5/6) pra não ser acaso — parece ter sido a
  fórmula padrão usada ao gerar cada tela individualmente, sem um "template de texto" único.
  Recomendação: padronizar pra "X atualizado(a) com sucesso!" nos 5 arquivos de Edit.

  **Achado (P3) — "Vínculos fixos" só existe em Editar Recorrência, não em Nova Recorrência.**
  `scaleTemplates/Edit.vue` tem uma seção inteira adicional ("Vínculos fixos" — servidores
  escalados automaticamente sempre que a recorrência gerar uma celebração) que
  `scaleTemplates/Create.vue` não tem de jeito nenhum. Diferente do padrão usado em
  `teams/Create.vue`, que já permite adicionar servidores durante a própria criação (array
  `servidores` no mesmo formulário). Pode ser uma decisão técnica legítima (o endpoint
  `/vinculos-fixos` exige um `scaleTemplateId` já existente), mas o efeito prático pro
  coordenador é um passo extra não óbvio: criar a recorrência, salvar, **depois** voltar e
  editar pra configurar quem sempre vai. Baixo impacto (a funcionalidade existe, só está um
  passo adiante do que seria ideal) — registrado pra avaliação na `TASK-0071` sobre se vale a
  pena juntar num único fluxo ou se é aceitável como está.

  **Densidade e scannability (§43-44) — sem achado novo**: `ScaleForm` Etapa 2 (revisão detalhada
  na `TASK-0061`) e `scales/Show.vue` (screenshot inspecionado na `TASK-0063`) já confirmaram bom
  equilíbrio — nem sobrecarregado nem espaçado demais, com agrupamento/badges/hierarquia
  cumprindo o papel de permitir "passar o olho".

  Nenhuma correção aplicada — nenhum arquivo de código tocado nesta task (`git status` já
  esperado limpo, confirmado). Task marcada `concluida`. Próximo passo: `TASK-0067`.
