from app.db import execute, query, query_one

COLUNAS = "id, usuario_id, tarefa_id, inicio, fim, tempo_foco_segundos, tempo_total_segundos"
# Mesmas colunas com o prefixo da tabela, para a consulta que faz JOIN.
COLUNAS_S = """
    s.id, s.usuario_id, s.tarefa_id, s.inicio, s.fim,
    s.tempo_foco_segundos, s.tempo_total_segundos
"""


def listar(usuario_id):
    return query(
        f"SELECT {COLUNAS} FROM sessoes_pomodoro WHERE usuario_id = %s ORDER BY inicio DESC",
        (usuario_id,),
    )


def buscar(sessao_id, usuario_id):
    return query_one(
        f"SELECT {COLUNAS} FROM sessoes_pomodoro WHERE id = %s AND usuario_id = %s",
        (sessao_id, usuario_id),
    )


def buscar_aberta(usuario_id):
    """Sessao ja iniciada e ainda sem fim, se houver alguma."""
    return query_one(
        f"""
        SELECT {COLUNAS_S}, t.titulo AS tarefa_titulo, t.projeto_id
          FROM sessoes_pomodoro s
          LEFT JOIN tarefas t ON s.tarefa_id = t.id
         WHERE s.usuario_id = %s AND s.fim IS NULL
         ORDER BY s.inicio DESC
         LIMIT 1
        """,
        (usuario_id,),
    )


def criar(usuario_id, tarefa_id, inicio, tempo_total_segundos=None):
    return execute(
        f"""
        INSERT INTO sessoes_pomodoro (usuario_id, tarefa_id, inicio, tempo_total_segundos)
        VALUES (%s, %s, %s, %s)
        RETURNING {COLUNAS}
        """,
        (usuario_id, tarefa_id, inicio, tempo_total_segundos),
    )


def finalizar(sessao_id, usuario_id, fim, tempo_foco_segundos=None):
    """Grava o fim da sessao calculando os tempos a partir de inicio e fim.

    O tempo total e sempre o decorrido. O tempo de foco so vem do cliente
    quando ele informa (sabe das pausas) e fica limitado ao tempo decorrido,
    para nao registrar duracao negativa nem maior que a sessao.
    """
    return execute(
        f"""
        UPDATE sessoes_pomodoro
           SET fim = %(fim)s,
               tempo_total_segundos = GREATEST(
                   EXTRACT(EPOCH FROM (%(fim)s - inicio))::int, 0
               ),
               -- CASE e nao COALESCE: no Postgres GREATEST ignora NULL,
               -- entao GREATEST(NULL, 0) daria 0 em vez de cair no calculado.
               -- O ::int e obrigatorio: sem ele o IS NULL nao infere o tipo.
               tempo_foco_segundos = CASE
                   WHEN %(foco)s::int IS NULL
                       THEN GREATEST(EXTRACT(EPOCH FROM (%(fim)s - inicio))::int, 0)
                   ELSE LEAST(
                       GREATEST(%(foco)s::int, 0),
                       GREATEST(EXTRACT(EPOCH FROM (%(fim)s - inicio))::int, 0)
                   )
               END
         WHERE id = %(id)s AND usuario_id = %(usuario)s
        RETURNING {COLUNAS}
        """,
        {"fim": fim, "foco": tempo_foco_segundos, "id": sessao_id, "usuario": usuario_id},
    )
