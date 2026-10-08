# 0009 — Coordenação por comunidade

- **Data**: 2026-10-08
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0009`
- **Task relacionada**: `TASK-0129` (e `TASK-0130`–`TASK-0134`)

## Contexto

Até aqui a gestão de escalas tinha dois níveis:
- `admin`, que pode tudo;
- `coordenador`, um papel global cujo escopo é por **ministério**: edita/exclui uma celebração se for
  `responsavel` de algum ministério escalado nela (`requireAnyTeamOwnership`, `api/_middleware/teamScope.ts`).

Nada ligava uma pessoa a uma **comunidade**.

O usuário pediu (2026-10-08) um acesso para **coordenadores de comunidade**, válido só nas comunidades
que eles coordenam, com dois poderes:
- editar os servidores escalados (adicionar, remover, trocar função);
- aprovar/rejeitar substituições.

Nada além disso: não cria nem exclui celebração, não muda data, horário, celebrante ou status.
Só o admin define quem coordena.

Achado que pesou no desenho: `PATCH /scales/:id` aceita todos os campos da escala e valida a posse
com o estado **anterior**. Reaproveitá-lo deixaria um coordenador de comunidade mudar data/status ou
mover a escala para outra comunidade.

## Decisão

1. **Vínculo, não papel.** Nova tabela `comunidade_coordenador (comunidade_id, servidor_id)`, N:N.
   - Uma pessoa pode coordenar várias comunidades, e uma comunidade pode ter vários coordenadores.
   - O `User.role` não muda: um servidor comum (`musico`) com vínculo ganha os poderes extras só nas
     comunidades vinculadas.
   - O vínculo aponta para `Servidor`, como `Team.responsavelId`. Só servidores com login
     (`Servidor.userId`) podem ser vinculados.
2. **Só o admin gerencia os vínculos**: `GET/PUT /comunidades/:id/coordenadores` com `requireRole('admin')`.
3. **Endpoint dedicado para a equipe**: `PUT /scales/:id/servidores` aceita **apenas** a lista de
   servidores. A autorização usa a comunidade **gravada** da escala, nunca o corpo da requisição.
   O `PATCH /scales/:id` completo continua restrito a admin e coordenador de ministério, como antes.
4. **Regra OR**: pode gerenciar a equipe ou as substituições de uma escala quem for:
   - admin; **ou**
   - coordenador de ministério dono de algum ministério da escala (regra que já existia); **ou**
   - coordenador da comunidade da escala.

   A regra fica em funções puras de `api/_lib/communityScope.ts`, com testes.
5. Os coordenadores da comunidade passam a ser **notificados de recusas** nas escalas dela, junto com
   admins e o responsável pelo ministério; sem isso, não saberiam que há substituição para aprovar.
6. `/auth/login` e `/auth/me` passam a devolver `comunidadesCoordenadas: number[]`. O frontend usa
   esse campo só para decidir o que mostrar; a API continua sendo a guarda real.

## Alternativas consideradas

- **Novo papel no enum `UserRole`** (ex. `coordenador_comunidade` + `comunidadeId` no User):
  descartada pelo usuário. É rígido: a pessoa deixaria de ser servidor comum e ficaria presa a uma
  comunidade só. O vínculo N:N cobre os dois casos sem mexer no enum.
- **Reaproveitar o `PATCH /scales/:id` com checagem extra**: descartada. Exigiria filtrar campo por
  campo conforme quem chama e validar o estado novo da escala (ex. troca de `comunidadeId`). Isso é
  fácil de esquecer num campo novo. Um endpoint que só aceita servidores tem uma superfície menor.
- **Coordenadores de ministério também atribuírem coordenadores de comunidade**: descartada pelo
  usuário, porque alguém poderia ampliar o próprio acesso.

## Consequências

- **Migration nova.** A Vercel não aplica migrations: rodar `prisma migrate deploy` em produção
  **antes** do deploy do código.
- **A equipe pode ser editada por dois caminhos**: o PATCH completo (staff) e o PUT só de servidores
  (inclusive para coordenador de comunidade). A lógica de diff e as notificações foram extraídas
  para `api/_lib/scaleServidoresSync.ts`, para os dois não divergirem.
- **O coordenador de comunidade age sobre qualquer ministério** dentro da comunidade, e não só sobre o
  próprio. É intencional: o recorte é por comunidade.
- **A escala de quem não usa ministério também fica coberta.** A regra antiga de substituições olhava
  só o `Scale.teamId` legado; escalas sem ministério legado continuavam só para admin na regra de
  ministério. A regra de comunidade passa a cobri-las para os coordenadores daquela comunidade.
