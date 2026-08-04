# Ordus Musicalis — Documento de Requisitos

Sistema de controle de escalas da equipe celebrativa (músicos, ministros da comunhão, acólitos,
leitores, comentaristas e demais funções) de uma paróquia católica, incluindo todas as suas
comunidades.

> **Nota histórica**: este documento nasceu descrevendo um sistema só para músicos da Matriz
> paroquial. Esse escopo original (seções abaixo) foi totalmente implementado e depois expandido
> — o sistema hoje cobre qualquer função litúrgica em qualquer comunidade da paróquia. O histórico
> dessa expansão e o que falta dela está em `todo.md`, na raiz do projeto.

## 1. Visão Geral

### 1.1 Problema
Coordenadores de pastoral litúrgica hoje não têm visibilidade clara sobre:
- Disponibilidade real de quem serve (músicos, ministros da comunhão, acólitos, leitores, comentaristas...)
- Intensidade de serviço de cada um (quem serve demais, quem serve de menos)
- Quais ministérios existem, a que categoria de função pertencem e quem os compõe
- A escala de forma visual e organizada, por celebração e por comunidade
- Quem confirmou presença e quem ainda não respondeu
- Quem está em vínculo fixo (ex: sempre na missa das 09h do 1º domingo) versus quem está escalado pontualmente

### 1.2 Objetivo
Dar ao coordenador uma visão única e confiável da escala de toda a equipe celebrativa, em qualquer
comunidade da paróquia, reduzindo trabalho manual (planilhas, grupos de WhatsApp) e falhas de
comunicação, respeitando a realidade específica da liturgia católica (tempos litúrgicos, tipos de
celebração, ministérios próprios).

### 1.3 Personas
| Persona | Necessidade principal |
|---|---|
| **Coordenador de ministério/pastoral litúrgica** | Montar e publicar escalas, saber quem confirmou, evitar sobrecarga, ver ministérios formados |
| **Servidor** (músico, ministro da comunhão, acólito, leitor, comentarista etc.) | Ver sua escala, marcar disponibilidade, confirmar presença, pedir substituição |
| **Pároco/vigário ou coordenador de pastoral** | Visão consolidada de todas as celebrações, comunidades e ministérios envolvidos |
| **Sacristão/coordenador geral de liturgia** | Ver quem está escalado em cada celebração, em todas as funções ao mesmo tempo (não só música) |

## 2. Particularidades da Igreja Católica a Modelar

### 2.1 Tipos de celebração
- Missa dominical (com horários fixos recorrentes: ex. Sábado 19h, Domingo 07h, 09h, 11h, 19h)
- Missa diária (dias de semana)
- Solenidades e festas (Natal, Páscoa, Corpus Christi, Padroeiro da paróquia — datas fixas ou móveis)
- Celebrações especiais: casamentos, funerais, batizados, primeira comunhão, crismas, novenas, terços, adoração
- Celebrações sem padre (Palavra, terço, adoração) em comunidades que nem sempre têm missa — por
  isso o sistema chama tudo genericamente de "celebração", não "missa"
- Tempos litúrgicos como contexto (Advento, Natal, Quaresma, Páscoa, Tempo Comum) — pode influenciar repertório, não necessariamente a escala em si, mas é bom o sistema reconhecer o calendário litúrgico

### 2.2 Categorias de função e ministérios
Cada celebração pode reunir gente de várias **categorias de função** ao mesmo tempo — hoje
cadastráveis pelo admin, com as seguintes de partida:
- **Música**: coral/coro, grupo de louvor, cantor(a) solista, organista/tecladista, regente,
  instrumentistas (violão, baixo, bateria, flauta, violino etc.)
- **Ministros da Comunhão**
- **Acólitos e Ancilas**
- **Leitores**
- **Comentaristas**
- Outras categorias podem ser cadastradas conforme a necessidade da paróquia

Dentro de cada categoria existem **ministérios/grupos** (ex: "Coral", "Grupo Jovem", "Acólitos da
Manhã") — cada ministério pertence a exatamente uma categoria, e pode ser vinculado a um ou mais
horários/tipos de celebração recorrentes.

O **celebrante** (padre/diácono) é tratado como um campo próprio da celebração, não como mais um
ministério — normalmente não é escalado junto com o resto da equipe.

### 2.3 Funções dentro de uma escala
Uma pessoa pode ter mais de uma função (ex: toca violão e também canta), e pode integrar mais de
um ministério — inclusive de categorias diferentes (ex: é do Coral e também é Leitor). O sistema
deve permitir múltiplos papéis por pessoa, e cada pessoa escalada numa celebração indica sob qual
ministério está servindo ali especificamente.

### 2.4 Comunidades
Uma paróquia é composta por várias comunidades (a Matriz e outras capelas/comunidades vinculadas).
Cada celebração pertence a exatamente uma comunidade. Ministérios são únicos para a paróquia toda —
não existe "Coral da Matriz" separado de "Coral da Comunidade X"; é o mesmo ministério servindo em
qualquer comunidade onde for escalado.

## 3. Requisitos Funcionais

### 3.1 Cadastro de Servidores
- Nome, contato (telefone/e-mail/WhatsApp)
- Ministério(s) que integra, com função dentro de cada um
- Instrumento(s) que exerce (quando aplicável)
- Nível (em formação, apto, líder/responsável do grupo)
- Status (ativo, afastado, inativo)

### 3.2 Cadastro de Ministérios
- Nome do ministério
- Categoria de função a que pertence
- Membros vinculados e suas funções dentro dele
- Horários/tipos de celebração que atende normalmente
- Responsável/coordenador do ministério

### 3.3 Cadastro de Comunidades
- Nome, endereço
- Status (ativa/inativa)

### 3.4 Cadastro de Categorias de Função
- Nome (Música, Ministros da Comunhão, Acólitos e Ancilas, Leitores, Comentaristas, ...)
- Ordem de exibição
- Status (ativa/inativa)

### 3.5 Cadastro de Celebrações
- Comunidade em que acontece
- Celebrante (opcional)
- Tipo/nome (missa dominical, diária, solenidade, casamento, funeral, celebração da Palavra etc.)
- Data e horário
- Recorrência (ex: toda semana, todo 1º domingo do mês, evento único)
- Equipe esperada: servidores de qualquer ministério/categoria, cada um com seu ministério
  indicado individualmente
- Repertório vinculado (opcional, quando há música)

### 3.6 Disponibilidade
- Cada servidor marca períodos/datas em que está disponível ou indisponível
- Suporte a indisponibilidade recorrente (ex: "não disponível todo sábado à noite")
- Janela de coleta de disponibilidade (coordenador abre um período, ex: "disponibilidade de agosto", servidores respondem até uma data limite)
- Visualização de quem ainda não respondeu

### 3.7 Escala Fixa vs. Provisória
- **Vínculo fixo**: regra recorrente do tipo "pessoa X + função Y + celebração recorrente Z" (ex: organista sempre na missa das 09h do 1º domingo)
- O sistema gera automaticamente a escala provisória do mês a partir dos vínculos fixos
- Coordenador pode sobrescrever pontualmente uma data específica (ex: substituição), sem quebrar o vínculo fixo permanente
- Na visualização da escala, deve ficar claro visualmente o que é fixo e o que é provisório/pontual para aquela data

### 3.8 Intensidade de Serviço
- Contagem automática de quantas vezes cada pessoa serviu (total e por função/ministério) em um período (mês, trimestre, ano)
- Alerta visual de sobrecarga (ex: pessoa escalada muitas vezes seguidas) e de ociosidade (pessoa há muito tempo sem servir)
- Regra configurável de descanso mínimo entre escalas (opcional)

### 3.9 Confirmação de Presença
- Status por pessoa escalada: convidado(a) → confirmado(a) → recusado(a) → substituído(a)
- Notificação automática ao ser escalado (push e WhatsApp)
- Lembrete automático para quem não respondeu, com prazo definido pelo coordenador (configurável por celebração)
- Painel do coordenador com destaque para pendências (quem não confirmou, quantos dias faltam)

### 3.10 Substituição
- Pessoa escalada sinaliza impossibilidade e pede substituição
- Sistema sugere substitutos com a mesma função/ministério que estejam disponíveis
- Coordenador aprova/efetiva a troca
- Histórico mantém registro da substituição (quem era o titular, quem assumiu)

### 3.11 Visualização da Escala
- Visão em calendário (mês/semana) com todas as celebrações, de todas as comunidades, e quem está escalado
- Visão "minha escala" por pessoa
- Visão por ministério e por comunidade (filtros)
- Detalhe da celebração agrupado por categoria de função (Música, Leitores, Acólitos...), com o celebrante em destaque
- Diferenciação visual entre fixo e provisório, e entre confirmado/pendente/recusado
- Exportação/compartilhamento (impressão, link público por comunidade, integração WhatsApp)

### 3.12 Relatórios
- Resumo do período: celebrações, escalações, taxa de confirmação, substituições pendentes
- Agrupamento por ministério (visão de coordenação) ou por categoria de função (visão geral de
  quantas pessoas serviram em cada tipo de função)

### 3.13 Permissões
- Administrador geral (pároco, coordenador de pastoral)
- Coordenador de ministério (gerencia só seu grupo, mas pode escalar servidores de qualquer categoria)
- Servidor comum (vê e responde sua própria escala)

## 4. Requisitos Não Funcionais
- Acesso via celular (mobile-first), já que a maioria dos servidores vai responder pelo WhatsApp/app no celular
- Notificações via WhatsApp e/ou push, não depender só de e-mail
- Simplicidade de uso para pessoas com pouca familiaridade tecnológica (público de paróquia é bem heterogêneo em idade)

## 5. Modelo de Dados (implementado)

- **Servidor** (id, nome, contato, nível, status)
- **Comunidade** (id, nome, endereço, status)
- **CategoriaFuncao** (id, nome, ordem, status) — cadastrável pelo admin
- **Team/Ministério** (id, nome, categoria_id, responsável)
- **ServidorMinisterio** (servidor_id, team_id, função)
- **Scale/Celebração** (id, comunidade_id, celebrante_id opcional, tipo, data, horário, recorrência, team_id "responsável" opcional)
- **ScaleServidor/Escalação** (id, scale_id, servidor_id, team_id — o ministério da pessoa *nessa* celebração —, instrumento, origem [fixo/provisório], status_confirmação)
- **VínculoFixo** (servidor_id, instrumento, regra_recorrência via ScaleTemplate)
- **Availability/Disponibilidade** (servidor_id, data/período, disponível: sim/não, recorrente: sim/não)
- **Substituição** (escalação_id, substituto_id, motivo, status)

## 6. Roadmap

O roadmap original (MVP + Fase 2 + Fase 3 abaixo) está **implementado por completo**. A expansão
subsequente para toda a equipe celebrativa e toda a paróquia está detalhada em `todo.md`.

### MVP (concluído)
- Cadastro de pessoas e ministérios
- Cadastro de celebrações (com recorrência simples)
- Escala manual (coordenador monta e publica)
- Confirmação de presença simples (sim/não)
- Visualização em calendário

### Fase 2 (concluído)
- Disponibilidade dos servidores (auto-declarada)
- Vínculo fixo com geração automática da escala provisória
- Contagem de intensidade de serviço
- Notificações automáticas (WhatsApp/push) e lembretes

### Fase 3 (concluído)
- Sugestão automática de substitutos cruzando disponibilidade + intensidade + vínculos fixos
- Fluxo de substituição com sugestão de substitutos
- Repertório vinculado à celebração
- Relatórios e dashboard para coordenação geral/pároco

### Expansão — equipe celebrativa e paróquia inteira (ver `todo.md`)
- Fase 0: rename Músico → Servidor, models Comunidade e CategoriaFuncao, campo Celebrante
- Fase 1: administração de Comunidades e Categorias de Função
- Fase 2: escalas com equipe multi-ministério, agrupada por categoria
- Fase 3: filtros por comunidade em toda a aplicação, relatórios por categoria
- Fase 4: polimento (este documento faz parte dela)

## 7. Fluxos Principais (para prototipar telas)

1. **Coordenador monta escala do mês** → sistema sugere com base em fixos e disponibilidade → coordenador ajusta, escalando gente de qualquer ministério/categoria → publica
2. **Servidor recebe notificação de escalação** → confirma ou recusa → se recusar, aciona fluxo de substituição
3. **Coordenador acompanha painel** → vê pendências de confirmação → dispara lembrete
4. **Servidor marca indisponibilidade** para um período → sistema evita escalá-lo automaticamente nesse período
5. **Visitante consulta o calendário público de uma comunidade** → filtra por comunidade → vê a celebração e quem está escalado, agrupado por categoria de função
