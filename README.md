# tasko

Aplicação web de produtividade voltada para organização de projetos, gerenciamento de tarefas e acompanhamento de períodos de foco. O sistema permite que usuários organizem suas atividades em projetos, definam prioridades e acompanhem seu progresso. As tarefas podem ser executadas através de sessões de foco baseadas na técnica Pomodoro, cujos dados são utilizados para gerar métricas de produtividade. Dessa forma, o sistema busca integrar planejamento, execução e análise em uma única plataforma.

## Funcionalidades

* Criação e gerenciamento de projetos
* Criação e gerenciamento de tarefas, dentro de um projeto ou avulsas
* Definição de prioridades e prazos
* Sessões de foco utilizando a técnica Pomodoro
* Registro automático do tempo de foco
* Dashboard com métricas de produtividade
* Histórico de atividades
* Definição e acompanhamento de metas

## Histórias de Usuário

### HU01 — Criar projeto

Como usuário, quero criar projetos com nome, categoria, descrição e prazo para organizar diferentes objetivos e atividades.

### HU02 — Gerenciar tarefas

Como usuário, quero criar, editar, concluir e excluir tarefas dentro de um projeto para acompanhar minhas atividades.

### HU03 — Priorizar tarefas

Como usuário, quero definir a prioridade de minhas tarefas para identificar quais atividades devem receber mais atenção.

### HU04 — Executar Pomodoro

Como usuário, quero iniciar e finalizar sessões Pomodoro  associadas a uma tarefa para controlar meus períodos de foco, com tempos

### HU05 — Registrar produtividade

Como usuário, quero que minhas sessões de foco sejam registradas automaticamente para acompanhar quanto tempo dedico às minhas atividades.

### HU06 — Visualizar dashboard

Como usuário, quero visualizar um dashboard com minhas principais métricas de produtividade para acompanhar meu desempenho. As métricas devem ir desde quantidade de tempo estudado na semana até uma visualização da distribuição de tempo em cada projeto.

### HU07 — Consultar histórico

Como usuário, quero consultar meu histórico de sessões, tarefas concluídas, projetos finalizados.

### HU08 — Definir metas

Como usuário, quero definir metas de produtividade e acompanhar meu progresso para manter uma rotina de estudos ou trabalho consistente.

### HU09 — Login

Como usuário, quero criar minha conta e fazer login com email e senha para acessar meus projetos e tarefas de forma segura, e consultar os dados da minha conta quando precisar.

### HU10 — Tela inicial

Como usuário, quero uma tela inicial ao abrir o app que reúna minhas tarefas do dia e a sessão de foco em andamento, para retomar meu trabalho rapidamente.

### HU11 — Tarefas avulsas

Como usuário, quero criar tarefas que não pertencem a nenhum projeto, para anotar o que não se encaixa em um objetivo maior, e vê-las na tela inicial junto com as tarefas dos projetos.

## Tecnologias

### Frontend

* React

### Backend

* Python
* Flask
* psycopg3

### Banco de Dados

* PostgreSQL

### Ferramentas de IA

* Claude, 
* Github Copilot

## Equipe

| Membro | Papel      |
| ------ | ---------- |
| Brisa Nascimento | Full Stack |
| Luiz Gustavo | Full Stack |
| Leonardo Mendes | Frontend   |
| Arthur Faria | Backend |

## Arquitetura

O sistema será desenvolvido seguindo uma arquitetura web composta por um frontend responsável pela interface do usuário e um backend responsável pela API e pela persistência dos dados em banco de dados.

```mermaid
flowchart LR
    U[Usuário] --> F[Frontend Web]
    F --> A[Backend / API]
    A --> B[(Banco de Dados)]
```

### Modelo de dados

Tudo pertence a um usuário: projetos, tarefas, sessões e metas guardam `usuario_id`, e
é por ele que toda consulta filtra. Dois vínculos são opcionais de propósito — tarefa
pode não ter projeto (HU11) e sessão pode ficar sem tarefa quando a tarefa é excluída,
o que preserva o tempo já focado.

```mermaid
erDiagram
    usuarios ||--o{ projetos : cria
    usuarios ||--o{ tarefas : cria
    usuarios ||--o{ sessoes_pomodoro : registra
    usuarios ||--o{ metas : define
    projetos |o--o{ tarefas : agrupa
    tarefas |o--o{ sessoes_pomodoro : "recebe foco"

    usuarios {
        serial id PK
        varchar nome
        varchar email UK
        varchar senha_hash
        timestamptz criado_em
    }
    projetos {
        serial id PK
        int usuario_id FK
        varchar nome
        varchar categoria "opcional"
        text descricao "opcional"
        date prazo "opcional"
        varchar status "ativo ou concluido"
        timestamptz criado_em
        timestamptz concluido_em "preenchido ao concluir"
    }
    tarefas {
        serial id PK
        int usuario_id FK
        int projeto_id FK "nulo = tarefa avulsa"
        varchar titulo
        text descricao "opcional"
        smallint prioridade "3 alta, 2 media, 1 baixa"
        date prazo "opcional"
        varchar status "pendente ou concluida"
        timestamptz criado_em
        timestamptz concluida_em "preenchido ao concluir"
    }
    sessoes_pomodoro {
        serial id PK
        int usuario_id FK
        int tarefa_id FK "nulo = tarefa excluida"
        timestamptz inicio
        timestamptz fim "nulo = sessao em andamento"
        int tempo_foco_segundos
        int tempo_total_segundos "duracao escolhida, depois decorrido"
    }
    metas {
        serial id PK
        int usuario_id FK
        varchar tipo
        numeric valor_alvo
        date data_limite
        timestamptz criado_em
    }
```

O arquivo aplicável está em [`db/schema.sql`](db/schema.sql); há também uma versão
visual em `db/Diagrama_SQL.png`.

### Sessão de foco (HU04, HU05)

O diagrama abaixo mostra por que o tempo registrado é sempre do servidor: o
cliente informa apenas quanto tempo ficou em foco (ele sabe das pausas), e
quem decide `inicio`, `fim` e o total decorrido é o backend.

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend
    participant A as API
    participant B as Banco

    U->>F: inicia o foco em uma tarefa
    F->>A: POST /sessoes-pomodoro/iniciar
    A->>B: descarta sessões abertas há mais de 4h
    A->>B: INSERT com inicio = agora
    B-->>A: sessão criada
    A-->>F: 201 (ou 409 se já houver sessão aberta)

    Note over F: o timer roda no navegador

    U->>F: encerra o foco
    F->>A: POST /sessoes-pomodoro/<id>/finalizar
    A->>B: UPDATE fim = agora, tempos calculados no banco
    B-->>A: sessão finalizada
    A-->>F: 200 com tempo de foco e total

    F->>A: GET /dashboard/resumo
    A->>B: agrega as sessões dos últimos 7 dias
    B-->>A: total, série diária e distribuição por projeto
    A-->>F: 200
```

O estado do frontend, o que falta e o guia de integração com a API estão em [docs/FRONTEND.md](docs/FRONTEND.md). O contrato de todas as rotas está em [docs/api.md](docs/api.md).

## Possíveis extensões

* Notificações
* Tarefas recorrentes
* Calendário
* Tags
* Gamificação
* Streaks de produtividade
* Integração com calendário externo
* Recomendações personalizadas de estudo e trabalho
