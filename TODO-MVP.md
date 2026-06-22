# MVP — Sistema de Gerenciamento de Escala de Músicos Litúrgicos

Checklist de implementação do MVP, baseado no documento de arquitetura (`readme.txt`).

**Stack:** Laravel 10 (PHP 8.1.10) + Vue 3 + Tailwind CSS via Inertia.js + PostgreSQL 14.5.
Ambiente local (Laragon) mantido como está — sem upgrades de PHP/Node/Postgres.

---

## Fase 0 — Verificação do ambiente (sem upgrades)

- [x] Confirmar versões ativas: `php -v` → 8.1.10, `composer -V` → 2.10.1
- [x] Confirmar PostgreSQL 14.5 rodando (serviço já ativo) e conexão via `psql` (usuário padrão do Laragon: `postgres`/`root`)
- [x] Criar o banco de dados do projeto: `CREATE DATABASE escala_musicos;`
- [ ] (Opcional) Criar um usuário/role dedicado da aplicação (`escala_app`) em vez de usar o superusuário `postgres` — pulado por simplicidade no MVP/dev
- [x] Confirmar Git instalado e configurado (`user.name`/`user.email` já presentes)

## Fase 1 — Criação e configuração inicial do projeto Laravel 10

- [x] Criar o projeto: `composer create-project laravel/laravel:^10.0 .` (movendo `readme.txt`/`TODO-MVP.md` para fora e de volta, já que o Composer exige diretório vazio)
- [x] **Achado importante:** toda a série Laravel 10.x está marcada pelo Composer com avisos de segurança não corrigidos (framework em fim de vida). Para a instalação não ser bloqueada, foi desativado o bloqueio via `composer config policy.advisories.block false` (só neste projeto). Decisão do usuário: aceitável para este MVP de teste, mas **não é recomendado para produção** — ver nota de fase futura.
- [x] Mover o `readme.txt` para `docs/arquitetura.md`
- [x] `git init` + primeiro commit do scaffold limpo (`chore: scaffold inicial Laravel 10`)
- [x] Copiar `.env.example` → `.env` e rodar `php artisan key:generate`
- [x] Ajustar `APP_NAME`, `APP_URL` no `.env`; `timezone`/`locale` ajustados direto em `config/app.php` (no Laravel 10 esses campos não lêem do `.env`)
- [x] Configurar conexão Postgres no `.env`: `DB_CONNECTION=pgsql`, `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_DATABASE=escala_musicos`, `DB_USERNAME=postgres`, `DB_PASSWORD=root`
- [x] Habilitar extensões `pdo_pgsql` e `pgsql` no `php.ini` do PHP 8.1.10 do Laragon (estavam comentadas/desativadas por padrão)
- [x] Testar conexão: `php artisan migrate` (rodou as migrations padrão sem erro)
- [x] `php artisan serve` e validar a tela inicial do Laravel em `http://127.0.0.1:8000` (HTTP 200, título "Laravel")
- [x] Commit do scaffold inicial (cobriu também a configuração de ambiente, sem diffs extras pendentes)

## Fase 2 — Breeze (Vue + Inertia), Tailwind e Vite

- [x] `composer require laravel/breeze --dev` (instalou v1.29.1, compatível com PHP 8.1 — a v2.x exige PHP 8.2+)
- [x] `php artisan breeze:install vue` (scaffold PHP gerado; o `npm install` interno falhou por falta do `npm` no PATH — instalado manualmente depois)
- [x] Revisar o scaffold gerado: `resources/js/Pages/Auth/*`, `Dashboard.vue`, `Layouts/AuthenticatedLayout.vue`, `GuestLayout.vue` — todos presentes
- [x] Confirmar Tailwind (`tailwind.config.js`, `resources/css/app.css`) e Vite (`vite.config.js`) já configurados pelo Breeze
- [x] `npm install` (usando `node`/`npm` de `C:\laragon\bin\nodejs\node-v18\`, fora do PATH padrão) e `npm run build` (validação de build de produção, 185 módulos compilados sem erro)
- [x] `php artisan migrate` (nada pendente, tabelas do Breeze já cobertas pelo scaffold padrão) + `php artisan serve`
- [x] Testado fluxo completo via requisições HTTP reais (cookies + CSRF): registro → dashboard (200, dados do usuário presentes) → logout (dashboard passa a redirecionar para `/login`) → login → dashboard novamente (200)
- [x] Responsividade (RNF04) confirmada: classes Tailwind com breakpoints `sm:`/`md:` presentes em `GuestLayout.vue` e `AuthenticatedLayout.vue`
- [x] Commit: "feat: instala Laravel Breeze (Vue + Inertia), Tailwind e Vite"

## Fase 3 — Modelagem do banco de dados

### 3.1 Perfis de usuário (RF01)
- [ ] Migration para adicionar coluna `role` à tabela `users` (`admin`, `coordenador`, `musico`)
- [ ] Criar `app/Enums/UserRole.php` e usar como cast em `User::$casts`
- [ ] Adicionar a `User`: `isAdmin()`, `isCoordenador()`, `isMusico()`, relacionamento `hasOne(Musician::class)`
- [ ] Criar Policies (`MusicianPolicy`, `ScalePolicy`, `RepertoirePolicy`) e registrá-las em `app/Providers/AuthServiceProvider.php`
- [ ] Criar Middleware `EnsureUserHasRole` e registrar como alias em `app/Http/Kernel.php`

### 3.2 Músicos e instrumentos (RF02)
- [ ] Migration `musicians` (`id`, `user_id` FK nullable, `nome`, `telefone`, `email` nullable, `ativo`, `observacoes`, timestamps)
- [ ] Migration `instruments` (`id`, `nome`) + pivot `instrument_musician`
- [ ] Models `Musician` e `Instrument` com relacionamentos
- [ ] Seeder `InstrumentSeeder` (Violão, Teclado/Piano, Voz, Bateria, Baixo, Flauta, Violino, Cajón) e `MusicianFactory`

### 3.3 Equipes musicais (RF03)
- [ ] Migration `teams` (`id`, `nome`, `descricao`, `ativo`) + pivot `musician_team`
- [ ] Model `Team` com `belongsToMany(Musician)` e `hasMany(Scale)`

### 3.4 Escalas (RF04)
- [ ] Migration `scales` (`id`, `data`, `horario`, `celebracao`, `team_id` FK nullable, `observacoes`, `status`)
- [ ] Migration pivot `scale_musician` (`scale_id`, `musician_id`, `instrument_id` nullable, `confirmado` boolean)
- [ ] Model `Scale` (`belongsTo(Team)`, `belongsToMany(Musician)->withPivot('instrument_id','confirmado')`)
- [ ] Enum `ScaleStatus` (`Rascunho`, `Confirmada`)

### 3.5 Repertórios e partituras (RF06, RF07)
- [ ] Migration `repertoires` (`id`, `scale_id` FK, `titulo`, `observacoes`)
- [ ] Migration `repertoire_items` (`id`, `repertoire_id` FK, `ordem`, `titulo_musica`, `tom` nullable, `arquivo_pdf_path` nullable, `link_externo` nullable)
- [ ] Models `Repertoire` e `RepertoireItem`
- [ ] Configurar disco `public` em `config/filesystems.php` + `php artisan storage:link`

### 3.6 Disponibilidade dos músicos (extra)
- [ ] Migration `availabilities` (`id`, `musician_id` FK, `tipo` enum [`data_especifica`,`recorrente_semanal`], `dia_semana`/`data`, `periodo` [`manha`,`tarde`,`noite`], `disponivel`, `observacao`)
- [ ] Model `Availability` (`belongsTo(Musician)`)

### 3.7 Fechamento
- [ ] `php artisan migrate` completo e validação das FKs no HeidiSQL
- [ ] Seeders consolidados (`InstrumentSeeder` + `AdminUserSeeder` de teste) via `DatabaseSeeder`
- [ ] Commit: "feat: modelagem completa do banco (músicos, equipes, escalas, repertórios, disponibilidade)"

## Fase 4 — Páginas Vue/Inertia por requisito funcional

- [ ] **RF01**: Middleware de role aplicado nas rotas; `Dashboard.vue` com conteúdo condicional por perfil; desabilitar autoregistro público
- [ ] **RF02**: `MusicianController` resource + rotas `musicos`; páginas `Musicians/Index.vue`, `Create.vue`, `Edit.vue`, `Show.vue`; `StoreMusicianRequest`/`UpdateMusicianRequest`
- [ ] **RF03**: `TeamController` resource + rotas `equipes`; páginas `Teams/Index.vue`, `Create.vue`/`Edit.vue`
- [ ] **RF04**: `ScaleController` resource + rotas `escalas`; páginas `Scales/Index.vue`, `Create.vue`, `Edit.vue`, `Show.vue`; rota `PATCH /escalas/{escala}/confirmar`
- [ ] **RF06**: `RepertoireController` + `RepertoireItemController`; páginas `Repertoires/Show.vue` e `Edit.vue`
- [ ] **RF07**: upload de PDF validado em `RepertoireItemController`; rota/método de download via `Storage::disk('public')->download(...)`; botão de download em `Repertoires/Show.vue`
- [ ] **Disponibilidade (extra)**: `AvailabilityController`; página `Availability/Form.vue` (músico) e `Availability/Index.vue` (Coordenador)
- [ ] **Compartilhado**: menu de navegação condicional por `role` em `AuthenticatedLayout.vue`; componentes reutilizáveis (`Badge`, `MultiSelect`, tabela paginada)
- [ ] Commits incrementais por RF

## Fase 5 — Notificações (RF05)

> MVP usa Laravel Notifications com canais `database` + `mail`, processamento síncrono (sem fila/Redis).

- [ ] `php artisan notifications:table` + `migrate`
- [ ] Notification `MusicianScheduledNotification` (`via`: `database`,`mail`)
- [ ] Notification `ScaleReminderNotification` para lembrete "um dia antes da missa"
- [ ] Configurar `.env` de e-mail em dev (`MAIL_MAILER=log` ou Mailtrap/Mailpit)
- [ ] Dropdown de notificações em `AuthenticatedLayout.vue` + rota para marcar como lida
- [ ] Commit: "feat: sistema de notificações para músicos escalados (RF05)"

## Fase 6 — Job agendado: preenchimento automático mensal (extra)

> Laravel 10 registra o agendamento em `app/Console/Kernel.php::schedule()`.

- [ ] Migration `fixed_schedule_slots` (`id`, `dia_semana`, `horario`, `celebracao`, `team_id` nullable, `ativo`)
- [ ] Model `FixedScheduleSlot` + tela administrativa (`FixedScheduleSlotController`, `FixedSlots/Index.vue`, `Create.vue`/`Edit.vue`)
- [ ] Command `GenerateMonthlySchedule` (`schedule:generate-monthly`)
- [ ] Pré-vincular músicos com `Availability` compatível ao gerar escalas automáticas (sugestão, `confirmado=false`)
- [ ] Command `SendScaleReminders` (`schedule:send-reminders`)
- [ ] Registrar os dois Commands em `app/Console/Kernel.php`: `->monthlyOn(25, '03:00')` e `->dailyAt('18:00')`
- [ ] Documentar no README o cron real de produção (`* * * * * php artisan schedule:run`)
- [ ] Testes básicos (`GenerateMonthlyScheduleTest`)
- [ ] Commit: "feat: geração automática mensal de escalas com dias fixos e lembretes agendados"

## Fase 7 — Escopo do MVP (dentro vs. fora)

**Dentro do MVP:**
- [ ] RF01–RF07 completos + disponibilidade + geração mensal automática
- [ ] Auth apenas com sessões do Breeze (sem Sanctum/API tokens, sem OAuth, sem 2FA)
- [ ] PDFs em disco local `public` (sem S3/cloud storage)
- [ ] Notificações síncronas (sem fila/Redis)
- [ ] Deploy manual em servidor único (sem Docker/Kubernetes/CI-CD)

**Fora do MVP — fase futura:**
- [ ] Laravel Octane, filas com Redis, Docker/Kubernetes, deploy em AWS/Azure
- [ ] API REST via Sanctum para app mobile nativo
- [ ] Notificações push/WhatsApp, dashboards de métricas, SSR do Inertia, multi-tenancy

## Fase 8 — Encerramento do MVP

- [ ] `README.md` do projeto: setup local, comandos úteis, link para `docs/arquitetura.md`
- [ ] Revisão manual de cada RF navegando como Admin, Coordenador e Músico
- [ ] `npm run build` e validar assets de produção
- [ ] Commit final: "chore: MVP do Sistema de Gerenciamento de Escala de Músicos Litúrgicos concluído" + tag `v0.1.0-mvp` (opcional)
