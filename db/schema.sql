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
    status VARCHAR(20) NOT NULL DEFAULT 'ativo'
        CHECK (status IN ('ativo', 'concluido')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    concluido_em TIMESTAMPTZ
);

CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    projeto_id INT REFERENCES projetos(id),
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    prioridade SMALLINT CHECK (prioridade BETWEEN 1 AND 3),
    prazo DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'concluida')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    concluida_em TIMESTAMPTZ
);

CREATE TABLE sessoes_pomodoro (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    tarefa_id INT REFERENCES tarefas(id),
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ,
    tempo_foco_segundos INT,
    tempo_total_segundos INT
);

CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('tempo_foco_horas', 'tarefas_concluidas',
                        'sessoes_pomodoro', 'projetos_concluidos')),
    valor_alvo NUMERIC NOT NULL CHECK (valor_alvo > 0),
    data_limite DATE NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regras que nao aparecem no tipo da coluna e que a aplicacao depende.
-- Ficam no proprio banco para quem abrir o psql sem ler o codigo.
COMMENT ON COLUMN tarefas.projeto_id IS
    'Nulo = tarefa avulsa, sem projeto (HU11).';
COMMENT ON COLUMN tarefas.prioridade IS
    '3 alta, 2 media, 1 baixa; nulo = sem prioridade.';
COMMENT ON COLUMN tarefas.status IS
    'pendente ou concluida; concluida_em acompanha a mudanca.';
COMMENT ON COLUMN projetos.status IS
    'ativo ou concluido; concluido_em acompanha a mudanca.';
COMMENT ON COLUMN sessoes_pomodoro.tarefa_id IS
    'Nulo quando a tarefa foi excluida: a sessao fica, o tempo focado continua valendo.';
COMMENT ON COLUMN sessoes_pomodoro.fim IS
    'Nulo = sessao em andamento. So existe uma aberta por usuario.';
COMMENT ON COLUMN sessoes_pomodoro.tempo_total_segundos IS
    'Enquanto a sessao esta aberta, guarda a duracao escolhida; ao finalizar, vira o tempo decorrido entre inicio e fim.';
COMMENT ON COLUMN sessoes_pomodoro.tempo_foco_segundos IS
    'Tempo efetivamente focado, sem as pausas; limitado ao tempo decorrido.';
COMMENT ON COLUMN metas.tipo IS
    'tempo_foco_horas, tarefas_concluidas, sessoes_pomodoro ou projetos_concluidos.';
COMMENT ON COLUMN metas.valor_alvo IS
    'Alvo na unidade do tipo: horas, tarefas, sessoes ou projetos.';
