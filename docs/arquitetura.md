Projeto Escala de Músicos

A Arquitetura do Sistema vai compor: Front-end Vue 3 + Tailwind CSS, integrado via Inertia.js;
Back-end Laravel 11 (PHP 8.3+) Arquitetura MVC;
Banco de Dados PostgreSQL 17.

Estava pensando em um sistema com uma interface simples, de fácil entendimento e moderna, com um sistema de login, e um sistema de notificação onde a pessoa possa ser notificada um dia antes da missa que ela irá tocar/cantar, com também uma aba de repertórios litúrgicos que possa ser atualizado a cada semana, outra aba onde a pessoa possa falar os dias que ela tem disponibilidade além do dia que ela já toca para conseguirmos suprir a falta de músicos (como se fosse um questionário), também um sistema automatizado que possa atualizar a agenda todo mês preenchendo com os dias fixos…
DOCUMENTO DE ARQUITETURA DE SOFTWARE
Sistema de Gerenciamento de Escala de Músicos Litúrgicos
Versão: 2.0
Data: Junho de 2026
Autor: Pedro Scarcela

1. Visão Geral
1.1 Objetivo
Este documento descreve a arquitetura do Sistema de Gerenciamento de Escala de Músicos Litúrgicos, desenvolvido para facilitar o planejamento, organização e comunicação entre coordenadores e músicos da paróquia.
O sistema permitirá o cadastro de usuários, gerenciamento de equipes, criação de escalas, notificações automáticas e consulta de repertórios.

2. Objetivos de Negócio
Reduzir o trabalho manual na criação de escalas.
Centralizar informações em uma única plataforma.
Melhorar a comunicação entre coordenadores e músicos.
Diminuir faltas por esquecimento através de notificações.
Disponibilizar repertórios e partituras digitalmente.

3. Requisitos Funcionais
RF01 – Autenticação
O sistema deverá permitir login e logout de usuários.
RF02 – Cadastro de Músicos
O coordenador poderá cadastrar músicos e seus instrumentos.
RF03 – Gerenciamento de Equipes
O sistema deverá permitir criar equipes musicais.
RF04 – Criação de Escalas
O coordenador poderá criar escalas para celebrações.
RF05 – Notificações
Os músicos receberão notificações quando forem escalados.
RF06 – Repertórios
O sistema deverá disponibilizar repertórios organizados por celebração.
RF07 – Download de Partituras
O sistema permitirá o download de arquivos PDF.

4. Requisitos Não Funcionais
RNF01 – Segurança
Senhas criptografadas com Bcrypt (hashing padrão do Laravel).
Proteção contra SQL Injection (Eloquent ORM com prepared statements).
Proteção contra XSS (escaping automático do Blade/Vue).
Proteção contra CSRF (middleware nativo do Laravel).
RNF02 – Performance
Tempo médio de resposta inferior a 2 segundos.
RNF03 – Disponibilidade
Disponibilidade mínima de 99%.
RNF04 – Responsividade
Compatível com dispositivos móveis e desktop (layout responsivo via Tailwind CSS).

5. Arquitetura do Sistema
Padrão Arquitetural
O sistema utilizará:
Arquitetura MVC
Arquitetura em Camadas (Layered Architecture)
Monolito moderno com Laravel + Inertia.js (sem necessidade de API REST separada)
Camadas
Apresentação (Front-End)
Tecnologias:
Vue 3 (Composition API)
Tailwind CSS
Inertia.js (ponte entre rotas Laravel e componentes Vue)
Vite (build e hot-reload)
Responsabilidades:
Interface do usuário
Validação inicial dos formulários
Renderização das páginas via componentes Vue, com navegação SPA entregue pelo Inertia
Camada de Aplicação
Tecnologias:
PHP 8.3+ (versão mais recente)
Laravel 11
Responsabilidades:
Regras de negócio
Autenticação (Laravel Breeze/Fortify com Inertia)
Controle de permissões (Policies/Gates)
Agendamento de tarefas (Laravel Scheduler) e notificações
Camada de Persistência
Tecnologias:
PostgreSQL 17
Eloquent ORM
Responsabilidades:
Armazenamento de dados
Consultas
Integridade das informações (constraints, migrations versionadas)

6. Diagrama de Arquitetura
Usuário
↓
Front-End (Vue 3 + Tailwind CSS, renderizado via Inertia.js)
↓
Rotas + Controllers (Laravel)
↓
Services / Form Requests
↓
Models (Eloquent) / Repositories
↓
PostgreSQL Database

7. Estrutura de Diretórios
project/
├── app/
│ ├── Http/
│ │ ├── Controllers/
│ │ ├── Middleware/
│ │ └── Requests/
│ ├── Models/
│ ├── Services/
│ ├── Policies/
│ └── Notifications/
├── database/
│ ├── migrations/
│ ├── factories/
│ └── seeders/
├── resources/
│ ├── js/
│ │ ├── Pages/
│ │ ├── Components/
│ │ └── Layouts/
│ └── css/
├── routes/
│ └── web.php
├── config/
├── tests/
└── public/

8. Banco de Dados
Principais Entidades
Usuários
id
nome
email
senha
perfil
Músicos
id
nome
instrumento
telefone
Escalas
id
data
horário
celebração
Escala_Músicos
escala_id
músico_id

9. Segurança
Autenticação
Sessões autenticadas do Laravel (Breeze/Fortify), com suporte a Sanctum caso seja necessário expor API para apps externos no futuro.
Criptografia
Bcrypt para senhas (padrão do Laravel)
Controle de Acesso
Perfis:
Administrador
Coordenador
Músico

10. Escalabilidade
A arquitetura permite futura evolução para:
Laravel Octane (performance em alta concorrência)
Filas assíncronas (Laravel Queues + Redis) para envio de notificações
Docker
Kubernetes
AWS
Azure
Sem necessidade de reescrever as regras de negócio.

11. Tecnologias Utilizadas
Front-End:
Vue 3
Tailwind CSS
Inertia.js
Vite
Back-End:
PHP 8.3+ (versão mais recente)
Laravel 11
Banco de Dados:
PostgreSQL 17
Ferramentas:
Git
GitHub
VS Code
Composer / NPM

12. Conclusão
A arquitetura proposta oferece simplicidade, segurança, manutenibilidade e escalabilidade, atendendo às necessidades atuais da paróquia e permitindo futuras expansões sem impactos significativos na estrutura existente.
