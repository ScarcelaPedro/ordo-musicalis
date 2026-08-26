# SPEC — Etapa 4: Implementação do Redesign

Projeto: Ordo Musicalis
Etapa: 4 — Implementação Frontend do Novo Design
Objetivo: Implementar no sistema real a arquitetura, UX e Design System definidos nas Etapas 1, 2 e 3, preservando integralmente as regras de negócio existentes.

---

## 1. CONTEXTO

As etapas anteriores definiram:

Etapa 1:
- arquitetura da informação;
- navegação;
- organização das funcionalidades;
- diferenciação por perfil.

Etapa 2:
- fluxos;
- wireframes;
- hierarquia de informação;
- comportamento mobile/desktop;
- estados das telas.

Etapa 3:
- identidade visual;
- Design System;
- cores;
- tipografia;
- espaçamento;
- componentes;
- estados;
- padrões visuais.

A Etapa 4 transforma essas definições em implementação real.

---

# 2. OBJETIVO PRINCIPAL

Atualizar a interface existente do Ordo Musicalis para o novo padrão visual e de UX.

A implementação deve:

- preservar as funcionalidades existentes;
- preservar as regras de negócio;
- preservar permissões;
- preservar integrações;
- preservar contratos da API;
- reutilizar dados existentes;
- aplicar o novo Design System;
- aplicar a nova arquitetura;
- aplicar os fluxos aprovados;
- funcionar corretamente em mobile e desktop.

---

# 3. REGRA FUNDAMENTAL

NÃO alterar o comportamento do sistema sem necessidade.

Esta etapa é principalmente uma transformação de:

INTERFACE ANTIGA

↓

NOVA EXPERIÊNCIA

mantendo:

BACKEND
+
API
+
BANCO
+
REGRAS DE NEGÓCIO

---

# 4. STACK

A implementação deve respeitar a stack existente do projeto.

Frontend:

- Vue;
- Tailwind;
- componentes existentes quando forem reutilizáveis;
- arquitetura atual.

Não substituir a stack por outra tecnologia apenas para facilitar o redesign.

---

# 5. ESTRATÉGIA DE IMPLEMENTAÇÃO

A implementação deverá ocorrer de forma incremental.

Não tentar reconstruir todo o frontend de uma vez.

Ordem:

1. Fundação do Design System.
2. Layout global.
3. Navegação.
4. Dashboard.
5. Escalas.
6. Criar/Editar Escala.
7. Minha Escala.
8. Listagens.
9. Disponibilidade.
10. Demais telas.

---

# 6. ETAPA 4.1 — FUNDAÇÃO

Antes das telas, implementar:

- tokens;
- cores;
- tipografia;
- espaçamento;
- radius;
- sombras;
- breakpoints;
- componentes base.

---

# 7. DESIGN TOKENS

Criar os tokens definidos na Etapa 3.

Categorias mínimas:

Colors:

- background;
- surface;
- surface elevated;
- border;
- text primary;
- text secondary;
- text muted;
- primary;
- secondary;
- accent;
- success;
- warning;
- danger;
- info.

Typography:

- font family;
- sizes;
- weights;
- line heights.

Spacing:

- xs;
- sm;
- md;
- lg;
- xl;
- 2xl.

Radius:

- sm;
- md;
- lg;
- full.

Elevation:

- none;
- sm;
- md;
- lg.

---

# 8. COMPONENTES BASE

Implementar primeiro os componentes reutilizáveis.

Prioridade:

1. Button
2. IconButton
3. Input
4. Select
5. Textarea
6. Checkbox
7. Radio
8. Switch
9. Badge
10. Alert
11. Toast
12. Modal
13. Drawer
14. Tooltip
15. Card
16. Avatar
17. Tabs
18. Dropdown
19. Breadcrumb
20. EmptyState
21. Loading/Skeleton
22. ErrorState

---

# 9. ESTADOS DOS COMPONENTES

Todos os componentes interativos devem possuir os estados necessários.

Exemplo:

Button:

- default;
- hover;
- active;
- focus;
- disabled;
- loading.

Input:

- default;
- focus;
- filled;
- error;
- disabled.

Select:

- default;
- open;
- selected;
- error;
- disabled.

---

# 10. ACESSIBILIDADE

Os componentes devem possuir:

- foco visível;
- labels adequados;
- atributos ARIA quando necessários;
- navegação por teclado;
- estados compreensíveis;
- áreas de toque adequadas.

Não utilizar apenas cor para indicar estado.

---

# 11. LAYOUT GLOBAL

Implementar o novo layout global:

Desktop:

Sidebar
+
Topbar
+
Conteúdo

Mobile:

Topbar
+
Conteúdo
+
Navegação mobile quando definida.

---

# 12. SIDEBAR

Implementar a arquitetura definida na Etapa 1.

Organizar:

Dashboard

Escalas

Pessoas

Conteúdo

Análises

Configurações

Perfil

A sidebar deverá:

- indicar página atual;
- indicar seção;
- respeitar permissões;
- não exibir links que o usuário não pode acessar;
- possuir estados hover/focus/active.

---

# 13. NAVEGAÇÃO POR PERFIL

A interface deve respeitar os perfis existentes.

Servidor:

Priorizar:

- Dashboard;
- Minha Escala;
- Disponibilidade;
- notificações;
- perfil.

Coordenador/Admin:

Priorizar:

- Dashboard;
- Escalas;
- Pessoas;
- Conteúdo;
- Análises;
- Configurações.

Não duplicar regras de autorização do backend.

A interface pode ocultar funcionalidades não permitidas, mas o backend continua sendo a autoridade final.

---

# 14. TOPBAR

Implementar:

- título;
- contexto;
- breadcrumbs quando necessários;
- ações;
- notificações;
- perfil.

Evitar excesso de elementos.

---

# 15. RESPONSIVIDADE

A implementação deverá ser mobile-first.

Não utilizar como solução principal:

overflow-x-auto

para resolver problemas de layout.

Quando uma estrutura não couber no mobile, adaptar sua apresentação.

Exemplo:

Desktop:

Tabela.

Mobile:

Card/lista.

Desktop:

Sidebar.

Mobile:

Menu apropriado.

Desktop:

Calendário mensal.

Mobile:

Visualização adaptada.

---

# 16. DASHBOARD

Implementar o Dashboard seguindo os wireframes aprovados.

Servidor:

Prioridade:

1. próxima escala;
2. pendências;
3. alterações;
4. próximas escalas;
5. disponibilidade;
6. repertório/liturgia.

Coordenador:

Prioridade:

1. próximas celebrações;
2. situação das escalas;
3. pendências;
4. funções vazias;
5. conflitos;
6. substituições;
7. ações rápidas.

---

# 17. DASHBOARD MOBILE

O Dashboard não deve simplesmente reduzir os componentes desktop.

A hierarquia deve ser reorganizada.

Primeiro:

Próxima escala.

Depois:

Pendências.

Depois:

Outras informações.

O usuário deve conseguir compreender a situação sem precisar ampliar ou rolar horizontalmente.

---

# 18. CALENDÁRIO

Implementar o comportamento definido na Etapa 2.

Desktop:

Calendário completo quando adequado.

Mobile:

Não utilizar calendário com largura mínima que obrigue scroll horizontal.

Caso a melhor solução seja uma agenda/lista no mobile, implementar essa transformação.

---

# 19. ESCALA — DETALHES

Implementar:

- cabeçalho da celebração;
- data;
- horário;
- comunidade;
- celebrante;
- status;
- equipe;
- funções;
- repertório;
- liturgia;
- informações adicionais.

---

# 20. STATUS DA ESCALA

Utilizar os componentes de status definidos no Design System.

Exemplos:

- confirmado;
- pendente;
- recusado;
- publicado;
- rascunho.

---

# 21. FUNÇÕES VAZIAS

Quando existir uma função necessária sem servidor, mostrar claramente:

⚠ Função sem servidor

e disponibilizar a ação adequada:

[Adicionar]

ou

[Resolver]

Não esconder o problema dentro da lista.

---

# 22. CONFLITOS

Conflitos devem aparecer contextualizados.

Exemplo:

⚠ Conflito de horário

João já está escalado para outra celebração neste horário.

[Ver conflito]

A interface não deve apenas impedir a operação sem explicar o motivo.

---

# 23. CRIAR/EDITAR ESCALA

Este é o fluxo de maior prioridade.

A implementação deverá seguir a estrutura definida:

Etapa 1:
Dados da celebração.

Etapa 2:
Montagem da equipe.

Etapa 3:
Validação.

Etapa 4:
Revisão.

---

# 24. DADOS DA CELEBRAÇÃO

Organizar:

- data;
- horário;
- comunidade;
- celebrante;
- ministério;
- observações.

Agrupar visualmente informações relacionadas.

Evitar formulário vertical excessivamente longo sem estrutura.

---

# 25. MONTAGEM DA EQUIPE

A interface deverá apresentar categorias de forma organizada.

Exemplo:

Música

[servidores]

[+ Adicionar]

Acólitos

[servidores]

[+ Adicionar]

Leitores

[servidores]

[+ Adicionar]

---

# 26. ADICIONAR SERVIDOR

Implementar o fluxo definido nos wireframes.

Possibilidades:

- busca;
- seleção;
- autocomplete;
- drawer;
- modal.

Utilizar a solução aprovada.

A interação deve:

1. encontrar servidor;
2. mostrar informações relevantes;
3. permitir definir função;
4. validar conflitos;
5. adicionar à equipe.

---

# 27. SUGESTÕES

Implementar visualmente as sugestões existentes.

A interface deve deixar claro:

- quem foi sugerido;
- por que foi sugerido quando essa informação estiver disponível;
- como adicionar;
- como ignorar;
- como selecionar manualmente.

Não criar nova regra de sugestão.

---

# 28. VALIDAÇÃO

Antes de concluir a escala, apresentar:

- funções vazias;
- conflitos;
- indisponibilidades;
- campos obrigatórios;
- inconsistências.

A validação deve ser compreensível.

---

# 29. REVISÃO

Antes da ação final:

mostrar resumo de:

- celebração;
- horário;
- comunidade;
- celebrante;
- equipe;
- funções;
- problemas.

A ação final deve possuir hierarquia clara.

---

# 30. MINHA ESCALA

Criar experiência específica para o servidor.

Mostrar:

- próximas escalas;
- data;
- horário;
- comunidade;
- função;
- status;
- confirmação.

O servidor não deve precisar interpretar a interface administrativa.

---

# 31. CONFIRMAÇÃO

Implementar fluxo claro para:

- confirmar;
- recusar;
- visualizar estado atual.

Após confirmação:

mostrar feedback.

Exemplo:

"Presença confirmada."

---

# 32. ALTERAÇÕES

Quando uma escala previamente publicada sofrer alteração, destacar a alteração conforme especificado no UX.

Exemplo:

"Horário alterado."

ou

"Escala atualizada."

Não implementar nova regra de notificação nesta etapa.

Apenas utilizar os dados existentes.

---

# 33. LISTAGENS

Aplicar o padrão visual definido para:

- servidores;
- escalas;
- comunidades;
- demais entidades.

Desktop:

Tabela quando adequada.

Mobile:

Cards/listas quando necessário.

---

# 34. AÇÕES EM LISTAGENS

As ações devem possuir hierarquia.

Exemplo:

Principal:

[Ver]

Secundárias:

[Editar]
[Excluir]
[...]

Não colocar todos os botões com o mesmo peso visual.

---

# 35. FILTROS

Filtros deverão:

- possuir hierarquia;
- ser fáceis de limpar;
- mostrar estado ativo;
- funcionar no mobile.

No mobile, considerar:

[Filtrar]

abrindo drawer/painel contextual.

---

# 36. PAGINAÇÃO

Quando existir paginação:

- manter padrão consistente;
- funcionar no mobile;
- indicar página atual;
- permitir navegação clara.

---

# 37. DISPONIBILIDADE

Implementar a nova apresentação da disponibilidade.

Desktop:

estrutura comparativa quando apropriado.

Mobile:

estrutura adaptada.

Manter:

- servidores;
- dias;
- horários;
- disponibilidade;
- status.

Não alterar regras existentes.

---

# 38. ESTADOS DE CARREGAMENTO

Todas as telas principais devem possuir loading adequado.

Preferir:

Skeleton

quando a estrutura final for previsível.

Utilizar:

Spinner

para ações pontuais.

---

# 39. EMPTY STATES

Implementar estados vazios definidos na Etapa 3.

Exemplo:

"Nenhuma escala encontrada."

"Não existem escalas para este período."

[ Criar escala ]

---

# 40. ERROS

Implementar mensagens compreensíveis.

Evitar exibir diretamente:

- stack traces;
- códigos técnicos;
- mensagens internas da API.

Exibir mensagem amigável.

Quando possível:

"Não foi possível salvar a escala."

"Verifique os campos destacados."

---

# 41. TOASTS

Utilizar para feedback rápido.

Exemplos:

"Escala salva."

"Servidor adicionado."

"Disponibilidade atualizada."

Não utilizar toast para informações críticas que precisam permanecer visíveis.

---

# 42. CONFIRMAÇÕES

Substituir confirmações nativas do navegador onde o redesign determinar um componente específico.

Utilizar:

Modal/Dialog

para ações destrutivas ou importantes.

---

# 43. NÃO ALTERAR REGRAS DE NEGÓCIO

Se durante a implementação for identificado que uma decisão de UX exigiria alteração de regra de negócio:

PARAR.

Registrar:

- problema;
- regra atual;
- impacto;
- sugestão.

Não implementar silenciosamente.

---

# 44. NÃO INVENTAR DADOS

Não criar:

- novos status;
- novas categorias;
- novos campos;
- novas regras;
- novos fluxos.

Se algo não estiver disponível no backend, utilizar o comportamento definido ou registrar a necessidade.

---

# 45. COMPONENTIZAÇÃO

Componentes devem ser reutilizados.

Exemplo:

Button

↓

utilizado em:

Dashboard
Escala
Formulários
Modais

Não criar cinco versões diferentes do mesmo botão.

---

# 46. COMPONENTES DE DOMÍNIO

Criar componentes específicos somente quando houver benefício real.

Exemplos:

ScaleCard
ScaleMember
ScaleRole
ConflictAlert
AvailabilityStatus
CelebrationHeader

Esses componentes devem encapsular comportamento visual relacionado ao domínio.

---

# 47. EVITAR ABSTRAÇÃO EXCESSIVA

Não criar componentes apenas para transformar poucas linhas de HTML em outro arquivo.

A abstração deve possuir benefício real.

---

# 48. TAILWIND

Utilizar Tailwind de maneira consistente.

Evitar:

- valores arbitrários excessivos;
- classes contraditórias;
- estilos repetidos;
- uso indiscriminado de !important.

Quando determinado padrão se repetir, avaliar transformá-lo em componente/token.

---

# 49. CSS

Evitar CSS global desnecessário.

Priorizar:

- tokens;
- componentes;
- utilitários;
- estilos encapsulados.

CSS global deve ser reservado para regras realmente globais.

---

# 50. RESPONSIVIDADE REAL

Testar pelo menos:

- celular pequeno;
- celular grande;
- tablet;
- notebook;
- desktop;
- monitor grande.

Não considerar:

"funciona no meu monitor"

como validação suficiente.

---

# 51. ACESSIBILIDADE

Validar:

- teclado;
- foco;
- contraste;
- labels;
- leitura;
- touch targets;
- navegação;
- mensagens de erro.

---

# 52. PERFORMANCE VISUAL

Evitar:

- imagens enormes;
- bibliotecas desnecessárias;
- animações pesadas;
- componentes renderizados sem necessidade.

O redesign não deve tornar o sistema perceptivelmente mais lento.

---

# 53. MIGRAÇÃO INCREMENTAL

Não remover a interface antiga inteira antes de validar a nova.

Preferir migração por áreas.

Exemplo:

Dashboard
↓
validar
↓
Escalas
↓
validar
↓
Formulário
↓
validar
↓
restante.

---

# 54. CRITÉRIOS DE ACEITE — GERAIS

A Etapa 4 será considerada concluída quando:

- [ ] Design System está implementado.
- [ ] Layout global está implementado.
- [ ] Navegação está implementada.
- [ ] Dashboard está atualizado.
- [ ] Escalas estão atualizadas.
- [ ] Criar/Editarar Escala está atualizado.
- [ ] Minha Escala está atualizada.
- [ ] Listagens principais estão atualizadas.
- [ ] Disponibilidade está atualizada.
- [ ] Estados de loading estão implementados.
- [ ] Estados vazios estão implementados.
- [ ] Estados de erro estão implementados.
- [ ] Feedbacks estão implementados.
- [ ] Responsividade foi validada.
- [ ] Acessibilidade básica foi validada.
- [ ] Nenhuma regra de negócio foi alterada indevidamente.

---

# 55. CRITÉRIOS DE ACEITE — MOBILE

- [ ] Nenhuma tela prioritária exige scroll horizontal desnecessário.
- [ ] Navegação mobile funciona corretamente.
- [ ] Botões possuem tamanho adequado.
- [ ] Texto permanece legível.
- [ ] Formulários são utilizáveis.
- [ ] Calendário possui estratégia mobile.
- [ ] Tabelas possuem apresentação adaptada.
- [ ] Modais/drawers funcionam em telas pequenas.

---

# 56. CRITÉRIOS DE ACEITE — ESCALA

- [ ] Criar escala possui fluxo claro.
- [ ] Editar escala possui fluxo claro.
- [ ] Adicionar servidor é simples.
- [ ] Sugestões são compreensíveis.
- [ ] Conflitos são identificados.
- [ ] Funções vazias são identificadas.
- [ ] Revisão existe antes da conclusão.
- [ ] Feedback de sucesso existe.
- [ ] Erros são compreensíveis.

---

# 57. CRITÉRIOS DE ACEITE — VISUAL

- [ ] Não existem estilos antigos misturados sem justificativa.
- [ ] Cores seguem os tokens.
- [ ] Tipografia segue a escala.
- [ ] Espaçamentos seguem o sistema.
- [ ] Botões são consistentes.
- [ ] Inputs são consistentes.
- [ ] Badges são consistentes.
- [ ] Cards são consistentes.
- [ ] Estados são consistentes.
- [ ] Ícones seguem o mesmo padrão.

---

# 58. TESTES

Antes de considerar cada área concluída, verificar:

### Funcional

A funcionalidade continua funcionando?

### Visual

A interface corresponde ao Design System?

### Responsivo

Funciona em diferentes larguras?

### Acessibilidade

É utilizável por teclado e leitores de estado?

### Regressão

Algo antigo deixou de funcionar?

---

# 59. REGRA DE REGRESSÃO

Uma tela só deve ser considerada migrada quando:

NOVA UI

+

FUNCIONALIDADE EXISTENTE

+

RESPONSIVIDADE

+

ESTADOS

estiverem funcionando juntos.

Não considerar concluído apenas porque:

"A tela está bonita."

---

# 60. DOCUMENTAÇÃO DE IMPLEMENTAÇÃO

O agente deverá registrar:

- componentes criados;
- componentes reutilizados;
- páginas migradas;
- decisões técnicas;
- problemas encontrados;
- limitações;
- decisões que precisam voltar para UX.

---

# 61. PROBLEMAS ENCONTRADOS

Se durante a implementação surgir um problema de UX:

Não improvisar uma solução definitiva.

Registrar:

PROBLEMA

SOLUÇÃO PROVISÓRIA

IMPACTO

RECOMENDAÇÃO

Isso permite retornar à Etapa 2 ou 3 quando necessário.

---

# 62. O QUE NÃO FAZER

Não:

- reescrever backend;
- alterar banco;
- mudar API;
- criar funcionalidades novas;
- mudar regras;
- trocar framework;
- instalar bibliotecas desnecessárias;
- adicionar animações excessivas;
- criar componentes duplicados;
- ignorar mobile;
- ignorar acessibilidade;
- preservar layouts ruins apenas porque já existem.

---

# 63. ENTREGÁVEIS

Ao final da etapa, o agente deverá entregar:

1. Interface global atualizada.
2. Design System implementado.
3. Componentes base implementados.
4. Dashboard atualizado.
5. Escala atualizada.
6. Criar/Editarar Escala atualizado.
7. Minha Escala atualizada.
8. Listagens atualizadas.
9. Disponibilidade atualizada.
10. Estados implementados.
11. Responsividade implementada.
12. Relatório de problemas encontrados.
13. Relatório de regressão.
14. Lista de componentes criados/reutilizados.

---

# 64. ORDEM DE EXECUÇÃO

A implementação deverá seguir:

FASE 1
Fundação

↓
FASE 2
Layout + Navegação

↓
FASE 3
Dashboard

↓
FASE 4
Escalas

↓
FASE 5
Criar/Editar Escala

↓
FASE 6
Minha Escala

↓
FASE 7
Listagens

↓
FASE 8
Disponibilidade

↓
FASE 9
Demais telas

↓
FASE 10
Polimento + Responsividade + Acessibilidade

---

# 65. REGRA PARA TASKS

O agente deverá transformar esta SPEC em tasks pequenas e verificáveis.

Cada task deverá possuir:

- objetivo;
- arquivos/componentes envolvidos;
- comportamento esperado;
- critérios de aceite;
- dependências;
- possíveis riscos.

Evitar tasks genéricas como:

"Atualizar dashboard."

Preferir:

"Implementar o novo cabeçalho do Dashboard do coordenador utilizando o componente CelebrationHeader e exibir a próxima celebração conforme o wireframe aprovado."

---

# 66. REGRA DE COMMITS

Quando possível, separar commits por unidade funcional.

Exemplo:

feat(ui): add design tokens

feat(ui): add button component

feat(layout): redesign sidebar

feat(dashboard): redesign coordinator dashboard

feat(scales): redesign scale details

feat(scales): redesign scale form

Isso facilita revisão e rollback.

---

# 67. RESULTADO ESPERADO

Ao final desta etapa, o Ordo Musicalis deverá deixar de ser apenas:

"o sistema antigo com uma aparência nova."

Ele deverá se tornar:

"o mesmo produto funcional, porém com uma experiência completamente reorganizada e uma interface consistente."

A implementação deve respeitar as decisões tomadas anteriormente.

---

# DIRETRIZ CENTRAL DA ETAPA 4

Etapa 1:

ONDE.

Etapa 2:

COMO.

Etapa 3:

COMO PARECE.

Etapa 4:

FAZER FUNCIONAR.

Não improvisar UX durante a implementação.

Não alterar regras de negócio para facilitar frontend.

Não sacrificar acessibilidade por estética.

Não sacrificar usabilidade por fidelidade ao layout antigo.

A implementação deve transformar as decisões de UX/UI em código limpo, reutilizável, responsivo e sustentável.