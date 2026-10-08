---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0134 — Coordenação por comunidade: Substituições no menu e na rota

**Task ID**: `TASK-0134`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Item "Substituições" no menu (sidebar e "Mais") para coordenador de comunidade; guard do router com `meta.allowCommunityCoordinator` em `/substituicoes`.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0131`, `TASK-0133` (store de auth).

## Critérios de conclusão

- [x] Coordenador de comunidade acessa Substituições e aprova as da sua comunidade.
- [x] Servidor comum sem vínculo continua sem acesso.
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
- 2026-10-08 — Executada. Commit: `6f4eedd`.

  **Menu**: em `AuthenticatedLayout.vue`, o grupo "Escalas" do servidor ganha o item
  "Substituições" quando `auth.isCommunityCoordinator`. O grupo também fica ativo em
  `/substituicoes`. O "Mais" do mobile deriva de `navGroups`, então recebe o item sozinho.

  **Router**: `/substituicoes` mantém `roles: ['admin','coordenador']` e ganha
  `allowCommunityCoordinator: true`. O guard libera a rota quando a flag está ligada e o usuário
  coordena alguma comunidade. A página não precisou mudar, porque a API já filtra pelas comunidades
  (`TASK-0131`).

  **Verificação** (banco temporário + preview; substituição pendente criada na Matriz):
  - Xênia a 1100px claro: menu Dashboard/Escalas (Minha Escala, Disponibilidade,
    **Substituições**). A página lista só a da Matriz. "Ver sugestões" → "Aprovar com este" →
    modal "Aprovar" → "Substituição aprovada!" e "Nenhuma substituição pendente". No banco:
    `aprovada`, Zeca `confirmado`.
  - Xênia a 375px escuro: "Mais" → Substituições/Perfil/Sair.
  - Yuri: sem o item no menu; `/substituicoes` direto → dashboard com "Você não tem permissão".
  - `npm run build` e `npm test` passam.
