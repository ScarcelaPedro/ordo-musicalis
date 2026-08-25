---
status: concluida
modulo: src/layouts
owner: Pedro Scarcela
criado-em: 2026-08-24
---

# 0035 — Navegação mobile (bottom nav)

**Task ID**: `TASK-0035`

## Objetivo

Substituir o dropdown mobile atual pela navegação inferior (bottom nav) diferenciada por
perfil, já decidida em `docs/tasks/0004-recomendacoes-desktop-tablet-mobile.md` (Etapa 1) e
especificada visualmente em `docs/tasks/0024-navegacao-visual.md` (Etapa 3). Elimina também a
duplicação de lista de navegação entre desktop/mobile que o próprio comentário no código
(`AuthenticatedLayout.vue:16-17`) já reconhece como problema.

## Arquivos/componentes envolvidos

- `src/layouts/AuthenticatedLayout.vue` — remover o dropdown mobile (`mobileMenuOpen`), adicionar
  bottom nav fixo.

## Comportamento esperado

```text
Servidor:      Início │ Minha Escala │ Disponibilidade │ Mais
Coordenador:   Início │ Escalas │ + (Nova escala) │ Mais
```

"Mais" abre o `Drawer` (`TASK-0031`) com o restante dos itens do perfil. Bottom nav só aparece
abaixo do breakpoint mobile (`< 768px`); some em tablet/desktop, onde a sidebar (`TASK-0034`)
assume.

## Dependências

- `TASK-0034` — layout global e `navItems` reestruturado (fonte única de dados de navegação,
  resolvendo a duplicação).
- `TASK-0031` — `Drawer`.

## Critérios de conclusão

- [x] Dropdown mobile antigo removido, sem código morto deixado para trás.
- [x] Bottom nav implementado com os itens exatos já decididos por perfil (nenhum item novo
      inventado).
- [x] Item ativo indicado por mais de um sinal (cor + preenchimento do ícone solid/outline).
- [x] "Mais" abre o `Drawer` com o restante dos itens, sem itens duplicados entre a barra
      principal e o "Mais".
- [x] Fonte única de dados de navegação usada tanto pela sidebar (`TASK-0034`) quanto pelo
      bottom nav — nenhuma lista mantida duplicada manualmente.
- [x] `npm run build` passa sem erros.
- [~] Testado manualmente em pelo menos 2 larguras de tela mobile (celular pequeno e grande,
      SPEC-004 §50) logado como `musico` e como `coordenador` — **não executado**: mesma
      limitação já registrada na `TASK-0034` (sem ferramenta de automação de navegador neste
      ambiente). Verificado por leitura de código/lógica; confirmação visual em dispositivo real
      fica pendente para o usuário.

## Riscos

- Remover o dropdown mobile é uma mudança estrutural visível a todo usuário mobile — se algo
  quebrar, o impacto é imediato e amplo. Preferir testar em uma branch/preview antes de
  considerar a migração desta área concluída (SPEC-004 §53, migração incremental).

## Referências

- [`docs/specs/SPEC-004.md`](../specs/SPEC-004.md) — §11, §12, §13, §15.
- `docs/tasks/0004-recomendacoes-desktop-tablet-mobile.md`,
  `docs/tasks/0024-navegacao-visual.md` (especificação completa).

## Notas de progresso

- 2026-08-24 — Task criada a partir da decomposição da SPEC-004.
- 2026-08-24 — Task reivindicada e executada. `mobileMenuOpen` e todo o dropdown/hambúrguer
  mobile removidos de `AuthenticatedLayout.vue` (nenhum resquício deixado). Bottom nav fixo
  adicionado (`< 768px`, `md:hidden`): staff = Início/Escalas/+ (Nova escala, círculo elevado
  ligando a `/escalas/criar`)/Mais; servidor = Início/Minha Escala/Disponibilidade/Mais —
  exatamente o texto já decidido na `TASK-0004`, sem inventar item novo. Item ativo com 3 sinais
  (cor `primary`, ícone solid/outline, peso `font-semibold`). "Mais" abre `Drawer` (`side="bottom"`)
  com `moreNavGroups` — computed que **deriva** de `navGroups` (a mesma fonte usada pela sidebar
  da `TASK-0034`) filtrando os itens já presentes na barra principal, mais os links fixos de
  Perfil/Sair (que já existiam soltos na topbar, não duplicados de lugar nenhum). Não há lista
  de navegação mobile mantida à mão em paralelo — só filtragem sobre a fonte única. Confirmado
  por leitura de código: para servidor, `moreNavGroups` resulta vazio (Minha Escala/
  Disponibilidade já estão na barra principal), sobrando só Perfil — igual ao secundário
  descrito na `TASK-0004`; para staff, sobra Pessoas/Substituições/Recorrências/Disponibilidade
  painel/Análises/Configurações, também batendo com a task de origem. Adicionado `pb-24 md:pb-12`
  no container de conteúdo para o bottom nav fixo não sobrepor o final da página. `npm run build`
  passou sem erros; `dist/` restaurado. `git status` confirmou que só `AuthenticatedLayout.vue`
  mudou entre arquivos de tela/layout. Teste manual em 2 larguras mobile logado como `musico`/
  `coordenador` **não executado** — mesma limitação de ambiente já registrada na `TASK-0034` (sem
  ferramenta de automação de navegador aqui); paridade de itens por perfil verificada por leitura
  de código, não visualmente. Task marcada `concluida` com essa ressalva registrada. Próximo
  passo: `TASK-0036` (Topbar) já está elegível.
