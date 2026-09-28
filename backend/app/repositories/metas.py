from app.db import execute, query, query_one

# valor_alvo e NUMERIC: sem o ::float o Flask serializa o Decimal como
# string ("10") e o front recebe texto onde espera numero.
COLUNAS = """
    id, usuario_id, tipo, valor_alvo::float AS valor_alvo,
    data_limite, criado_em
"""

# Quanto ja foi feito para cada tipo de meta, contando o que aconteceu
# entre a criacao e a data limite: passado o prazo, o progresso congela.
PROGRESSO = """
    CASE m.tipo
        WHEN 'tempo_foco_horas' THEN (
            SELECT COALESCE(SUM(s.tempo_foco_segundos), 0) / 3600.0
              FROM sessoes_pomodoro s
             WHERE s.usuario_id = m.usuario_id
               AND s.fim >= m.criado_em AND s.fim < m.data_limite + 1
        )
        WHEN 'sessoes_pomodoro' THEN (
            SELECT COUNT(*) FROM sessoes_pomodoro s
             WHERE s.usuario_id = m.usuario_id
               AND s.fim >= m.criado_em AND s.fim < m.data_limite + 1
        )
        WHEN 'tarefas_concluidas' THEN (
            SELECT COUNT(*) FROM tarefas t
             WHERE t.usuario_id = m.usuario_id
               AND t.concluida_em >= m.criado_em
               AND t.concluida_em < m.data_limite + 1
        )
        WHEN 'projetos_concluidos' THEN (
            SELECT COUNT(*) FROM projetos p
             WHERE p.usuario_id = m.usuario_id
               AND p.concluido_em >= m.criado_em
               AND p.concluido_em < m.data_limite + 1
        )
    END::float AS progresso
"""


def listar(usuario_id):
    return query(
        f"""
        SELECT {COLUNAS}, {PROGRESSO}
          FROM metas m
         WHERE m.usuario_id = %s
         ORDER BY m.criado_em DESC
        """,
        (usuario_id,),
    )


def buscar(meta_id, usuario_id):
    return query_one(
        f"SELECT {COLUNAS}, {PROGRESSO} FROM metas m WHERE m.id = %s AND m.usuario_id = %s",
        (meta_id, usuario_id),
    )


def criar(usuario_id, tipo, valor_alvo, data_limite):
    return execute(
        f"""
        INSERT INTO metas AS m (usuario_id, tipo, valor_alvo, data_limite)
        VALUES (%s, %s, %s, %s)
        RETURNING {COLUNAS}, {PROGRESSO}
        """,
        (usuario_id, tipo, valor_alvo, data_limite),
    )


def atualizar(meta_id, usuario_id, tipo, valor_alvo, data_limite):
    return execute(
        f"""
        UPDATE metas AS m
           SET tipo = %s,
               valor_alvo = %s,
               data_limite = %s
         WHERE m.id = %s AND m.usuario_id = %s
        RETURNING {COLUNAS}, {PROGRESSO}
        """,
        (tipo, valor_alvo, data_limite, meta_id, usuario_id),
    )


def excluir(meta_id, usuario_id):
    return execute(
        "DELETE FROM metas WHERE id = %s AND usuario_id = %s RETURNING id",
        (meta_id, usuario_id),
    )
