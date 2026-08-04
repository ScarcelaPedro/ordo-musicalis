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
- [x] Aplicar migration em produção + smoke test (health, calendário público, login, servidores,
      teams com categoria — dados reais preservados, ministérios existentes com categoria
      "Música" corretamente).

## Fase 1 — Administração

- [x] CRUD de Comunidades: `api/_routes/comunidades.ts` + `src/pages/comunidades/`
      (`Index/Create/Edit.vue`), staff-only, mesmo padrão visual das páginas de Ministério.
- [x] CRUD de Categorias de Função: `api/_routes/categorias.ts` + `src/pages/categorias/`
      (`Index/Create/Edit.vue`), staff-only.
- [x] Seletor de Categoria no cadastro/edição de Ministério (`teams/Create.vue`, `Edit.vue`);
      badge de categoria também exibido em `teams/Index.vue` e `teams/Show.vue`.
- [x] Link de navegação pras duas novas seções (menu desktop + mobile do `AuthenticatedLayout`).
- [x] Testado local: CRUD completo de Comunidades/Categorias, criação de Equipe com
      `categoriaId` explícito, e proteção de FK (não deixa excluir categoria/comunidade em uso).

## Fase 2 — Escalas multi-equipe

- [x] `ScaleForm.vue`: seletor de Comunidade (obrigatório), seletor de Celebrante (opcional,
      lista de Servidores). Cada servidor escalado ganha seletor de Ministério individual (select
      de `Team`); o filtro rígido antigo (que só deixava escalar gente do "Ministério" da escala)
      foi removido — agora dá pra escalar qualquer servidor ativo pra qualquer celebração, com
      busca por nome pra manter a lista usável. O "Ministério responsável" no topo do form virou
      só o campo de permissão/coordenação (`Scale.teamId`), com texto explicando isso.
- [x] "Adicionar equipe inteira": seletor de Ministério + botão que busca os membros via
      `GET /teams/:id` e adiciona todos de uma vez à escala, já com o `teamId` de cada um
      preenchido. Não é restrito a nenhuma categoria específica.
- [x] Backend `scales.ts` (POST/PATCH): já aceitava `comunidadeId`, `celebranteId`, e `teamId` por
      item de `servidores[]` desde a Fase 0 — nenhuma mudança adicional necessária aqui.
- [x] `scales/Show.vue`: cabeçalho mostra Comunidade e Celebrante. Corpo reagrupado por
      `CategoriaFuncao` (ordenado por `categoria.ordem`, com "Sem ministério definido" por
      último), cada seção com os servidores daquela categoria — reaproveitando os badges de
      status/vínculo fixo já existentes.
- [x] `MyScales.vue` (próximas + histórico) e banner "Próxima celebração" do Dashboard: exibem
      Comunidade e Celebrante quando presentes.
- [x] Bug pré-existente corrigido durante os testes: `POST/PATCH /servidores` quebrava
      (`TypeError`) quando o corpo da requisição não incluía `instruments` -- a UI sempre manda
      `[]`, então nunca tinha aparecido antes.
- [x] Testado local: escala criada com comunidade + celebrante + servidores de duas categorias
      diferentes (Música e Leitores), resposta da API confere exatamente com o que `Show.vue`
      espera pro agrupamento (`servidor.team.categoria.{nome,ordem}`).

## Fase 3 — Alcance paroquial

- [x] Filtro por Comunidade no Dashboard (calendário) e em `scales/Index.vue` (só aparece quando
      há mais de uma comunidade cadastrada); `scales/Index.vue` também ganhou coluna Comunidade.
- [x] Calendário público (`public/Calendar.vue`): filtro por Comunidade (via novo endpoint
      público `GET /api/public/comunidades`); nome da comunidade aparece na celebração.
- [x] Relatórios: toggle "Por Ministério" / "Por Categoria de Função". A visão por categoria
      agrupa por `ScaleServidor.team.categoria` (não pela `Scale.teamId`), já que uma celebração
      pode reunir várias categorias ao mesmo tempo desde a Fase 2.
- [x] Testado local: filtro de comunidade em `/scales`, `/public/scales` e no calendário público;
      novo endpoint público de comunidades; `porCategoria` no relatório.

## Fase 4 — Polimento

- [x] Revisar rótulos remanescentes: grep por "Músico"/"musician" em `src/` e `api/` só encontrou
      um comentário residual (`Dashboard.vue`, não visível ao usuário), corrigido pra "servidor".
      Rótulos visíveis já estavam todos atualizados desde a Fase 0.
- [x] `ordus-musicalis-requisitos.md` reescrito pro novo escopo (equipe celebrativa completa,
      Comunidade, CategoriaFuncao, Celebrante), com nota histórica linkando pra este arquivo e
      roadmap original marcado como concluído.
- [x] Checagem final: `grep` de "musician"/"músico" limpo (só migrations antigas) + fluxo completo
      via API real (criar comunidade → criar servidores → criar ministérios em categorias
      diferentes → montar escala com celebrante + equipe de Música e Acólitos → conferir que o
      detalhe retorna tudo pronto pro agrupamento por categoria). **Não fiz revisão visual em
      navegador** (sem ferramenta de browser neste ambiente) — a verificação foi via typecheck
      (`tsc`/`vue-tsc` limpos) e chamadas reais à API, não renderização real das telas.

## Fase 5 — Ajustes de uso real

Depois de usar o sistema de verdade, dois pontos da Fase 0/2 precisaram de ajuste:

- [x] **Celebrante vira entidade própria** (revisa a decisão da Fase 0): não fazia sentido um
      padre ser um "Servidor" com instrumentos/nível/ministérios. Novo model `Celebrante`
      (`nome, telefone, email, ativo`), CRUD próprio staff-only (`api/_routes/celebrantes.ts` +
      `src/pages/celebrantes/`), link de navegação, e `Scale.celebranteId` repontado pra essa
      tabela nova. Migration migra com segurança qualquer celebrante que já existisse como
      Servidor, sem perder o vínculo nem apagar o registro antigo.
- [x] **`ScaleForm.vue` reorganizado por categoria de função** (estende a Fase 2): numa
      celebração de verdade todas as funções servem ao mesmo tempo, então a escala agora mostra
      uma seção por categoria ativa (Música, Leitores, Acólitos...), cada uma com sua própria
      lista de adicionar servidor/equipe inteira e um aviso visual de "ninguém escalado" — sem
      bloquear o salvamento (nem toda celebração precisa de todas as categorias). Uma seção
      "sem ministério definido" cobre o caso residual.
- [x] Testado local: CRUD de celebrantes, escala criada com `celebranteId` apontando pra
      `celebrantes` (confirmado que a resposta não traz mais instrumentos/nível), typecheck limpo.
- [x] **Servidor ganha Função(ões) com múltipla escolha**, separada de Instrumentos/Ministério:
      nem todo servidor é músico, então esses dois campos só aparecem no cadastro quando "Música"
      está entre as funções selecionadas (e são limpos automaticamente se ela for desmarcada).
      Nova tabela `servidor_categoria` com backfill (quem já tinha instrumento ou ministério
      ganhou a função correspondente automaticamente, pra não esconder dado existente).
- [x] **`ScaleServidor` ganha `categoriaId` direto, desacoplado do `teamId`** (corrige um bug
      descoberto em uso real): antes, uma função só aparecia agrupada na escala se existisse um
      Ministério cadastrado pra ela — e como Ministério só era atribuído a Músicos, nenhuma outra
      função conseguia ser escalada corretamente. Agora a categoria é gravada direto na
      escalação; o Ministério continua existindo como vínculo opcional adicional (útil sobretudo
      pra Música). Testado: um Acólito sem nenhum Ministério cadastrado aparece corretamente na
      seção "Acólitos e Coroinhas" da escala e do relatório por categoria.
- [x] **`ScaleForm.vue` só oferece, em cada seção de categoria, servidores que têm aquela função
      marcada no cadastro** (bug de uso real: antes qualquer servidor aparecia disponível pra
      qualquer categoria — um Acólito conseguia ser escalado como Leitor, por exemplo, o que não
      faz sentido). A seção "sem função definida" continua sem filtro, como válvula de escape pra
      quem ainda não tem função cadastrada.
- [x] **Instrumento só aparece/é atribuído quando a pessoa está sendo escalada como Música**
      (bug de uso real: um servidor que é Músico e também Acólito ganhava instrumento mesmo
      escalado como Acólito, já que o campo dependia só de ele ter instrumento cadastrado, não da
      função em que estava sendo escalado ali). Agora o instrumento é decidido pela seção da
      escala em que a pessoa entra, não pelo cadastro dela.
- [x] **Campo "Ministério responsável" removido da criação/edição de escala** (não fazia mais
      sentido: uma celebração pode reunir várias categorias, então não existe "o" ministério de
      uma escala). Ministério por pessoa também virou sempre opcional em qualquer categoria
      (antes, com só um ministério cadastrado numa categoria, ele era escolhido automaticamente
      -- nem todo servidor de uma função integra um ministério formal). Como consequência, a
      permissão de coordenador pra editar/excluir uma escala deixou de depender de um único
      `Scale.teamId` e passou a considerar **qualquer** ministério de quem está escalado ali
      (`requireAnyTeamOwnership`); o mesmo vale pra quem recebe pendências e notificação de
      recusa, que agora usam o ministério da própria escalação. Testado local com dois
      coordenadores: dono de um ministério escalado consegue editar, coordenador sem nenhum
      ministério ali toma 403.
- [x] **Funções litúrgicas dos Acólitos e Ancilas**: novo campo `funcaoLiturgica` (opcional) em
      cada escalação, com as 7 funções da celebração (Cerimoniário 1, Cerimoniário 2, Librífero,
      Cruciferário, Ceroferário, Turiferário, Naveteiro). Aparece só na seção de "Acólitos e
      Coroinhas" da escala — igual ao instrumento, que só aparece em Música. Não é obrigatório, e
      qualquer acólito/ancila está apto pra qualquer função (sem aptidão cadastrada por pessoa,
      diferente de instrumento). Exibido no detalhe da escala junto do nome de cada um.

---

## Como usar este arquivo

Cada fase é implementada e testada (local + produção) antes de avançar pra próxima, no mesmo
ritmo já usado no projeto até aqui. Marque os itens `[x]` conforme forem concluídos. Fases não
precisam ser feitas inteiras de uma vez — dá pra parar e retomar a qualquer ponto.
