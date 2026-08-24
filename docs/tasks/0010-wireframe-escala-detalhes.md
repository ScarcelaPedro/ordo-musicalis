---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0010 — Wireframe da tela de Detalhes da Escala

**Task ID**: `TASK-0010`

## Objetivo

Redesenhar a hierarquia visual da tela de detalhes de uma escala
([`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §8), sem necessariamente reduzir cliques — a
auditoria já considera o fluxo atual relativamente enxuto (a confirmar na TASK-0006); o ganho
principal deve vir da hierarquia visual. Cobrir destaque do celebrante (§8.2, apontado como
requisito de negócio hoje mal implementado), situação da escala (§8.3), indicação de funções
vazias (§8.4) e indicação de alteração recente (§8.5).

## Dependências

- `TASK-0006` — estrutura real de `scales/Show.vue` hoje.
- `TASK-0007` — padrões transversais (estados, ações) a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe documentado com os campos do §26, seguindo a ordem de hierarquia do §8.1:
      celebração, data/hora, comunidade, celebrante, situação da escala, equipe, repertório,
      liturgia, informações secundárias.
- [x] Destaque visual do celebrante especificado (§8.2).
- [x] Representação de situação da escala definida: confirmados, pendentes, recusados, vagas,
      alterações recentes (§8.3).
- [x] Indicação de função vazia especificada, com ação "Resolver" acionável (§8.4).
- [x] Indicação de escala alterada especificada — ex. "Alterada recentemente" / "Horário
      alterado" (§8.5).
- [x] Critério de aceite "Servidor → Alterações importantes são perceptíveis" (§28) coberto
      (compartilhado com TASK-0008/TASK-0011).

## Estrutura atual (releitura completa de `scales/Show.vue`, 249 linhas)

Confirmado nesta task para ancorar o redesenho:

- Cabeçalho: título = `celebracao`; ações no-print (Imprimir, Repertório/Editar só staff,
  Liturgia sempre) — todas já existentes, mantidas.
- Bloco de dados: um único `<dl>` em grid — Data, Horário, Status (badge), Comunidade,
  Celebrante (condicional), Ministério responsável (condicional), Observações (condicional) —
  **todos com o mesmo peso visual**, confirmando exatamente o achado da auditoria/`TASK-0006`
  (celebrante sem destaque, `Show.vue:151-158`).
- Bloco "Minha confirmação" (só para `musico` com participação na escala): badge de status +
  confirmar/recusar (com motivo opcional) — já funcional, mantido como está.
- Bloco "Equipe da celebração": agrupado por categoria, **construído a partir de
  `scale.servidores`** — uma categoria sem ninguém escalado simplesmente não gera grupo nenhum
  e não aparece na tela (confirmado: `gruposPorCategoria` só itera sobre pessoas já presentes).
  Isso é a causa raiz do achado "função vazia não indicada" (§8.4) — não é uma falha de estilo,
  é a estrutura de dados da tela que ignora categorias vazias por completo.
- Bloco Repertório: só aparece `v-if="scale.repertoire"`, com prévia (3 primeiros itens
  implícito? não — lista completa) + link "Ver completo".
- **Sem bloco de Liturgia** nesta tela — hoje é só um botão no cabeçalho levando a uma página
  separada (`/escalas/:id/liturgia`), diferente do tratamento dado ao Repertório (que tem prévia
  inline).
- **Sem nenhuma indicação de alteração recente** — nem timestamp, nem qualquer sinal visual.
- O fluxo já é considerado "relativamente enxuto" pela auditoria — telas baseadas em cartões
  como esta já funcionam razoavelmente bem no mobile hoje (diferente do calendário do Dashboard).
  Por isso este wireframe foca em **hierarquia**, não em reestruturar layout responsivo do zero.

## Wireframe: Escala — Detalhes

- **Objetivo**: permitir que qualquer usuário autenticado compreenda rapidamente uma celebração
  — quem celebra, quem está confirmado, o que falta.
- **Usuário**: todos os perfis autenticados (`admin`/`coordenador`/`musico`); ação de confirmar
  presença só para `musico` escalado; ações de edição só para staff.
- **Informação principal**: depende do perfil — para o servidor com participação pendente, é a
  própria pendência de confirmação; para os demais, é a situação geral da escala (§8.3).
- **Ação principal**: confirmar presença (servidor pendente); para staff, não há uma ação
  forçada única — a tela é primariamente de referência, com "Editar" como ação disponível
  quando algo precisa ser resolvido (ex. clique em "Resolver" numa categoria vazia).
- **Ações secundárias**: recusar presença, imprimir, ver repertório completo, ver liturgia,
  editar (staff).
- **Estrutura**, seguindo a hierarquia do §8.1:
  1. **Celebração** — título, já existente, mantido.
  2. **Data/hora** — subtítulo logo abaixo do título (hoje enterrado no `<dl>` plano).
  3. **Comunidade** — junto ao subtítulo, mesmo nível.
  4. **Celebrante, em destaque** (§8.2) — bloco visual próprio, separado do restante dos
     metadados, não mais um `<dt>/<dd>` igual aos outros — resolve diretamente o requisito de
     negócio documentado e hoje não implementado corretamente (achado da auditoria).
  5. **Situação da escala** (§8.3) — nova faixa-resumo agregada: contagem de confirmados,
     pendentes, recusados e vagas (categorias vazias), calculada a partir dos dados já
     retornados pela tela (`scale.servidores[].status` + categorias existentes) — nenhuma nova
     consulta de API necessária, só uma agregação client-side que não existe hoje.
  6. **Equipe** — mantém o agrupamento por categoria já existente (achado positivo a
     preservar), mas passa a **listar todas as categorias cadastradas**, não só as que têm
     gente — categoria vazia aparece com o mesmo tratamento visual do `ScaleForm` (fundo âmbar
     + "Ninguém escalado"), com botão "Resolver" para staff (leva à Etapa 2 de `TASK-0009`) e,
     para servidor, a mesma indicação sem o botão (transparência sem ação que ele não pode
     tomar — resolve o achado "servidor não percebe que falta gente numa função").
  7. **Repertório** — mantido como está (prévia + "Ver completo"), padrão a reaproveitar.
  8. **Liturgia** — **decisão aberta, não bloqueante**: dar à Liturgia o mesmo tratamento do
     Repertório (prévia inline + link "Ver completo") deixaria a hierarquia consistente com o
     §8.1, mas depende de o endpoint da escala já retornar os dados da liturgia do dia
     (`scale.liturgia`) — não confirmado nesta task. Se o dado já vier junto, aplicar o mesmo
     padrão do Repertório; se não, manter o link de cabeçalho como está hoje (não é regressão,
     é o comportamento atual) e registrar a extensão de API como pendência de implementação,
     fora do escopo desta etapa (SPEC-002 §29).
  9. **Informações secundárias** — Ministério responsável, Observações: rebaixadas visualmente,
     abaixo da Equipe, sem o mesmo peso do bloco de dados principal.
- **Estados**: loading ("..." no título, já existe, mantido); vazio em Equipe (hoje "Nenhum
  servidor na escala" — mantido, mas agora convivendo com a listagem de categorias vazias);
  vazio em Repertório (bloco simplesmente não aparece, mantido).
- **Mobile**: estrutura em cartões empilhados (já é o padrão atual e já funciona, confirmado
  pela auditoria) — a faixa de situação (item 5) empilha os 4 contadores em vez de uma linha
  única quando não couber.
- **Desktop**: mesma estrutura; faixa de situação em linha única; bloco de celebrante pode
  ficar lado a lado com data/hora/comunidade em vez de empilhado.
- **Navegação**: vem de `Escalas` (lista), `Dashboard`, `Minha Escala`; leva a `Repertório`
  completo, `Liturgia`, `Editar` (Etapa 2 da `TASK-0009`, com deep-link quando vier de
  "Resolver" numa categoria vazia).

## Indicação de alteração recente (§8.5)

**Depende de dado ainda não confirmado**: mostrar "Alterada recentemente"/"Horário alterado"
exige saber quando a escala foi editada pela última vez (`updatedAt`, convenção padrão do
Prisma) e, idealmente, distinguir uma edição trivial de uma mudança relevante (horário/local).
Esta task define a experiência-alvo — um indicador visível perto do topo, ex. "⚠ Horário
alterado" ou "Alterada em 20/08" — mas a viabilidade exata (o campo já vem na resposta da API? é
preciso marcar campos "relevantes" de forma explícita?) fica registrada como pendência de
verificação/implementação, não resolvida aqui (fora do escopo desta etapa, SPEC-002 §29 exclui
alteração de API).

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §8, §25 (Prioridade 3), §26, §28.
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `scales/Show.vue` (249
  linhas) confirmou que a estrutura de dados atual (`gruposPorCategoria`, construída a partir de
  `scale.servidores`) é a causa raiz de categorias vazias nunca aparecerem — não é só estilo, é
  a lógica de agrupamento. Wireframe redesenha a hierarquia (celebrante em bloco próprio,
  situação da escala como faixa-resumo agregada calculada client-side sem nova API, categorias
  vazias listadas com "Resolver" para staff) mantendo o padrão de cartões que a auditoria já
  considera funcional no mobile — foco em hierarquia, não em reestruturação responsiva. Duas
  decisões ficaram marcadas como dependentes de verificação de dado, não resolvidas
  silenciosamente: (1) dar prévia inline à Liturgia como o Repertório já tem, condicionado a
  `scale.liturgia` já vir na resposta da API; (2) indicação de "alterada recentemente",
  condicionada à disponibilidade e semântica de `updatedAt`. Task marcada `concluida`. Próximo
  passo: TASK-0011 (Minha Escala) já está elegível.
