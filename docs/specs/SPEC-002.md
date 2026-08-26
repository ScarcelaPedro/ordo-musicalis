# SPEC — Etapa 2: UX e Wireframes

Projeto: Ordo Musicalis
Etapa: 2 — Experiência do Usuário e Wireframes
Objetivo: Redefinir a experiência das principais telas e fluxos do sistema antes da definição visual e da implementação.

---

## 1. OBJETIVO

Transformar a arquitetura definida na Etapa 1 em uma experiência de usuário clara, simples e eficiente.

Nesta etapa serão definidos:

- estrutura das telas;
- hierarquia das informações;
- organização dos conteúdos;
- ações primárias e secundárias;
- fluxos de interação;
- comportamento dos componentes;
- estados das telas;
- comportamento mobile;
- comportamento desktop;
- wireframes de baixa/média fidelidade.

O objetivo principal é responder:

"Como o usuário deve realizar cada tarefa?"

Antes de responder:

"Como essa interface deve parecer?"

---

## 2. PRINCÍPIO CENTRAL

O redesign deverá seguir o seguinte princípio:

"Complexidade no domínio, simplicidade na interface."

O sistema possui regras de negócio relativamente complexas, especialmente na montagem de escalas.

A interface não deve expor essa complexidade desnecessariamente ao usuário.

Devemos esconder complexidade até o momento em que ela seja necessária.

---

## 3. PRINCÍPIOS DE UX

Todos os wireframes deverão seguir estes princípios:

### 3.1 Clareza

O usuário deve entender rapidamente:

- onde está;
- o que está vendo;
- o que pode fazer;
- qual é a ação principal;
- o que aconteceu após uma ação.

---

### 3.2 Hierarquia

As informações mais importantes devem receber maior destaque.

As informações secundárias devem ocupar menos espaço visual.

Não tratar todos os dados com a mesma importância.

---

### 3.3 Progressive Disclosure

Não exibir todas as opções simultaneamente quando elas não são necessárias.

Mostrar primeiro:

- informação principal;
- ação principal.

E revelar informações secundárias conforme o usuário precisar.

---

### 3.4 Feedback

Toda ação relevante deve possuir resposta visual adequada.

Exemplos:

- salvando;
- salvo;
- erro;
- alteração realizada;
- confirmação pendente;
- conflito encontrado;
- nenhuma sugestão encontrada.

---

### 3.5 Prevenção de erros

A interface deve tentar impedir erros antes que eles aconteçam.

Especialmente:

- servidor indisponível;
- servidor já escalado;
- função duplicada;
- dados obrigatórios ausentes;
- exclusão acidental.

---

### 3.6 Mobile-first

As interfaces devem ser pensadas primeiro para telas pequenas.

Não criar uma versão desktop e simplesmente reduzir seu tamanho no celular.

---

## 4. TELAS PRIORITÁRIAS

A ordem inicial de trabalho será:

1. Dashboard
2. Criar/Editar Escala
3. Escala — Detalhes
4. Listagens administrativas
5. Painel de Disponibilidade

Essa ordem segue a criticidade identificada na auditoria.

O Dashboard possui atualmente o problema mais grave de mobile, enquanto o ScaleForm é o fluxo mais pesado e frequente do coordenador. :contentReference[oaicite:1]{index=1}

---

# 5. DASHBOARD

## Objetivo

O Dashboard deve ser o principal ponto de entrada do sistema.

Ele deve responder rapidamente:

"O que está acontecendo?"

e:

"O que eu preciso fazer?"

---

## 5.1 Dashboard — Servidor

Prioridade das informações:

1. Próxima escala.
2. Confirmação pendente.
3. Alterações importantes.
4. Próximas escalas.
5. Disponibilidade.
6. Repertório/liturgia relacionado à próxima celebração.

A primeira informação relevante não deve ser uma grande tabela/calendário.

O servidor deve conseguir identificar sua próxima obrigação imediatamente.

---

## 5.2 Dashboard — Coordenador

Prioridade:

1. Próximas celebrações.
2. Situação das escalas.
3. Pendências.
4. Funções sem servidores.
5. Conflitos.
6. Substituições.
7. Ações rápidas.

Exemplo conceitual:

┌────────────────────────────────────┐
│ Bom dia, João                      │
│                                    │
│ Próximas celebrações               │
│                                    │
│ Domingo · 19:00                    │
│ São João Batista                   │
│ 12/15 funções preenchidas          │
│                                    │
│ [Ver escala] [Editar]              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Pendências                         │
│                                    │
│ 3 confirmações aguardando           │
│ 1 função sem servidor               │
│ 1 substituição pendente             │
└────────────────────────────────────┘

Isso é apenas uma referência estrutural.

Não definir ainda cores, tipografia ou estilo visual.

---

# 6. CALENDÁRIO DO DASHBOARD

O calendário atual é um dos principais problemas do sistema.

Atualmente existe uma largura mínima de 560px no calendário, fazendo com que usuários de celulares precisem rolar horizontalmente. :contentReference[oaicite:2]{index=2}

Esse comportamento NÃO deve existir no novo design.

---

## 6.1 Requisito mobile

O calendário deverá caber na largura disponível.

Não depender de:

- scroll horizontal;
- zoom;
- arrastar lateralmente.

---

## 6.2 Estratégia

O wireframe deverá avaliar uma abordagem adaptativa.

Desktop:

Calendário mensal completo.

Mobile:

Possível transformação para:

- agenda vertical;
- agrupamento por dia;
- calendário compacto + lista;
- ou outra solução equivalente.

A decisão final deverá ser baseada na compreensão e velocidade de consulta, não na obrigação de preservar o formato atual.

---

## 6.3 Informação mínima

Cada evento deverá comunicar, quando houver espaço:

- data;
- horário;
- comunidade;
- celebração;
- situação relevante.

Não utilizar textos excessivamente pequenos para fazer caber informação.

A auditoria identificou textos/chips de aproximadamente 10px e informações escondidas no mobile como problemas de legibilidade. :contentReference[oaicite:3]{index=3}

---

# 7. CRIAR/EDITAR ESCALA

Esta será a tela de maior atenção da Etapa 2.

O formulário atual é extremamente denso.

Uma escala comum pode exigir 30+ interações discretas para montar a equipe. :contentReference[oaicite:4]{index=4}

O objetivo NÃO é simplesmente reorganizar os campos.

Precisamos repensar a interação.

---

## 7.1 Novo princípio

A montagem da escala deve parecer:

"Montar uma equipe"

e não:

"Preencher um formulário gigante."

---

## 7.2 Estrutura conceitual

A tela deverá ser dividida em etapas lógicas:

### Etapa 1 — Celebração

Informações:

- data;
- horário;
- comunidade;
- celebrante;
- ministério, quando aplicável;
- observações.

---

### Etapa 2 — Equipe

Organização por categoria:

Música

[ + Adicionar ]

Acólitos

[ + Adicionar ]

Leitores

[ + Adicionar ]

Ministros

[ + Adicionar ]

etc.

Cada categoria deve funcionar como um bloco independente.

---

### Etapa 3 — Validação

Antes de salvar/publicar:

- conflitos;
- indisponibilidades;
- funções vazias;
- informações obrigatórias;
- possíveis problemas.

---

### Etapa 4 — Revisão

Mostrar um resumo da celebração e equipe antes da conclusão.

---

## 7.3 Adicionar servidor

A interação atual exige:

Selecionar servidor
+
Clicar em adicionar
+
Selecionar informações adicionais quando necessário.

O novo wireframe deverá explorar uma interação mais direta.

Exemplo conceitual:

[ + Adicionar servidor ]

Ao clicar:

┌─────────────────────────────────┐
│ Adicionar servidor               │
│                                 │
│ 🔎 Buscar pessoa...              │
│                                 │
│ João Silva                      │
│ Maria Souza                     │
│ Pedro Santos                    │
│                                 │
│ Categoria: Música               │
│ Função: Violão                  │
│                                 │
│ [Adicionar]                     │
└─────────────────────────────────┘

A implementação pode utilizar outro padrão, como autocomplete, seleção rápida, drawer ou modal.

O importante é reduzir a carga cognitiva.

---

## 7.4 Sugestões

O sistema possui atualmente uma seção de "Sugeridos" e sugestões por categoria que competem visualmente.

Isso pode confundir o coordenador sobre qual caminho utilizar primeiro. :contentReference[oaicite:5]{index=5}

O novo UX deverá definir claramente:

- quando utilizar sugestões;
- como aceitar sugestão;
- como adicionar manualmente;
- como substituir uma sugestão;
- o que acontece quando não existem sugestões.

---

## 7.5 Conflitos

O novo fluxo deverá prever visualmente:

### Servidor indisponível

"Maria marcou este período como indisponível."

### Servidor já escalado

"João já está escalado para outra celebração neste horário."

### Função incompatível

"Este servidor não possui esta categoria/função."

O objetivo é detectar o problema no momento da escalação.

A auditoria identificou a ausência de detecção de conflitos como um problema de alta severidade. :contentReference[oaicite:6]{index=6}

---

## 7.6 Estado sem sugestões

Nunca apresentar apenas:

"Nenhum servidor encontrado."

A interface deverá explicar, quando possível, por que não existem sugestões.

Possíveis razões:

- indisponível;
- já escalado;
- categoria incompatível;
- nenhum cadastro correspondente.

E deverá oferecer um próximo passo.

---

# 8. ESCALA — TELA DE DETALHES

A tela de detalhes deve permitir compreender uma celebração rapidamente.

A auditoria indica que o fluxo atual já é relativamente enxuto; portanto, o ganho principal deverá vir da hierarquia visual, e não da redução de cliques. :contentReference[oaicite:7]{index=7}

---

## 8.1 Hierarquia

A ordem deverá priorizar:

1. Celebração.
2. Data/hora.
3. Comunidade.
4. Celebrante.
5. Situação da escala.
6. Equipe.
7. Repertório.
8. Liturgia.
9. Informações secundárias.

---

## 8.2 Celebrante

O celebrante deverá possuir destaque visual adequado.

Isso é requisito de negócio e atualmente não está implementado corretamente. :contentReference[oaicite:8]{index=8}

---

## 8.3 Situação da escala

Deverá ser fácil identificar:

- confirmados;
- pendentes;
- recusados;
- vagas;
- alterações recentes.

---

## 8.4 Funções vazias

Quando uma categoria necessária não possuir ninguém:

Exemplo:

⚠ Função sem servidor

Música
Teclado

[Resolver]

O usuário deve perceber o problema sem precisar analisar toda a lista.

A auditoria identifica a ausência dessa indicação como problema médio. :contentReference[oaicite:9]{index=9}

---

## 8.5 Escala alterada

Caso uma escala publicada seja modificada, deverá existir uma indicação clara de alteração.

Exemplo:

"Alterada recentemente"

ou:

"Horário alterado"

A intenção é evitar que servidores deixem de perceber mudanças importantes.

---

# 9. MINHA ESCALA

A experiência do servidor deve ser diferente da experiência administrativa.

O objetivo é responder:

"Onde e quando eu vou servir?"

---

## 9.1 Estrutura

Exemplo:

MINHAS PRÓXIMAS ESCALAS

┌─────────────────────────────┐
│ Domingo, 23 de agosto       │
│ 19:00                       │
│ São João Batista            │
│                             │
│ 🎵 Violão                   │
│                             │
│ ✓ Presença confirmada      │
│                             │
│ [Ver detalhes]              │
└─────────────────────────────┘

O servidor não deve precisar interpretar uma tabela administrativa para descobrir suas próprias escalas.

---

# 10. LISTAGENS ADMINISTRATIVAS

As telas de listagem atualmente utilizam tabelas HTML e `overflow-x-auto`, o que gera problemas graves no mobile. :contentReference[oaicite:10]{index=10}

O novo UX deverá definir dois comportamentos:

### Desktop

Tabela pode continuar sendo utilizada quando ela realmente favorecer comparação de dados.

### Mobile

A informação deverá ser reorganizada para:

- cards;
- listas;
- agrupamentos;
- ações contextuais.

Não simplesmente reduzir a tabela.

---

## 10.1 Estrutura mobile

Exemplo:

┌─────────────────────────────┐
│ João Silva                  │
│ Música · Violão             │
│ 3 escalas este mês          │
│                             │
│ [Ver] [Mais]                │
└─────────────────────────────┘

O objetivo é manter as informações importantes visíveis sem scroll horizontal.

---

# 11. PAINEL DE DISPONIBILIDADE

O painel atual utiliza uma grade servidor × dia que possui problemas semelhantes de largura.

O wireframe deverá priorizar:

- leitura rápida;
- identificação de quem respondeu;
- identificação de quem não respondeu;
- abertura/fechamento da coleta;
- filtros;
- visão mobile.

---

## 11.1 Desktop

Pode utilizar uma estrutura tabular/grade quando isso favorecer a comparação.

---

## 11.2 Mobile

Não deve depender de uma tabela horizontal gigantesca.

Deverá ser explorada uma estrutura como:

Servidor

João Silva

Segunda
✓ Manhã
✓ Tarde
— Noite

Terça
✓ Manhã
— Tarde
✓ Noite

ou uma abordagem equivalente.

---

# 12. FORMULÁRIOS

Os formulários deverão seguir uma hierarquia consistente.

Estrutura geral:

1. Título.
2. Breve explicação.
3. Campos principais.
4. Campos secundários.
5. Ações.
6. Feedback.

Evitar:

- dezenas de campos sem agrupamento;
- labels pouco claros;
- ações espalhadas;
- botões sem hierarquia.

---

# 13. AÇÕES PRIMÁRIAS E SECUNDÁRIAS

Cada tela deverá possuir uma ação principal claramente identificável.

Exemplo:

Criar escala:

AÇÃO PRIMÁRIA:
"Salvar escala"

AÇÕES SECUNDÁRIAS:
"Cancelar"
"Voltar"
"Salvar rascunho", se existir.

Não apresentar vários botões com o mesmo peso visual.

---

# 14. ESTADOS DAS TELAS

Cada wireframe deverá considerar:

- Loading;
- Empty;
- Error;
- Success;
- Disabled;
- Selected;
- Active;
- Focus;
- Validation;
- Confirmation.

Não desenhar apenas o "estado perfeito".

---

## 14.1 Empty states

Um estado vazio deve explicar:

1. O que está vazio.
2. Por que pode estar vazio.
3. O que o usuário pode fazer.

Exemplo:

"Você ainda não possui escalas."

"Quando uma escala for atribuída a você, ela aparecerá aqui."

---

# 15. CONFIRMAÇÕES

A interface não deverá depender do `confirm()` nativo do navegador como experiência final.

A auditoria identifica isso como inconsistente e pouco explicativo. :contentReference[oaicite:11]{index=11}

Deverá ser especificado um padrão de confirmação.

Exemplo:

┌─────────────────────────────────┐
│ Excluir servidor?               │
│                                 │
│ Esta ação removerá o servidor   │
│ da escala e poderá afetar       │
│ registros relacionados.         │
│                                 │
│ [Cancelar] [Excluir]            │
└─────────────────────────────────┘

A implementação da reversibilidade/exclusão física não faz parte desta etapa.

Nesta etapa definiremos somente a experiência.

---

# 16. RESPONSIVIDADE

Cada wireframe deverá especificar comportamento em:

- Mobile pequeno;
- Mobile grande;
- Tablet;
- Desktop.

Não basta dizer:

"Responsivo."

É necessário definir como o conteúdo muda.

Exemplo:

Desktop:

Sidebar + conteúdo.

Mobile:

Topbar + navegação inferior/menu secundário.

Desktop:

Tabela.

Mobile:

Cards.

Desktop:

Calendário mensal.

Mobile:

Agenda/lista ou calendário adaptado.

---

# 17. ACESSIBILIDADE

Os wireframes deverão considerar:

- hierarquia semântica;
- contraste futuro adequado;
- áreas de toque;
- labels claros;
- feedback textual;
- não depender exclusivamente de cor;
- foco visível;
- textos legíveis;
- ícones acompanhados de texto quando necessário.

Os selects nativos existentes são considerados positivos para usuários pouco técnicos e acessibilidade, portanto não devem ser substituídos simplesmente por estética. :contentReference[oaicite:12]{index=12}

---

# 18. NAVEGAÇÃO ENTRE TELAS

Cada wireframe deverá indicar:

- de onde o usuário veio;
- para onde pode ir;
- qual ação retorna;
- qual ação continua o fluxo.

Evitar fluxos em que o usuário fique sem saber:

"O que faço agora?"

---

# 19. BREADCRUMBS E CONTEXTO

Breadcrumbs podem ser utilizados em fluxos administrativos complexos.

Exemplo:

Escalas
→
Escala de 23/08
→
Editar

Não utilizar breadcrumbs automaticamente em todas as telas.

A decisão deve considerar a necessidade de contexto.

---

# 20. MODAIS, DRAWERS E PÁGINAS

Não utilizar modal simplesmente para reduzir número de páginas.

Critério:

### Modal

Para ações rápidas e contextuais.

### Drawer

Para tarefas secundárias ou seleção contextual.

### Página

Para tarefas complexas ou que exigem concentração.

A montagem completa de uma escala, por exemplo, não deve ser comprimida em um modal.

---

# 21. PREVENÇÃO DE CARGA COGNITIVA

Evitar:

- excesso de informações simultâneas;
- campos irrelevantes naquele momento;
- múltiplos caminhos para a mesma ação;
- controles duplicados;
- termos técnicos desnecessários;
- excesso de filtros;
- ações escondidas.

Especialmente no ScaleForm.

A auditoria identificou que atualmente existem duas fontes concorrentes para adicionar pessoas: sugestões gerais e seleção manual por categoria. :contentReference[oaicite:13]{index=13}

O novo wireframe deverá escolher uma hierarquia clara entre essas alternativas.

---

# 22. DESIGN PARA USUÁRIOS NÃO TÉCNICOS

O sistema será utilizado por pessoas com diferentes níveis de familiaridade tecnológica.

Portanto:

- evitar linguagem técnica;
- preferir verbos claros;
- explicar consequências;
- não depender de ícones isolados;
- não esconder ações importantes;
- evitar interações pouco convencionais sem necessidade.

A complexidade deverá aparecer somente quando realmente necessária.

---

# 23. REGRAS DE CONTEÚDO

Os textos da interface deverão ser:

- curtos;
- claros;
- objetivos;
- orientados à ação.

Exemplo ruim:

"Processamento da solicitação de confirmação de participação."

Preferir:

"Confirmar presença"

---

# 24. O QUE NÃO DEVE SER DECIDIDO NESTA ETAPA

Não definir ainda:

- cores finais;
- fonte final;
- sombras;
- bordas;
- identidade visual;
- ilustrações;
- ícones definitivos;
- animações;
- tokens de design;
- componentes Vue finais;
- biblioteca visual;
- implementação Tailwind.

Esses pontos pertencem à etapa de Design System/UI.

---

# 25. O QUE DEVE SER PRODUZIDO

O agente deverá produzir wireframes para as seguintes experiências:

### Prioridade 1

Dashboard — Servidor

Dashboard — Coordenador

### Prioridade 2

Criar Escala

Editar Escala

Adicionar servidor

Validar conflitos

Revisar escala

### Prioridade 3

Escala — Detalhes

### Prioridade 4

Minha Escala

### Prioridade 5

Listagem genérica

Exemplo:

Servidores

Escalas

Comunidades

### Prioridade 6

Painel de Disponibilidade

---

# 26. CADA WIREFRAME DEVE CONTER

Para cada tela, documentar:

### Objetivo

Por que a tela existe?

### Usuário

Quem utiliza?

### Informação principal

Qual é a primeira coisa que deve ser percebida?

### Ação principal

O que o usuário deve conseguir fazer?

### Ações secundárias

Quais outras ações existem?

### Estrutura

Quais blocos compõem a tela?

### Estados

Loading, vazio, erro, sucesso etc.

### Mobile

Como a tela se adapta?

### Desktop

Como a tela se adapta?

### Navegação

De onde vem e para onde vai?

---

# 27. FLUXOS PRIORITÁRIOS

Os seguintes fluxos deverão possuir wireframes completos:

## Fluxo A — Servidor

Login
 ↓
Dashboard
 ↓
Minha escala
 ↓
Detalhes da escala
 ↓
Confirmar presença

---

## Fluxo B — Coordenador

Login
 ↓
Dashboard
 ↓
Escalas
 ↓
Criar escala
 ↓
Dados da celebração
 ↓
Montar equipe
 ↓
Validar
 ↓
Revisar
 ↓
Salvar/Publicar
 ↓
Detalhes da escala

---

## Fluxo C — Substituição

Escalas
 ↓
Substituições
 ↓
Solicitação
 ↓
Ver sugestões
 ↓
Selecionar substituto
 ↓
Confirmar

O estado "nenhum substituto encontrado" também deverá ser especificado.

---

## Fluxo D — Disponibilidade

Minha disponibilidade
 ↓
Selecionar disponibilidade
 ↓
Adicionar exceção
 ↓
Salvar
 ↓
Feedback de sucesso

---

# 28. CRITÉRIOS DE ACEITE

A Etapa 2 será considerada concluída quando:

### UX

- [ ] Cada tela prioritária possui objetivo definido.
- [ ] Cada tela possui ação principal definida.
- [ ] A hierarquia de informações está definida.
- [ ] Os principais fluxos estão documentados.
- [ ] O fluxo de criação de escala foi simplificado conceitualmente.
- [ ] O fluxo de servidor foi separado da experiência administrativa.
- [ ] Os principais estados das telas estão especificados.

### Mobile

- [ ] Cada tela prioritária possui comportamento mobile definido.
- [ ] Nenhuma solução depende de scroll horizontal desnecessário.
- [ ] Tabelas possuem estratégia alternativa para mobile.
- [ ] O calendário possui estratégia mobile definida.
- [ ] Áreas de toque e legibilidade foram consideradas.

### Escala

- [ ] Dados da celebração estão separados da montagem da equipe.
- [ ] Categorias de equipe possuem agrupamento claro.
- [ ] Adicionar servidor possui fluxo definido.
- [ ] Sugestões possuem hierarquia clara.
- [ ] Conflitos possuem representação definida.
- [ ] Funções vazias possuem representação definida.
- [ ] Revisão da escala possui fluxo definido.

### Servidor

- [ ] Minha Escala possui experiência própria.
- [ ] Próxima escala é facilmente identificável.
- [ ] Confirmação de presença é clara.
- [ ] Alterações importantes são perceptíveis.

---

# 29. FORA DO ESCOPO

Esta etapa NÃO contempla:

- implementação do frontend;
- criação dos componentes Vue;
- alteração de banco;
- alteração da API;
- alteração das regras de negócio;
- criação de Design System;
- definição de identidade visual;
- definição de cores;
- definição de tipografia;
- implementação das telas;
- refatoração de código.

---

# 30. ENTREGÁVEIS

O agente deverá entregar:

1. Mapa dos principais fluxos.
2. Wireframes das telas prioritárias.
3. Wireframes mobile.
4. Wireframes desktop.
5. Estados principais de cada tela.
6. Descrição das decisões de UX.
7. Relação entre telas.
8. Regras de comportamento responsivo.
9. Fluxo completo de criação/edição de escala.
10. Lista de decisões que deverão ser levadas para a Etapa 3.

---

# 31. DECISÕES QUE DEVEM SER EXPLICITADAS

Quando houver mais de uma solução possível, o agente NÃO deve simplesmente escolher silenciosamente.

Deverá apresentar:

- problema;
- alternativa A;
- alternativa B;
- vantagens;
- desvantagens;
- recomendação;
- justificativa.

Exemplo:

"Calendário mobile"

Alternativa A:
Calendário mensal adaptado.

Alternativa B:
Agenda vertical.

Alternativa C:
Calendário compacto + lista.

Recomendação:
X.

Motivo:
Y.

Isso permitirá revisão humana antes da implementação.

---

# 32. REGRA FUNDAMENTAL

Os wireframes não devem tentar preservar a interface atual.

Devem preservar:

- regras de negócio;
- dados;
- funcionalidades necessárias;
- relações entre entidades.

Mas a forma como o usuário interage com essas informações pode ser completamente repensada.

A auditoria recomenda explicitamente simplificar a montagem da escala sem perder a flexibilidade multi-categoria existente. :contentReference[oaicite:14]{index=14}

---

# 33. RESULTADO ESPERADO

Ao final desta etapa, devemos possuir uma resposta clara para:

"O que aparece nesta tela?"

"O que aparece primeiro?"

"O que o usuário pode fazer?"

"Qual é a ação principal?"

"O que acontece depois?"

"Como funciona no celular?"

"Como funciona no desktop?"

"O que acontece quando algo dá errado?"

"O que acontece quando não há dados?"

"Onde o usuário deve clicar para continuar?"

Se essas perguntas ainda não puderem ser respondidas para uma tela, o wireframe ainda não está suficientemente definido.

---

# DIRETRIZ CENTRAL DA ETAPA 2

Não queremos desenhar telas bonitas.

Queremos desenhar telas que façam sentido.

A estética será decidida posteriormente.

Primeiro:

UX.

Depois:

UI.

Depois:

Código.

A Etapa 2 deve transformar a arquitetura da Etapa 1 em uma experiência clara, previsível e eficiente para o usuário real do Ordo Musicalis.