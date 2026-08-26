# SPEC — Etapa 3: Design System e UI Visual

Projeto: Ordo Musicalis
Etapa: 3 — Design System, Identidade Visual e Interface
Objetivo: Criar a linguagem visual completa do Ordo Musicalis e transformar os wireframes aprovados da Etapa 2 em uma interface moderna, consistente, acessível e responsiva.

---

## 1. CONTEXTO

As Etapas 1 e 2 definiram:

Etapa 1:
- arquitetura da informação;
- navegação;
- agrupamento das funcionalidades;
- diferenciação entre perfis;
- estrutura mobile/desktop.

Etapa 2:
- fluxos de usuário;
- hierarquia das telas;
- organização das informações;
- ações principais;
- estados;
- comportamento responsivo;
- wireframes.

A Etapa 3 NÃO deve voltar a discutir a arquitetura estrutural do sistema, salvo quando for identificado algum problema grave durante a aplicação visual.

O objetivo agora é transformar a estrutura aprovada em uma experiência visual coerente.

---

# 2. OBJETIVO PRINCIPAL

Criar uma identidade visual e um Design System para o Ordo Musicalis que transmita:

- simplicidade;
- organização;
- confiança;
- acolhimento;
- elegância;
- sobriedade;
- contexto litúrgico;
- modernidade.

O sistema não deve parecer:

- um ERP corporativo genérico;
- um sistema administrativo antigo;
- um template Bootstrap;
- uma interface excessivamente ornamentada;
- uma aplicação cheia de efeitos visuais.

A direção desejada é:

"Moderno, limpo, humano e com identidade."

---

# 3. PRINCÍPIO VISUAL CENTRAL

O visual deverá seguir a seguinte ideia:

"Interface moderna sem perder a identidade litúrgica."

A identidade religiosa deve aparecer de maneira sutil e elegante.

Não transformar a interface em uma página decorativa.

A liturgia deve influenciar:

- atmosfera;
- cores;
- linguagem;
- iconografia;
- detalhes visuais;

mas não deve prejudicar:

- legibilidade;
- simplicidade;
- velocidade;
- acessibilidade.

---

# 4. PRINCÍPIOS DE DESIGN

O Design System deverá seguir os seguintes princípios.

## 4.1 Clareza

O usuário deve entender rapidamente:

- onde está;
- o que está vendo;
- o que pode fazer;
- qual ação é principal;
- qual informação requer atenção.

---

## 4.2 Consistência

Elementos com a mesma função devem parecer e funcionar da mesma maneira em todo o sistema.

Exemplos:

- botões;
- inputs;
- selects;
- badges;
- tabelas;
- cards;
- modais;
- alertas;
- navegação.

---

## 4.3 Hierarquia visual

Nem todas as informações possuem a mesma importância.

A interface deverá estabelecer claramente:

1. informação principal;
2. informação secundária;
3. informação auxiliar;
4. metadados.

---

## 4.4 Respiro

O sistema atual apresenta densidade excessiva em determinadas telas.

O novo design deverá utilizar espaçamento para separar visualmente:

- seções;
- grupos;
- ações;
- informações.

Não utilizar espaços exagerados apenas para criar uma aparência "premium".

O espaçamento deve ter função.

---

## 4.5 Simplicidade

Evitar elementos decorativos sem função.

Cada elemento visual deve contribuir para:

- compreensão;
- orientação;
- ação;
- feedback;
- identidade.

---

# 5. IDENTIDADE VISUAL

A identidade visual deverá ser criada especificamente para o Ordo Musicalis.

Não utilizar um template visual genérico sem adaptação.

O sistema deverá possuir:

- paleta de cores;
- tipografia;
- escala de espaçamento;
- escala de bordas;
- raio de componentes;
- elevação;
- iconografia;
- tratamento de imagens;
- estados;
- linguagem visual.

---

# 6. PALETA DE CORES

A paleta deverá ser definida semanticamente.

Não criar apenas:

"Azul, cinza e branco."

Deverá existir uma função para cada grupo de cores.

Estrutura mínima:

### Primary

Cor principal da marca e das ações principais.

### Secondary

Cor de apoio.

### Accent

Utilizada pontualmente para destaque.

### Neutral

Cores para:

- fundo;
- superfície;
- texto;
- bordas;
- elementos desabilitados.

### Success

Estados positivos.

### Warning

Atenção.

### Danger

Erros e ações destrutivas.

### Info

Informações.

---

# 7. DIREÇÃO CROMÁTICA

A paleta deverá considerar o contexto do Ordo Musicalis.

Uma possibilidade a ser explorada é uma base neutra com uma cor principal inspirada em:

- azul profundo;
- azul litúrgico;
- tons naturais;
- dourado discreto;
- marfim/off-white.

IMPORTANTE:

Isso não é uma decisão definitiva.

O agente deverá apresentar alternativas antes de consolidar a paleta final.

---

# 8. REGRA PARA CORES SEMÂNTICAS

Não utilizar cor apenas como decoração.

As cores deverão comunicar significado.

Exemplo:

Verde:
Sucesso / confirmado.

Amarelo:
Atenção / pendente.

Vermelho:
Problema / erro / ação destrutiva.

Azul:
Informação / ação principal.

A interface não pode depender exclusivamente da cor para transmitir informação.

Utilizar também:

- texto;
- ícone;
- label;
- forma;
- estado.

---

# 9. DARK MODE

Não implementar Dark Mode nesta etapa.

Entretanto, o Design System deverá ser estruturado de forma que uma futura implementação de tema escuro seja possível.

As cores deverão ser definidas por tokens semânticos.

Exemplo:

--color-background
--color-surface
--color-text-primary
--color-text-secondary
--color-border
--color-primary

Evitar espalhar valores hexadecimais diretamente pelos componentes.

---

# 10. TIPOGRAFIA

Definir uma família tipográfica principal.

Critérios:

- excelente legibilidade;
- boa aparência em português;
- boa leitura em mobile;
- diferentes pesos disponíveis;
- boa distinção entre títulos e corpo;
- carregamento razoável.

Evitar fontes excessivamente decorativas.

---

# 11. ESCALA TIPOGRÁFICA

Criar uma escala consistente para:

- Display;
- H1;
- H2;
- H3;
- H4;
- Body;
- Body Small;
- Caption;
- Label.

Não utilizar tamanhos arbitrários diferentes em cada tela.

---

# 12. LEGIBILIDADE

O sistema deverá evitar textos excessivamente pequenos.

Não utilizar aproximadamente 10px para informações relevantes.

Textos pequenos podem existir apenas para informações auxiliares e nunca devem carregar informação essencial.

---

# 13. ESPAÇAMENTO

Criar uma escala de espaçamento consistente.

Exemplo conceitual:

4
8
12
16
24
32
40
48
64

Os valores finais devem ser definidos pelo Design System.

O objetivo é evitar:

- margin arbitrário;
- padding arbitrário;
- espaçamentos diferentes para elementos equivalentes.

---

# 14. BORDER RADIUS

Definir uma escala consistente de radius.

Exemplo:

- pequeno;
- médio;
- grande;
- pill.

Não aplicar:

"rounded-lg"

em absolutamente todos os elementos.

O raio deve possuir função hierárquica.

---

# 15. ELEVAÇÃO E SOMBRAS

O sistema atual utiliza sombra de maneira repetitiva.

O novo Design System deverá definir poucos níveis de elevação.

Exemplo:

Elevation 0:
Sem sombra.

Elevation 1:
Cards e superfícies discretas.

Elevation 2:
Menus, dropdowns.

Elevation 3:
Modal/dialog.

Evitar sombras fortes ou exageradas.

---

# 16. SUPERFÍCIES

Definir claramente a diferença entre:

- background;
- surface;
- elevated surface;
- bordered surface.

O objetivo é evitar que toda a interface pareça:

"white card sobre gray background".

---

# 17. GRID E LAYOUT

Definir:

- largura máxima de conteúdo;
- gutters;
- grid;
- colunas;
- espaçamento entre seções.

O conteúdo não deve ocupar largura excessiva em monitores grandes.

Também não deve parecer comprimido em telas menores.

---

# 18. SIDEBAR

A sidebar deverá refletir a arquitetura definida na Etapa 1.

Ela deve:

- mostrar claramente a seção atual;
- possuir hierarquia;
- separar grupos;
- destacar a página ativa;
- permitir navegação rápida;
- não ficar visualmente carregada.

Não utilizar apenas cor para indicar a página atual.

Pode utilizar:

- fundo;
- ícone;
- texto;
- indicador lateral;
- peso tipográfico.

---

# 19. NAVEGAÇÃO MOBILE

A navegação mobile deverá possuir uma solução própria.

Não simplesmente reduzir a sidebar desktop.

Considerar:

- bottom navigation;
- menu secundário;
- drawer;
- topbar;
- ações contextuais.

A solução final deverá ser definida com base na frequência das tarefas.

---

# 20. TOPBAR

Definir padrão para:

- título da página;
- breadcrumbs quando necessários;
- ações principais;
- notificações;
- perfil.

A topbar não deve ficar sobrecarregada.

---

# 21. BOTÕES

Criar um componente de botão consistente.

Variantes mínimas:

### Primary

Ação principal.

### Secondary

Ação secundária.

### Tertiary/Ghost

Ações discretas.

### Danger

Ações destrutivas.

### Icon Button

Ações exclusivamente iconográficas quando o significado for óbvio.

---

## 21.1 Estados

Todo botão deverá possuir:

- default;
- hover;
- active;
- focus;
- disabled;
- loading.

---

# 22. HIERARQUIA DE BOTÕES

Cada tela deve possuir uma ação visualmente dominante.

Evitar:

[Salvar] [Editar] [Cancelar] [Excluir] [Voltar]

todos com a mesma importância.

A interface deve comunicar:

"O que você provavelmente quer fazer?"

---

# 23. INPUTS

Criar padrões para:

- text;
- email;
- password;
- number;
- date;
- time;
- search;
- textarea.

Cada input deverá possuir:

- label;
- placeholder quando necessário;
- descrição quando necessária;
- erro;
- sucesso quando aplicável;
- disabled;
- focus.

---

# 24. SELECTS

O sistema atualmente utiliza selects nativos em diversas situações.

Eles não devem ser substituídos automaticamente apenas por estética.

A prioridade é:

- acessibilidade;
- facilidade de uso;
- consistência;
- comportamento previsível.

Utilizar select customizado somente quando houver benefício real.

---

# 25. CHECKBOXES E RADIOS

Criar padrões consistentes para:

- checkbox;
- radio;
- switch/toggle.

Definir quando cada padrão deve ser utilizado.

Regra geral:

Checkbox:
Selecionar múltiplas opções.

Radio:
Escolher uma opção entre várias.

Switch:
Ativar/desativar uma configuração.

---

# 26. BADGES

Criar sistema de badges para representar estados.

Exemplos:

- Confirmado;
- Pendente;
- Recusado;
- Publicado;
- Rascunho;
- Disponível;
- Indisponível;
- Ativo;
- Inativo.

O badge deve possuir:

- cor;
- texto;
- eventualmente ícone.

Nunca depender somente da cor.

---

# 27. ALERTAS

Criar padrões para:

- informação;
- sucesso;
- aviso;
- erro.

Exemplo:

[✓] Escala salva com sucesso.

[!] Existem funções sem servidor.

[×] Não foi possível salvar a escala.

---

# 28. TOASTS

Definir quando utilizar toast.

Usar para:

- ações concluídas;
- alterações salvas;
- operações rápidas.

Não usar toast para mensagens que exigem leitura prolongada ou decisão.

---

# 29. MODAIS

Definir padrão visual e comportamental.

Modal deve ser utilizado para:

- confirmação;
- ações rápidas;
- pequenas tarefas contextuais.

Não utilizar modal para fluxos complexos.

---

# 30. DRAWERS

Criar padrão para drawer quando necessário.

Possíveis usos:

- filtros;
- detalhes rápidos;
- seleção contextual;
- edição simples.

---

# 31. CARDS

Cards deverão ser utilizados quando ajudarem a agrupar informações.

Não transformar toda informação em card.

O sistema atual tende a utilizar estruturas repetitivas de:

"white + shadow + rounded".

O novo design deverá variar superfícies e hierarquias de maneira controlada.

---

# 32. TABELAS

Criar padrão de tabela para desktop.

Deverá contemplar:

- cabeçalho;
- ordenação;
- seleção;
- ações;
- estados;
- loading;
- vazio.

---

# 33. TABELAS NO MOBILE

Não permitir que a tabela simplesmente force scroll horizontal quando existir alternativa melhor.

Dependendo da informação, transformar em:

- cards;
- lista;
- accordion;
- agrupamento;
- tabela reduzida.

A transformação deverá preservar as informações essenciais.

---

# 34. CALENDÁRIO

Criar um padrão visual específico para calendário.

Deverá existir:

- estado atual;
- dia selecionado;
- eventos;
- eventos importantes;
- navegação;
- estado vazio;
- loading.

No mobile, o calendário deverá possuir comportamento próprio.

---

# 35. ESCALA — COMPONENTES VISUAIS

A tela de escala é o principal caso de uso do sistema.

Criar componentes visuais específicos para:

- celebração;
- equipe;
- função;
- servidor;
- status;
- conflito;
- disponibilidade;
- confirmação;
- vaga.

---

# 36. REPRESENTAÇÃO DE SERVIDOR

Definir um padrão visual para representar uma pessoa.

Pode conter:

- avatar/inicial;
- nome;
- função;
- categoria;
- status;
- ações.

Exemplo conceitual:

┌─────────────────────────────┐
│ JS  João Silva              │
│     Violão · Música         │
│                             │
│     ✓ Confirmado            │
└─────────────────────────────┘

---

# 37. REPRESENTAÇÃO DE CONFLITOS

Conflitos devem possuir destaque sem transformar a tela em um ambiente visualmente agressivo.

Exemplo:

⚠ Conflito de horário

João já está escalado às 19:00 em outra comunidade.

[Ver conflito]

---

# 38. REPRESENTAÇÃO DE FUNÇÕES VAZIAS

Uma função sem servidor deve possuir uma representação clara.

Exemplo:

┌─────────────────────────────┐
│ Teclado                     │
│                             │
│ ⚠ Nenhum servidor           │
│                             │
│ [+ Adicionar]               │
└─────────────────────────────┘

---

# 39. ESTADOS GLOBAIS

O Design System deverá definir padrões para:

### Loading

- skeleton;
- spinner;
- loading contextual.

### Empty

Estado vazio orientado à ação.

### Error

Mensagem clara + próximo passo.

### Success

Feedback objetivo.

### Disabled

Controle claramente indisponível.

---

# 40. SKELETON LOADING

Priorizar skeleton quando o conteúdo possui estrutura previsível.

Exemplo:

Dashboard carregando:

[████████████]

[████████████████]

[████████]

Evitar utilizar spinner para absolutamente tudo.

---

# 41. EMPTY STATES

Todo estado vazio relevante deverá possuir:

- título;
- explicação;
- ação quando aplicável.

Exemplo:

"Nenhuma escala encontrada."

"Não existem escalas para este período."

[ Criar escala ]

---

# 42. ERROS

Mensagens de erro deverão ser humanas.

Evitar:

"Error 422"

"Failed to fetch"

"Internal server error"

Preferir:

"Não foi possível salvar a escala."

"Verifique os campos destacados e tente novamente."

Quando possível, informar a ação recomendada.

---

# 43. CONFIRMAÇÕES

Substituir a experiência visual de confirmações nativas do navegador por componentes consistentes.

Exemplo:

Excluir servidor?

"Essa ação não poderá ser desfeita."

[Cancelar]

[Excluir]

---

# 44. ÍCONES

Definir uma biblioteca de ícones consistente.

Todos os ícones deverão seguir:

- mesmo estilo;
- espessura coerente;
- proporção consistente.

Não misturar diferentes estilos de ícones.

---

# 45. REGRA DE ÍCONE

Ícones não devem substituir texto quando o significado não for imediatamente óbvio.

Exemplo ruim:

[🗑]

Exemplo preferível quando houver espaço:

[Excluir]

Em ações recorrentes e universalmente reconhecidas, o ícone pode ser suficiente, desde que exista tooltip/acessibilidade adequada.

---

# 46. IMAGENS E ELEMENTOS LITÚRGICOS

Imagens podem ser utilizadas em:

- Dashboard;
- estados especiais;
- páginas institucionais;
- cabeçalhos específicos.

Não utilizar imagens decorativas em todas as telas.

A identidade litúrgica deve ser principalmente construída pelo Design System, e não pela quantidade de imagens religiosas.

---

# 47. MICROINTERAÇÕES

Definir microinterações de maneira discreta.

Exemplos:

- hover;
- focus;
- seleção;
- confirmação;
- expansão;
- loading.

Evitar animações excessivas.

A animação deve comunicar mudança de estado, não simplesmente decorar.

---

# 48. ACESSIBILIDADE VISUAL

O Design System deverá considerar:

- contraste;
- tamanho mínimo de texto;
- foco visível;
- áreas de toque;
- leitura em telas pequenas;
- estados não dependentes exclusivamente de cor.

---

# 49. TOUCH TARGET

Controles interativos devem possuir área de toque adequada para dispositivos móveis.

Evitar:

- botões muito pequenos;
- ícones encostados;
- links difíceis de tocar;
- controles excessivamente próximos.

---

# 50. RESPONSIVIDADE

Cada componente deverá possuir comportamento definido para:

- mobile;
- tablet;
- desktop.

Não basta utilizar classes responsivas sem definir o comportamento desejado.

Exemplo:

Card:

Desktop:
horizontal.

Mobile:
vertical.

Tabela:

Desktop:
tabela.

Mobile:
card/lista.

---

# 51. DESIGN TOKENS

O Design System deverá utilizar tokens.

Categorias mínimas:

### Colors

- primary;
- secondary;
- accent;
- background;
- surface;
- border;
- text;
- success;
- warning;
- danger;
- info.

### Typography

- font family;
- size;
- weight;
- line height.

### Spacing

- xs;
- sm;
- md;
- lg;
- xl;
- 2xl.

### Radius

- sm;
- md;
- lg;
- full.

### Shadow

- sm;
- md;
- lg.

### Breakpoints

- mobile;
- tablet;
- desktop;
- large desktop.

---

# 52. COMPONENTES BASE

O Design System deverá definir pelo menos:

- Button;
- IconButton;
- Input;
- Select;
- Textarea;
- Checkbox;
- Radio;
- Switch;
- Label;
- Badge;
- Alert;
- Toast;
- Modal;
- Drawer;
- Tooltip;
- Card;
- Avatar;
- Table;
- Pagination;
- Tabs;
- Dropdown;
- Breadcrumb;
- EmptyState;
- Loading/Skeleton;
- ErrorState.

---

# 53. COMPONENTES DE DOMÍNIO

Além dos componentes genéricos, definir componentes específicos do Ordo Musicalis quando necessário.

Exemplos:

- ScaleCard;
- ScaleMember;
- ScaleRole;
- CelebrationHeader;
- AvailabilityStatus;
- ConfirmationStatus;
- ConflictAlert;
- EmptyRole;
- RepertoireItem;
- LiturgicalInfo.

Esses componentes devem ser criados apenas quando representarem padrões reais e recorrentes.

---

# 54. REUTILIZAÇÃO

O agente não deve criar componentes apenas para abstrair HTML.

Um componente deverá existir quando:

- houver repetição;
- houver comportamento próprio;
- houver estado próprio;
- houver necessidade de consistência.

Evitar abstrações excessivas.

---

# 55. COMPATIBILIDADE COM O PROJETO EXISTENTE

A implementação futura deverá respeitar:

- Vue;
- Tailwind;
- arquitetura existente;
- regras de negócio;
- API;
- permissões;
- banco.

O Design System deve ser compatível com a stack existente.

Não substituir a stack apenas por preferência visual.

---

# 56. CRITÉRIOS DE ACEITE

A Etapa 3 será considerada concluída quando:

### Identidade

- [ ] Existe uma direção visual definida.
- [ ] A identidade litúrgica está presente de maneira sutil.
- [ ] O sistema não parece um template genérico.
- [ ] A interface mantém aparência profissional e moderna.

### Cores

- [ ] Existe paleta semântica.
- [ ] Estados possuem cores consistentes.
- [ ] Cores não são utilizadas como único meio de comunicação.
- [ ] Tokens foram definidos.

### Tipografia

- [ ] Existe família tipográfica definida.
- [ ] Existe escala tipográfica.
- [ ] Tamanhos são consistentes.
- [ ] Legibilidade foi validada em mobile.

### Componentes

- [ ] Componentes base possuem especificação.
- [ ] Estados estão definidos.
- [ ] Botões possuem hierarquia.
- [ ] Inputs possuem estados.
- [ ] Badges possuem padrões.
- [ ] Alertas possuem padrões.
- [ ] Modais possuem padrões.
- [ ] Tabelas possuem padrões.
- [ ] Calendário possui padrão.

### Responsividade

- [ ] Componentes possuem comportamento mobile definido.
- [ ] Não existem componentes críticos dependentes de scroll horizontal desnecessário.
- [ ] Touch targets são adequados.
- [ ] A hierarquia permanece clara em telas pequenas.

### Acessibilidade

- [ ] Contraste foi considerado.
- [ ] Foco foi considerado.
- [ ] Ícones não são utilizados como única informação quando isso prejudica entendimento.
- [ ] Estados não dependem exclusivamente de cor.
- [ ] Textos são legíveis.

---

# 57. ENTREGÁVEIS

O agente deverá produzir:

## 1. Direção visual

Documento explicando:

- conceito;
- referências;
- personalidade;
- princípios.

---

## 2. Paleta

Definição completa de:

- cores;
- variações;
- estados;
- tokens.

---

## 3. Tipografia

Definição de:

- família;
- pesos;
- escala;
- line-height.

---

## 4. Espaçamento

Escala completa.

---

## 5. Radius

Escala completa.

---

## 6. Elevação

Níveis de sombra/superfície.

---

## 7. Componentes

Especificação visual dos componentes base.

---

## 8. Componentes de domínio

Especificação dos componentes específicos do Ordo Musicalis.

---

## 9. Estados

Documentação de:

- loading;
- empty;
- error;
- success;
- disabled;
- focus;
- hover;
- active.

---

## 10. Telas de referência

Aplicar o Design System aos wireframes mais importantes.

Prioridade:

1. Dashboard;
2. Escala;
3. Criar/Editarar Escala;
4. Minha Escala;
5. Listagens.

Não é necessário redesenhar todas as telas nesta etapa.

As telas prioritárias devem servir como referência para o restante do sistema.

---

# 58. DOCUMENTAÇÃO DE DECISÕES

Quando houver mais de uma possibilidade visual, o agente deverá apresentar:

Problema:
X

Alternativa A:
X

Alternativa B:
Y

Vantagens:
X

Desvantagens:
Y

Recomendação:
X

Justificativa:
Y

Não tomar decisões importantes de forma silenciosa.

---

# 59. NÃO FAZER

O agente NÃO deve:

- implementar todas as telas;
- alterar regras de negócio;
- alterar banco;
- alterar API;
- trocar framework;
- adicionar biblioteca UI sem necessidade;
- adicionar animações excessivas;
- utilizar gradientes excessivos;
- utilizar glassmorphism indiscriminadamente;
- utilizar sombras exageradas;
- criar dezenas de variações de componentes;
- transformar toda informação em card;
- usar ícones decorativos sem função;
- sacrificar acessibilidade pela estética.

---

# 60. FORA DO ESCOPO

Esta etapa NÃO contempla:

- implementação completa das telas;
- refatoração completa do frontend;
- alterações de backend;
- alterações de banco;
- novas funcionalidades;
- novas regras de negócio;
- otimização de performance;
- testes automatizados completos.

Esses pontos serão tratados posteriormente.

---

# 61. REGRA FUNDAMENTAL DO DESIGN

Não criar um sistema visualmente bonito que seja difícil de utilizar.

O objetivo não é:

"Deixar o sistema bonito."

O objetivo é:

"Fazer o sistema parecer simples porque ele é bem organizado."

---

# 62. RESULTADO ESPERADO

Ao final da Etapa 3, deverá ser possível olhar para qualquer nova tela do Ordo Musicalis e responder:

"Qual é a identidade visual?"

"Qual é a ação principal?"

"Qual componente devo utilizar?"

"Qual espaçamento devo utilizar?"

"Qual cor representa este estado?"

"Como esse componente funciona no mobile?"

"Como ele funciona no desktop?"

"Como ele se comporta em erro?"

"Como ele se comporta durante carregamento?"

"Como ele se comporta quando está desabilitado?"

Se essas respostas forem consistentes, o Design System está suficientemente definido.

---

# DIRETRIZ CENTRAL DA ETAPA 3

A Etapa 1 definiu:

ONDE.

A Etapa 2 definiu:

COMO.

A Etapa 3 define:

COMO ISSO PARECE.

O resultado deve ser uma interface:

- moderna;
- limpa;
- acolhedora;
- profissional;
- liturgicamente coerente;
- acessível;
- responsiva;
- consistente.

Mas, acima de tudo:

FÁCIL DE USAR.

A estética deve servir à experiência.

Nunca o contrário.