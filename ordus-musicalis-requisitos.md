# Ordus Musicalis — Documento de Requisitos

Sistema de controle de escalas de músicos para paróquia católica.

## 1. Visão Geral

### 1.1 Problema
Coordenadores de música litúrgica hoje não têm visibilidade clara sobre:
- Disponibilidade real dos músicos
- Intensidade de serviço de cada um (quem serve demais, quem serve de menos)
- Quais ministérios/grupos musicais existem e quem os compõe
- A escala de forma visual e organizada
- Quem confirmou presença e quem ainda não respondeu
- Quem está em vínculo fixo (ex: sempre na missa das 09h do 1º domingo) versus quem está escalado pontualmente

### 1.2 Objetivo
Dar ao coordenador uma visão única e confiável da escala litúrgica musical, reduzindo trabalho manual (planilhas, grupos de WhatsApp) e falhas de comunicação, respeitando a realidade específica da liturgia católica (tempos litúrgicos, tipos de celebração, ministérios próprios).

### 1.3 Personas
| Persona | Necessidade principal |
|---|---|
| **Coordenador de música/pastoral litúrgica** | Montar e publicar escalas, saber quem confirmou, evitar sobrecarga, ver ministérios formados |
| **Músico/cantor/ministro** | Ver sua escala, marcar disponibilidade, confirmar presença, pedir substituição |
| **Pároco/vigário ou coordenador de pastoral** | Visão consolidada de todas as celebrações e ministérios envolvidos |
| **Sacristão/coordenador geral de liturgia** (opcional, fase 2) | Ver quem está escalado em cada celebração (música + outros ministérios) |

## 2. Particularidades da Igreja Católica a Modelar

### 2.1 Tipos de celebração
- Missa dominical (com horários fixos recorrentes: ex. Sábado 19h, Domingo 07h, 09h, 11h, 19h)
- Missa diária (dias de semana)
- Solenidades e festas (Natal, Páscoa, Corpus Christi, Padroeiro da paróquia — datas fixas ou móveis)
- Celebrações especiais: casamentos, funerais, batizados, primeira comunia, crismas, novenas, terços, adoração
- Tempos litúrgicos como contexto (Advento, Natal, Quaresma, Páscoa, Tempo Comum) — pode influenciar repertório, não necessariamente a escala em si, mas é bom o sistema reconhecer o calendário litúrgico

### 2.2 Ministérios/grupos musicais típicos
- Coral/Coro
- Grupo de louvor (jovem, adulto)
- Cantor(a) solista
- Organista/tecladista
- Regente/ministro de música
- Instrumentistas (violão, baixo, bateria, flauta, violino etc.)
- Cada ministério pode ser vinculado a um ou mais horários/tipos de missa (ex: "Grupo Jovem" toca na missa de sábado 19h; "Coral" canta nas solenidades)

### 2.3 Funções dentro de uma escala
Uma pessoa pode ter mais de uma função (ex: toca violão e também canta). O sistema deve permitir múltiplos papéis por pessoa.

## 3. Requisitos Funcionais

### 3.1 Cadastro de Pessoas (Músicos/Ministros)
- Nome, contato (telefone/e-mail/WhatsApp)
- Ministério(s) que integra
- Função(ões)/instrumento(s) que exerce
- Nível (em formação, apto, líder/responsável do grupo)
- Status (ativo, afastado, inativo)

### 3.2 Cadastro de Ministérios
- Nome do ministério
- Membros vinculados e suas funções dentro dele
- Horários/tipos de missa que atende normalmente
- Responsável/coordenador do ministério

### 3.3 Cadastro de Celebrações
- Tipo (missa dominical, diária, solenidade, casamento, funeral, etc.)
- Data e horário
- Recorrência (ex: toda semana, todo 1º domingo do mês, evento único)
- Ministério(s) esperado(s) para essa celebração
- Repertório vinculado (opcional/fase 2)

### 3.4 Disponibilidade
- Cada músico marca períodos/datas em que está disponível ou indisponível
- Suporte a indisponibilidade recorrente (ex: "não disponível todo sábado à noite")
- Janela de coleta de disponibilidade (coordenador abre um período, ex: "disponibilidade de agosto", músicos respondem até uma data limite)
- Visualização de quem ainda não respondeu

### 3.5 Escala Fixa vs. Provisória
- **Vínculo fixo**: regra recorrente do tipo "pessoa X + função Y + celebração recorrente Z" (ex: organista sempre na missa das 09h do 1º domingo)
- O sistema gera automaticamente a escala provisória do mês a partir dos vínculos fixos
- Coordenador pode sobrescrever pontualmente uma data específica (ex: substituição), sem quebrar o vínculo fixo permanente
- Na visualização da escala, deve ficar claro visualmente o que é fixo e o que é provisório/pontual para aquela data

### 3.6 Intensidade de Serviço
- Contagem automática de quantas vezes cada pessoa serviu (total e por função/ministério) em um período (mês, trimestre, ano)
- Alerta visual de sobrecarga (ex: pessoa escalada muitas vezes seguidas) e de ociosidade (pessoa há muito tempo sem servir)
- Regra configurável de descanso mínimo entre escalas (opcional)

### 3.7 Confirmação de Presença
- Status por pessoa escalada: convidado(a) → confirmado(a) → recusado(a) → substituído(a)
- Notificação automática ao ser escalado
- Lembrete automático para quem não respondeu, com prazo definido pelo coordenador
- Painel do coordenador com destaque para pendências (quem não confirmou, quantos dias faltam)

### 3.8 Substituição
- Pessoa escalada sinaliza impossibilidade e pede substituição
- Sistema sugere substitutos com a mesma função/ministério que estejam disponíveis
- Coordenador aprova/efetiva a troca
- Histórico mantém registro da substituição (quem era o titular, quem assumiu)

### 3.9 Visualização da Escala
- Visão em calendário (mês/semana) com todas as celebrações e quem está escalado
- Visão "minha escala" por pessoa
- Visão por ministério
- Diferenciação visual entre fixo e provisório, e entre confirmado/pendente/recusado
- Exportação/compartilhamento (PDF, imagem, link público, integração WhatsApp)

### 3.10 Permissões
- Administrador geral (pároco, coordenador de pastoral)
- Coordenador de ministério (gerencia só seu grupo)
- Músico/ministro comum (vê e responde sua própria escala)

## 4. Requisitos Não Funcionais
- Acesso via celular (mobile-first), já que a maioria dos músicos vai responder pelo WhatsApp/app no celular
- Notificações via WhatsApp e/ou push, não depender só de e-mail
- Simplicidade de uso para pessoas com pouca familiaridade tecnológica (público de paróquia é bem heterogêneo em idade)

## 5. Modelo de Dados (sugestão inicial)

- **Pessoa** (id, nome, contato, status)
- **Ministério** (id, nome, responsável)
- **PessoaMinisterio** (pessoa_id, ministerio_id, função)
- **Celebração** (id, tipo, data, horário, recorrência, ministerio_id esperado)
- **VínculoFixo** (pessoa_id, função, regra_recorrência, celebração_tipo/horário)
- **Escalação** (id, pessoa_id, celebração_id, função, origem [fixo/provisório], status_confirmação)
- **Disponibilidade** (pessoa_id, data/período, disponível: sim/não, recorrente: sim/não)
- **Substituição** (escalação_id, titular_id, substituto_id, motivo)

## 6. Roadmap Sugerido

### MVP (Fase 1)
- Cadastro de pessoas e ministérios
- Cadastro de celebrações (com recorrência simples)
- Escala manual (coordenador monta e publica)
- Confirmação de presença simples (sim/não)
- Visualização em calendário

### Fase 2
- Disponibilidade dos músicos (auto-declarada)
- Vínculo fixo com geração automática da escala provisória
- Contagem de intensidade de serviço
- Notificações automáticas (WhatsApp/push) e lembretes

### Fase 3
- Sugestão automática de escala (IA cruzando disponibilidade + intensidade + vínculos fixos)
- Fluxo de substituição com sugestão de substitutos
- Repertório vinculado à celebração
- Relatórios e dashboard para coordenação geral/pároco

## 7. Fluxos Principais (para prototipar telas)

1. **Coordenador monta escala do mês** → sistema sugere com base em fixos e disponibilidade → coordenador ajusta → publica
2. **Músico recebe notificação de escalação** → confirma ou recusa → se recusar, aciona fluxo de substituição
3. **Coordenador acompanha painel** → vê pendências de confirmação → dispara lembrete
4. **Músico marca indisponibilidade** para um período → sistema evita escalá-lo automaticamente nesse período
