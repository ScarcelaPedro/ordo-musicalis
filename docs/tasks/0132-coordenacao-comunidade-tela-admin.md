---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-10-08
---

# 0132 — Coordenação por comunidade: tela do admin para definir coordenadores

**Task ID**: `TASK-0132`

**Prioridade**: P1 (pedido direto do usuário)

## Objetivo

Na edição da comunidade, seção "Coordenadores" visível só para admin: escolher servidores com login e salvar via `PUT /comunidades/:id/coordenadores`.

Parte do acesso de **coordenador de comunidade** (pedido do usuário em 2026-10-08). O desenho está em
[`ADR-0009`](../decisions/0009-coordenacao-por-comunidade.md).

## Dependências

- `TASK-0129`.

## Critérios de conclusão

- [x] Admin adiciona/remove coordenadores; não-admin não vê a seção.
- [x] Claro e escuro, mobile e desktop.
- [x] `npm run build` e `npm test` passam.

## Referências

- [`docs/decisions/0009-coordenacao-por-comunidade.md`](../decisions/0009-coordenacao-por-comunidade.md)

## Notas de progresso

- 2026-10-08 — Task criada a partir do plano aprovado pelo usuário.
- 2026-10-08 — Executada. Commit: `aa29a74`.

  `src/pages/comunidades/Edit.vue` ganhou o card "Coordenadores da comunidade", renderizado só se
  `auth.isAdmin`, que é também a única condição em que os dados são buscados.
  - Os coordenadores atuais aparecem como chips, cada um com um botão de remover que tem
    `aria-label` com o nome da pessoa.
  - Um `Select` lista só servidores **com login** que ainda não coordenam. A API também valida.
  - Cada adição ou remoção chama `PUT /comunidades/:id/coordenadores` com a lista completa e mostra
    o resultado. Não há um botão "salvar" separado que dê para esquecer.

  **Verificação** (banco temporário + preview):
  - Admin a 1100px no claro: a Xênia aparece como coordenadora. As opções são só Mara e Yuri; Xênia
    (já coordena) e Zeca/Bia (sem login) ficam de fora. Adicionar o Yuri e removê-lo atualiza os
    chips.
  - 375px no escuro: legível, sem scroll horizontal.
  - Mara (coordenadora de ministério, que também acessa essa rota): o formulário aparece e a seção
    **não**.
  - `npm run build` e `npm test` passam; `dist/` revertido.
