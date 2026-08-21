---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0001 — Auditoria de rotas e funcionalidades existentes

**Task ID**: `TASK-0001`

## Objetivo

Levantar e documentar todas as rotas, páginas e funcionalidades atualmente existentes no
sistema (`src/router/index.ts`, `src/pages/`), incluindo quais perfis (`admin`/`coordenador`/
`musico`/visitante anônimo) têm acesso a cada uma, para servir de base factual à reestruturação
de arquitetura de navegação proposta em [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md).

A SPEC-001 (seção 4, observação) exige explicitamente: "o agente de implementação deverá
verificar as rotas e funcionalidades efetivamente existentes antes de criar, remover ou renomear
qualquer recurso" e (seção 19) proíbe "criar funcionalidades não existentes" ou "remover
funcionalidades existentes". Sem esta auditoria, as tasks seguintes (mapa de navegação, matriz de
acesso, fluxos, recomendações) correm o risco de inventar ou omitir funcionalidades.

## Dependências

Nenhuma.

## Critérios de conclusão

- [x] Lista completa das rotas atuais (`src/router/index.ts`) documentada, com path, página
      associada e guard de papel (`meta.roles`), quando existente.
- [x] Lista completa das páginas em `src/pages/` mapeadas às rotas correspondentes (ou
      identificadas como órfãs/sem rota direta, se houver).
- [x] Funcionalidades citadas na SPEC-001 (Relatórios, Substituições, Escalas Recorrentes,
      Intensidade de Serviço, Disponibilidade, Repertórios, Liturgia, Minha Escala) confirmadas
      como existentes no código, com caminho de arquivo/rota correspondente.
- [x] Divergências entre a SPEC-001 e o sistema real (funcionalidade citada na SPEC que não
      existe, ou funcionalidade existente não citada pela SPEC) registradas explicitamente.
- [x] Resultado registrado de forma reutilizável pelas TASK-0002 a TASK-0005 (nas notas de
      progresso desta task, ou em documento de apoio referenciado a partir delas).

## Resultado da auditoria (2026-08-21)

Fonte: `src/router/index.ts` (33 rotas), `src/layouts/AuthenticatedLayout.vue` (menu atual),
`src/stores/auth.ts` (roles: `admin` | `coordenador` | `musico`).

### 1. Rotas registradas

**Autenticação (guest)**

| Path | Nome | Página |
|---|---|---|
| `/login` | `login` | `auth/Login.vue` |
| `/register` | `register` | `auth/Register.vue` |
| `/forgot-password` | `forgot-password` | `auth/ForgotPassword.vue` |
| `/reset-password` | `reset-password` | `auth/ResetPassword.vue` |

**Dashboard**

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/` | — | redirect → `/dashboard` | — | — |
| `/dashboard` | `dashboard` | `dashboard/Dashboard.vue` | `auth` | Sim |

**Servidores**

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/servidores` | `servidores.index` | `servidores/Index.vue` | `auth` | Sim (staff) |
| `/servidores/criar` | `servidores.create` | `servidores/Create.vue` | `auth`, `[admin,coordenador]` | Não — ação dentro do Index |
| `/servidores/:id` | `servidores.show` | `servidores/Show.vue` | `auth` | Não — via Index |
| `/servidores/:id/editar` | `servidores.edit` | `servidores/Edit.vue` | `auth`, `[admin,coordenador]` | Não — via Show |
| `/servidores/intensidade` | `servidores.intensity` | `servidores/Intensity.vue` | `auth`, `[admin,coordenador]` | **Não** — só botão em `servidores/Index.vue` |

**Equipes** (rotulado "Ministérios" no menu atual)

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/equipes` | `teams.index` | `teams/Index.vue` | `auth` | Sim (staff, rótulo "Ministérios") |
| `/equipes/criar` | `teams.create` | `teams/Create.vue` | `auth`, `[admin,coordenador]` | Não |
| `/equipes/:id` | `teams.show` | `teams/Show.vue` | `auth` | Não |
| `/equipes/:id/editar` | `teams.edit` | `teams/Edit.vue` | `auth`, `[admin,coordenador]` | Não |

**Comunidades / Categorias / Celebrantes** (cadastros administrativos)

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/comunidades` | `comunidades.index` | `comunidades/Index.vue` | `auth`, `[admin,coordenador]` | Sim (staff) |
| `/comunidades/criar`, `/comunidades/:id/editar` | — | `Create.vue`/`Edit.vue` | `auth`, `[admin,coordenador]` | Não |
| `/categorias` | `categorias.index` | `categorias/Index.vue` | `auth`, `[admin,coordenador]` | Sim (staff) |
| `/categorias/criar`, `/categorias/:id/editar` | — | `Create.vue`/`Edit.vue` | `auth`, `[admin,coordenador]` | Não |
| `/celebrantes` | `celebrantes.index` | `celebrantes/Index.vue` | `auth`, `[admin,coordenador]` | Sim (staff) |
| `/celebrantes/criar`, `/celebrantes/:id/editar` | — | `Create.vue`/`Edit.vue` | `auth`, `[admin,coordenador]` | Não |

**Escalas**

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/escalas` | `scales.index` | `scales/Index.vue` | `auth` | Sim (todos autenticados) |
| `/escalas/criar` | `scales.create` | `scales/Create.vue` | `auth`, `[admin,coordenador]` | Não — botão no Dashboard/Index |
| `/escalas/:id` | `scales.show` | `scales/Show.vue` | `auth` | Não — via Index |
| `/escalas/:id/editar` | `scales.edit` | `scales/Edit.vue` | `auth`, `[admin,coordenador]` | Não |
| `/minha-escala` | `scales.mine` | `scales/MyScales.vue` | `auth` | Sim (apenas não-staff) |

**Escalas Recorrentes**

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/escalas-recorrentes` | `scaleTemplates.index` | `scaleTemplates/Index.vue` | `auth`, `[admin,coordenador]` | **Não** — só botão em `scales/Index.vue` |
| `/escalas-recorrentes/criar`, `/escalas-recorrentes/:id/editar` | — | `Create.vue`/`Edit.vue` | `auth`, `[admin,coordenador]` | Não |

**Repertório e Liturgia** (contextuais a uma escala)

| Path | Nome | Página | Guard | Acesso |
|---|---|---|---|---|
| `/escalas/:id/repertorio` | `repertoire.show` | `repertoire/Show.vue` | `auth` | Contextual, via `scales/Show.vue` |
| `/escalas/:id/repertorio/editar` | `repertoire.edit` | `repertoire/Edit.vue` | `auth`, `[admin,coordenador]` | Contextual |
| `/escalas/:id/liturgia` | `liturgia.show` | `liturgia/Show.vue` | `auth` | Contextual, via `scales/Show.vue` |

**Disponibilidade**

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/disponibilidade` | `availability.form` | `availability/Form.vue` | `auth`, `[musico]` | Sim (apenas não-staff) |
| `/disponibilidade/painel` | `availability.panel` | `availability/Panel.vue` | `auth`, `[admin,coordenador]` | Sim (staff, rótulo "Disponibilidade") |

**Substituições / Relatórios**

| Path | Nome | Página | Guard | No menu hoje? |
|---|---|---|---|---|
| `/substituicoes` | `substitutions.index` | `substitutions/Index.vue` | `auth`, `[admin,coordenador]` | **Não** — só botão no header do Dashboard (staff) |
| `/relatorios` | `reports.index` | `reports/Index.vue` | `auth`, `[admin,coordenador]` | **Não** — só botão no header do Dashboard (staff) |

**Público / Perfil**

| Path | Nome | Página | Guard | Observação |
|---|---|---|---|---|
| `/publico` | `public.calendar` | `public/Calendar.vue` | sem `meta` (acesso anônimo) | Única rota realmente pública |
| `/profile` | `profile.edit` | `profile/Edit.vue` | `auth` | Página única: dados da conta + senha + notificações push + exclusão de conta, num só formulário |
| `/:pathMatch(.*)*` | — | redirect → `/dashboard` | — | 404 |

Todas as páginas em `src/pages/` estão associadas a alguma rota — não há páginas órfãs sem rota.

### 2. Funcionalidades da SPEC-001 confirmadas no código

| Funcionalidade citada na SPEC-001 | Existe? | Rota | Acesso atual |
|---|---|---|---|
| Relatórios | Sim | `/relatorios` | Indireto (botão no header do Dashboard, staff) |
| Substituições | Sim | `/substituicoes` | Indireto (botão no header do Dashboard, staff) |
| Escalas Recorrentes / Recorrências | Sim | `/escalas-recorrentes` | Indireto (botão em `scales/Index.vue`) |
| Intensidade de serviço | Sim | `/servidores/intensidade` | Indireto (botão em `servidores/Index.vue`) |
| Disponibilidade | Sim | `/disponibilidade` (servidor) e `/disponibilidade/painel` (coordenador) | Direto no menu — dois pontos de entrada por perfil |
| Repertórios | Sim | `/escalas/:id/repertorio(/editar)` | Só contextual — não existe rota de listagem própria fora do contexto de uma escala |
| Liturgia | Sim | `/escalas/:id/liturgia` | Só contextual — mesma observação acima |
| Minha Escala | Sim | `/minha-escala` | Direto no menu (apenas não-staff) |
| Escalas (núcleo) | Sim | `/escalas`, `/escalas/:id`, `/escalas/criar`, `/escalas/:id/editar` | Direto no menu (index); demais indiretos |
| Pessoas / Servidores | Sim | `/servidores` | Direto no menu (staff) |
| Configurações (Ministérios/Categorias/Comunidades/Celebrantes) | Sim | `/equipes`, `/categorias`, `/comunidades`, `/celebrantes` | Diretos no menu (staff) |
| Perfil | Sim, mas como página única | `/profile` | Direto (link no header, fora do menu lateral) |

Nenhuma funcionalidade citada na SPEC-001 está ausente do código.

### 3. Divergências relevantes para as próximas tasks (TASK-0002 a 0005)

- **Repertório/Liturgia sem rota de listagem própria**: a SPEC-001 §14 propõe uma área
  "Conteúdo → Repertórios/Liturgia" além do acesso contextual, mas hoje essas telas só existem
  como sub-rota de uma escala específica (`/escalas/:id/repertorio`, `/escalas/:id/liturgia`).
  A TASK-0002 precisa decidir como representar isso no mapa sem inventar uma rota de listagem
  nova (o que seria "criar funcionalidade não existente", proibido pela SPEC-001 §19) — por
  exemplo, deixando claro que o item de menu "Conteúdo" é, por ora, só um agrupamento
  conceitual dos pontos de acesso contextuais já existentes.
- **Perfil é uma única página**: `/profile` cobre conta, senha e notificações num só
  formulário; não há sub-rotas separadas. A estrutura da SPEC-001 §17 (Perfil → Minha conta /
  Notificações / Segurança) deve ser tratada, na TASK-0002, como divisão de **seções dentro
  dessa página existente**, não como sub-rotas novas.
- **Terminologia**: o perfil "servidor" (usado na SPEC e na UI) corresponde ao role de sistema
  `musico` no código/guards. Não existe role "visitante" — usuário anônimo é apenas ausência de
  sessão; a única rota efetivamente pública é `/publico`.
- **"Ministérios" = "Equipes"**: o rótulo de menu atual e a SPEC (em Configurações) usam
  "Ministérios", mas o recurso de código é `equipes`/`teams.*`.
- **Confirma-se o problema descrito na SPEC-001 §2**: Relatórios, Substituições, Escalas
  Recorrentes e Intensidade de Serviço existem e funcionam plenamente, mas não têm entrada
  própria no menu principal — só acesso indireto via botões dentro de outras telas (Dashboard,
  `scales/Index.vue`, `servidores/Index.vue`).

## Referências

- [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) — seção 4 (observação), seção 19.
- `src/router/index.ts`, `src/pages/`.
- [`docs/arquitetura.md`](../arquitetura.md) — seção 5 (estrutura de diretórios).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-001.
- 2026-08-21 — Task reivindicada e executada. Auditoria completa das 33 rotas de
  `src/router/index.ts`, do menu atual (`src/layouts/AuthenticatedLayout.vue`) e dos roles
  (`src/stores/auth.ts`) registrada na seção "Resultado da auditoria" acima. Todas as
  funcionalidades citadas na SPEC-001 foram confirmadas como existentes no código; nenhuma
  ausente. Três divergências relevantes documentadas para orientar TASK-0002/TASK-0003 sem
  reinterpretar a SPEC silenciosamente: (1) Repertório/Liturgia não têm rota de listagem própria
  fora do contexto de uma escala; (2) Perfil é uma única página, sem sub-rotas para
  Notificações/Segurança; (3) terminologia SPEC↔código diverge em "servidor"/`musico` e
  "Ministérios"/`equipes`. Task marcada `concluida` — todos os critérios de conclusão atendidos.
  Próximo passo: TASK-0002 (mapa de navegação + matriz de acesso) já está elegível.
