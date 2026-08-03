# Expansão: toda a equipe celebrativa, toda a Paróquia

## Objetivo

O sistema nasceu como facilitador só para os **músicos** da **Matriz**. Está sendo expandido para
cobrir:

1. Toda a **equipe celebrativa** de uma celebração: Padre, Músicos, Ministros da Comunhão, Acólitos e
   Coroinhas, Leitores, Comentarista — e qualquer outra função que surja no futuro.
2. Toda a **Paróquia**, incluindo todas as **Comunidades** (não só a Matriz).
3. A **agenda continua sendo a base do sistema**: ao clicar num dia, o usuário vê tudo daquela
   celebração — comunidade, celebrante e cada função com seus escalados.

Isso é uma **evolução do sistema atual, não uma reescrita**. Tudo que já existe (escalas,
disponibilidade, vínculo fixo, substituição, notificações push/WhatsApp, relatórios) continua
funcionando — só passa a valer para qualquer função/comunidade, não só música/Matriz.

## Decisões já tomadas

- **"Músico" → "Servidor(a)"**: renomeação de verdade em todo o sistema (banco de dados, rotas de
  API, telas) — não é só troca de rótulo.
- **Ministérios são únicos por paróquia**: não existe "Coral da Matriz" separado de "Coral da
  Comunidade X" — é o mesmo ministério, servindo em qualquer comunidade.
- **Celebrante é campo próprio da celebração** (seletor "Celebrante"), separado da lista de
  equipe escalada — não é tratado como mais um ministério.
- **Categorias de função são cadastráveis** pelo admin, não uma lista fixa no código.

## Decisão de arquitetura central

Hoje uma escala (`Scale`) tem **um único** ministério (`teamId`) — a escala inteira pertence a um
ministério só. Isso não serve mais: uma celebração agora reúne várias funções ao mesmo tempo (Música +
Leitores + Acólitos + Ministros da Comunhão...).

**Solução**: `Scale.teamId` continua existindo exatamente como hoje (usado pelas Escalas
Recorrentes, pelo escopo de permissão do coordenador, pelo calendário público) — e cada pessoa
escalada (`ScaleServidor`, o antigo `ScaleMusician`) ganha o **seu próprio** `teamId` opcional,
representando sob qual ministério aquela pessoa específica serve **naquela celebração**. É esse
campo que permite agrupar a tela de detalhe por categoria (Música, Leitores, Acólitos...), via
`ScaleServidor → Team → CategoriaFuncao`.

É uma mudança aditiva: nada do que já existe quebra. A permissão de editar a escala inteira
continua sendo por `Scale.teamId` (ou admin) — não fatiamos permissão por categoria nesta rodada;
quem monta a escala (coordenador responsável ou admin) monta a equipe toda.

## Novo modelo de dados (resumo)

| Model | O que muda |
|---|---|
| `Comunidade` (novo) | `id, nome, endereco?, ativo`. Toda `Scale` ganha `comunidadeId` obrigatório. |
| `CategoriaFuncao` (novo, cadastrável) | `id, nome, ordem, ativo`. Seed: Música, Ministros da Comunhão, Acólitos e Coroinhas, Leitores, Comentaristas. |
| `Team` (Ministério) | ganha `categoriaId` obrigatório. |
| `Scale` (Celebração) | ganha `comunidadeId` obrigatório e `celebranteId` opcional (FK → `Servidor`). |
| `ScaleMusician` → `ScaleServidor` | ganha `teamId` opcional (o ministério da pessoa **nessa** celebração). |
| `Musician` → `Servidor` (tabela `servidores`) | mesmos campos, só o nome muda. |
| `MusicianTeam` → `ServidorMinisterio` | idem. |
| `InstrumentMusician` → `InstrumentServidor` | idem. |
| `VinculoFixo`, `Availability`, `AvailabilityWindowResponse` | campo `musicianId` → `servidorId`. |

---

## Fase 0 — Schema e rename (fundação)

- [x] Criar model `Comunidade` + migration.
- [x] Criar model `CategoriaFuncao` (cadastrável) + migration + seed das 5 categorias iniciais.
- [x] `Team.categoriaId` (obrigatório) + backfill: ministérios existentes → categoria "Música".
- [x] `Scale.comunidadeId` (obrigatório) + backfill: escalas existentes → Comunidade "Matriz"
      (criada no seed).
- [x] `Scale.celebranteId` (opcional, FK → `Servidor`).
- [x] `ScaleMusician.teamId` (opcional) — renomear model para `ScaleServidor` no mesmo passo.
- [x] Rename completo `Musician` → `Servidor` no schema (model, tabela, campos relacionados em
      `MusicianTeam`→`ServidorMinisterio`, `InstrumentMusician`→`InstrumentServidor`,
      `VinculoFixo.musicianId`, `Availability.musicianId`, `AvailabilityWindowResponse.musicianId`
      → `servidorId`).
- [x] Migration escrita à mão (via `prisma migrate diff` como base, mas editada pra usar
      `ALTER TABLE ... RENAME TO` / `RENAME COLUMN` em vez de dropar-e-recriar, senão perde
      dados existentes).
- [x] Backend: `api/_routes/musicians.ts` → `api/_routes/servidores.ts` (rota `/api/servidores`);
      atualizar contrato (`musicianId` → `servidorId`) em todos os arquivos que tocam nisso:
      `scales.ts`, `teams.ts`, `scaleTemplates.ts`, `vinculosFixos.ts`, `availability.ts`,
      `availabilityWindows.ts`, `substituicoes.ts`, `reports.ts`, `public.ts`, `cron.ts`,
      `_lib/sendPush.ts`, `_lib/sendWhatsapp.ts`, `_lib/suggestMusicians.ts` →
      `_lib/suggestServidores.ts`.
- [x] Frontend: `src/pages/musicians/` → `src/pages/servidores/` (`Index/Show/Create/Edit.vue`,
      `MusicianForm.vue` → `ServidorForm.vue`); rotas `/musicos` → `/servidores` em
      `src/router/index.ts`; `auth.user.musicianId` → `servidorId` na store.
- [x] Verificação final do rename: `grep -ri "musician" api/ src/` sem resultados.
- [x] Typecheck (`tsc --noEmit` api + `vue-tsc --noEmit`) limpos.
- [x] Testar local via API real (servidor, ministério+categoria, escala com comunidade/celebrante,
      confirmar/recusar/substituição, `/scale-templates/generate`, relatórios, calendário público,
      intensidade) — todos os fluxos passaram, dados de teste removidos.
- [ ] Aplicar migration em produção + smoke test.

## Fase 1 — Administração

- [ ] CRUD de Comunidades: `api/_routes/comunidades.ts` + `src/pages/comunidades/`
      (`Index/Create/Edit.vue`), staff-only, mesmo padrão visual das páginas de Ministério.
- [ ] CRUD de Categorias de Função: `api/_routes/categorias.ts` + `src/pages/categorias/`
      (`Index/Create/Edit.vue`), staff-only.
- [ ] Seletor de Categoria no cadastro/edição de Ministério (`teams/Create.vue`, `Edit.vue`).
- [ ] Link de navegação pras duas novas seções (menu/dashboard).

## Fase 2 — Escalas multi-equipe

- [ ] `ScaleForm.vue`: seletor de Comunidade (obrigatório), seletor de Celebrante (opcional,
      lista de Servidores). Ao adicionar alguém à equipe, escolher também o ministério que essa
      pessoa representa ali (select de `Team`, opcionalmente filtrado por categoria).
- [ ] "Adicionar equipe inteira": junto do jeito pessoa-por-pessoa, opção de escolher um
      Ministério e adicionar todos os membros dele de uma vez à escala (com o `teamId` de cada um
      já preenchido). Disponível pra qualquer ministério/categoria — hoje só faz sentido pra
      Música (ex: "Coral"), mas nada impede o admin de cadastrar grupos fixos de Acólitos,
      Leitores etc. no futuro, então a função não fica restrita a uma categoria específica.
- [ ] Backend `scales.ts` (POST/PATCH): aceitar `comunidadeId`, `celebranteId`, e `teamId` por
      item de `musicians[]` (a ser `servidores[]` já com o rename da Fase 0).
- [ ] `scales/Show.vue`: cabeçalho mostra Comunidade e Celebrante. Corpo reagrupado por
      `CategoriaFuncao` (ordenado por `categoria.ordem`), cada seção com os servidores daquela
      categoria — reaproveitando os badges de status/vínculo fixo já existentes.
- [ ] `MyScales.vue`, calendário do Dashboard: exibir Comunidade e/ou Celebrante quando fizer
      sentido no espaço disponível.

## Fase 3 — Alcance paroquial

- [ ] Filtro por Comunidade no Dashboard (calendário) e em `scales/Index.vue`.
- [ ] Calendário público (`public/Calendar.vue`): filtro por Comunidade; nome da comunidade
      aparece na celebração.
- [ ] Relatórios: agrupar (opcionalmente) por categoria além de por ministério.

## Fase 4 — Polimento

- [ ] Revisar todos os rótulos "Músico"/"Ministério" nas telas remanescentes pra garantir
      consistência com o novo escopo (ex: textos genéricos tipo "equipe celebrativa" onde fizer
      sentido).
- [ ] Atualizar `ordus-musicalis-requisitos.md` (ou documento equivalente) refletindo o novo
      escopo, se ainda for usado como referência.
- [ ] Checagem final: `grep` de "musician" (Fase 0) + revisão visual das telas principais num
      fluxo completo (criar comunidade → criar ministério com categoria → criar servidor →
      montar escala com celebrante + equipe de várias categorias → ver o detalhe agrupado).

---

## Como usar este arquivo

Cada fase é implementada e testada (local + produção) antes de avançar pra próxima, no mesmo
ritmo já usado no projeto até aqui. Marque os itens `[x]` conforme forem concluídos. Fases não
precisam ser feitas inteiras de uma vez — dá pra parar e retomar a qualquer ponto.
