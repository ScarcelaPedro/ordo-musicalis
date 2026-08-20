# Ordo Musicalis — AGENTS.md

Leia este arquivo primeiro. Cada módulo tem seu próprio `AGENTS.md` com detalhes específicos (ver tabela abaixo).

## O que é este projeto

Ordo Musicalis é um sistema de gerenciamento de escalas de músicos e servidores litúrgicos para uma paróquia: cadastro de servidores/equipes/comunidades/celebrantes, montagem e confirmação de escalas de celebração, coleta de disponibilidade, vínculos fixos (recorrência automática), repertório musical (com PDFs), liturgia diária integrada, substituições, notificações (push/e-mail/WhatsApp) e relatórios. É uma SPA Vue 3 consumindo uma API Express própria, com PostgreSQL via Prisma, hospedada na Vercel.

## Escopo atual e direção do projeto

O roadmap e as prioridades atuais ainda não estão consolidados em `docs/SCOPE.md` (arquivo novo, ver seção de governança abaixo) — até que o usuário/time o preencha, use `todo.md`, `TODO-MVP.md` e `todo-liturgia.md` na raiz como sinal do que está em andamento/planejado, mas prefira sempre `docs/SCOPE.md` como fonte formal assim que ele existir. Agentes devem ler `docs/SCOPE.md` antes de propor mudanças de arquitetura ou prioridade, e não devem editá-lo, exceto quando o usuário pedir explicitamente uma mudança de escopo/direção.

## Estrutura do repositório

| Diretório | Tipo | Descrição | AGENTS.md |
|---|---|---|---|
| `src/` | SPA (Vue 3 + Vite) | Frontend — todas as telas e stores da aplicação | [`src/AGENTS.md`](src/AGENTS.md) |
| `api/` | API (Express + Prisma) | Backend serverless, lógica de negócio e persistência | [`api/AGENTS.md`](api/AGENTS.md) |
| `evolution/` | Infra (Docker Compose) | Stack self-hosted da Evolution API (WhatsApp) + Postgres + Redis, consumida por `api/_lib/sendWhatsapp.ts` | — |
| `public/` | Estático | Assets servidos como estão (`sw.js` — Service Worker de push) | — |
| `docs/` | Documentação | `arquitetura.md`, `SCOPE.md`, `decisions/`, `tasks/` | — |
| `resources/` | ⚠️ Código morto | Scaffold Laravel Breeze/Inertia abandonado, não usado pelo build atual — ver [`src/AGENTS.md`](src/AGENTS.md) | — |
| `dist/` | Build gerado | Saída de `npm run build`, não editar manualmente. ⚠️ Está versionada no Git (não consta em `.gitignore`), o que é atípico já que o deploy na Vercel gera o build automaticamente — provavelmente sobra de um fluxo anterior; não é necessário atualizá-la manualmente a cada commit | — |

`README.md` e `docs/arquitetura.md` foram atualizados para refletir a arquitetura real (Vue 3 SPA + API Express + Prisma) — antes descreviam um plano Laravel/Inertia nunca concluído. Use-os normalmente como fonte de verdade.

## Build

```bash
npm install          # roda `postinstall` (prisma generate) automaticamente
npm run dev           # SPA (Vite), porta 5173
npm run api:dev       # API (Express via ts-node), porta 3001
npm run dev:full       # os dois juntos (concurrently)
npm run build         # type-check (vue-tsc) + build de produção em dist/
npm run db:migrate     # aplica migrations Prisma
npm run db:seed        # popula dados de exemplo
```

Infra opcional de WhatsApp (Evolution API): `docker compose -f evolution/docker-compose.yml up -d` (requer `EVOLUTION_API_KEY` no ambiente).

Ver [`src/AGENTS.md`](src/AGENTS.md) e [`api/AGENTS.md`](api/AGENTS.md) para detalhes de configuração e variáveis de ambiente.

## Regras de padronização (obrigatórias para agentes de IA)

Regras de política da Soluta SoftHouse — têm prioridade sobre qualquer padrão herdado do código existente neste repositório. Aplique-as a todo código novo e a todo trecho que você tocar; não é necessário fazer varreduras de reescrita em massa em código não relacionado à sua tarefa só para adequá-lo.

### 1. Idioma: código em inglês, documentação em português

- **Código** — identificadores (classes, funções, variáveis, parâmetros), comentários de código, mensagens de log/exceção, nomes de commit/branch: **em inglês**.
- **Documentação** — `AGENTS.md`, `README.md`, `docs/`, registros de decisão (regra 2) e qualquer material de arquitetura/processo: **em português**.
- **Exceção — texto voltado ao usuário final**: strings exibidas na UI (labels, toasts, mensagens de erro, e-mails, bundles de i18n) continuam no idioma do público do sistema (normalmente português, para usuários brasileiros) — isso é conteúdo de produto, não "código" nem "documentação" para efeito desta regra.
- Código pré-existente em português (comentários, logs) **não precisa ser retroativamente traduzido** só por causa desta regra. Ao editar um arquivo, prefira migrar para inglês o trecho que você está tocando, em vez de misturar ainda mais os dois idiomas dentro do mesmo arquivo.
- Termos de domínio do negócio (siglas do setor, nomenclatura oficial de sistemas externos com os quais o projeto integra) nunca são traduzidos.

### 2. Toda decisão relevante deve ficar documentada

Para evitar que sessões/agentes diferentes tomem decisões conflitantes (duas abordagens diferentes para o mesmo problema, reversão silenciosa de uma escolha anterior), **é responsabilidade do próprio agente registrar as decisões que tomar** — não do usuário.

- Registros ficam em `docs/decisions/`, um arquivo Markdown por decisão, numerado sequencialmente (`0001-titulo-curto.md`), em português. Template em `docs/decisions/0000-template.md`.
- **Antes** de tomar uma decisão técnica não trivial (escolha de biblioteca, padrão de arquitetura, trade-off, contorno de limitação, desvio de uma convenção já estabelecida), verifique em `docs/decisions/` se já existe algo relacionado — não contradiga uma decisão anterior sem justificar por quê.
- **Depois** de decidir, crie (ou, se for revisão de algo já registrado, atualize) um registro com: contexto, decisão tomada, alternativas consideradas e por que foram descartadas, consequências/trade-offs aceitos.
- Decisões triviais ou óbvias (nome de variável, formatação) não precisam de registro — reserve para escolhas que causariam retrabalho ou conflito se outro agente as refizesse de forma diferente.
- **Não crie uma ADR apenas para repetir um requisito que uma SPEC já prescreve de forma inequívoca** (quando o projeto usar specs formais em `docs/specs/`) — isso não é uma decisão do agente, é a SPEC sendo transcrita. Uma ADR registra uma escolha real entre alternativas, tipicamente feita durante discovery/implementação de uma task quando a SPEC deixa a questão aberta — ou, mais raramente, uma decisão arquitetural transversal tomada conscientemente já na fase de especificação. Fluxo completo em `docs/AGENTS.md`.

### 3. Testes leves e eficazes (unitários e de integração)

Objetivo: o sistema não deve quebrar a cada alteração, sem impor suíte pesada ou frágil.

- Toda mudança de comportamento (lógica de negócio, endpoint, integração) deve vir com teste(s) cobrindo o caminho principal e, quando fizer sentido, os casos de borda mais prováveis de quebrar. Prefira poucos testes de alto valor a cobertura exaustiva.
- Cada módulo documenta no seu próprio `AGENTS.md` qual framework de teste já existe (ou a ausência de um) — consulte-o antes de escrever testes; nunca assuma que existe tooling de teste sem checar `package.json`/`pom.xml`/equivalente.
- Se um módulo não tiver nenhum framework de teste configurado, configure um antes de escrever os testes (ex.: Vitest/Jest para projetos Vite/npm, JUnit/Mockito para JVM, pytest para Python) — escolha o que for nativo do ecossistema do módulo, e registre a escolha em `docs/decisions/` se houver mais de uma opção razoável.
- Evite testes frágeis (snapshots de UI inteiros, mocks excessivos que só testam o próprio mock) — prefira testar comportamento observável.
- Rode a suíte relevante antes de considerar uma tarefa concluída.

### 4. Gerenciamento de tasks padronizado (`docs/tasks/`)

A ferramenta interna de tasks da sessão do agente organiza o trabalho *dentro* de uma conversa, mas não sobrevive entre sessões. Para trabalho que não é uma edição pontual de uma sessão só, o registro persistente fica em `docs/tasks/` — mesma lógica de responsabilidade do agente que a regra 2.

- Um arquivo Markdown por task, numerado sequencialmente (`0001-titulo-curto.md`), com frontmatter `status` (`backlog`/`em-andamento`/`concluida`/`bloqueada`/`adiada`/`parcialmente-concluida`/`cancelada`), `modulo`, `owner`, `criado-em`. Template em `docs/tasks/0000-template.md`. Distinções que importam: `bloqueada` é impedimento técnico/externo (dependência pendente, falta de acesso); `adiada` é decisão consciente de sequenciamento (a task continua válida, só não deve ser selecionada automaticamente nem aguardada); `parcialmente-concluida` é quando parte dos critérios de conclusão foi entregue e o restante foi **deliberadamente** deferido, com o motivo registrado nas notas de progresso — nunca use este status para encobrir trabalho inacabado sem explicação.
- Antes de começar algo não trivial, verifique se já existe uma task relacionada (evita duplicar trabalho ou conflitar com o que outra sessão — ou outro desenvolvedor — já estava fazendo).
- Atualize `status` e as notas de progresso conforme o trabalho avança e ao final da sessão — não deixe uma task `em-andamento` desatualizada.
- Tasks vindas do roadmap devem referenciar a SPEC de origem, quando o projeto usar specs formais (`docs/specs/`), e/ou a seção correspondente de `docs/SCOPE.md`.
- **Múltiplos desenvolvedores podem trabalhar no mesmo projeto simultaneamente, cada um em sua própria task** — o limite de "uma task `em-andamento` por vez" é por `owner`, não um limite global do projeto (ver seção "Múltiplos desenvolvedores no mesmo projeto" do protocolo completo). Processo completo de claim, protocolo anti-colisão de numeração e o algoritmo de seleção/execução autônoma estão em `docs/AGENTS.md` (copiado de `assets/task-workflow-protocol.md`) — não reinvente esse mecanismo por projeto.

## Convenções gerais do projeto

- **Versionamento**: sem tags/releases formais até o momento — `git log` é a fonte de verdade do histórico. Commits recentes seguem mensagens descritivas em português, sem prefixo Conventional Commits consistente; a regra 4 acima e `docs/AGENTS.md` recomendam Conventional Commits para trabalho novo vinculado a tasks/ADRs.
- **CI**: não há pipeline de CI configurado (`.github/workflows/` não existe). Type-check (`vue-tsc`) e build rodam apenas localmente via `npm run build`.
- **Segredos**: nenhum segredo real está commitado. `.env.example` na raiz documenta as variáveis necessárias com placeholders; o `.gitignore` já ignora `.env*`. Nunca commitar um `.env` real.
- **package.json único**: não é um monorepo com workspaces — `src/` e `api/` compartilham o mesmo `package.json`/`node_modules` na raiz, com `tsconfig.json` (frontend) e `tsconfig.api.json` (backend) separados.

## Por onde começar, dependendo da tarefa

- Tela nova, componente, store, rota do frontend → [`src/AGENTS.md`](src/AGENTS.md).
- Endpoint novo, regra de negócio, migration, integração externa (e-mail/push/WhatsApp/liturgia) → [`api/AGENTS.md`](api/AGENTS.md).
- Mudança de infraestrutura de WhatsApp self-hosted → `evolution/docker-compose.yml`.
- Processo de tasks/ADRs entre sessões e desenvolvedores → [`docs/AGENTS.md`](docs/AGENTS.md).
