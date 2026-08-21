# Arquitetura da Interface — Etapa 1

Consolida os entregáveis da Etapa 1 do redesign (`docs/specs/SPEC-001.md`): mapa de navegação,
matriz de acesso por perfil, fluxos de navegação e recomendações desktop/tablet/mobile. Produzido
por `TASK-0002`, `TASK-0003` e `TASK-0004` (`docs/tasks/`), com base no levantamento real de
rotas/funcionalidades da `TASK-0001`.

**Escopo desta etapa**: arquitetura de informação e navegação — *onde as coisas ficam e como o
usuário chega até elas*. Não inclui paleta, tipografia, ícones, componentes ou qualquer
implementação de código (ver "Confirmação de escopo" ao final). Identidade visual e componentes
ficam para uma etapa posterior (`docs/specs/SPEC-003.md`).

---

## 1. Mapa de navegação

Cada item aponta para a rota real que o atende hoje (`src/router/index.ts`, levantado na
`TASK-0001`). Onde a SPEC-001 propõe algo sem rota equivalente ainda, isso é marcado como
**lacuna** — não como rota nova a criar, já que decisão de código está fora desta etapa
(SPEC-001 §22).

```text
Dashboard
└── /dashboard (dashboard.dashboard) — hub único, já cobre visão servidor/coordenador (§5)

Escalas
├── Visão geral / Escalas (lista)  → /escalas (scales.index)
│     LACUNA: SPEC-001 §4 lista "Visão geral" e "Escalas" como dois itens distintos dentro do
│     domínio; hoje existe uma única tela (/escalas) cobrindo os dois papéis.
│   ├── Criar        → /escalas/criar (admin, coordenador)
│   ├── Detalhes      → /escalas/:id (scales.show)
│   │   ├── Repertório → /escalas/:id/repertorio (contextual, ver "Conteúdo" abaixo)
│   │   └── Liturgia   → /escalas/:id/liturgia (contextual, ver "Conteúdo" abaixo)
│   └── Editar        → /escalas/:id/editar (admin, coordenador)
├── Minha escala      → /minha-escala (scales.mine) — experiência própria do servidor (§9)
├── Substituições      → /substituicoes (substitutions.index) [admin, coordenador]
│     HOJE: só acessível via botão no header do Dashboard — sem entrada própria no menu.
├── Recorrências       → /escalas-recorrentes (scaleTemplates.index) [admin, coordenador]
│     HOJE: só acessível via botão em /escalas — mesma lacuna de descoberta acima.
└── Disponibilidade
      ├── (servidor)     → /disponibilidade (availability.form) [somente musico]
      └── (coordenador)  → /disponibilidade/painel (availability.panel) [admin, coordenador]
      HOJE: já tem entrada própria no menu, mas como item de topo isolado — deve migrar
      conceitualmente para dentro do submenu Escalas (§10), sem trocar de rota.

Pessoas
├── Servidores          → /servidores (servidores.index) [staff no menu; guard real não restringe — ver §2]
│   ├── Criar            → /servidores/criar (admin, coordenador)
│   ├── Detalhes          → /servidores/:id
│   └── Editar            → /servidores/:id/editar (admin, coordenador)
└── Intensidade de serviço → /servidores/intensidade (servidores.intensity) [admin, coordenador]
      HOJE: só acessível via botão em /servidores — mesma lacuna de descoberta.

Conteúdo
├── Repertórios → /escalas/:id/repertorio(/editar) — SOMENTE contextual (via uma escala)
└── Liturgia    → /escalas/:id/liturgia            — SOMENTE contextual (via uma escala)
      LACUNA: SPEC-001 §14 propõe uma área "Conteúdo" com acesso GLOBAL além do contextual; uma
      listagem própria de repertórios/liturgia independente de uma escala NÃO existe hoje.
      Criar essa rota é implementação frontend — fora do escopo desta etapa. Por ora,
      "Conteúdo" no menu é um agrupamento conceitual dos pontos de acesso contextuais já
      existentes.

Análises
└── Relatórios → /relatorios (reports.index) [admin, coordenador]
      HOJE: só acessível via botão no header do Dashboard — exatamente o problema que a
      SPEC-001 (§15) pede para resolver via arquitetura de navegação.

Configurações
├── Ministérios  → /equipes (teams.index) [staff no menu; guard real não restringe — ver §2]
├── Categorias   → /categorias (categorias.index) [admin, coordenador]
├── Comunidades  → /comunidades (comunidades.index) [admin, coordenador]
└── Celebrantes  → /celebrantes (celebrantes.index) [admin, coordenador]
      Já são cadastros isolados do menu principal hoje — a SPEC-001 pede apenas que continuem
      agrupados sob "Configurações", o que já corresponde à realidade.

Perfil
└── Minha conta → /profile (profile.edit) — página única
      LACUNA DE ESTRUTURA (não de rota): SPEC-001 §17 propõe Minha conta/Notificações/Segurança
      como três itens. Hoje é uma única página com três seções (conta, senha, notificações
      push). Tratar como divisão de SEÇÕES dentro da página existente, não sub-rotas novas.

Público (fora da navegação autenticada)
└── /publico (public.calendar) — única rota sem `meta.auth`, acessível a visitante anônimo
```

Detalhamento completo (com rótulos "no menu hoje?" por rota individual): `TASK-0002`, seção
"Mapa de navegação".

## 2. Matriz de acesso por perfil

Validada contra os `meta.roles`/`meta.auth` reais de `src/router/index.ts` — não copiada da
tabela-exemplo da SPEC-001 (§21, item 2).

| Área | Admin | Coordenador | Servidor (musico) | Visitante |
|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | — |
| Escalas → Visão geral/Escalas (lista, detalhe) | ✓ | ✓ | ✓ (leitura; criar/editar restrito) | — |
| Escalas → Minha escala | ✓ (rota aberta) | ✓ (rota aberta) | ✓ | — |
| Escalas → Substituições | ✓ | ✓ | — | — |
| Escalas → Recorrências | ✓ | ✓ | — | — |
| Escalas → Disponibilidade | ✓ (via painel) | ✓ (via painel) | ✓ (via form) | — |
| Pessoas → Servidores | ✓ | ✓ | — no menu; ✓ (rota aberta) — ver nota | — |
| Pessoas → Intensidade de serviço | ✓ | ✓ | — | — |
| Conteúdo → Repertórios (contextual) | ✓ | ✓ | ✓ (leitura) | — |
| Conteúdo → Liturgia (contextual) | ✓ | ✓ | ✓ (leitura) | — |
| Análises → Relatórios | ✓ | ✓ | — | — |
| Configurações → Ministérios | ✓ | ✓ | — no menu; ✓ (rota aberta) — ver nota | — |
| Configurações → Categorias | ✓ | ✓ | — | — |
| Configurações → Comunidades | ✓ | ✓ | — | — |
| Configurações → Celebrantes | ✓ | ✓ | — | — |
| Perfil → Minha conta | ✓ | ✓ | ✓ | — |
| Público (calendário) | ✓ | ✓ | ✓ | ✓ |

**Nota — inconsistência real de guards, não introduzida por esta etapa**: `/servidores`
(índice/detalhe) e `/equipes` (índice/detalhe) têm `meta: { auth: true }` sem `roles` — um
`musico` autenticado consegue acessá-las por URL direta mesmo não aparecendo no seu menu. Já
`/comunidades`, `/categorias` e `/celebrantes` restringem `roles: ['admin', 'coordenador']`
desde o índice. Registrado para decisão futura; **não corrigido aqui**, pois alterar permissões
está fora do escopo da SPEC-001 (§19).

## 3. Fluxos de navegação

### Servidor

```text
1. Login              → /login
2. Dashboard          → /dashboard
     - Bloco "Minhas próximas escalas" — até 3 escalas do próprio servidor.
3. Detalhes da escala  → /escalas/:id, a partir do clique numa dessas escalas.
     - Seção "Minha confirmação" — status atual + botão "Confirmar presença" (se pendente).
4. Confirmar presença → clique dispara PATCH /scales/:id/confirmar na mesma tela.
```

Caminho alternativo direto: `/minha-escala` → lista → clique numa escala → mesma tela de
confirmação do passo 3.

### Coordenador

```text
1. Login                → /login
2. Dashboard            → /dashboard
     - Bloco "Pendências de confirmação" + botões "Substituições"/"Relatórios"/"Nova Escala".
3. Escala               → /escalas (listagem completa)
4. Criar/Editar         → /escalas/criar ou /escalas/:id/editar
5. Montar equipe        → seção "Equipe da celebração" do mesmo formulário
6. Validar / Publicar   → campo "Status": Rascunho → Confirmada
```

**Achado relevante**: a SPEC-001 (§8, §21.3) descreve "Validar conflitos" e "Publicar" como
passos distintos. No código atual não existe validação automática de conflitos, nem uma ação
chamada "Publicar" — o equivalente real é revisão manual da equipe + troca do campo `Status`
para `Confirmada`, no mesmo formulário de criar/editar. A própria SPEC-001 §8 já reconhece esse
fluxo como algo a "receber atenção especial nas próximas etapas" — a lacuna não contradiz a
SPEC, só não deve ser tratada como algo já implementado. Detalhamento: `TASK-0003`.

### Acesso contextual vs. global (SPEC-001 §18)

- **Global** (via menu, de qualquer ponto do sistema): Substituições, Recorrências.
- **Contextual** (só a partir do conteúdo relacionado): Repertório e Liturgia de uma escala
  específica (`/escalas/:id/repertorio`, `/escalas/:id/liturgia`).

## 4. Recomendações desktop / tablet / mobile

Evidência de código: `AuthenticatedLayout.vue` hoje só distingue **dois** contextos, não três —
abaixo de `md` (768px) mostra dropdown de hambúrguer; a partir de `md` mostra sidebar off-canvas
(nunca fixa). Tablet não tem tratamento próprio hoje. O problema do `overflow-x-auto` citado na
SPEC-001 §7 está presente em 12 telas de listagem (`dashboard/Dashboard.vue`,
`servidores/Index.vue`, `celebrantes/Index.vue`, `reports/Index.vue`, `scales/Index.vue`,
`teams/Index.vue`, `categorias/Index.vue`, `comunidades/Index.vue`, `availability/Panel.vue`,
`servidores/Intensity.vue`, `scaleTemplates/Index.vue`, `availability/Form.vue`) — dívida
registrada, não corrigida aqui (corrigir é implementação frontend).

**Desktop (≳1024px)**: hierarquia completa (nível 1 = domínios, nível 2 = sub-itens) visível
simultaneamente, num painel de navegação persistente ou sob demanda (escolha de componente fica
para a Etapa 3).

**Tablet (~768–1024px)**: recomendação é manter o alinhamento já existente no código — herda o
padrão "desktop" (hierarquia completa) a partir de `md`. Não é necessário nem esperado desta
etapa desenhar um terceiro padrão visual dedicado.

**Mobile (<768px)**: navegação inferior com poucos itens principais + agrupamento secundário,
diferenciada por perfil (SPEC-001 §3.3, que já lista mais itens frequentes do que cabem em 3–4
posições fixas):

```text
Servidor:      Início │ Minha Escala │ Disponibilidade │ Mais
Coordenador:   Início │ Escalas │ + (Nova escala) │ Mais
```

"Mais" agrupa o restante de cada perfil (Perfil, Pessoas, Substituições, Recorrências,
Relatórios, Configurações, conforme o caso). Detalhamento completo por área × breakpoint:
`TASK-0004`.

---

## 5. Verificação dos critérios de aceite (SPEC-001 §20)

### Navegação

- [x] Todas as funcionalidades existentes possuem um local lógico de acesso — confirmado no
      mapa (§1); nenhuma funcionalidade da TASK-0001 ficou de fora.
- [x] Não existem funcionalidades importantes acessíveis somente por caminhos indiretos **na
      arquitetura proposta** — Substituições, Recorrências, Relatórios e Intensidade de Serviço
      ganham entrada de primeira classe no mapa (§1). Ainda são indiretas *na implementação
      atual do menu* — essa correção é trabalho de implementação futura, fora do escopo de uma
      etapa só de arquitetura/documentação (SPEC-001 §22).
- [x] Relatórios possuem acesso identificável — §1, domínio Análises.
- [x] Substituições possuem acesso identificável — §1, domínio Escalas.
- [x] Recorrências possuem acesso identificável — §1, domínio Escalas.
- [x] Intensidade de serviço possui acesso identificável — §1, domínio Pessoas.

### Organização

- [x] Funcionalidades agrupadas por contexto/tarefa — §1, os 6 domínios do mapa.
- [x] Cadastros administrativos não poluem a navegação principal — Ministérios/Categorias/
      Comunidades/Celebrantes agrupados sob "Configurações" (§1).
- [x] Minha Escala possui identidade própria — §1 (Escalas → Minha escala, rota dedicada
      `/minha-escala`) e §3 (fluxo próprio na §3).
- [x] Disponibilidade pertence conceitualmente ao domínio de Escalas — §1.
- [x] Substituições pertencem ao domínio de Escalas — §1.

### Perfis

- [x] A arquitetura diferencia claramente as necessidades de servidor e coordenador — matriz de
      acesso (§2) e fluxos separados (§3).
- [x] O servidor consegue chegar rapidamente à própria escala — §3, 2 passos do login (ou 1 via
      `/minha-escala`).
- [x] O coordenador consegue chegar rapidamente às ferramentas de gerenciamento — §3,
      Substituições/Relatórios/Nova Escala a 1 clique do Dashboard.

### Mobile

- [x] A arquitetura funciona sem depender de navegação horizontal — §4, bottom nav + "Mais"
      cobre a navegação entre áreas (o `overflow-x-auto` remanescente é um problema de conteúdo
      de tabela dentro de uma tela, não de navegação entre áreas — permanece como dívida de
      implementação, não invalida esta arquitetura).
- [x] Existe uma estratégia definida para navegação mobile — §4.
- [x] As ações principais continuam facilmente acessíveis em telas pequenas — §4, itens
      frequentes por perfil nos slots principais do bottom nav.

### Consistência

- [x] A estrutura proposta pode ser aplicada às telas existentes sem alterar as regras de
      negócio — todo o mapa (§1) reaproveita rotas/páginas já existentes; nenhuma regra de
      negócio, guard de permissão, endpoint de API ou schema de banco foi alterado ao longo da
      Etapa 1 (ver confirmação de escopo abaixo).
- [x] A arquitetura está documentada antes da implementação visual — este documento e as
      `TASK-0002`/`0003`/`0004` que o originam.

## 6. Confirmação de escopo (SPEC-001 §19 e §22)

Nenhuma das ações proibidas pela SPEC-001 §19 foi realizada durante a Etapa 1: não foram
alteradas regras de negócio, banco de dados, permissões (`meta.roles` dos guards) ou APIs;
nenhuma funcionalidade existente foi removida; nenhuma funcionalidade nova foi inventada — todo
achado de "lacuna" neste documento é uma lacuna *documentada*, nunca implementada; não houve
redesign visual, escolha de identidade visual definitiva, substituição de componentes por
biblioteca de UI, nem implementação de animações.

Do que a SPEC-001 §22 lista como fora do escopo, nada foi produzido além do previsto: não houve
redesign visual, criação de Design System, escolha de cores/fontes, wireframes de alta
fidelidade, **implementação frontend real**, refatoração de código, nem alteração de API/banco.
Todo o trabalho desta etapa (`TASK-0001` a `TASK-0005`) resultou exclusivamente em documentos
Markdown sob `docs/`.

## 7. Resultado esperado (SPEC-001 §23)

| Pergunta | Resposta |
|---|---|
| Se eu sou um servidor, onde vou? | Dashboard → "Minhas próximas escalas" ou `/minha-escala` (§1, §3) |
| Se eu sou coordenador, onde vou? | Dashboard → atalhos de gerenciamento, ou `/escalas` (§1, §3) |
| Onde encontro uma escala? | Domínio Escalas → Visão geral/Escalas (§1) |
| Onde resolvo uma substituição? | Domínio Escalas → Substituições (§1) |
| Onde informo minha disponibilidade? | Domínio Escalas → Disponibilidade (§1) |
| Onde encontro os relatórios? | Domínio Análises → Relatórios (§1) |
| Onde gerencio os cadastros? | Domínio Configurações → Ministérios/Categorias/Comunidades/Celebrantes (§1) |

---

## Referências

- [`docs/specs/SPEC-001.md`](specs/SPEC-001.md) — spec de origem.
- [`docs/tasks/0001-auditoria-rotas-funcionalidades-existentes.md`](tasks/0001-auditoria-rotas-funcionalidades-existentes.md)
- [`docs/tasks/0002-mapa-navegacao-matriz-acesso-perfil.md`](tasks/0002-mapa-navegacao-matriz-acesso-perfil.md)
- [`docs/tasks/0003-fluxos-navegacao-por-perfil.md`](tasks/0003-fluxos-navegacao-por-perfil.md)
- [`docs/tasks/0004-recomendacoes-desktop-tablet-mobile.md`](tasks/0004-recomendacoes-desktop-tablet-mobile.md)
- [`docs/tasks/0005-consolidacao-arquitetura-interface-etapa1.md`](tasks/0005-consolidacao-arquitetura-interface-etapa1.md)
