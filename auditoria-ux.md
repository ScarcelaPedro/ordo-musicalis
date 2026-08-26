# Auditoria de Produto — Ordo Musicalis
### Relatório técnico para redesign de UI/UX

---

## Nota metodológica

Esta auditoria foi feita por **leitura completa do código-fonte**: as 53 telas Vue do
frontend (`src/pages/**/*.vue`), os 9 componentes reutilizáveis (`src/components/`), os 2
layouts (`src/layouts/`), as stores (Pinia), o roteador (`src/router/index.ts`), o schema
Prisma completo (23 models) e os handlers da API que definem regras de negócio relevantes
para a experiência (ex.: o que acontece quando alguém recusa uma escalação). Também li o
documento de requisitos do próprio projeto (`ordus-musicalis-requisitos.md`) e o changelog
de expansão (`todo.md`).

**Não houve navegação ao vivo no app renderizado** (não uso credenciais de produção nem
dados reais para clicar na aplicação). Toda afirmação sobre layout, cor, espaçamento e
comportamento vem da leitura direta do template Vue e das classes Tailwind aplicadas —
essas classes são determinísticas (Tailwind não tem ambiguidade de output), então a
descrição visual é confiável, mas marco explicitamente com **[Observado]** o que vem
diretamente do código e **[Inferido]** o que é dedução/hipótese sobre percepção do usuário
final. Onde não há como confirmar algo (ex. como o WhatsApp/push realmente aparece no
celular do servidor), digo isso abertamente em vez de supor.

Stack observada: Vue 3 (Composition API, `<script setup>`) + Vue Router + Pinia, Tailwind
CSS puro (sem tema customizado — `tailwind.config.js` não estende cores nem fontes, só
adiciona `@tailwindcss/forms`), backend Express + Prisma + PostgreSQL. Sem framework de UI
(sem Vuetify/PrimeVue/shadcn) — todo componente é escrito à mão.

---

## 1. Visão geral do sistema

**Propósito** [Observado]: gerenciar a escala de serviço da equipe celebrativa de uma
paróquia católica — não só músicos, mas qualquer função litúrgica (ministros da comunhão,
acólitos/ancilas, leitores, comentaristas), em qualquer comunidade/capela da paróquia, não
só na matriz.

**Problema que resolve** [Observado, declarado no próprio doc de requisitos]: hoje a
coordenação de pastoral litúrgica usa planilhas e grupos de WhatsApp e não tem visibilidade
sobre disponibilidade real das pessoas, intensidade de serviço (quem serve demais/de
menos), quem confirmou presença, e o que é vínculo fixo vs. escalação pontual.

**Usuários / perfis** [Observado — `UserRole` no schema + `useAuthStore`]:
1. **Admin** — acesso total.
2. **Coordenador** — mesmas telas do admin (`isStaff` agrupa os dois no frontend); a
   diferenciação de permissão por ministério existe no backend mas a UI não distingue
   visualmente o que um coordenador pode ou não fazer além de esconder itens `roles:
   ['admin','coordenador']` do menu.
3. **Músico/servidor comum** (`role: musico`) — qualquer pessoa escalada: músico,
   ministro da comunhão, acólito, leitor, comentarista. O código usa `auth.isMusico` como
   nome da flag, mas cobre todas essas funções — resquício da origem do sistema (só
   músicos) que **ainda aparece no código**, embora não mais na interface.
4. **Visitante anônimo** — acessa só `/publico`, sem login.

**Tarefas por perfil** [Observado]:
- *Staff (admin/coordenador)*: cadastra servidores, ministérios, categorias de função,
  comunidades, celebrantes; monta e edita escalas; cria recorrências e gera escalas do mês
  automaticamente; abre janelas de coleta de disponibilidade e acompanha pendências; aprova
  ou rejeita pedidos de substituição; consulta relatórios e intensidade de serviço; edita
  repertório; corrige a liturgia do dia manualmente.
- *Servidor comum*: vê o dashboard, vê "Minha Escala", confirma ou recusa presença, marca
  disponibilidade semanal e exceções pontuais, ativa notificações push, edita o próprio
  perfil/senha, pode excluir a própria conta.
- *Visitante*: consulta o calendário público filtrando por comunidade, sem nenhuma ação de
  escrita.

**Funcionalidades existentes** [Observado, ver mapeamento completo na seção 2]: autenticação
completa (login/registro/recuperação de senha), dashboard com calendário mensal e cores
litúrgicas, CRUD de Escalas com sugestão automática de servidores, Escalas Recorrentes com
geração automática mensal e Vínculos Fixos, "Minha Escala" com confirmar/recusar, CRUD de
Servidores com página de Intensidade de Serviço, CRUD de Ministérios (Teams), CRUD de
Comunidades, CRUD de Categorias de Função, CRUD de Celebrantes, Disponibilidade (formulário
pessoal + painel do coordenador + janelas de coleta com prazo), Substituições (fila,
sugestão automática, aprovação/rejeição), Repertório (lista de músicas por celebração, PDF
e link externo), Liturgia diária (leitura + correção manual pelo staff), Relatórios (KPIs
+ agrupamento por ministério/categoria), Calendário Público, Perfil (dados, senha,
notificações push, exclusão de conta), alternância de tema claro/escuro/sistema.

**O que parece mais importante** [Inferido, mas com evidência convergente]: a **Escala**
é o núcleo — o próprio doc de requisitos chama isso explicitamente ("a agenda continua
sendo a base do sistema"), é a tela com mais linhas de código e mais complexidade de
interação (`ScaleForm.vue`, 430 linhas — de longe o maior arquivo do frontend), e é o
destino principal do dashboard. Confirmação de presença e disponibilidade também são
centrais — aparecem como banners de destaque no dashboard ("Pendências de confirmação") e
têm fluxo dedicado tanto para servidor quanto para coordenador.

**O que parece secundário** [Inferido]: Repertório, Liturgia diária, Relatórios,
Intensidade de Serviço e o próprio tema claro/escuro. Não são menos bem construídos, mas
não fazem parte do "loop" semanal essencial (montar escala → confirmar → celebrar); são
consultas de apoio.

**Fluxo geral de utilização** [Observado/reconstituído a partir do roteador e das telas]:

```
Staff cadastra base (Comunidades, Categorias, Servidores, Ministérios, Celebrantes)
        ↓
Staff cadastra Recorrências (Escalas Recorrentes) e Vínculos Fixos
        ↓
Staff gera as escalas do mês (botão em /escalas-recorrentes) ou cria uma Escala avulsa
        ↓
Staff monta a equipe da celebração (ScaleForm: por categoria de função, com sugestões)
        ↓
Staff muda o status pra "confirmada" (ou deixa "rascunho")
        ↓
Servidor é notificado (push/WhatsApp — fora do escopo desta auditoria de tela)
        ↓
Servidor confirma ou recusa em "Minha Escala" ou na própria tela da Escala
        ↓
Se recusa → sistema cria Substituição pendente automaticamente (confirmado no backend,
             api/_routes/scales.ts:270-293) → aparece em /substituicoes pro staff
        ↓
Staff busca sugestões de substituto e aprova
        ↓
No dia: servidor/staff consulta Repertório e Liturgia da celebração
```

---

## 2. Mapeamento completo das telas

40 rotas distintas foram encontradas em `src/router/index.ts`. Não há modais/drawers/
pop-ups como camada de UI neste sistema — **confirmado por ausência**: não existe nenhum
componente `Modal.vue`/`Dialog.vue` na pasta de componentes, e toda ação "secundária"
(editar, criar, confirmar exclusão) é uma **navegação de página inteira** ou um `confirm()`
nativo do navegador. As duas únicas exceções de sobreposição de camada são o menu lateral
deslizante (`sidebarOpen`) e o dropdown do menu mobile, ambos em `AuthenticatedLayout.vue`.

### 2.1 Autenticação (sem menu, `GuestLayout`)

| Tela | Rota | Objetivo | Ações | Estados | Vem de / Vai para |
|---|---|---|---|---|---|
| Login | `/login` | Autenticar | Entrar, ir p/ recuperar senha, ir p/ registro | erro de credencial (texto vermelho inline); loading no botão | Entrada direta → Dashboard |
| Registro | `/register` | Criar conta | Criar conta, ir p/ login | erro (senhas não coincidem / API); loading | Login → Dashboard |
| Esqueci a senha | `/forgot-password` | Disparar e-mail de reset | Enviar, voltar | mensagem de sucesso inline (texto verde), erro | Login → (e-mail externo) |
| Redefinir senha | `/reset-password?email&token` | Definir nova senha | Redefinir | erro (senhas não coincidem / token inválido) | Link de e-mail → Login |

Nenhuma dessas 4 telas tem estado de "carregando dados" (não buscam nada no `onMounted`) —
consistente e correto para o caso de uso.

### 2.2 Núcleo — Escalas

| Tela | Rota | Objetivo | Quem acessa | Ações principais | Estados | Navegação |
|---|---|---|---|---|---|---|
| Dashboard | `/dashboard` | Visão geral do mês + atalhos | Todos | Navegar mês, filtrar comunidade, ir a "Nova Escala"/Substituições/Relatórios (staff) | loading do calendário (spinner); banners condicionais (próxima celebração, minhas escalas, pendências) só aparecem se houver dado | Login → aqui é o "hub"; daqui vai pra Escala, Substituições, Relatórios, Nova Escala |
| Escalas (lista) | `/escalas` | Listar celebrações com filtro | Todos | Filtrar por mês/ministério/comunidade, ver, editar (staff), excluir (staff), copiar link público (staff), ir p/ Recorrências | vazio ("Nenhuma escala encontrada"); sem loading state explícito | Dashboard/menu → Escala (Show) |
| Nova Escala | `/escalas/criar` | Criar celebração + equipe | Staff | Preencher dados, buscar sugestões, adicionar servidor por categoria, adicionar equipe inteira, salvar | loading no submit | Escalas → Escala criada (Show) |
| Escala (detalhe) | `/escalas/:id` | Ver tudo de uma celebração | Todos | Confirmar/recusar (servidor), imprimir, ir a Repertório/Liturgia/Editar (staff) | "..." no título enquanto carrega; sem spinner dedicado | Escalas/Dashboard/Minha Escala → Repertório, Liturgia, Editar |
| Editar Escala | `/escalas/:id/editar` | Editar celebração + equipe | Staff | Mesmo form de criação, populado | idem criação | Escala → Escala |
| Minha Escala | `/minha-escala` | Ver só as próprias celebrações | Servidor | Confirmar/recusar direto na lista, ver histórico | "Carregando..." texto simples; vazio nas duas listas (próximas/histórico) | Menu → Escala (Show) |
| Escalas Recorrentes (lista) | `/escalas-recorrentes` | Gerenciar recorrências + gerar mês | Staff | Gerar escalas do mês, criar/editar/excluir recorrência | loading texto; vazio | Escalas → aqui só via botão "Recorrências" (não está no menu) |
| Nova Recorrência | `/escalas-recorrentes/criar` | Cadastrar padrão semanal/mensal | Staff | Preencher e salvar | loading no submit | Recorrentes → Recorrentes |
| Editar Recorrência | `/escalas-recorrentes/:id/editar` | Editar padrão + Vínculos Fixos | Staff | Editar campos, adicionar/remover vínculo fixo | vazio ("Nenhum vínculo fixo ainda") | Recorrentes → Recorrentes |
| Repertório (ver) | `/escalas/:id/repertorio` | Ver músicas da celebração | Todos | Baixar PDF, abrir link, editar (staff) | "Nenhum repertório cadastrado" | Escala → Escala/Editar Repertório |
| Editar Repertório | `/escalas/:id/repertorio/editar` | Gerenciar músicas | Staff | Salvar dados, adicionar música (com upload de PDF), remover | loading nos dois submits separados | Repertório → Repertório |
| Liturgia | `/escalas/:id/liturgia` | Ler/corrigir a liturgia do dia | Todos | Corrigir (staff) | "Carregando...", "Liturgia ainda não disponível para esta data" | Escala → Escala |

### 2.3 Cadastros / Administração

| Tela | Rota | Quem | Ações | Estados | Observação |
|---|---|---|---|---|---|
| Servidores (lista) | `/servidores` | Todos veem, staff edita | Buscar por nome, ver, editar/excluir (staff), ir p/ Intensidade | loading; vazio | busca é `@input` sem debounce — dispara 1 request por tecla |
| Novo/Editar Servidor | `/servidores/criar`, `/servidores/:id/editar` | Staff | Form completo (categorias, instrumentos, ministérios) | loading no submit; erros por campo | form muda de forma dinamicamente (mostra instrumentos/ministérios só se "Música" estiver marcado) |
| Servidor (detalhe) | `/servidores/:id` | Todos | Ver dados e histórico de escalas | "..." no título | — |
| Intensidade de Serviço | `/servidores/intensidade` | Staff | Trocar período (mês/trimestre/ano) | loading texto; vazio | só acessível por um link dentro de Servidores/lista — não está no menu |
| Ministérios (lista) | `/equipes` | Todos veem, staff edita | Ver, editar/excluir (staff) | **sem estado de loading** (ver 12) | tabela sempre monta antes do fetch responder |
| Novo/Editar Ministério | `/equipes/criar`, `/equipes/:id/editar` | Staff | Selecionar categoria, responsável, membros (chips) | loading no submit | — |
| Ministério (detalhe) | `/equipes/:id` | Todos | Ver horários recorrentes e membros | "..." no título | — |
| Comunidades (lista/criar/editar) | `/comunidades*` | Staff (índice visível a todos que acessam a rota, mas nav só mostra pra staff) | CRUD simples | loading; vazio | — |
| Categorias de Função (lista/criar/editar) | `/categorias*` | Staff | CRUD simples + campo "ordem" | loading; vazio | — |
| Celebrantes (lista/criar/editar) | `/celebrantes*` | Staff | CRUD simples | loading; vazio | — |

### 2.4 Disponibilidade e Substituição

| Tela | Rota | Quem | Ações | Estados | Observação |
|---|---|---|---|---|---|
| Minha Disponibilidade | `/disponibilidade` | Servidor (`roles: ['musico']`) | Marcar grade semanal (7×3 checkboxes), adicionar exceções pontuais, salvar | loading no submit | banner se houver "janela de coleta" ativa com prazo |
| Painel de Disponibilidade | `/disponibilidade/painel` | Staff | Abrir/fechar janela de coleta, ver grade de todos, ver quem não respondeu | — | tabela vira ilegível com muitos servidores (ver seção 9) |
| Substituições | `/substituicoes` | Staff | Ver sugestões, aprovar com um substituto, rejeitar | "Carregando...", "Nenhuma substituição pendente 🎉" | não está no menu principal |

### 2.5 Suporte / Relatórios / Público / Perfil

| Tela | Rota | Quem | Ações | Estados |
|---|---|---|---|---|
| Relatórios | `/relatorios` | Staff | Trocar intervalo de datas, alternar agrupamento (ministério/categoria) | loading; "Nenhuma celebração no período" |
| Calendário Público | `/publico` | Ninguém (sem login) | Navegar mês, filtrar comunidade, imprimir | loading; "Nenhuma celebração neste mês" |
| Perfil | `/profile` | Todos | Editar nome/e-mail, trocar senha, ativar/desativar push, excluir conta | loading em cada submit separadamente |

**Fluxo de navegação — visão geral** [Observado]: o sistema é fundamentalmente uma
estrela com dois centros: o **Dashboard** (hub do dia a dia) e a tela de **Escala**
individual (hub de detalhe, de onde se chega a Repertório e Liturgia). Quatro telas
inteiras — **Relatórios, Substituições, Escalas Recorrentes e Intensidade de Serviço** —
não têm link nenhum no menu lateral/mobile e só são alcançáveis por um botão secundário
dentro de outra tela específica (Dashboard, Escalas, Servidores respectivamente). Isso é
detalhado como problema de arquitetura de informação na seção 7.

---

## 3. Análise dos fluxos principais

### 3.1 Login
- **Objetivo**: autenticar.
- **Passos**: 2 campos + 1 clique. Mínimo possível.
- **Erros possíveis**: credencial inválida (mensagem genérica vinda da API).
- **Confusão**: nenhuma prevista — fluxo padrão e bem conhecido.
- **Simplificação**: nenhuma necessária aqui; é o fluxo mais bem resolvido do sistema.

### 3.2 Visualização da escala (Escala Show + Minha Escala)
- **Objetivo**: saber onde/quando/com quem a pessoa serve.
- **Passos**: 0 cliques adicionais depois de abrir a tela — informação já vem agrupada por
  categoria de função.
- **Pontos de decisão**: confirmar ou recusar presença (2 a 3 cliques se recusar, com
  motivo opcional).
- **Erros possíveis**: recusar uma escalação passada (mitigado — botões só aparecem se
  `isFuture()` e status ainda for "convidado").
- **Confusão** [Inferido]: o **celebrante** — que o próprio documento de requisitos pede
  que apareça "em destaque" — está no mesmo `<dl>` que Data/Horário/Status, com o mesmo
  peso visual de qualquer outro metadado (`scales/Show.vue:151-158`). Ou seja, existe uma
  divergência entre requisito documentado e o que foi de fato implementado.
- **Simplificação**: já é um fluxo enxuto; o ganho está em hierarquia visual, não em
  reduzir cliques.

### 3.3 Criação/edição de escala (o fluxo mais pesado do sistema)
- **Objetivo**: montar a equipe completa de uma celebração.
- **Passos observados** para uma missa dominical típica (ex.: 5 músicos + 6 acólitos + 2
  leitores + 3 ministros da comunhão): preencher 8 campos de cabeçalho, depois, **para
  cada pessoa**, escolher no select "Adicionar servidor..." + clicar "Adicionar" (2
  interações), e se a categoria for Música, mais um select de instrumento; se for
  Acólitos, mais um select de função litúrgica. Isso soma **facilmente 30+ interações
  discretas** numa única tela para montar uma equipe comum, mesmo com o atalho "Adicionar
  equipe inteira" (que só existe quando a categoria tem Ministérios cadastrados — hoje,
  pelo comentário no próprio código, `ScaleForm.vue:87-88`, isso normalmente só vale para
  Música).
- **Pontos de decisão**: qual categoria, qual ministério (opcional), qual instrumento, qual
  função litúrgica (só Acólitos), usar sugestão automática ou adicionar manualmente.
- **Informações necessárias**: para cada uma das ~7 categorias de função, o coordenador
  precisa saber quem está cadastrado nela — o form já filtra por `servidoresDaCategoria`,
  o que ajuda.
- **Erros possíveis**: nenhuma validação de conflito é feita (ver seção 8) — dá para
  escalar alguém duas vezes na mesma data/horário em celebrações diferentes, ou escalar
  alguém que marcou indisponibilidade pra aquele período, sem aviso algum na tela.
- **Confusão** [Inferido]: a seção "Sugeridos" e o bloco de sugestões por categoria
  competem visualmente — o coordenador vê duas fontes de "adicionar pessoa" (sugestão
  geral no topo + select manual em cada categoria) sem uma indicação clara de qual usar
  primeiro.
- **Oportunidade de simplificação**: é o candidato número 1 do sistema para uma reformulação
  de interação (ex.: busca com autocomplete + arrastar para categoria, ou um passo-a-passo
  por categoria em vez de um formulário monolítico).

### 3.4 Confirmação de participação
- **Objetivo**: registrar presença/ausência.
- **Passos**: 1 clique para confirmar; 2–3 para recusar (abrir motivo → digitar opcional →
  confirmar recusa).
- **Pontos de decisão**: só recusar exige justificar (opcional).
- **Erro possível**: tentar confirmar depois do prazo — não há mensagem específica, o botão
  simplesmente some (`isFuture()` false) sem explicação do motivo daquele sumiço, o que
  pode confundir alguém que abriu a tela achando que ainda podia responder.
- **Simplificação**: já é enxuto. Falta *feedback explicativo* quando a ação não está mais
  disponível.

### 3.5 Consulta e registro de disponibilidade
- **Objetivo**: informar quando a pessoa pode servir.
- **Passos**: marcar até 21 checkboxes (7 dias × 3 períodos) + opcionalmente adicionar
  exceções pontuais (data + período + disponível/indisponível) + salvar.
- **Confusão** [Inferido]: a UI não deixa claro que "não marcar" significa "indisponível
  por padrão" (ou seria "sem informação"?) — não há nenhum texto explicando a semântica do
  checkbox desmarcado, o que é ambíguo pra um usuário pouco técnico decidir se precisa
  desmarcar algo ou só marcar o que pode.
- **Simplificação**: grade é compacta e direta; o ponto fraco é a falta de explicação
  textual da regra por trás dela.

### 3.6 Substituição
- **Objetivo**: substituir quem recusou uma escalação.
- **Fluxo real** [Observado no backend, `api/_routes/scales.ts:270-293`]: o servidor não
  "pede" substituição explicitamente — o simples ato de clicar "Não posso ir" já cria
  automaticamente um registro de `Substituicao` pendente. Isso é elegante (menos passos
  pro servidor) mas significa que **não existe tela nem confirmação mostrando ao servidor
  que uma substituição foi aberta em seu nome** — ele só vê a flash message de sucesso da
  recusa.
- **Passos do coordenador**: abrir `/substituicoes` (não está no menu) → clicar "Ver
  sugestões" → clicar "Aprovar com este" num dos sugeridos, ou "Rejeitar".
- **Erro possível**: nenhum sugerido aparece ("Nenhum substituto sugerido") sem explicar
  por quê (todos indisponíveis? já escalados? ninguém tem a categoria certa?) — o
  coordenador fica sem próximo passo claro.

### 3.7 Gerenciamento de servidores/ministérios/categorias/comunidades/celebrantes
- Cinco CRUDs praticamente idênticos em estrutura (lista com tabela → criar/editar em
  formulário de página inteira). Consistente entre si (bom), mas repetitivo em código e em
  interação — nenhuma dessas 5 listas tem paginação, e só Servidores tem busca.

### 3.8 Consulta de repertório / download de arquivo
- **Objetivo**: ver/baixar as partituras da celebração.
- **Passos**: 0 cliques pra ver a lista; 1 clique pra abrir PDF ou link externo (`target=
  "_blank"`).
- **Observação**: o link de download do PDF aponta pra uma rota de API
  (`/api/scales/:id/repertoire/items/:id/download`) enquanto, na tela de **edição**, o
  link do PDF aponta direto pro `item.arquivoPdfPath` (provavelmente uma URL do Vercel
  Blob) — **uma inconsistência de padrão entre a tela de visualização e a de edição** para
  a mesma ação (abrir o PDF).

### 3.9 Notificações (push)
- **Objetivo**: opt-in de notificações no navegador/celular.
- **Passos**: 1 clique em "Ativar notificações" no Perfil.
- **Confusão possível**: é a única funcionalidade do sistema inteiro que depende de o
  navegador suportar Web Push — em iOS isso exige o site estar **instalado como PWA na
  tela inicial** (Safari não oferece push a partir da aba do navegador). Não existe
  `manifest.json` no projeto (confirmado — pasta `public/` só tem `sw.js`), então o app
  **não é instalável como PWA**, o que quer dizer que uma fração relevante dos usuários de
  iPhone provavelmente nunca vê a opção de notificação funcionar de verdade, sem nenhum
  aviso disso na tela de Perfil.

### 3.10 Relatórios / Intensidade de Serviço
- Fluxos de consulta pura, sem escrita. Simples e sem problemas de interação relevantes —
  o problema aqui é de descoberta (não estão no menu), não de uso.

---

## 4. Auditoria de UX

Cada item traz **severidade**, o problema, por que prejudica, quem afeta, e direção de
solução — sem redesenhar ainda.

**1) Navegação órfã para 4 telas inteiras — Severidade: Alto**
`Relatórios`, `Substituições`, `Escalas Recorrentes` e `Intensidade de Serviço` não têm
nenhum link no menu lateral nem no menu mobile (`AuthenticatedLayout.vue:18-40`). Só são
alcançáveis por um botão secundário dentro de outra tela (Dashboard, Escalas, Servidores).
Prejudica principalmente coordenadores novos ou pouco assíduos, que simplesmente não vão
descobrir que essas ferramentas existem. Direção: essas 4 telas deveriam estar no menu
principal, possivelmente agrupadas por seção.

**2) Formulário de escala sobrecarregado — Severidade: Crítico**
`ScaleForm.vue` acumula: dados básicos, busca de sugestões, e um bloco repetido por
categoria de função com até 4 controles inline por linha de servidor. Isso é o formulário
mais longo e mais denso do sistema, usado toda semana pelo perfil que provavelmente tem
menos paciência para complexidade (coordenador de pastoral, não necessariamente
tech-savvy). Afeta diretamente a tarefa mais frequente do sistema. Direção: quebrar em
passos, ou em um padrão de busca+adição mais direto (autocomplete único, menos selects
aninhados).

**3) Ausência de detecção de conflitos — Severidade: Alto**
Nada na tela avisa se um servidor está sendo escalado duas vezes no mesmo horário, ou se
está marcado como indisponível naquela data/período. O requisito está documentado
(`ordus-musicalis-requisitos.md`, seção "Substituição"/"Disponibilidade") mas não foi
implementado. Afeta coordenadores, que só descobrem o conflito quando o servidor reclama.
Direção: alerta inline no momento de adicionar o servidor à escala.

**4) Confirmação de exclusão via `confirm()` nativo — Severidade: Médio**
Toda exclusão (servidor, ministério, categoria, celebrante, comunidade, escala, template,
vínculo, fechar janela, rejeitar substituição) usa `window.confirm()` — uma caixa de
diálogo do navegador, sem estilo, sem explicar consequência, sem "desfazer". Afeta todos
os usuários staff, mas principalmente os menos familiarizados com tecnologia, que tendem a
clicar "OK" em diálogos do sistema por hábito, sem realmente ler. Direção: um componente
de confirmação estilizado e consistente com o resto da UI, com texto específico da
consequência.

**5) Nenhuma exclusão é reversível — Severidade: Alto**
Todas as exclusões são `DELETE` imediatos, sem soft-delete nem lixeira. Combinado com o
item anterior (confirmação genérica de sistema), o risco de perda de dado por engano é
real — especialmente em uma base de dados onde cada `Servidor`/`Team` tem meses de
histórico associado. Direção: ao menos considerar soft-delete (`ativo: false` já existe
como padrão no schema para a maioria das entidades — a exclusão física parece nem ser
necessária na maior parte dos casos, já existe status ativo/inativo).

**6) Tabelas puras em telas mobile-first — Severidade: Crítico**
Todo `Index` (Escalas, Servidores, Ministérios, Categorias, Celebrantes, Comunidades,
Recorrências, Disponibilidade/Painel) usa `<table>` HTML dentro de `overflow-x-auto`, sem
alternativa em cartão para telas estreitas. O requisito não-funcional do próprio projeto
diz "acesso via celular (mobile-first)" — a implementação contradiz isso sistematicamente.
Afeta todo mundo no celular, mas com mais peso para quem só usa celular (provavelmente a
maioria dos servidores). Detalhado na seção 9.

**7) Calendário do Dashboard exige rolagem horizontal no celular — Severidade: Crítico**
`Dashboard.vue:335`: `<div class="min-w-[560px]">` força o grid de 7 colunas a ter no
mínimo 560px, mas a maioria dos celulares tem entre 360–414px de largura útil. Isso
significa que a tela mais usada do sistema (o calendário mensal) não cabe na tela do
celular sem o usuário perceber que precisa arrastar pro lado para ver sexta/sábado.
Detalhado na seção 8/9.

**8) Modo escuro implementado pela metade — Severidade: Alto**
Existe um seletor de tema funcional (`ThemeToggle.vue`, `useThemeStore`) que alterna a
classe `dark` no `<html>`, e o layout/navbar/inputs/badges têm classes `dark:` completas.
Mas o **conteúdo de quase toda página autenticada** (Dashboard, Escalas, Servidores,
Ministérios, Categorias, Celebrantes, Comunidades, Relatórios, Intensidade, Substituições,
ScaleForm, ServidorForm) usa `bg-white`, `text-gray-800/900`, `divide-gray-200`, `border-
gray-100/200` **sem nenhum par `dark:`**. Resultado: em modo escuro, a navbar fica escura
mas todos os cartões de conteúdo continuam brancos — uma inconsistência visual grande e
fácil de perceber até por um usuário leigo. Curiosamente, `public/Calendar.vue` e
`liturgia/Show.vue` (aparentemente construídas depois) **têm** classes dark completas —
prova de que o padrão existe no sistema, só não foi aplicado retroativamente. Afeta
qualquer usuário com tema escuro no celular (e isso é automático via `prefers-color-
scheme` se a pessoa nunca escolheu nada).

**9) Estado de carregamento ausente em "Ministérios"— Severidade: Baixo**
`teams/Index.vue` não declara variável de `loading` nem verifica isso no template — ao
contrário de Servidores/Categorias/Celebrantes/Comunidades, que têm. Resultado: a
mensagem "Nenhum ministério cadastrado" pode piscar na tela por uma fração de segundo
antes dos dados chegarem — pequeno, mas é uma inconsistência que aponta falta de um padrão
de estado compartilhado entre telas semelhantes.

**10) "Celebrante em destaque" não implementado — Severidade: Médio**
O requisito documentado explicitamente pede destaque visual pro celebrante na tela da
escala; a implementação trata o campo com o mesmo peso visual de qualquer outro dado
(seção 3.2, seção 8). Afeta a legibilidade rápida de "quem celebra" — importante,
segundo o próprio doc de negócio, para o sacristão/coordenador de liturgia.

**11) Ausência de paginação — Severidade: Baixo hoje, Médio no crescimento**
Nenhuma lista tem paginação — todas carregam o array inteiro de uma vez. Para uma
paróquia pequena isso não é problema agora, mas não há nenhuma preparação de UI para
quando o histórico de escalas ou o número de servidores crescer (ex. `/escalas` sem
filtro de mês nunca teria paginação).

**12) Sem explicação para "sem sugestões" / "sem substitutos"— Severidade: Médio**
Tanto em `ScaleForm` (buscar sugestões) quanto em `Substituições` (ver sugestões), um
resultado vazio só diz "nenhum(a) encontrado(a)" sem indicar a causa (indisponibilidade?
já escalado? sem categoria compatível?). Isso deixa o coordenador sem próximo passo.

**13) Semântica de checkbox desmarcado não explicada (Disponibilidade) — Severidade: Baixo**
Ver seção 3.5. Ambiguidade conceitual mais do que visual, mas afeta diretamente usuários
pouco técnicos.

**14) Inconsistência de link de PDF entre visualização e edição — Severidade: Baixo**
Ver seção 3.8 — dois padrões de URL para a "mesma" ação em duas telas irmãs.

**15) Falta de feedback quando a janela de confirmação expira — Severidade: Baixo**
Ver seção 3.4 — o botão de confirmar/recusar simplesmente desaparece sem texto
explicativo.

---

## 5. Auditoria de UI

- **Cores**: paleta 100% padrão do Tailwind (nenhuma cor customizada em
  `tailwind.config.js`). Uso semântico é consistente via `Badge.vue`/`STATUS_COLORS`:
  verde = confirmado/ativo, amarelo = pendente/convidado, vermelho = recusado/erro, azul =
  substituído/informativo, roxo = vínculo fixo/categorias. Esse mapeamento é um acerto —
  poucos sistemas internos mantêm semântica de cor tão disciplinada.
- **Tipografia**: fonte padrão do sistema (stack sans-serif default do Tailwind) em
  **toda** a aplicação, com uma única exceção: `liturgia/Show.vue` importa Google Fonts
  (EB Garamond + Playfair Display) pra imitar um missal impresso. É uma escolha de design
  bonita e defensável isoladamente, mas cria uma ilha visual completamente desconectada do
  resto do sistema — vale uma decisão deliberada no redesign (estender essa linguagem
  editorial pra mais lugares, ou isolar de propósito e assumir que é "a página do
  texto sagrado").
- **Tamanho de fonte**: hierarquia rasa — praticamente tudo transita entre `text-xs`,
  `text-sm` e `text-xl`/`text-2xl` nos títulos; poucos saltos intermediários. Números de
  destaque no Dashboard (`text-4xl font-extrabold`) e nos Relatórios (`text-2xl font-
  semibold`) são os únicos pontos de tipografia realmente grande no sistema.
- **Contraste**: `text-gray-400`/`text-gray-500` sobre `bg-white` é o padrão para textos
  secundários (datas, legendas) — dentro do aceitável em modo claro, mas repetido em
  excesso (praticamente toda legenda do sistema usa uma dessas duas classes), o que
  nivela por baixo a hierarquia (tudo que "não é o dado principal" fica visualmente igual,
  independente de importância real).
- **Espaçamento**: consistente — quase toda tela usa `space-y-6` entre blocos e `p-4`/`p-6`
  dentro de cartões (`bg-white shadow-sm rounded-lg p-6` é o "cartão padrão" repetido
  dezenas de vezes). Isso é positivo para consistência, mas nenhuma tela usa mais do que 1
  nível de sombra (`shadow-sm`) — sensação visual bem "achatada", sem hierarquia de
  profundidade entre elementos primários e secundários.
- **Grid/alinhamento**: formulários usam `grid sm:grid-cols-2` de forma consistente.
  Tabelas usam `min-w-full divide-y` de forma consistente. Não há quebra de padrão entre
  telas do mesmo tipo (bom para previsibilidade).
- **Bordas/sombras**: `rounded-lg` e `rounded-md` dominam (cartões grandes vs. botões/
  inputs), `border-gray-200`/`gray-300` para separação. Nenhum uso de sombra elevada além
  do menu lateral (`shadow-xl`) — o resto do sistema é visualmente "plano".
- **Cards**: o card branco com sombra suave é o container universal — usado tanto para uma
  lista de 50 itens quanto para um único KPI (Relatórios/Dashboard). Não há diferenciação
  de card por tipo de conteúdo.
- **Botões**: 3 variantes consistentes (`PrimaryButton` cinza-escuro/quase-preto,
  `SecondaryButton` branco com borda, `DangerButton` vermelho) — **porém, fora desses três
  componentes, muitas telas recriam botões inline com classes Tailwind repetidas** em vez
  de usar os componentes (ex.: os botões de cabeçalho "Copiar link público", "Recorrências",
  "Editar", "Imprimir" em várias telas usam `class="px-4 py-2 bg-gray-200 text-gray-700
  text-xs font-semibold uppercase rounded-md hover:bg-gray-300"` copiada e colada
  repetidamente em vez de existir, por exemplo, um `TertiaryButton` ou `HeaderButton`
  reutilizável). Isso é uma inconsistência de arquitetura de componentes, não só visual.
- **Inputs**: consistentes via `TextInput.vue` — mas **selects e textareas nativos nunca
  usam esse componente**, são reescritos com classes inline em praticamente todo
  formulário (`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md
  shadow-sm`, repetido dezenas de vezes). Um `Select.vue`/`Textarea.vue` reutilizável
  nunca foi criado, apesar do padrão visual já estar definido de fato.
- **Ícones**: só SVGs inline copiados manualmente (seta, hambúrguer, sol/lua/monitor,
  plus), sem biblioteca de ícones. Poucos ícones no sistema todo — a maior parte da
  interface é só texto, o que é bom para clareza mas às vezes força texto onde um ícone
  reconhecível ajudaria mais rápido (ex. "Vínculo fixo" é sempre uma badge roxa com texto,
  nunca um ícone de "pin"/"lock").
- **Tabelas**: ver seção 9 — visualmente consistentes (`bg-gray-50` no cabeçalho,
  `divide-y` nas linhas) mas o padrão em si é problemático no mobile.
- **Menus (nav/sidebar)**: `AuthenticatedLayout.vue` tem 3 padrões de navegação
  coexistindo — barra superior horizontal (desktop), sidebar deslizante desktop (aberta por
  um botão hambúrguer, redundante com a barra), e dropdown mobile. O comentário no próprio
  código (`AuthenticatedLayout.vue:16-17`) admite que a lista do dropdown mobile é mantida
  **separada e duplicada** da fonte única usada pela sidebar — ou seja, o próprio time já
  sabe que há duplicação de lista de navegação mantida manualmente em dois lugares.
- **Badges**: consistentes e semanticamente corretas (ver Cores).
- **Alertas**: só um padrão (`FlashMessage.vue`, canto do conteúdo, cor por tipo,
  autossuficiente) — mas **não some sozinho** (sem timeout automático observado no
  `useFlashStore`, não lido em detalhe, mas o componente não tem lógica de auto-dismiss);
  fica na tela até a próxima navegação/ação disparar outro flash.

---

## 6. Hierarquia da informação

**Escala (Show)**: informação mais importante devia ser "estou escalado e minha ação
pendente" (pro servidor) ou "quem está confirmado vs. pendente" (pro coordenador).
Atualmente o que tem mais destaque visual é o **nome da celebração** (título `text-xl`) —
correto como identificador, mas o status de confirmação de cada pessoa só aparece como uma
badge pequena dentro da lista, do mesmo tamanho pra todo mundo, sem agrupamento visual
"quem já confirmou" vs "quem ainda não respondeu". Ação primária = confirmar/recusar (bem
posicionada, primeiro bloco depois do cabeçalho). Ações secundárias = imprimir, repertório,
liturgia, editar — corretamente relegadas ao cabeçalho como botões pequenos. **O que
poderia ser oculto até necessário**: os `dt/dd` de metadados (comunidade, ministério
responsável) que raramente mudam a decisão do usuário.

**Dashboard**: informação mais importante = "o que eu preciso fazer agora" (pendências,
minha próxima escala). Isso de fato tem destaque (banners coloridos, acima do
calendário) — um acerto de hierarquia. Só que o calendário abaixo, que é visualmente o
maior elemento da tela, comunica principalmente "quantidade de celebrações no mês", que é
informação de contexto, não de ação — ou seja, o elemento mais *grande* da tela não é o
mais *acionável*.

**ScaleForm**: a informação mais importante para o coordenador é "quais categorias ainda
estão vazias" — isso já tem tratamento correto (bloco fica com fundo âmbar e texto
"Ninguém escalado" quando vazio, `ScaleForm.vue:312-323`) — um dos poucos lugares do
sistema com sinalização de estado por cor teimosa (bom exemplo a preservar).

**Painel de Disponibilidade**: mistura duas informações de natureza diferente na mesma
tela (gerenciar a janela de coleta + ver a grade de quem respondeu o quê) sem separação
visual forte além de dois cartões empilhados — funcional, mas a pergunta "quem ainda não
respondeu" (que o requisito de negócio chama de crítica) está reduzida a uma lista de
badges amarelas dentro do primeiro cartão, menor visualmente que a grade de disponibilidade
abaixo dela, que é a informação menos urgente das duas.

**As quatro perguntas-chave**, avaliadas de forma geral sobre o sistema:
- *"O que é isso?"* — Respondido de forma consistente (título no cabeçalho de toda tela).
- *"O que eu preciso fazer?"* — Bem respondido no Dashboard e na Escala (banners/botões de
  ação central); mal respondido no Painel de Disponibilidade e em Substituições (a ação
  "aprovar" só aparece depois de um clique extra em "Ver sugestões").
- *"O que aconteceu?"* — Respondido via `FlashMessage`, mas de forma genérica e sem
  persistência (ver seção 12).
- *"O que posso fazer agora?"* — Geralmente claro dentro de uma tela isolada, mas fraco em
  nível de aplicação (ver "navegação órfã", seção 4/7) — o usuário não sabe o que existe
  fora da tela em que está.

---

## 7. Arquitetura de informação

**Menu atual** (`AuthenticatedLayout.vue:18-39`): lista plana, sem agrupamento —
`Dashboard, Escalas, [staff: Servidores, Ministérios, Disponibilidade, Comunidades,
Categorias, Celebrantes]` / `[servidor: Minha Escala, Disponibilidade]`.

**Problemas identificados**:
1. **Itens órfãos** (repetido da seção 4, item 1): Relatórios, Substituições, Escalas
   Recorrentes e Intensidade de Serviço existem como telas completas mas não têm entrada
   no menu — só descobertos por acaso.
2. **Nenhum agrupamento semântico**: os 6 itens do menu staff misturam **cadastro
   estrutural** (Comunidades, Categorias, Celebrantes — dados que mudam raramente) com
   **operação do dia a dia** (Escalas, Disponibilidade — usados toda semana). Ficam lado a
   lado sem hierarquia, obrigando o usuário a "adivinhar" onde cada coisa está pela ordem
   em que aparecem, sempre a mesma independente de frequência de uso.
3. **Nomenclatura**: majoritariamente clara e em português corrente ("Ministérios",
   "Celebrantes", "Disponibilidade"). Um ponto de atrito: "Ministérios" no menu aponta pra
   `/equipes` — o termo de rota (`equipes`) e o termo mostrado ao usuário (Ministérios) já
   divergem entre si internamente (o schema chama de `Team`), mas isso só importa se algum
   dia a rota vazar pro usuário (compartilhamento de link, por exemplo) — hoje é invisível
   na prática.
4. **"Disponibilidade" muda de destino conforme o papel** (`/disponibilidade` pro servidor,
   `/disponibilidade/painel` pro staff) mantendo o mesmo rótulo — coerente dentro de cada
   papel individualmente, mas dificulta qualquer documentação/suporte que precise falar "a
   tela de Disponibilidade" de forma não-ambígua.
5. **Duplicação de fonte da navegação mobile** (repetido da seção 5) é um problema de
   manutenção que eventualmente vira problema de UX (as duas listas podem divergir com o
   tempo sem ninguém perceber).

**Proposta estrutural (sem desenhar telas)** [Inferido — recomendação]:
Agrupar o menu staff em blocos, por exemplo:
- **Escala** (uso semanal): Escalas, Minha Escala/Dashboard, Substituições, Escalas
  Recorrentes, Disponibilidade.
- **Pessoas** (uso quinzenal/mensal): Servidores, Intensidade de Serviço.
- **Cadastros** (uso raro): Ministérios, Categorias de Função, Celebrantes, Comunidades.
- **Análise** (uso mensal): Relatórios.

Isso resolveria os itens órfãos e daria ao menu uma leitura por frequência de uso, não só
por tipo de entidade de banco de dados (que é como a lista atual claramente foi derivada).

---

## 8. Escala — análise aprofundada

A Escala é modelada de forma sofisticada no backend (celebração com comunidade,
celebrante opcional, múltiplas categorias de função, origem fixo/provisório, status por
pessoa) — mas a interface simplifica menos do que poderia para o usuário final.

- **Como é apresentada**: como uma página de detalhe agrupada por *categoria de função*
  (Música, Acólitos e Ancilas, etc.), cada uma com sua própria lista de pessoas. A
  categoria "Acólitos e Ancilas" ganha um tratamento especial de 2 colunas quando tem 6+
  pessoas (`scales/Show.vue:83-91`) — um ajuste pontual e específico de domínio, não um
  padrão geral de layout.
- **Como os dias são organizados**: no Dashboard, grade mensal tradicional (domingo a
  sábado); em Minha Escala, lista cronológica simples separada em "Próximas"/"Histórico" —
  **esse segundo padrão é mais legível no celular** que o calendário em grid.
- **Como as pessoas são identificadas**: por nome + instrumento/função entre parênteses
  informais (`· Violão`), sem foto, sem indicação de contato direto na tela da escala (teria
  que ir ao perfil do Servidor para ver telefone/e-mail).
- **Como funções/cargos são exibidas**: por categoria (cabeçalho de seção) + badge de
  status + texto inline de instrumento/função litúrgica. Não há filtro nem busca dentro da
  lista de uma escala específica (irrelevante em escalas pequenas, mas ganharia relevância
  em celebrações grandes tipo Natal/Páscoa com muita gente escalada de uma vez).
- **Como o usuário identifica a própria escala rapidamente**: bem resolvido — "Minha
  Escala" é uma tela dedicada e o Dashboard tem a seção "Minhas próximas escalas" em
  destaque.
- **Como o usuário identifica alterações**: **não há histórico de mudança nem
  "notificação de alteração" visível dentro da própria tela da escala** — se o coordenador
  trocar o horário depois de publicar, o servidor só descobre via push/WhatsApp (fora
  desta auditoria) ou revisitando a tela; a tela não tem um "editado em" nem "o que mudou".
- **Como são exibidos conflitos**: **não são** — ausência confirmada (seção 4, item 3).
- **Como são exibidas vagas** (categoria sem ninguém escalado): tratado só na tela de
  edição (fundo âmbar + "Ninguém escalado", `ScaleForm.vue:316-322`); na tela de
  visualização (`Show.vue`), uma categoria sem ninguém **simplesmente não aparece** —
  então um visitante ou servidor olhando a escala não tem como saber que, por exemplo,
  falta um Leitor naquele dia — só o coordenador vê isso, e só durante a edição.
- **Como são exibidas confirmações/indisponibilidades**: confirmações via badge de status
  (`STATUS_COLORS`); indisponibilidade dos servidores só aparece agregada no Painel de
  Disponibilidade, nunca cruzada visualmente com uma escala específica.
- **Navegação entre datas/meses**: seta anterior/próximo, sem "ir para hoje" nem seletor
  direto de mês/ano (precisa clicar várias vezes pra voltar/avançar múltiplos meses) —
  tanto no Dashboard quanto no Calendário Público.
- **Celular vs. desktop**: no celular, o calendário mensal do Dashboard exige rolagem
  horizontal (item crítico, seção 4/9); "Minha Escala" e a tela de detalhe da Escala (Show)
  já são baseadas em cartões empilhados e funcionam razoavelmente bem sem alterações.

**As 7 perguntas-teste, avaliadas**:
- *"Onde estou escalado?"* → bem respondido (Minha Escala, banner do Dashboard).
- *"Em qual dia? Qual horário?"* → bem respondido, sempre junto do nome da celebração.
- *"Qual é minha função?"* → respondido, mas com peso visual pequeno (texto cinza claro
  inline, não uma badge própria).
- *"Quem estará comigo?"* → respondido na tela de detalhe (Show), mas exige navegar até lá
  a partir de Minha Escala/Dashboard — não aparece na lista compacta.
- *"Houve alguma alteração?"* → **não respondido** (sem indicador de mudança/histórico).
- *"Existe alguém faltando?"* → **não respondido** pro servidor comum nem pro visitante
  público (só o coordenador vê isso, e só durante a edição).

---

## 9. Responsividade

Metodologia: inferência a partir das classes Tailwind responsivas (`sm:`, `md:`, `lg:`)
efetivamente usadas — não há teste em dispositivo real.

- **Padrão geral**: o sistema usa breakpoints Tailwind de forma correta em formulários
  (`grid-cols-1 sm:grid-cols-2`) e no menu (`hidden md:flex` / `md:hidden`) — isso funciona
  bem. O problema está concentrado em dois tipos de componente específicos:

1. **Tabelas** (Escalas, Servidores, Ministérios, Categorias, Celebrantes, Comunidades,
   Recorrências, Painel de Disponibilidade, Relatórios): todas envolvidas em
   `overflow-x-auto`, o que **evita quebra de layout** mas troca o problema por **rolagem
   horizontal obrigatória** em qualquer tabela com mais de ~4 colunas em tela <400px. Sem
   indicação visual de que a tabela rola (nenhuma sombra de "fade" na borda, nenhuma seta),
   um usuário pouco familiarizado com tecnologia pode simplesmente não perceber que há
   mais colunas/ações à direita (ex.: a coluna de ações "Editar/Excluir" fica fora da
   visão inicial em qualquer tabela de 5+ colunas num Android comum).

2. **Grid de calendário** (Dashboard e Calendário Público): `min-w-[560px]` força rolagem
   horizontal no celular (detalhado na seção 8) — este é o problema de responsividade mais
   grave do sistema porque atinge a tela de entrada (Dashboard).

3. **`ScaleForm`**: usa `flex-wrap` nas linhas de servidor escalado, então tecnicamente não
   quebra — mas cada linha pode ter até 4 controles (nome, instrumento, ministério, função
   litúrgica, botão remover) que empilham verticalmente em telas estreitas, tornando uma
   escala com 15 pessoas numa rolagem vertical muito longa e repetitiva no celular.

4. **Áreas de toque**: botões usam `py-1.5`/`py-2` (Tailwind, ~34–40px de altura) — dentro
   do aceitável, mas os links de ação em tabelas ("Editar", "Excluir", "Ver") são apenas
   texto sublinhado sem padding próprio (`text-sm`, sem `py-*`) — área de toque
   pequena para dedo em tela pequena, especialmente com "Editar"/"Excluir" adjacentes na
   mesma célula, próximos um do outro (`space-x-3`), risco de toque no botão errado.

5. **Textos pequenos**: badges e legendas (`text-[10px]`, `text-xs`) — no chip do
   calendário (`Dashboard.vue:381`, `text-[10px]`) o nome do celebrante fica em fonte
   praticamente ilegível no celular, e some completamente abaixo de `lg:` (`hidden
   lg:inline`) — ou seja, no celular o usuário só vê o horário no chip, nunca o
   celebrante, mesmo que a informação exista.

**Telas que merecem atenção prioritária no mobile** [Inferido, priorizado]: (1) Dashboard
— calendário mensal; (2) `ScaleForm` (criar/editar escala); (3) qualquer tela de listagem
com tabela e mais de 4 colunas (Escalas, Servidores, Ministérios); (4) Painel de
Disponibilidade — a grade servidor×dia é uma tabela ampla por natureza e vai precisar de
um padrão diferente de tabela HTML no celular.

---

## 10. Acessibilidade e facilidade de uso

- **Clareza dos textos**: em geral boa e em português direto, sem jargão técnico vazando
  pra interface (exceção pontual: mensagens de erro cruas da API aparecem direto na tela
  em alguns lugares, ex. `e.response?.data?.message ?? 'Erro ao...'` — se a API retornar
  algo técnico, isso vaza sem tradução).
- **Tamanho de áreas clicáveis**: ver seção 9, item 4 — links de ação em tabela são o
  ponto mais fraco.
- **Contraste**: dentro do aceitável em modo claro (`gray-500`/`gray-600` sobre branco);
  **quebrado em modo escuro** onde não há par `dark:` (seção 4, item 8) — nesses casos,
  como os containers em si não têm fundo escuro, o problema não chega a ser "texto
  ilegível", mas sim "ilha clara" dentro de uma UI escura, o que é confuso mais que
  inacessível tecnicamente.
- **Dependência de cor**: mitigada parcialmente — badges de status sempre têm texto junto
  da cor (não é só cor pura), o que é uma boa prática já presente. Exceção: o grid do
  calendário (`Dashboard.vue`) usa cor de fundo da célula para indicar a cor litúrgica do
  dia **sem nenhum texto/ícone alternativo na própria célula** — só a legenda no rodapé
  explica o significado das cores, então alguém com daltonismo (ou simplesmente alguém que
  não viu a legenda) não distingue Quaresma de Tempo Comum olhando só pra célula.
- **Ícones sem texto**: o botão de tema (`ThemeToggle`) e os botões de navegação de mês
  (setas) são ícone-apenas, mas **têm `aria-label`/`title`** (`ThemeToggle.vue:23-24`) —
  acerto pontual de acessibilidade que não se repete em todo lugar (as setas de navegação
  de mês no Dashboard, por exemplo, não têm `aria-label`, só o ícone SVG).
- **Legibilidade**: tamanho de fonte nunca cai abaixo de `text-xs` (12px) exceto o
  `text-[10px]` do chip do calendário — ponto de atenção real pra público heterogêneo em
  idade (mencionado explicitamente pelo usuário como preocupação).
- **Feedback de ações**: consistente via `FlashMessage`, mas de vida curta e sem
  destaque forte (aparece no topo do conteúdo, pode passar despercebido se o usuário já
  estiver olhando pra outra parte da tela após o clique, especialmente em telas longas).
- **Mensagens de erro**: em formulários pontuais (login, registro, servidor) há mensagens
  de campo (`InputError.vue`); em ações rápidas (`confirmar`, `recusar`, `excluir`) o erro
  vira só um flash genérico, sem indicar qual campo/ação especificamente falhou.
- **Navegação**: aceitável no desktop (menu horizontal + sidebar); no celular depende do
  dropdown, que exige 1 toque extra pra abrir antes de qualquer navegação — ok, é um padrão
  conhecido (hambúrguer), mas some qualquer "onde eu estou" visualmente enquanto fechado
  (o item ativo só é destacado dentro do menu aberto).
- **Formulários**: uso de `<select>` nativo em vez de combobox customizado — **isso é
  positivo para acessibilidade e usuários pouco técnicos** (comportamento nativo do
  sistema operacional, já conhecido por qualquer pessoa que usa um celular).
- **Facilidade para iniciantes** [Inferido, avaliação geral]: o sistema é **funcionalmente
  simples de entender no papel de servidor comum** (Minha Escala, Disponibilidade, Perfil
  são fluxos curtos e diretos) — o risco de "precisar de treinamento" está concentrado
  quase inteiramente no papel de coordenador, especificamente no formulário de escala
  (item 2, seção 4) e na descoberta de telas fora do menu (item 1, seção 4).

---

## 11. Componentes existentes

| Componente | Consistente? | Precisa melhorar? | Substituir? | Variantes que faltam |
|---|---|---|---|---|
| `PrimaryButton` | Sim | Não | Não | Estado de "loading" com spinner (hoje é só texto trocado) |
| `SecondaryButton` | Sim | Não | Não | idem |
| `DangerButton` | Sim | Não | Não | idem |
| `Badge` | Sim | Não | Não | já cobre bem as 6 cores necessárias |
| `TextInput` | Sim | Menor — não expõe estado de erro/sucesso via borda, só combinado com `InputError` externo | Não | variante "erro" com borda vermelha própria |
| `InputLabel` | Sim | Não | Não | — |
| `InputError` | Sim | Não | Não | — |
| `FlashMessage` | Parcial — sem timer de auto-dismiss observado | Sim | Não | fechar manual (X) e/ou timeout |
| `ThemeToggle` | Sim | Não | Não | — |
| **Select nativo** | **Inconsistente — reescrito inline em cada formulário** | Sim | Deveria virar componente (`Select.vue`) | — |
| **Textarea nativo** | Idem — reescrito inline sempre | Sim | Deveria virar componente | — |
| **Botão de cabeçalho terciário** (cinza claro, ex. "Editar"/"Imprimir"/"Copiar link") | Inconsistente — várias cópias da mesma classe inline, nunca um componente | Sim | Deveria virar `TertiaryButton`/`HeaderButton` | — |
| **Tabela** | Consistente visualmente, mas sem componente — é HTML puro repetido em 8+ telas | Sim | Vale um `Table.vue` ou (melhor) um padrão de cards responsivos | ver seção 9 |
| **Modal/Dialog** | **Não existe** | — | Precisa ser criado do zero | confirmação, formulário rápido |
| **Pagination** | **Não existe** | — | Precisa ser criado quando/se necessário | — |
| **Calendar/Calendário** | Não existe como componente — a grade é reescrita inline tanto no Dashboard quanto no Calendário Público (duas implementações quase idênticas de `calendarCells`/`prevMonth`/`nextMonth`) | Sim | Deveria virar componente único | — |
| **Toast** | Não existe separado de `FlashMessage` (que não é bem um toast — fica embutido no fluxo do conteúdo, não flutuante) | Sim | Considerar migrar pra um toast flutuante de verdade | — |
| **Tabs** | Só reimplementado ad-hoc em Relatórios (botões toggle "Por Ministério"/"Por Categoria") | Sim | Poderia virar `Tabs.vue` se o padrão se repetir mais | — |
| **Dropdown** | Só existe como menu de navegação, não como padrão reutilizável de ação | — | Considerar se precisar de menu de ações (hoje resolvido com botões separados) | — |

---

## 12. Estados da interface

| Estado | Onde existe bem | Onde falta ou é inconsistente |
|---|---|---|
| Loading | Dashboard (spinner animado), maioria dos Index (`loading.value` + texto) | `teams/Index.vue` **não tem** (seção 4, item 9) |
| Empty state | Presente e com mensagem específica em praticamente toda lista/seção (`"Nenhum(a) X encontrado(a)"`) — ponto forte real do sistema | Escala (Show) não avisa quando falta gente numa categoria (seção 8) |
| Error | Formulários de auth e de servidor mostram erro de campo; a maioria das ações rápidas só mostra flash genérico | Sem padrão para "erro de rede" (offline) em nenhuma tela |
| Success | `FlashMessage` cobre bem todas as ações de escrita | Sem "undo" em nenhuma |
| Disabled | Botões desabilitados durante submit (`:disabled="loading"`) — consistente | — |
| Hover | Presente em botões, links e linhas interativas (`hover:bg-gray-50` etc.) — consistente | — |
| Focus | Herdado do Tailwind Forms plugin nos inputs (`focus:ring-indigo-500`) — consistente nos campos, mas **links de ação em tabela não têm estado de foco visível diferenciado** (dependem só do focus-ring default do navegador) |
| Selected/Active | Item ativo do menu lateral tem destaque (`bg-indigo-50 text-indigo-700`) — mobile dropdown **não destaca item ativo** (`RouterLink` sem `:class` condicional nesse trecho) |
| Confirmation | Só via `confirm()` nativo (seção 4, item 4) |

---

## 13. Problemas prioritários

| Prioridade | Problema | Impacto | Severidade | Área afetada |
|---|---|---|---|---|
| 1 | Calendário do Dashboard exige rolagem horizontal no celular (`min-w-[560px]`) | Tela de entrada ilegível sem gesto extra pra maioria dos celulares | Crítico | Dashboard / Mobile |
| 2 | Formulário de criação/edição de escala é extremamente denso (30+ interações numa tela só) | Fluxo mais frequente do coordenador é o mais custoso | Crítico | ScaleForm |
| 3 | Todas as listas usam tabela HTML sem alternativa mobile | Ações (editar/excluir) ficam fora da área visível inicial no celular | Crítico | Todas as telas Index |
| 4 | 4 telas inteiras (Relatórios, Substituições, Recorrentes, Intensidade) fora do menu | Funcionalidades inteiras ficam invisíveis pra maioria dos usuários | Alto | Arquitetura de informação |
| 5 | Sem detecção de conflito de escalação/indisponibilidade | Erros operacionais só descobertos depois, na prática | Alto | ScaleForm / Escala |
| 6 | Modo escuro implementado só parcialmente (conteúdo sem classes `dark:`) | Inconsistência visual grande para qualquer usuário em tema escuro | Alto | Todo o sistema |
| 7 | Nenhuma exclusão é reversível (sem soft delete / lixeira) | Risco real de perda de dado por clique acidental | Alto | Todos os CRUDs |
| 8 | "Celebrante em destaque" documentado como requisito mas não implementado | Informação de negócio relevante fica com peso visual igual a qualquer outra | Médio | Escala (Show) |
| 9 | Confirmação de exclusão via `confirm()` nativo do navegador | Quebra consistência visual e não explica consequência | Médio | Todos os CRUDs |
| 10 | Escala (Show) não indica categorias sem ninguém escalado para quem só visualiza | Servidor/visitante não percebe que falta gente numa função | Médio | Escala (Show) / Público |
| 11 | Sem indicação de "isso foi alterado" numa escala já publicada | Servidor pode não perceber mudança de horário/local | Médio | Escala (Show) |
| 12 | "Sem sugestões"/"sem substitutos" não explica o motivo | Coordenador fica sem próximo passo claro | Médio | ScaleForm / Substituições |
| 13 | Textos e chips minúsculos no calendário (`text-[10px]`) e informação escondida (`hidden lg:inline`) | Nome do celebrante nunca aparece no celular | Médio | Dashboard |
| 14 | Sem `manifest.json` (app não é instalável como PWA) | Push notification pouco confiável em iOS sem instalação | Médio | Perfil / Notificações |
| 15 | Componentes de UI reescritos inline em vez de reutilizados (select, textarea, botão terciário, calendário) | Manutenção difícil e pequenas inconsistências acumuladas | Médio | Arquitetura de componentes |
| 16 | Estado de loading ausente em Ministérios (Index) | Flash de estado vazio antes dos dados chegarem | Baixo | Ministérios |
| 17 | Sem paginação em nenhuma lista | Não escala se o volume de dados crescer | Baixo (hoje) |Todos os Index |
| 18 | Link de PDF inconsistente entre visualização e edição de repertório | Pequena divergência de padrão técnico visível ao usuário | Baixo | Repertório |
| 19 | Semântica do checkbox de disponibilidade não explicada | Ambiguidade conceitual para usuário leigo | Baixo | Disponibilidade |
| 20 | Duplicação da lista de navegação entre desktop/mobile mantida manualmente | Risco de menus divergirem com o tempo | Baixo | AuthenticatedLayout |

---

## 14. O que NÃO deveria ser alterado

- **O modelo de dados por trás da escala** (categorias de função, ministérios, vínculo
  fixo vs. provisório, celebrante como campo próprio) é rico, bem pensado e já resolve
  problemas reais de domínio litúrgico — o redesign deveria trabalhar **em cima** dessa
  modelagem, não contra ela.
- **A geração automática de escalas a partir de recorrências** (`Escalas Recorrentes` →
  "Gerar escalas do mês") é uma funcionalidade de alto valor que já funciona (não duplica
  escalas existentes) — só precisa ficar mais visível (ver navegação órfã), não mudar de
  comportamento.
- **A sugestão automática de substitutos e de servidores** (`buscarSugestoes`,
  `/substituicoes/:id/sugestoes`) já cruza disponibilidade/histórico — é a peça mais
  "inteligente" do sistema e deveria ganhar mais destaque visual, não ser refeita.
- **O sistema semântico de cores em badges** (`STATUS_COLORS`) é consistente e deveria ser
  a base de qualquer novo sistema de design, não descartado.
- **Confirmar/recusar presença** é um fluxo já curto e direto (1–3 cliques) — não precisa
  de menos passos, só de reforço visual.
- **Estados vazios com mensagem específica** já existem de forma consistente em quase todo
  lugar — manter esse padrão (só completar as exceções, seção 12).
- **O uso de `<select>` nativo** em vez de combobox customizado é uma escolha correta para
  o público-alvo (familiaridade, acessibilidade) — não trocar por um componente mais
  "bonito" que seja menos previsível para usuários pouco técnicos.
- **A separação de papéis (admin/coordenador vs. servidor)** já filtra bem o que cada
  perfil vê — a lógica de permissão em si está correta, só a navegação staff que precisa de
  reorganização (seção 7).
- **O calendário litúrgico integrado** (cores por tempo litúrgico, leituras do dia) é um
  diferencial real do produto para o contexto católico — vale a pena preservar e até
  expandir a linguagem editorial que já existe isoladamente na tela de Liturgia.

---

## 15. Oportunidades de melhoria

**Alto impacto**
- Redesenhar a interação de montagem de equipe da escala (ScaleForm) — maior ganho de
  produtividade possível no sistema, pois é o fluxo mais frequente e mais pesado.
- Resolver a responsividade do calendário mensal (Dashboard/Público) — é a primeira tela
  que qualquer usuário vê.
- Substituir tabelas por um padrão de lista/cartão responsivo em todas as telas Index.
- Reorganizar a navegação para incluir as 4 telas órfãs e agrupar por frequência de uso.
- Completar o modo escuro no conteúdo (não só no chrome/navegação).

**Médio impacto**
- Adicionar indicação visual de conflito (mesmo servidor em dois lugares, ou
  indisponibilidade) no momento de montar a escala.
- Criar um componente de confirmação/modal para substituir `confirm()` nativo.
- Destacar visualmente o celebrante na tela de Escala, como o requisito original já pedia.
- Explicar motivo de "sem sugestões" (indisponível / já escalado / sem categoria) em vez de
  só dizer que está vazio.
- Adicionar indicação de "alterado recentemente" na tela de Escala.
- Extrair `Select`/`Textarea`/botão terciário/calendário como componentes reutilizáveis
  (ganho de manutenção que se reflete em consistência visual).

**Baixo impacto**
- Adicionar `manifest.json` para tornar o app instalável (ganho principalmente pra push no
  iOS).
- Adicionar paginação (não urgente na escala atual de dados).
- Unificar link de PDF entre visualização/edição de repertório.
- Explicar a semântica do checkbox de disponibilidade.
- Consolidar a lista de navegação mobile/desktop numa única fonte (hoje já documentado
  como duplicado no próprio comentário do código).

---

## 16. Resumo executivo

### Principais problemas
O sistema tem um modelo de domínio maduro e bem pensado, mas a camada de interface não
acompanhou essa maturidade em três frentes centrais: (1) a tela mais frequente do
coordenador — montar a equipe de uma escala — é sobrecarregada de interações; (2) a
experiência mobile quebra exatamente na tela de entrada (calendário) e em toda listagem
administrativa, apesar do próprio requisito do produto pedir "mobile-first"; (3) a
navegação deixa 4 funcionalidades inteiras invisíveis fora do menu principal, e o modo
escuro foi implementado só parcialmente, criando uma inconsistência visível para qualquer
usuário que use tema escuro (comum e às vezes automático no celular).

### Principais oportunidades
Redesenhar a interação de montagem de escala; resolver a responsividade do calendário e
das tabelas administrativas; reorganizar o menu por frequência de uso incluindo as telas
hoje órfãs; extrair um punhado de componentes que já existem visualmente mas são
reescritos inline (select, textarea, botão terciário, calendário, modal de confirmação);
completar o modo escuro no conteúdo das páginas.

### Telas prioritárias para redesenho
1. **Dashboard** (calendário mensal — problema de mobile mais grave do sistema)
2. **Criar/Editar Escala** (`ScaleForm`) — fluxo mais frequente e mais pesado
3. **Todas as telas de listagem (Index)** — padrão de tabela precisa virar responsivo
4. **Escala (Show)** — hierarquia de informação (celebrante, alterações, vagas)
5. **Painel de Disponibilidade** — grade servidor×dia, mesmo problema de tabela ampla

### Fluxos prioritários para simplificação
1. Montagem de equipe de uma celebração (o fluxo #1 em custo de interação)
2. Descoberta de Relatórios/Substituições/Recorrências/Intensidade (problema de
   navegação, não de interação dentro da tela)
3. Exclusão de qualquer entidade (confirmação nativa + irreversibilidade)
4. Resposta a "sem sugestões"/"sem substitutos" (falta de orientação de próximo passo)

### Recomendação geral
O redesign deveria **preservar a modelagem de domínio e a lógica de negócio já validada**
(ela é o ponto forte real do produto) e investir o esforço de design principalmente em
**três eixos**: (1) simplificar a interação de montagem de escala sem perder a
flexibilidade multi-categoria que o negócio exige; (2) tratar mobile como o caso principal
de verdade, não como um `overflow-x-auto` de curativo sobre um layout pensado pra
desktop; e (3) consolidar um sistema de componentes de fato (hoje metade existe como
componente Vue reutilizável e metade é HTML/Tailwind copiado e colado tela a tela) — o que
sozinho já resolveria boa parte das inconsistências visuais apontadas neste relatório sem
exigir nenhuma decisão nova de produto.
