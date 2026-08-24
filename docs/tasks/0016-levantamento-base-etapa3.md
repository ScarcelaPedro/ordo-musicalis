---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0016 — Levantamento de base para a Etapa 3

**Task ID**: `TASK-0016`

## Objetivo

[`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) §1 é explícita: a Etapa 3 "NÃO deve voltar a
discutir a arquitetura estrutural do sistema, salvo quando for identificado algum problema grave
durante a aplicação visual" — o trabalho aqui é "transformar os wireframes aprovados da Etapa 2
em uma interface moderna, consistente, acessível e responsiva". Por isso, esta task confirma que
os entregáveis da Etapa 2 (`TASK-0015`) estão de fato concluídos e prontos para servir de base, e
levanta os achados visuais relevantes já apontados por `auditoria-ux.md` que o Design System
precisa endereçar diretamente: sombra/superfície repetitiva ("white + shadow + rounded" — §31),
selects nativos hoje em uso (considerados positivos para acessibilidade — §24), uso atual de
ícones, chips/textos ~10px (§12), e a stack existente que o Design System precisa respeitar
(Vue 3, Tailwind — §55).

## Dependências

- `TASK-0015` — Etapa 2 (wireframes) precisa estar concluída; a Etapa 3 parte dela, não a refaz.

## Critérios de conclusão

- [x] Confirmado que `TASK-0015` está `concluida` e que o documento consolidado da Etapa 2
      (`docs/ux-wireframes-etapa2.md`, produzido por ela) está disponível como base.
- [x] Achados de `auditoria-ux.md` relevantes ao Design System (não à arquitetura/UX já
      resolvidas nas Etapas 1–2) resumidos: uso repetitivo de sombra/card, selects nativos
      atuais, textos/chips pequenos, ausência de tokens/paleta consistente hoje.
- [x] Stack existente confirmada (`Vue 3`, `Tailwind CSS`, `@tailwindcss/forms` — ver
      `tailwind.config.js`, `docs/arquitetura.md` §3/§10) como restrição de compatibilidade
      (SPEC-003 §55) para todas as tasks seguintes.
- [x] Resultado registrado de forma reutilizável pelas TASK-0017 a TASK-0027.

## Confirmação da base (Etapa 2)

- `TASK-0015`: `status: concluida` (confirmado no frontmatter do arquivo).
- `docs/ux-wireframes-etapa2.md`: existe e está publicado (16 KB), consolidando os 4 fluxos, as
  9 telas com wireframe e as 3 decisões explícitas da Etapa 2 — base para as telas de referência
  da `TASK-0026`.
- Nenhum problema arquitetural grave foi identificado durante a Etapa 2 que justificasse reabrir
  a Etapa 1 (SPEC-003 §1) — a única exceção prevista pela SPEC não se aplica aqui.

## Achados de `auditoria-ux.md` relevantes ao Design System (não à UX/arquitetura já resolvida)

Da seção "5. Auditoria de UI" e "11. Componentes existentes" do relatório (já lido na íntegra
na `TASK-0006`, revisitado aqui com foco visual):

- **Cores**: paleta hoje é 100% padrão do Tailwind (`tailwind.config.js` não estende nada) —
  nenhuma cor customizada existe ainda. O mapeamento semântico via `Badge`/`STATUS_COLORS`
  (verde=confirmado, amarelo=pendente, vermelho=recusado/erro, azul=informativo,
  roxo=vínculo fixo/categorias) já é consistente e deve ser a base da paleta semântica da
  `TASK-0017`, não descartado.
- **Tipografia**: fonte padrão sans-serif do Tailwind em toda a aplicação, com uma única
  exceção — `liturgia/Show.vue` importa Google Fonts (EB Garamond + Playfair Display) para
  imitar um missal impresso, criando uma "ilha visual" isolada do resto do sistema. A `TASK-0017`
  (direção visual) precisa decidir explicitamente se estende essa linguagem editorial ou a
  mantém isolada — decisão real, não uma escolha óbvia.
- **Espaçamento/sombra/superfície**: o "cartão padrão" (`bg-white shadow-sm rounded-lg p-6`) é
  repetido dezenas de vezes, sempre no mesmo nível de sombra — sensação "achatada", sem
  hierarquia de profundidade. Confirma diretamente a necessidade dos níveis de elevação da
  SPEC-003 §15 (`TASK-0019`).
- **Cards**: card branco com sombra suave é o container universal, usado tanto para uma lista de
  50 itens quanto para um único KPI — sem diferenciação por tipo de conteúdo. Base do achado
  citado na SPEC-003 §31 ("white + shadow + rounded" repetitivo).
- **Botões**: `PrimaryButton`/`SecondaryButton`/`DangerButton` já são consistentes (já
  aproveitados como base na `TASK-0007`, Etapa 2) — mas várias telas recriam botões inline com
  classes Tailwind copiadas em vez de um `TertiaryButton`/`HeaderButton` reutilizável. Relevante
  para a `TASK-0021`.
- **Inputs**: `TextInput` é consistente; **selects e textareas nativos nunca usam um
  componente próprio** — são reescritos inline em quase todo formulário, apesar do padrão
  visual já estar de fato definido. A auditoria classifica isso como positivo para
  acessibilidade e recomenda **não** substituir por combobox customizado — confirma
  diretamente a regra da SPEC-003 §24, já refletida na `TASK-0021`.
- **Ícones**: só SVGs inline copiados manualmente (seta, hambúrguer, sol/lua/monitor, plus), sem
  biblioteca de ícones e sem estilo unificado declarado. Base direta da `TASK-0020` (§44/§45).
- **Modo escuro**: implementado pela metade — o chrome (navbar/sidebar/inputs) tem classes
  `dark:` completas, mas o conteúdo de quase toda página autenticada não tem nenhum par `dark:`.
  Isso é relevante porque a SPEC-003 §9 pede tokens semânticos "prontos para dark mode" — a
  base de tokens da `TASK-0017` precisa ser desenhada considerando que o dark mode já existe
  parcialmente no sistema (não é um recurso a inventar do zero, é um recurso a **completar** no
  código, fora do escopo desta etapa, mas os tokens precisam já prever isso).
- **Menus/navegação**: 3 padrões de navegação coexistindo hoje (barra horizontal, sidebar
  deslizante, dropdown mobile duplicado) — já tratado na Etapa 1 (`TASK-0002`/`TASK-0004`) e
  será vestido visualmente na `TASK-0024`, não redecidido aqui.

## Stack existente confirmada (restrição de compatibilidade, SPEC-003 §55)

Confirmado em `package.json`: Vue `^3.4.29` (Composition API, `<script setup>`), Vue Router
`^4.3.3`, Pinia `^2.1.7`, Tailwind CSS `^3.4.4`, `@tailwindcss/forms` `^0.5.7`. Nenhum framework
de UI de componentes (sem Vuetify/PrimeVue/shadcn) — todo componente é escrito à mão, confirmado
por `auditoria-ux.md` §1. O Design System das TASK-0017 a 0027 precisa ser implementável sobre
essa stack exata, sem propor troca de framework, adição de biblioteca de UI desnecessária, ou
qualquer mudança de infraestrutura (SPEC-003 §55, §59).

## Referências

- [`docs/specs/SPEC-003.md`](../specs/SPEC-003.md) — §1, §55.
- `docs/tasks/0015-consolidacao-etapa2.md` e o documento que ela produz.
- `auditoria-ux.md` (raiz do repositório).
- [`docs/arquitetura.md`](../arquitetura.md) §3, §10 (stack atual).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-003.
- 2026-08-21 — Task reivindicada e executada. Confirmado que `TASK-0015` (Etapa 2) está
  concluída e que `docs/ux-wireframes-etapa2.md` existe como base. Achados de `auditoria-ux.md`
  relevantes ao Design System resumidos (paleta 100% padrão do Tailwind hoje, ilha tipográfica
  isolada em `liturgia/Show.vue`, sombra/card repetitivo, selects nativos a preservar, ausência
  de biblioteca de ícones, dark mode implementado só no chrome). Stack confirmada em
  `package.json`: Vue `^3.4.29`, Vue Router `^4.3.3`, Pinia `^2.1.7`, Tailwind `^3.4.4`,
  `@tailwindcss/forms` `^0.5.7`, sem biblioteca de UI. Task marcada `concluida`. Próximo passo:
  TASK-0017 (direção visual e paleta de cores) já está elegível.
