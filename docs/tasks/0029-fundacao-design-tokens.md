---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0029 — Fundação: design tokens (Tailwind)

**Task ID**: `TASK-0029`

## Objetivo

Implementar no código os design tokens definidos em `docs/design-system.md` (paleta, tipografia,
espaçamento, radius, elevação, breakpoints) como extensão de `tailwind.config.js`, primeira
peça da Fase 1 (Fundação) de [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) §6/§7. Hoje
`tailwind.config.js` não estende nada — todo o sistema usa a paleta/escala padrão do Tailwind
(confirmado em `docs/tasks/0016-*.md`).

## Arquivos/componentes envolvidos

- `tailwind.config.js` — `theme.extend.colors`, `theme.extend.fontFamily`,
  `theme.extend.fontSize`, `theme.extend.spacing` (se necessário além do padrão),
  `theme.extend.borderRadius`, `theme.extend.boxShadow`, `theme.extend.screens`.
- `index.html` ou `src/assets/app.css` — import da fonte Inter (self-hospedada ou Google Fonts,
  decisão de implementação; registrar em `docs/decisions/` se houver mais de uma opção real
  avaliada, regra 2 do `AGENTS.md` raiz).
- `src/assets/app.css` — variáveis CSS (`--color-*`) se a estratégia de tema escolhida
  (`darkMode: 'class'`, já configurado) precisar delas para dark mode futuro.

## Comportamento esperado

Nenhuma mudança visual perceptível nesta task isoladamente (os tokens ficam disponíveis, mas
nenhuma tela ainda os usa — isso acontece nas tasks seguintes). Cores semânticas
(`primary`/`secondary`/`accent`/`success`/`warning`/`danger`/`info`) e escala tipográfica
disponíveis como classes Tailwind (`bg-primary-600`, `text-display`, etc., ou nomenclatura
equivalente decidida na implementação).

## Dependências

Nenhuma (primeira task de implementação).

## Critérios de conclusão

- [x] Paleta semântica completa (`docs/design-system.md` §2) disponível em
      `tailwind.config.js`, incluindo a distinção entre paleta de UI e as cores litúrgicas já
      existentes em `Dashboard.vue` (`CORES_LITURGICAS_CLASSES`) — não substituídas, mantidas
      como categoria separada.
- [x] Fonte Inter carregada e aplicada como `font-sans` padrão; fonte serif (EB Garamond/
      Playfair Display, já usada em `liturgia/Show.vue`) preservada como token separado, sem
      regressão na tela de Liturgia.
- [x] Escala tipográfica de 9 níveis disponível (`docs/design-system.md` §3).
- [x] Escalas de espaçamento, radius e elevação disponíveis — **decisão de implementação**: não
      sobrescritas em `tailwind.config.js`, ver seção "Decisão de implementação" abaixo.
- [x] Breakpoints alinhados à `TASK-0019`/Tailwind padrão — não sobrescritos, mesmo motivo.
- [x] `npm run build` passa sem erros (verificado após instalar Node.js/npm neste ambiente, que
      não os tinha — ver Notas de progresso).
- [x] Nenhuma tela existente quebrou (build de produção completo, 199 módulos, sem erro de
      `vue-tsc`; smoke test do `npm run dev` respondendo HTTP 200 na raiz).

## Decisão de implementação: não sobrescrever spacing/radius/boxShadow/screens

Ao implementar, confirmei que os valores de espaçamento, radius, sombra e breakpoints que
`docs/design-system.md` pede **já são os valores padrão do Tailwind** (conclusão da própria
`TASK-0019`: "a mudança é de regra, não de valor técnico novo"). Sobrescrever esses eixos em
`theme.extend` teria mudado silenciosamente a aparência de todo uso existente de `rounded-md`
(88 ocorrências), `rounded-lg` (75), `shadow-sm` (114) e da escala de espaçamento (`p-4`/`p-6`/
`space-y-6`, 28+ ocorrências) — uma regressão visual ampla e não intencional, contrária à regra
de "não alterar comportamento sem necessidade" (SPEC-004 §3). Por isso `tailwind.config.js`
estende só o que é genuinamente novo e aditivo: `colors` (novos nomes, não substituem `gray`/
`red`/etc.), `fontFamily` (mudança intencional de `sans`, é o próprio objetivo da task) e
`fontSize` (nomes novos como `text-display`/`text-h1`, não removem `text-xs`/`text-sm`
existentes).

## Riscos

- Import de fonte externa (Google Fonts) pode exigir CSP/allowlist se o projeto tiver alguma
  restrição de rede em produção (Vercel) — verificar antes de assumir que funciona sem ajuste.
- Se a decisão for auto-hospedar a fonte, aumenta o peso do bundle — avaliar impacto (SPEC-004
  §52, performance visual).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §6, §7.
- [`docs/design-system.md`](../design-system.md) — seções 2–6.
- `docs/tasks/0017-*.md`, `0018-*.md`, `0019-*.md`.

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada. **Bloqueio de ambiente encontrado**: Node.js/npm não estavam
  instalados nesta máquina — impossível rodar `npm run build`/`npm run dev` para validar. Com
  autorização do usuário, instalei Node.js LTS (24.19.0) via `winget install
  OpenJS.NodeJS.LTS`. Registrada a decisão de mapeamento de cores em
  `docs/decisions/0001-mapeamento-tokens-cor-tailwind.md` (cada token semântico é um alias de
  família Tailwind já existente — `primary`→indigo, `secondary`/`neutral`→stone, `accent`→amber,
  `success`→green, `warning`→yellow, `danger`→red, `info`→blue — escolhido para preservar
  continuidade visual com o `Badge.vue` atual e reaproveitar o indigo já usado de fato no
  sistema). `tailwind.config.js` estendido com `colors`/`fontFamily`/`fontSize`; import da
  fonte Inter adicionado em `src/assets/app.css` (mesmo padrão de `@import` já usado em
  `liturgia/Show.vue` para a fonte serif). Decisão de **não** sobrescrever spacing/radius/
  boxShadow/screens, para não regredir visualmente o uso já existente desses valores padrão do
  Tailwind (documentado na task). `npm run build` executado com sucesso (199 módulos, sem erro
  de tipo); `npm run dev` testado com smoke test HTTP (200 na raiz). Build de verificação
  gerou artefatos em `dist/` (diretório versionado neste repo) — descartados via `git checkout
  -- dist/` + `git clean -f dist/`, já que não é objetivo desta task atualizar o build
  publicado. Task marcada `concluida`. Próximo passo: TASK-0030 (componentes de controles
  interativos) já está elegível.
