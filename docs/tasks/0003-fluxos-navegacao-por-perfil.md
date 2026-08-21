---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0003 — Fluxos de navegação por perfil (servidor e coordenador)

**Task ID**: `TASK-0003`

## Objetivo

Documentar o entregável 3 da [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) (seção 21, item 3):
os principais fluxos de navegação — servidor (login → dashboard → próxima escala → detalhes →
confirmar presença) e coordenador (login → dashboard → escala → criar/editar → montar equipe →
validar → publicar) — validando que cada passo corresponde a uma tela/ação real do sistema
(TASK-0001) e reflete a regra de acesso contextual vs. global da seção 18.

## Dependências

- `TASK-0001` — rotas/funcionalidades reais usadas para validar cada passo dos fluxos.
- `TASK-0002` — mapa de navegação, usado como referência de onde cada passo do fluxo se encaixa.

## Critérios de conclusão

- [x] Fluxo do servidor documentado passo a passo, cada passo referenciando a tela/rota real
      correspondente.
- [x] Fluxo do coordenador documentado passo a passo, cada passo referenciando a tela/rota real
      correspondente.
- [x] Regra de acesso contextual vs. global (seção 18) aplicada e exemplificada em pelo menos os
      casos citados na SPEC-001 (Escala → Repertório como acesso contextual; Escalas →
      Substituições como acesso global).
- [x] Critérios de aceite "Perfis" da seção 20 confirmados: servidor chega rapidamente à própria
      escala; coordenador chega rapidamente às ferramentas de gerenciamento.

## Fluxo do servidor

Passo a passo real (`meta.roles` não restringe nenhuma destas rotas a `musico` especificamente,
mas é o fluxo pensado para esse perfil — ver TASK-0002 quanto à matriz de acesso):

```text
1. Login              → /login (login)
2. Dashboard          → /dashboard (dashboard.dashboard)
     - Banner "Próxima celebração" (nextScale) — próxima escala do sistema, não
       necessariamente do próprio servidor.
     - Bloco "Minhas próximas escalas" (myNextScales) — até 3 escalas em que o servidor
       autenticado (auth.user.servidorId) está escalado; é este bloco que representa
       "minha próxima escala" citado na SPEC-001 §21.3.
3. Detalhes da escala  → /escalas/:id (scales.show), a partir do clique em uma das
     "Minhas próximas escalas" (ou do link "Ver escala completa" do banner).
     - Seção "Minha confirmação" exibe o status atual (Badge) e, se ainda pendente
       (status `convidado` e escala futura), o botão "Confirmar presença".
4. Confirmar presença → clique em "Confirmar presença" dispara
     PATCH /scales/:id/confirmar (client-side, mesma tela — não navega para outra rota).
```

Caminho alternativo já existente, também válido e mais direto para "ver todas as minhas
escalas" sem depender do Dashboard: `/minha-escala` (`scales.mine`, item próprio no menu do
servidor) → lista → clique numa escala → mesma tela de detalhes/confirmação do passo 3 acima.

## Fluxo do coordenador

Passo a passo real (rotas restritas a `admin`/`coordenador` via `meta.roles`, exceto onde
indicado):

```text
1. Login                → /login (login)
2. Dashboard            → /dashboard (dashboard.dashboard)
     - Bloco "Pendências de confirmação" (staff) — lista servidores que ainda não
       confirmaram, com link direto para a escala correspondente.
     - Botões no header: "Substituições" (/substituicoes), "Relatórios" (/relatorios) e
       "Nova Escala" (/escalas/criar) — acesso rápido às ferramentas de gerenciamento.
3. Escala               → /escalas (scales.index) — listagem completa, com filtros.
4. Criar/Editar         → /escalas/criar (scales.create) ou /escalas/:id/editar (scales.edit).
5. Montar equipe        → dentro do mesmo formulário (ScaleForm.vue, seção "Equipe da
     celebração"): adicionar servidores por categoria/instrumento, um a um ou em lote
     ("Adicionar todos" / "Adicionar toda a equipe de <ministério>").
6. Validar / Publicar   → campo "Status" do mesmo formulário: `Rascunho` → `Confirmada`.
```

**Divergência de terminologia registrada (não corrigida — SPEC-001 §19 não pede alteração de
regra de negócio)**: a SPEC-001 (§8, §21.3) descreve os passos "Validar conflitos" e "Publicar"
como etapas distintas do fluxo de montagem de equipe. No código atual **não existe** uma
funcionalidade de validação automática de conflitos (nenhuma ocorrência de "conflito" em
`src/`), nem um botão/ação chamado "Publicar" — o equivalente mais próximo é o coordenador
revisar manualmente a lista de servidores já adicionados (não há checagem automática de
choque de horário/dupla escalação) e então mudar o campo `Status` de `Rascunho` para
`Confirmada` no mesmo formulário de criação/edição. Isso está alinhado com a observação da
própria SPEC-001 (§8): "A montagem da equipe é considerada o fluxo de maior custo de interação
do sistema e deverá receber atenção especial nas próximas etapas" — ou seja, a SPEC já
reconhece esse fluxo como um ponto em aberto, não uma funcionalidade que esta etapa deveria
encontrar pronta. Nenhuma funcionalidade de validação de conflitos foi inventada para preencher
essa lacuna; ela fica registrada aqui para uma etapa futura de UX/implementação.

## Acesso contextual vs. global (SPEC-001 §18)

Confirmado com casos reais do sistema (TASK-0001/TASK-0002):

- **Acesso global** (via menu, independente de onde o usuário está): `Escalas → Substituições`
  (`/substituicoes`) e `Escalas → Recorrências` (`/escalas-recorrentes`) — hoje tecnicamente só
  alcançáveis por botão indireto (ver TASK-0002), mas conceitualmente são acesso global: fazem
  sentido a partir de qualquer ponto do sistema, não dependem de estar dentro de uma escala
  específica.
- **Acesso contextual** (disponível só a partir do conteúdo relacionado): `Escala → Detalhes →
  Repertório` (`/escalas/:id/repertorio`) e `Escala → Detalhes → Liturgia`
  (`/escalas/:id/liturgia`) — só existem vinculados a um `:id` de escala; não há hoje uma
  listagem global independente (ver lacuna já registrada na TASK-0002, seção "Conteúdo").

Isso evita os dois extremos citados na SPEC-001 §18: Substituições/Recorrências não dependem de
"descobrir" uma escala específica primeiro (Problema A); Repertório/Liturgia não obrigam o
usuário a sair da escala e voltar ao menu para revisá-los (Problema B).

## Verificação dos critérios de aceite "Perfis" (SPEC-001 §20)

- **Servidor chega rapidamente à própria escala**: confirmado — do login, são 2 passos até o
  detalhe da escala (`Dashboard` → clique em "Minhas próximas escalas"), ou 1 passo via
  `/minha-escala` no menu.
- **Coordenador chega rapidamente às ferramentas de gerenciamento**: confirmado — Substituições,
  Relatórios e criação de escala estão a 1 clique do Dashboard (botões no header); Pendências de
  confirmação aparecem diretamente na tela inicial, sem navegação adicional.

## Referências

- [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) — seções 8, 9, 18, 20, 21 (item 3).
- `TASK-0001`, `TASK-0002`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-001.
- 2026-08-21 — Task reivindicada e executada. Fluxos de servidor e coordenador documentados
  passo a passo com base nas telas reais (`Dashboard.vue`, `scales/Show.vue`, `ScaleForm.vue`,
  `scales/MyScales.vue`). Achado relevante registrado sem inventar funcionalidade: a SPEC-001
  descreve "Validar conflitos" e "Publicar" como passos do fluxo do coordenador, mas nenhum dos
  dois existe como funcionalidade real hoje (não há validação automática de conflitos em
  `src/`; "publicar" corresponde, na prática, a mudar o campo `Status` de `Rascunho` para
  `Confirmada` no mesmo formulário de criar/editar escala). A própria SPEC-001 §8 já sinaliza
  que a montagem de equipe "deverá receber atenção especial nas próximas etapas", então essa
  lacuna não contradiz a SPEC — só não deve ser tratada como algo já implementado. Regra de
  acesso contextual vs. global (§18) exemplificada com casos reais (Substituições/Recorrências
  = global; Repertório/Liturgia = contextual). Critérios de aceite "Perfis" (§20) confirmados.
  Task marcada `concluida`. Próximo passo: TASK-0004 (recomendações desktop/tablet/mobile) já
  está elegível — depende só da TASK-0002, concluída.
