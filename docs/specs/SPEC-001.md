# SPEC — Etapa 1: Arquitetura da Interface

Projeto: Ordo Musicalis
Etapa: 1 — Arquitetura da Interface e Navegação
Objetivo: Redefinir a estrutura de navegação e organização da informação do sistema antes do redesign visual.

---

## 1. OBJETIVO

Reestruturar a arquitetura da interface do Ordo Musicalis para que o sistema seja:

- mais fácil de entender;
- mais previsível de navegar;
- mais adequado para usuários pouco familiarizados com tecnologia;
- eficiente para coordenadores;
- extremamente simples para servidores;
- preparado para uso mobile-first;
- capaz de acomodar o crescimento futuro do sistema.

Esta etapa NÃO tem como objetivo definir o visual final.

Não serão definidas ainda:

- paleta definitiva;
- tipografia definitiva;
- estilo visual dos cards;
- sombras;
- bordas;
- ícones;
- animações;
- identidade visual completa.

O foco é exclusivamente:

"Onde as coisas ficam e como o usuário chega até elas?"

---

## 2. PROBLEMA ATUAL

A auditoria identificou que o sistema possui uma arquitetura funcional, porém sua organização atual não representa adequadamente a frequência e a importância das tarefas.

O sistema possui dois grandes centros:

- Dashboard;
- Escala individual.

Ao mesmo tempo, funcionalidades inteiras como Relatórios, Substituições, Escalas Recorrentes e Intensidade de Serviço não estão disponíveis diretamente no menu principal, sendo acessadas indiretamente através de outras telas.

Isso cria um problema de descoberta, especialmente para usuários que não conhecem previamente o sistema.

---

## 3. PRINCÍPIOS DA NOVA ARQUITETURA

A nova arquitetura deverá seguir estes princípios.

### 3.1 Orientação por tarefa

A organização deve refletir o que o usuário quer fazer, e não simplesmente a estrutura do banco de dados.

Evitar uma navegação baseada simplesmente em:

"Servidores / Categorias / Comunidades / Celebrantes..."

quando for possível apresentar uma estrutura baseada em:

"Escalas / Pessoas / Relatórios / Configurações..."

---

### 3.2 Frequência de uso

Funcionalidades utilizadas frequentemente devem estar mais próximas do usuário.

Funcionalidades administrativas ou ocasionais podem permanecer em níveis secundários.

---

### 3.3 Diferenciação por perfil

O sistema possui quatro perfis relevantes:

- Administrador;
- Coordenador;
- Servidor comum;
- Visitante anônimo.

A arquitetura deve reconhecer que esses usuários não possuem as mesmas necessidades.

Especialmente:

Servidor comum:

- minha escala;
- confirmar presença;
- disponibilidade;
- notificações;
- perfil.

Coordenador/Admin:

- escalas;
- montagem de escala;
- servidores;
- disponibilidade;
- substituições;
- recorrências;
- relatórios;
- gerenciamento administrativo.

---

## 4. NOVA ARQUITETURA PROPOSTA

A navegação autenticada deverá ser reorganizada conceitualmente em:

Dashboard

Escalas
├── Visão geral
├── Escalas
├── Minha escala
├── Substituições
├── Recorrências
└── Disponibilidade

Pessoas
├── Servidores
└── Intensidade de serviço

Conteúdo
├── Repertórios
└── Liturgia

Análises
└── Relatórios

Configurações
├── Ministérios
├── Categorias
├── Comunidades
└── Celebrantes

Perfil
└── Minha conta

OBSERVAÇÃO:

Essa é a arquitetura de informação proposta. O agente de implementação deverá verificar as rotas e funcionalidades efetivamente existentes antes de criar, remover ou renomear qualquer recurso.

Não devem ser inventadas funcionalidades.

---

## 5. DASHBOARD

O Dashboard deverá ser tratado como o HUB principal do sistema.

Ele não deve funcionar apenas como uma página de calendário.

Seu objetivo deve ser responder rapidamente:

"O que está acontecendo nas escalas?"

e, para o servidor:

"O que eu preciso saber/fazer?"

A auditoria identifica o Dashboard/calendário como uma das telas prioritárias e também como um dos maiores problemas de responsividade do sistema.

---

### 5.1 DASHBOARD — SERVIDOR

A experiência deverá priorizar:

1. Próxima escala.
2. Pendências de confirmação.
3. Alterações importantes.
4. Calendário/agenda.
5. Disponibilidade.
6. Repertório/liturgia relacionado à próxima celebração.

O servidor não deve precisar navegar por várias telas para descobrir sua próxima obrigação.

---

### 5.2 DASHBOARD — COORDENADOR

A experiência deverá priorizar:

1. Próximas celebrações.
2. Situação das escalas.
3. Confirmações pendentes.
4. Funções sem servidores.
5. Possíveis conflitos.
6. Substituições pendentes.
7. Acesso rápido à criação/edição de escala.

A interface deve permitir identificar rapidamente situações que exigem ação.

---

## 6. NAVEGAÇÃO PRINCIPAL

A navegação deverá possuir uma distinção clara entre:

### Principal

Funcionalidades utilizadas frequentemente.

### Secundária

Funcionalidades administrativas ou menos frequentes.

### Perfil

Configurações pessoais do usuário.

O menu não deve esconder funcionalidades importantes apenas porque elas são acessíveis indiretamente através de outras telas.

Isso corrige diretamente o problema identificado na auditoria sobre telas órfãs.

---

## 7. EXPERIÊNCIA MOBILE

A arquitetura deverá ser MOBILE-FIRST desde sua concepção.

Não será permitido projetar a estrutura pensando primeiro em desktop e posteriormente simplesmente adicionar:

overflow-x-auto

A auditoria identificou que as tabelas atuais utilizam exatamente essa abordagem e que isso contradiz o requisito mobile-first do projeto.

---

### 7.1 NAVEGAÇÃO MOBILE

No mobile, a navegação deverá priorizar poucas opções principais.

Uma possibilidade estrutural:

┌─────────────────────────────┐
│                             │
│          Conteúdo           │
│                             │
│                             │
├─────────────────────────────┤
│ Início │ Escalas │ + │ ... │
└─────────────────────────────┘

IMPORTANTE:

Isso é uma direção arquitetural, não uma decisão visual final.

A implementação deverá permitir acesso às demais áreas através de uma navegação secundária organizada.

---

## 8. ESCALAS COMO NÚCLEO DO PRODUTO

A área "Escalas" deverá ser considerada o principal domínio de interação do sistema.

A arquitetura deverá permitir navegar naturalmente entre:

Escalas
   ↓
Visualizar escala
   ↓
Ver detalhes
   ├── Repertório
   ├── Liturgia
   ├── Participantes
   └── Alterações

E, para coordenadores:

Escalas
   ↓
Criar / Editar
   ↓
Montar equipe
   ↓
Validar conflitos
   ↓
Publicar

A montagem da equipe é considerada o fluxo de maior custo de interação do sistema e deverá receber atenção especial nas próximas etapas.

---

## 9. "MINHA ESCALA"

A funcionalidade "Minha Escala" deve ser tratada como uma experiência própria do servidor.

Não deve ser apenas um filtro aplicado à mesma tela administrativa.

O usuário deve conseguir acessar diretamente:

"Minhas próximas escalas"

e visualizar:

- data;
- horário;
- comunidade;
- celebração;
- função;
- pessoas relacionadas;
- status de confirmação.

O objetivo é reduzir a carga cognitiva para o servidor.

---

## 10. DISPONIBILIDADE

A disponibilidade deve estar dentro do domínio de "Escalas", pois está diretamente relacionada à montagem da equipe.

Estrutura:

Escalas
└── Disponibilidade

A arquitetura não deve tratar disponibilidade como um cadastro administrativo isolado.

A questão da semântica dos campos de disponibilidade será tratada posteriormente na etapa de UX/UI.

---

## 11. SUBSTITUIÇÕES

Substituições devem ser uma funcionalidade de primeira classe dentro de "Escalas".

Não devem depender da descoberta de um botão escondido em outra tela.

Estrutura:

Escalas
└── Substituições

A área deverá futuramente permitir ao coordenador identificar:

- solicitações pendentes;
- pessoa que recusou;
- motivo;
- candidatos;
- status da substituição.

Quando nenhum substituto for encontrado, a interface deverá futuramente explicar o motivo e indicar um próximo passo.

---

## 12. RECORRÊNCIAS

Recorrências devem pertencer ao domínio de "Escalas".

Estrutura:

Escalas
└── Recorrências

A funcionalidade não deve ficar escondida dentro de outro fluxo.

Isso melhora a descoberta e permite ao coordenador entender que recorrências são uma ferramenta de geração/manutenção de escalas.

---

## 13. PESSOAS

A área "Pessoas" deverá centralizar informações relacionadas às pessoas que participam das escalas.

Estrutura:

Pessoas
├── Servidores
└── Intensidade de serviço

A intensidade de serviço não deve ficar escondida dentro da tela de servidores, pois representa uma análise diferente do cadastro.

---

## 14. CONTEÚDO

Conteúdos relacionados à celebração devem possuir uma área própria:

Conteúdo
├── Repertórios
└── Liturgia

Entretanto, o acesso contextual também deve existir.

Por exemplo:

Escala
   ↓
Detalhes
   ↓
Repertório da celebração

Não queremos obrigar o usuário a voltar ao menu para acessar informações relacionadas à escala.

---

## 15. ANÁLISES

Relatórios devem possuir entrada própria:

Análises
└── Relatórios

A principal solução para o problema atual de Relatórios é melhorar sua descoberta através da arquitetura de navegação.

---

## 16. CONFIGURAÇÕES

Cadastros estruturais devem ser agrupados:

Configurações
├── Ministérios
├── Categorias
├── Comunidades
└── Celebrantes

Isso evita transformar o menu principal em uma lista extensa de entidades.

---

## 17. PERFIL

Informações pessoais devem permanecer separadas das configurações administrativas.

Estrutura:

Perfil
├── Minha conta
├── Notificações
└── Segurança

O usuário comum não deve precisar entrar em "Configurações" para alterar informações pessoais.

---

## 18. REGRA IMPORTANTE: ACESSO CONTEXTUAL

A nova arquitetura deve utilizar dois tipos de acesso:

### Acesso global

Disponível através do menu.

Exemplo:

Escalas → Substituições

### Acesso contextual

Disponível quando a funcionalidade está relacionada ao conteúdo atual.

Exemplo:

Escala → Repertório

Isso evita dois extremos:

Problema A:
"Não consigo encontrar a funcionalidade."

Problema B:
"Preciso voltar para o menu toda hora."

---

## 19. O QUE NÃO DEVE ACONTECER NESTA ETAPA

O agente NÃO deve:

- alterar regras de negócio;
- alterar banco de dados;
- remover funcionalidades existentes;
- criar funcionalidades não existentes;
- redesenhar visualmente todas as telas;
- escolher identidade visual definitiva;
- substituir componentes por biblioteca UI;
- implementar animações;
- alterar permissões;
- modificar APIs.

Esta etapa é exclusivamente sobre ARQUITETURA DA INTERFACE.

---

## 20. CRITÉRIOS DE ACEITE

A Etapa 1 será considerada concluída quando:

### Navegação

- [ ] Todas as funcionalidades existentes possuem um local lógico de acesso.
- [ ] Não existem funcionalidades importantes acessíveis somente por caminhos indiretos.
- [ ] Relatórios possuem acesso identificável.
- [ ] Substituições possuem acesso identificável.
- [ ] Recorrências possuem acesso identificável.
- [ ] Intensidade de serviço possui acesso identificável.

### Organização

- [ ] Funcionalidades estão agrupadas por contexto/tarefa.
- [ ] Cadastros administrativos não poluem a navegação principal.
- [ ] Minha Escala possui identidade própria na experiência do servidor.
- [ ] Disponibilidade pertence conceitualmente ao domínio de Escalas.
- [ ] Substituições pertencem ao domínio de Escalas.

### Perfis

- [ ] A arquitetura diferencia claramente as necessidades de servidor e coordenador.
- [ ] O servidor consegue chegar rapidamente à própria escala.
- [ ] O coordenador consegue chegar rapidamente às ferramentas de gerenciamento.

### Mobile

- [ ] A arquitetura funciona sem depender de navegação horizontal.
- [ ] Existe uma estratégia definida para navegação mobile.
- [ ] As ações principais continuam facilmente acessíveis em telas pequenas.

### Consistência

- [ ] A estrutura proposta pode ser aplicada às telas existentes sem alterar as regras de negócio.
- [ ] A arquitetura está documentada antes da implementação visual.

---

## 21. ENTREGÁVEIS ESPERADOS

Ao finalizar esta etapa, o agente deverá produzir:

### 1. Mapa de navegação

Representação hierárquica da nova arquitetura.

### 2. Matriz de acesso por perfil

| Área | Admin | Coordenador | Servidor | Visitante |
|---|---:|---:|---:|---:|
| Dashboard | ✓ | ✓ | ✓ | — |
| Escalas | ✓ | ✓ | —/limitado | — |
| Minha escala | ✓ | ✓ | ✓ | — |
| Substituições | ✓ | ✓ | — | — |
| Disponibilidade | ✓ | ✓ | ✓ | — |
| Pessoas | ✓ | ✓ | — | — |
| Relatórios | ✓ | ✓ | — | — |
| Configurações | ✓ | ✓* | — | — |
| Perfil | ✓ | ✓ | ✓ | — |

*Respeitando as permissões já existentes no backend.

### 3. Fluxos de navegação

Documentar os principais caminhos.

Servidor:

Login
 ↓
Dashboard
 ↓
Minha próxima escala
 ↓
Detalhes
 ↓
Confirmar presença

Coordenador:

Login
 ↓
Dashboard
 ↓
Escala
 ↓
Criar/Editar
 ↓
Montar equipe
 ↓
Validar
 ↓
Publicar

### 4. Recomendações para desktop/mobile

Definir estruturalmente como cada área será acessada em:

- Desktop;
- Tablet;
- Mobile.

---

## 22. FORA DO ESCOPO

Esta etapa NÃO contempla:

- redesign visual;
- implementação de componentes;
- criação de Design System;
- escolha de cores;
- escolha de fontes;
- criação de wireframes de alta fidelidade;
- implementação frontend;
- refatoração de código;
- alterações de API;
- alterações de banco.

Esses pontos serão tratados nas próximas etapas.

---

## 23. RESULTADO ESPERADO

Ao final desta etapa, devemos conseguir olhar para o sistema e responder claramente:

"Se eu sou um servidor, onde vou?"

"Se eu sou coordenador, onde vou?"

"Onde encontro uma escala?"

"Onde resolvo uma substituição?"

"Onde informo minha disponibilidade?"

"Onde encontro os relatórios?"

"Onde gerencio os cadastros?"

Sem depender de conhecer previamente o sistema.

---

## DIRETRIZ CENTRAL

O novo Ordo Musicalis deve seguir esta lógica:

"Complexidade no domínio, simplicidade na interface."

Não vamos simplificar o sistema removendo sua capacidade.

Vamos simplificá-lo organizando melhor essa capacidade.

Esta é a primeira fundação do redesign.