---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0002 — Mapa de navegação e matriz de acesso por perfil

**Task ID**: `TASK-0002`

## Objetivo

Produzir os entregáveis 1 e 2 da [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) (seção 21): o
mapa de navegação hierárquico (seção 4) e a matriz de acesso por perfil (tabela da seção 21,
item 2), com base no levantamento real de rotas/funcionalidades da TASK-0001 — não a partir de
suposições. Deve cobrir a estrutura proposta na seção 4 (Dashboard, Escalas, Pessoas, Conteúdo,
Análises, Configurações, Perfil) e os critérios de aceite "Navegação"/"Organização" da seção 20.

## Dependências

- `TASK-0001` — levantamento de rotas/funcionalidades reais, necessário para não inventar nem
  omitir itens no mapa e na matriz.

## Critérios de conclusão

- [x] Mapa de navegação hierárquico documentado, cobrindo todas as áreas da seção 4 da SPEC-001,
      com cada item apontando para a rota/página real correspondente (ou nota explícita indicando
      que a rota ainda não existe, sem inventar a funcionalidade em si).
- [x] Matriz de acesso por perfil (Admin/Coordenador/Servidor/Visitante) preenchida e validada
      contra os guards de papel reais (`meta.roles`) — não apenas copiada da tabela-exemplo da
      SPEC-001 (seção 21, item 2).
- [x] Critérios de aceite "Navegação" (seção 20) confirmados no mapa: Relatórios, Substituições,
      Recorrências e Intensidade de Serviço com acesso identificável, sem depender de caminhos
      indiretos.
- [x] Critérios de aceite "Organização" (seção 20) confirmados: funcionalidades agrupadas por
      contexto/tarefa; cadastros administrativos fora da navegação principal; Minha Escala com
      identidade própria; Disponibilidade e Substituições dentro do domínio Escalas.
- [x] Checagem cruzada com TASK-0001 confirmando que nenhuma funcionalidade nova foi inventada e
      nenhuma existente foi omitida.

## Mapa de navegação

Baseado no levantamento real de rotas da TASK-0001. Cada item aponta para a rota existente que o
atende hoje; onde a SPEC-001 propõe algo sem rota equivalente ainda, isso é marcado como
**lacuna** (não como rota nova a criar — decisão de código fica fora desta etapa, SPEC-001 §22).

```text
Dashboard
└── /dashboard (dashboard.dashboard) — hub único, já cobre visão servidor/coordenador (§5)

Escalas
├── Visão geral / Escalas (lista)  → /escalas (scales.index)
│     LACUNA: SPEC-001 §4 lista "Visão geral" e "Escalas" como dois itens distintos dentro do
│     domínio; hoje existe uma única tela (/escalas) cobrindo os dois papéis. Não há uma rota de
│     "visão geral" separada da listagem — registrar como um único ponto de entrada por ora.
│   ├── Criar        → /escalas/criar (admin, coordenador)
│   ├── Detalhes      → /escalas/:id (scales.show)
│   │   ├── Repertório → /escalas/:id/repertorio (contextual, ver "Conteúdo" abaixo)
│   │   └── Liturgia   → /escalas/:id/liturgia (contextual, ver "Conteúdo" abaixo)
│   └── Editar        → /escalas/:id/editar (admin, coordenador)
├── Minha escala      → /minha-escala (scales.mine) — experiência própria do servidor (§9)
├── Substituições      → /substituicoes (substitutions.index) [admin, coordenador]
│     HOJE: só acessível via botão no header do Dashboard — sem entrada própria no menu.
│     Precisa ganhar entrada de primeira classe no menu (critério de aceite §20).
├── Recorrências       → /escalas-recorrentes (scaleTemplates.index) [admin, coordenador]
│     HOJE: só acessível via botão em /escalas — mesma lacuna de descoberta acima.
└── Disponibilidade
      ├── (servidor)     → /disponibilidade (availability.form) [somente musico]
      └── (coordenador)  → /disponibilidade/painel (availability.panel) [admin, coordenador]
      HOJE: já tem entrada própria no menu, mas como item de topo isolado — deve migrar
      conceitualmente para dentro do submenu Escalas (§10), sem trocar de rota.

Pessoas
├── Servidores          → /servidores (servidores.index) [staff no menu; ver nota de guard abaixo]
│   ├── Criar            → /servidores/criar (admin, coordenador)
│   ├── Detalhes          → /servidores/:id
│   └── Editar            → /servidores/:id/editar (admin, coordenador)
└── Intensidade de serviço → /servidores/intensidade (servidores.intensity) [admin, coordenador]
      HOJE: só acessível via botão em /servidores — mesma lacuna de descoberta de Substituições/
      Recorrências. Critério de aceite §20 exige acesso identificável.

Conteúdo
├── Repertórios → /escalas/:id/repertorio(/editar) — SOMENTE contextual (via uma escala)
└── Liturgia    → /escalas/:id/liturgia            — SOMENTE contextual (via uma escala)
      LACUNA: SPEC-001 §14 propõe uma área "Conteúdo" com acesso GLOBAL além do contextual
      ("Escala → Detalhes → Repertório da celebração" já existe; um item de menu "Conteúdo" que
      leve a uma listagem própria de repertórios/liturgia, independente de uma escala, NÃO
      existe hoje). Criar essa rota de listagem é implementação frontend — fora do escopo desta
      etapa (SPEC-001 §22). Por ora, "Conteúdo" no menu é só um agrupamento conceitual dos
      pontos de acesso contextuais já existentes; a rota de listagem própria fica registrada como
      pendência para uma etapa de implementação futura.

Análises
└── Relatórios → /relatorios (reports.index) [admin, coordenador]
      HOJE: só acessível via botão no header do Dashboard — mesma lacuna de Substituições/
      Recorrências/Intensidade. É exatamente o problema que a SPEC-001 (§15) pede para resolver
      via arquitetura de navegação.

Configurações
├── Ministérios  → /equipes (teams.index) [staff no menu; ver nota de guard abaixo]
├── Categorias   → /categorias (categorias.index) [admin, coordenador]
├── Comunidades  → /comunidades (comunidades.index) [admin, coordenador]
└── Celebrantes  → /celebrantes (celebrantes.index) [admin, coordenador]
      Já são cadastros isolados do menu principal hoje mesmo sem reestruturação — a SPEC-001
      pede apenas que continuem agrupados sob "Configurações" (o que já corresponde à realidade).

Perfil
└── Minha conta → /profile (profile.edit) — página única
      LACUNA DE ESTRUTURA (não de rota): a SPEC-001 §17 propõe Perfil → Minha conta /
      Notificações / Segurança como três itens. Hoje é uma única página com três seções
      (dados da conta, senha, notificações push). Tratar como divisão de SEÇÕES dentro da
      página existente, não como sub-rotas novas — criar sub-rotas seria implementação frontend
      fora do escopo desta etapa.

Público (fora da navegação autenticada)
└── /publico (public.calendar) — única rota sem `meta.auth`, acessível a visitante anônimo
```

## Matriz de acesso por perfil

Validada contra os `meta.roles`/`meta.auth` reais de `src/router/index.ts` (TASK-0001), não
copiada da tabela-exemplo da SPEC-001 (§21, item 2). "✓ (rota aberta)" marca um caso em que o
guard da rota é mais permissivo do que o item apareceria no menu — divergência pré-existente no
código atual, documentada e não corrigida aqui (corrigir seria "alterar permissões", proibido
pela SPEC-001 §19).

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

**Nota sobre guards mais permissivos que o menu (achado da auditoria, não introduzido por esta
task)**: `/servidores` (índice e detalhe) e `/equipes` (índice e detalhe) têm `meta: { auth: true }`
sem `roles` — um usuário `musico` autenticado consegue acessá-las digitando a URL diretamente,
mesmo não aparecendo no menu dele. Isso contrasta com `/comunidades`, `/categorias` e
`/celebrantes`, cujo próprio índice já exige `roles: ['admin', 'coordenador']`. É uma
inconsistência real do sistema atual — registrada aqui para uma decisão futura, mas **não**
corrigida nesta etapa, pois alterar permissões está fora do escopo da SPEC-001 (§19).

## Verificação dos critérios de aceite da SPEC-001 (§20) cobertos por esta task

- **Navegação**: Relatórios, Substituições, Recorrências e Intensidade de Serviço aparecem no
  mapa como itens de primeira classe do domínio correspondente — a lacuna de descoberta atual
  (só acessíveis via botão indireto) fica documentada como o que precisa mudar na implementação
  futura, não como algo já resolvido nesta etapa (que é só arquitetura/documentação).
- **Organização**: mapa agrupa por contexto/tarefa (Escalas/Pessoas/Conteúdo/Análises/
  Configurações/Perfil); cadastros administrativos (Ministérios/Categorias/Comunidades/
  Celebrantes) seguem fora da navegação principal, sob "Configurações"; Minha Escala tem entrada
  própria distinta da listagem administrativa de Escalas; Disponibilidade e Substituições estão
  no domínio Escalas.

## Referências

- [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) — seções 4, 6, 9–17, 20, 21 (itens 1 e 2).
- `TASK-0001` (resultado da auditoria de rotas/funcionalidades).

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-001.
- 2026-08-21 — Task reivindicada e executada. Mapa de navegação e matriz de acesso por perfil
  produzidos com base na TASK-0001 (não a partir da tabela-exemplo da SPEC). Três lacunas
  registradas explicitamente como pendência de implementação futura, não resolvidas nem
  inventadas nesta etapa: (1) "Visão geral" e "Escalas" da SPEC-001 §4 correspondem hoje a uma
  única rota (`/escalas`); (2) "Conteúdo → Repertórios/Liturgia" não tem rota de listagem global,
  só contextual via escala; (3) "Perfil → Notificações/Segurança" da SPEC-001 §17 é hoje uma
  única página (`/profile`) com três seções, não três sub-rotas. Também documentada — sem
  corrigir, por estar fora do escopo desta etapa (SPEC-001 §19 proíbe alterar permissões) — uma
  inconsistência pré-existente nos guards: `/servidores` e `/equipes` (índice/detalhe) não
  restringem por `roles`, ao contrário de `/comunidades`, `/categorias` e `/celebrantes`. Task
  marcada `concluida` — todos os critérios de conclusão atendidos. Próximo passo: TASK-0003
  (fluxos de navegação por perfil) já está elegível — depende desta e da TASK-0001, ambas
  concluídas.
