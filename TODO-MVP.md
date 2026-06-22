# MVP — Sistema de Gerenciamento de Escala de Músicos Litúrgicos

Checklist de implementação do MVP, baseado no documento de arquitetura (`readme.txt`).

**Stack:** Laravel 10 (PHP 8.1.10) + Vue 3 + Tailwind CSS via Inertia.js + PostgreSQL 14.5.
Ambiente local (Laragon) mantido como está — sem upgrades de PHP/Node/Postgres.

---

## Fase 0 — Verificação do ambiente (sem upgrades)

- [ ] Confirmar versões ativas no terminal do Laragon: `php -v` → 8.1.10, `composer -V` → 2.10.1, `node -v` → v18.x
- [ ] Iniciar o serviço PostgreSQL 14.5 pelo painel do Laragon e validar conexão via HeidiSQL ou `psql`
- [ ] Criar o banco de dados do projeto: `CREATE DATABASE escala_musicos;`
- [ ] (Opcional, recomendado) Criar um usuário/role dedicado da aplicação (`escala_app`) em vez de usar o superusuário `postgres`
- [ ] Confirmar Git instalado e configurado (`git --version`, `user.name`, `user.email`)

## Fase 1 — Criação e configuração inicial do projeto Laravel 10

- [ ] No terminal do Laragon, navegar até a pasta do projeto
- [ ] Criar o projeto: `composer create-project laravel/laravel:^10.0 .`
- [ ] Mover o `readme.txt` para `docs/arquitetura.md`
- [ ] `git init` (se necessário) + primeiro commit do scaffold limpo
- [ ] Copiar `.env.example` → `.env` e rodar `php artisan key:generate`
- [ ] Ajustar no `.env`: `APP_NAME`, `APP_URL`, `APP_TIMEZONE=America/Sao_Paulo`, `APP_LOCALE=pt_BR`
- [ ] Configurar conexão Postgres no `.env`: `DB_CONNECTION=pgsql`, `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_DATABASE=escala_musicos`, `DB_USERNAME`, `DB_PASSWORD`
- [ ] Testar conexão: `php artisan migrate`
- [ ] `php artisan serve` e validar a tela inicial do Laravel em `http://127.0.0.1:8000`
- [ ] Commit: configuração de ambiente e `.env.example` atualizado (nunca commitar `.env` real)

## Fase 2 — Breeze (Vue + Inertia), Tailwind e Vite

- [ ] `composer require laravel/breeze --dev`
- [ ] `php artisan breeze:install vue`
- [ ] Revisar o scaffold gerado: `resources/js/Pages/Auth/*`, `Dashboard.vue`, `Layouts/AuthenticatedLayout.vue`, `GuestLayout.vue`
- [ ] Confirmar Tailwind (`tailwind.config.js`, `resources/css/app.css`) e Vite (`vite.config.js`) já configurados pelo Breeze
- [ ] `npm install` e `npm run dev` (deixar rodando em paralelo)
- [ ] `php artisan migrate` (tabelas do Breeze) + `php artisan serve`
- [ ] Testar fluxo completo: registro → dashboard → logout → login
- [ ] Checar responsividade básica (RNF04) no DevTools em modo mobile
- [ ] Commit: "feat: instala Laravel Breeze (Vue + Inertia), Tailwind e Vite"

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
