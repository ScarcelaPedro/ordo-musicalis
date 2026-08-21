---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0005 — Consolidação da Arquitetura da Interface (Etapa 1) e validação dos critérios de aceite

**Task ID**: `TASK-0005`

## Objetivo

Consolidar os entregáveis das TASK-0002, TASK-0003 e TASK-0004 em um único documento de
arquitetura da interface, validar integralmente os critérios de aceite da seção 20 da
[`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) (Navegação, Organização, Perfis, Mobile,
Consistência) e confirmar que a etapa não ultrapassou o escopo definido nas seções 19 e 22 (nenhuma
alteração de banco, API, permissões ou regras de negócio, e nenhuma implementação frontend real —
esta etapa é exclusivamente de arquitetura/documentação).

## Dependências

- `TASK-0002` — mapa de navegação e matriz de acesso.
- `TASK-0003` — fluxos de navegação por perfil.
- `TASK-0004` — recomendações desktop/tablet/mobile.

## Critérios de conclusão

- [x] Documento único consolidando mapa de navegação, matriz de acesso, fluxos de navegação e
      recomendações desktop/tablet/mobile, publicado em `docs/` (ex.
      `docs/arquitetura-interface.md`), referenciado a partir de
      [`docs/arquitetura.md`](../arquitetura.md) quando fizer sentido.
- [x] Todos os itens da checklist da seção 20 da SPEC-001 (Navegação, Organização, Perfis,
      Mobile, Consistência) revisados e marcados como atendidos, cada um com referência à parte
      do documento consolidado que o satisfaz.
- [x] Confirmação explícita registrada de que nada do listado na seção 19 da SPEC-001 (regras de
      negócio, banco de dados, permissões, APIs, funcionalidades removidas ou inventadas, redesign
      visual) foi alterado durante a etapa.
- [x] Confirmação explícita registrada de que nada do listado na seção 22 da SPEC-001 (fora do
      escopo) foi produzido além do previsto — em particular, que nenhuma implementação frontend
      real foi feita nesta etapa.
- [x] Resultado esperado da seção 23 da SPEC-001 (respostas diretas a "onde vou/encontro X" para
      cada perfil) verificável diretamente no documento consolidado.

## Resultado

Documento consolidado publicado em [`docs/arquitetura-interface.md`](../arquitetura-interface.md),
referenciado a partir de [`docs/arquitetura.md`](../arquitetura.md) (seção 9 — "Escalabilidade /
evolução futura"). Estrutura do documento:

1. Mapa de navegação (de `TASK-0002`)
2. Matriz de acesso por perfil (de `TASK-0002`)
3. Fluxos de navegação — servidor, coordenador, acesso contextual vs. global (de `TASK-0003`)
4. Recomendações desktop/tablet/mobile (de `TASK-0004`)
5. Verificação item a item da checklist da SPEC-001 §20 (Navegação, Organização, Perfis, Mobile,
   Consistência) — todos os itens confirmados, cada um com referência à seção do documento que o
   sustenta.
6. Confirmação explícita de escopo: nada da SPEC-001 §19 (regra de negócio, banco, permissões,
   API, funcionalidade removida/inventada, redesign visual) foi alterado; nada da SPEC-001 §22
   (fora do escopo, em especial implementação frontend real) foi produzido além do previsto —
   todo o trabalho da Etapa 1 resultou só em documentos Markdown.
7. Tabela de resposta às 7 perguntas da SPEC-001 §23 ("onde vou/encontro X"), cada uma apontando
   para a seção do mapa/fluxo que a responde.

Único ponto que fica registrado como **exceção não resolvida** (não um bloqueio da Etapa 1, mas
algo que a checklist "Navegação" §20 pede olhando com cuidado): o critério "não existem
funcionalidades importantes acessíveis somente por caminhos indiretos" está satisfeito **na
arquitetura proposta** (mapa dá a Substituições/Recorrências/Relatórios/Intensidade uma entrada
de primeira classe), mas **não na implementação atual do menu** (`AuthenticatedLayout.vue`
continua com a lista antiga, sem esses itens). Isso é esperado — corrigir o menu é
"implementação frontend", explicitamente fora do escopo desta etapa (SPEC-001 §22) — mas fica
registrado aqui para não ser lido como "já resolvido no sistema real".

## Referências

- [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) — seções 19, 20, 21, 22, 23.
- `TASK-0002`, `TASK-0003`, `TASK-0004`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-001.
- 2026-08-21 — Task reivindicada e executada. Consolidado `docs/arquitetura-interface.md` a
  partir das TASK-0002/0003/0004, referenciado em `docs/arquitetura.md` (seção 9). Todos os
  itens da checklist SPEC-001 §20 confirmados; confirmação de escopo (§19/§22) registrada —
  nenhuma regra de negócio, banco, permissão, API ou implementação frontend foi alterada durante
  a Etapa 1, só documentos Markdown. Tabela de respostas às 7 perguntas da §23 incluída. Uma
  ressalva foi registrada explicitamente (não como pendência desta task, mas como leitura
  correta do resultado): o critério "sem caminhos indiretos" da SPEC vale para a arquitetura
  *documentada*, não para o menu real do sistema hoje — corrigir o menu é implementação
  frontend, fora do escopo desta etapa. Task marcada `concluida`.
  **Encerramento do programa (Etapa 1 / SPEC-001)**: TASK-0001 a TASK-0005 estão todas
  `concluida`, nenhuma `adiada` ou `parcialmente-concluida` pendente — a Etapa 1 está encerrada
  sem exceção pendente. Próxima etapa do roadmap (implementação real do menu reestruturado, e
  a Etapa 2 — UX/Wireframes, `docs/specs/SPEC-002.md`) não tem tasks próprias criadas ainda.
