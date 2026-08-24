---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0014 — Wireframes de Substituições (fluxo completo)

**Task ID**: `TASK-0014`

## Objetivo

[`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) exige, em §27 (Fluxo C), um wireframe completo
do fluxo de substituição (Escalas → Substituições → Solicitação → Ver sugestões → Selecionar
substituto → Confirmar, incluindo o estado "nenhum substituto encontrado"), mas não lista uma
tela de Substituições entre as prioridades numeradas do §25 (P1–P6).

Esta task preenche essa lacuna sem inventar escopo além do que o próprio §27 já exige — não é
uma prioridade nova decidida por esta task, é a execução de um requisito explícito da SPEC que
não foi listado entre as prioridades numeradas (divergência interna da própria SPEC-002, não
uma reinterpretação feita aqui).

## Dependências

- `TASK-0006` — estrutura real de `substitutions/Index.vue` hoje.
- `TASK-0007` — padrões transversais (estado vazio/sem resultado, confirmação) a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe da tela/fluxo de Substituições documentado com os campos do §26, cobrindo os
      passos do Fluxo C (§27): solicitação, ver sugestões, selecionar substituto, confirmar.
- [x] Estado "nenhum substituto encontrado" especificado, explicando o motivo e oferecendo um
      próximo passo — mesma lógica de transparência já usada no estado sem sugestões do
      `ScaleForm` (§7.6, ver `TASK-0009`).
- [x] Coerência com o que já existe hoje em `/substituicoes`
      (`substitutions/Index.vue`, mapeado nas `TASK-0001`/`TASK-0002` da Etapa 1) — preservando
      dados e regras de negócio existentes (§32), sem inventar campos/fluxos que o backend não
      suporta.

## Estrutura atual (releitura completa de `substitutions/Index.vue`, 134 linhas)

- Não existe uma etapa de "Solicitação" operada pelo usuário — confirmado já na `TASK-0003`
  (Etapa 1): a substituição é criada **automaticamente** quando um servidor clica "Não posso ir"
  (`api/_routes/scales.ts:270-293`). O coordenador já encontra a lista de solicitações prontas
  ao abrir `/substituicoes` — o "Fluxo C" do §27 começa, na prática, em "Ver sugestões".
- Cada substituição pendente é um cartão: celebração (link) + data/horário/ministério, "Titular:
  Nome · Instrumento", motivo da recusa (opcional), badge "Pendente", botões "Ver
  sugestões"/"Fechar" (expande/recolhe inline, sem navegar) e "Rejeitar" (usa `confirm()`
  nativo — um dos 12 usos já mapeados na `TASK-0006`).
- Sugestões aparecem inline ao expandir: loading, lista com nome+motivo+botão único "Aprovar com
  este" (**aprovação e confirmação são a mesma ação, sem etapa de confirmação distinta** — hoje
  um único clique já efetiva a troca), ou "Nenhum substituto sugerido para esse dia/horário"
  **sem explicar o motivo** — mesmo padrão de lacuna já identificado no `ScaleForm`
  (`TASK-0009`, §7.6): a API retorna sugestões positivas com `motivo`, mas não informa por que
  alguém foi excluído.
- Tela já é card-based, sem tabela — não tem o problema de largura das outras telas desta etapa.

## Wireframe: Substituições

- **Objetivo**: permitir ao coordenador resolver rapidamente uma recusa de presença, encontrando
  um substituto ou entendendo por que nenhum está disponível.
- **Usuário**: `admin`/`coordenador`.
- **Informação principal**: quantas substituições estão pendentes e há quanto tempo.
- **Ação principal**: aprovar um substituto sugerido.
- **Ações secundárias**: ver sugestões, rejeitar o pedido, abrir a escala original.
- **Estrutura**, mapeando os passos do Fluxo C (§27) ao que já existe:
  1. **Solicitação** — já existe, criada automaticamente (não é uma etapa de UI desta tela); o
     cartão de cada substituição pendente já representa esse estado.
  2. **Ver sugestões** — mantido como expansão inline (já funciona bem para uma lista
     tipicamente curta — mesma lógica já aplicada às categorias do `ScaleForm`, `TASK-0009`: não
     vale abrir uma camada nova/drawer quando o contexto já é pequeno).
  3. **Selecionar substituto** — clique em "Aprovar com este" (mantido).
  4. **Confirmar** — **novo passo, hoje inexistente**: em vez de "Aprovar com este" efetivar a
     troca imediatamente, abre o padrão de confirmação definido na `TASK-0007` — "Aprovar
     substituição? <Nome> vai substituir <Titular> em <Celebração>, <Data>. [Cancelar]
     [Aprovar]". Torna explícita a etapa que o §27 já pede como distinta, sem adicionar
     navegação nova (é o mesmo padrão de modal já definido para outras confirmações do sistema).
  5. **Rejeitar** — passa a usar o mesmo padrão de confirmação (substitui o `confirm()` nativo),
     em vez de um padrão próprio.
- **Estados**: pendente (badge amarela, já existe); sugestões carregando (já existe); sugestões
  vazias — ver decisão abaixo; aprovado/rejeitado (lista atualiza e o item some, já existe,
  reforçado por feedback de sucesso já existente).
- **Mobile/Desktop**: já é card-based e funciona em qualquer largura — nenhuma reestruturação
  responsiva necessária, diferente das outras telas desta etapa.
- **Navegação**: acessada pelo menu (Escalas → Substituições, conforme mapa de navegação da
  Etapa 1); leva a `Escala — Detalhes` (link na celebração, `TASK-0010`).

## Estado "nenhum substituto encontrado" (§27)

Mesma tabela de motivos já definida na `TASK-0009` (§7.6) para o `ScaleForm`, aplicada aqui —
é a mesma limitação de dado, não um problema novo:

| Motivo | Computável hoje? |
|---|---|
| Nenhum servidor com a categoria/função correspondente | Provavelmente sim, mesma lógica de filtro por categoria do `ScaleForm` — a confirmar contra `api/_routes/substituicoes.ts` na implementação. |
| Servidor indisponível naquele período | **Não** — mesma lacuna já registrada na `TASK-0009`; não existe cruzamento com `Availability` hoje. |
| Servidor já escalado no mesmo horário | **Não** — mesma lacuna. |

Mensagem-alvo: em vez de "Nenhum substituto sugerido para esse dia/horário", explicar o motivo
disponível (quando computável) e oferecer um próximo passo, ex. "Nenhum servidor com esta função
está disponível neste horário. [Adicionar substituto manualmente]" — o link "adicionar
manualmente" reaproveita a busca da Etapa 2 do `ScaleForm` (`TASK-0009`), já que aprovar uma
substituição, no fundo, é adicionar alguém à escala. A lógica de detecção que falta (2 dos 3
motivos) fica registrada como pendência de implementação, não resolvida nesta etapa (SPEC-002
§29).

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §27 (Fluxo C), §26, §32.
- `docs/tasks/0001-auditoria-rotas-funcionalidades-existentes.md`,
  `docs/tasks/0002-mapa-navegacao-matriz-acesso-perfil.md` (SPEC-001).
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `substitutions/Index.vue`
  (134 linhas) confirmou o achado da `TASK-0003`: não existe etapa de "Solicitação" operada pelo
  usuário (é automática). Mapeados os passos do Fluxo C (§27) ao que já existe, com uma mudança
  real de comportamento: "Aprovar com este" deixa de efetivar a troca num único clique e passa a
  abrir o padrão de confirmação da `TASK-0007`, tornando explícita a etapa "Confirmar" que o §27
  já pedia como distinta de "Selecionar substituto". Estado "nenhum substituto encontrado"
  reaproveitou exatamente a mesma tabela de motivos definida na `TASK-0009` para o `ScaleForm` —
  é a mesma limitação de dado (sem verificação de indisponibilidade/dupla escalação), não um
  problema novo. Mensagem-alvo agora oferece "adicionar substituto manualmente" como próximo
  passo, reaproveitando a busca já desenhada na Etapa 2 do `ScaleForm`. Task marcada `concluida`.
  Próximo passo: TASK-0015 (consolidação da Etapa 2) já está elegível — todas as suas
  dependências (TASK-0008 a 0014) estão concluídas.
