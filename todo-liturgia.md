# Liturgia diária automática

## Objetivo

Cada celebração passa a mostrar a liturgia do dia (tempo litúrgico, cor, antífonas, coleta,
leituras, Glória/Credo, oferendas, comunhão, pós-comunhão) buscada automaticamente, sem digitação
manual. O botão de destaque na escala muda de "Repertório" para "Liturgia"; Repertório continua
existindo como link secundário. O calendário do Dashboard passa a colorir cada dia pela cor
litúrgica.

## Fonte dos dados

API pública gratuita `https://liturgia.up.railway.app/v2/` (`Dancrf/liturgia-diaria`), consultada
por data. Não traz Glória/Credo (calculado por regra local) nem tempo litúrgico separado da string
`liturgia`.

## Decisões já tomadas

- Liturgia é chaveada por **data**, não por escala — a mesma liturgia vale pra qualquer celebração
  no mesmo dia, em qualquer comunidade.
- Repertório **não é removido**, só deixa de ser o botão principal.
- Existe correção manual por data (`editadoManualmente`), que a sincronização automática nunca
  sobrescreve.

---

## Fase 1 — Fundação: modelo de dados + sincronização automática

- [x] Model `Liturgia` no `api/prisma/schema.prisma` (chave `data DateTime @unique @db.Date`,
      sem FK pra `Scale`).
- [x] Migration escrita à mão (`CREATE TABLE liturgias`).
- [x] `api/_lib/fetchLiturgia.ts` — busca na API externa, mapeia pro formato do model, calcula
      `temGloria`/`temCredo` por regra (domingo fora de Advento/Quaresma via Computus, Solenidade,
      Festa).
- [x] `api/_routes/liturgia.ts` — `GET /?data=`, `GET /?mes=`, `PATCH /:data` (admin/coordenador).
- [x] Cron `GET /api/cron/liturgia-sync` (janela de 60 dias, até 20 buscas por execução) + entrada
      em `vercel.json`.
- [x] `.env.example` — documentar `LITURGIA_API_URL`.
- [x] Typecheck + teste local via curl -- validado contra 8/8, 6/8 (Transfiguração), 9/8 e 23/8
      (Domingos), 16/8 (Assunção, Solenidade) e 25/12 (Natal, com 2ª leitura) — Glória/Credo batem
      com a regra litúrgica em todos os casos.

## Fase 2 — Tela de Liturgia + botão na escala

- [x] `src/pages/liturgia/Show.vue` (visualização + edição inline pra staff).
- [x] `src/pages/scales/Show.vue` — botão "Liturgia" em destaque, "Repertório" como link
      secundário.
- [x] Rota `/escalas/:id/liturgia` em `src/router/index.ts`.

## Fase 3 — Cores litúrgicas no calendário do Dashboard

- [x] `src/pages/dashboard/Dashboard.vue` — busca liturgia do mês, colore o fundo de cada dia pela
      `cor`; "hoje" passou a usar um anel (`ring-2 ring-indigo-400`) em vez de fundo, pra não
      brigar com a cor litúrgica.
- [x] Legenda de cores litúrgicas no rodapé do calendário.

## Fase 4 — Polimento

- [x] Validar visualmente algumas datas reais (domingo, memória, solenidade, festa) contra a
      regra litúrgica — ver Fase 1.
- [x] Estado vazio (dia ainda não sincronizado) tratado no calendário (fundo neutro) e na tela de
      detalhe ("Liturgia ainda não disponível para esta data").
- [ ] Deploy em produção (migration + push + smoke test) com confirmação do usuário.
