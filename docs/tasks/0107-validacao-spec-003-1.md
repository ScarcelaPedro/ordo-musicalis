---
status: concluida
modulo: geral
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0107 — Validação final da SPEC-003.1 (responsividade, a11y, critérios de aceite)

**Task ID**: `TASK-0107`

**Prioridade**: P1 (fecha a SPEC-003.1)

## Objetivo

Validar ponta a ponta os critérios de aceite da SPEC-003.1 (§31) com dado real e navegação real,
cobrindo responsividade (§28) e acessibilidade das cores (§25), e registrar o resultado.

## Escopo

- Seed temporário (não commitado) com várias categorias (Leitores, Acólitos, Ministros da
  Eucaristia, Música, …), celebrações no mês com cores litúrgicas diferentes, escalas em
  rascunho/confirmadas e servidores com confirmação pendente.
- Percorrer como **admin/coordenador** e como **servidor**: Dashboard, calendário, detalhes da
  escala, sidebar/navegação mobile.
- Viewports: 360px, 414px, tablet (768px), desktop (1440px); temas claro e escuro.

## Critérios de conclusão

Checklist da §31, cada item com evidência (tela/viewport) nas notas:

- [x] O sistema representa diferentes ministérios.
- [x] A interface não assume que o sistema é exclusivamente musical.
- [x] A sidebar mantém a ordem atual.
- [x] O Dashboard administrativo possui maior densidade de informações.
- [x] O Dashboard do usuário comum é simplificado.
- [x] O calendário respeita a experiência Mobile First existente.
- [x] O calendário não é confundido com o Dashboard.
- [x] Os indicadores coloridos são tratados como Tempo Litúrgico.
- [x] Cores litúrgicas não são usadas como status administrativo.
- [x] A cobertura representa diferentes ministérios.
- [x] A interface continua responsiva (sem scroll horizontal em 360px).
- [x] O Design System permanece consistente.
- [x] Nenhuma regra de negócio foi alterada (`git diff` de `api/` vazio desde o início da SPEC,
      salvo decisão registrada em ADR).
- [x] `npm run build` e `npm test` passam.
- [x] Achados não resolvidos viram tasks novas (não corrigidos silenciosamente aqui).

## Dependências

- `TASK-0098`, `TASK-0099`, `TASK-0101`, `TASK-0102`, `TASK-0103`, `TASK-0104`, `TASK-0105`,
  `TASK-0106` (as demais tasks da SPEC entram transitivamente).

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §25, §28, §31.
- `docs/tasks/0072-relatorio-final-etapa5.md` (formato de validação usado anteriormente).

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada.

  **Ambiente**: Postgres 16 temporário em Docker (porta 55432) + migrations + seed padrão + seed
  temporário `api/prisma/_seedSpec031.ts` (não commitado): admin, coordenadora e servidora
  (Leitora) com login; 6 servidores em 5 categorias; 6 escalas (rascunho e confirmadas,
  convites pendentes, um Turiferário, um Violão); liturgia de setembro com Verde, Branco e
  Vermelho; 1 repertório; 2 substituições; 6 categorias extras para testar volume.

  **Checklist §31, com evidência**:

  - [x] **Diferentes ministérios**: funções reais em Dashboard do servidor, Minha Escala,
    Substituições e Detalhes (`TASK-0104`/`0105`/`0106`); cobertura por categoria real
    (`TASK-0103`, 13 categorias testadas).
  - [x] **Não exclusivamente musical**: `♪` e gradiente roxo removidos; repertório só "quando
    aplicável" e secundário nos detalhes; função mostrada para Leitores e Acólitos, não só
    instrumento. Pendência registrada: calendário público (`TASK-0109`, exige API).
  - [x] **Sidebar com a ordem atual**: `git diff` do `AuthenticatedLayout` desde `b49f2f1` só
    altera o critério de item ativo de "Escalas" (`isScalesRoute`); ordem conferida no DOM
    (`TASK-0098`).
  - [x] **Dashboard administrativo mais denso**: destaque + calendário + próximas celebrações,
    pendências, cobertura e situação (`TASK-0102`/`0103`).
  - [x] **Dashboard do servidor simplificado**: sem estatísticas nem dados de terceiros; ordem
    próxima → próximas → pendências → disponibilidade → conteúdo (`TASK-0104`).
  - [x] **Calendário respeita o Mobile First**: grade compacta + lista mantida abaixo de `md`
    (`TASK-0101`), verificada a 375px.
  - [x] **Calendário não confundido com o Dashboard**: componente próprio "Calendário
    Litúrgico — {mês}", contido na coluna esquerda, abaixo do destaque (`TASK-0101`/`0102`).
  - [x] **Indicadores = tempo litúrgico**: ponto/tinta por `Liturgia.cor`, legenda "Cor do dia ·
    Tempo litúrgico" com significado, rótulo acessível por dia (`TASK-0100`/`0101`).
  - [x] **Cores litúrgicas ≠ status**: chips de escala neutros (ícone para confirmada), legendas
    separadas, teste unitário garante que as classes litúrgicas não usam tokens semânticos, e
    grep confirma que não sobraram classes de família litúrgica em `Dashboard.vue`/`Calendar.vue`
    fora do util.
  - [x] **Cobertura representa diferentes ministérios**: `ADR-0005`, N categorias, rolagem
    interna.
  - [x] **Continua responsiva**: varredura automática com iframes a 360/414/768/1024/1440px em
    `/dashboard`, `/escalas/2`, `/escalas` e `/substituicoes` (admin) e `/dashboard`,
    `/escalas/2` e `/minha-escala` (servidora): `scrollWidth − clientWidth = 0` em todas as 29
    combinações. `/escalas` a 768–1024px tem tabela rolando dentro do próprio contêiner, sem
    transbordar a página (pré-existente, aceitável). Achado: falta gutter lateral no mobile
    (`TASK-0108`).
  - [x] **Design System consistente**: 0 classes `indigo-*`, 0 cores arbitrárias `[#...]` em
    classes, 0 `text-[10px]` no Dashboard/Calendário; tokens `primary`/`canvas`/`shadow-card`
    (`ADR-0003`), `Card`/botões do DS nas telas tocadas; claro e escuro verificados em todas as
    tasks.
  - [x] **Nenhuma regra de negócio alterada**: `git diff --stat b49f2f1 HEAD -- api/ src/router
    src/stores` vazio. Mudanças de dados foram só de leitura/apresentação (endpoints
    existentes).
  - [x] `npm run build` e `npm test` (30 testes) passam no último commit da SPEC (`a10bcb9`).
  - [x] Achados não resolvidos viraram tasks: `TASK-0108` (gutter mobile), `TASK-0109`
    (ministério no calendário público, com human gate por ser API pública) e `TASK-0110`
    (focus trap do drawer no tablet).

  **Encerramento do programa**: as tasks de implementação da SPEC-003.1 (`0096`–`0106`) estão
  `concluida`, e não há task `adiada`/`parcialmente-concluida` nela. Ficam em `backlog` as 3
  melhorias de acompanhamento acima, fora dos critérios da §31.
