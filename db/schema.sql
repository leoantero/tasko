CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    nome VARCHAR(120) NOT NULL,
    categoria VARCHAR(60),
    descricao TEXT,
    prazo DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    concluido_em TIMESTAMPTZ
);

CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    projeto_id INT REFERENCES projetos(id),
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    prioridade SMALLINT,
    prazo DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    concluida_em TIMESTAMPTZ
);

CREATE TABLE sessoes_pomodoro (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ,
    tempo_foco_segundos INT,
    tempo_total_segundos INT
);

CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL,
    valor_alvo NUMERIC NOT NULL,
    data_limite DATE NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
