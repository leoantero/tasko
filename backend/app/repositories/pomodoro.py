from app.db import execute, query, query_one

COLUNAS = "id, usuario_id, tarefa_id, inicio, fim, tempo_foco_segundos, tempo_total_segundos"


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


def criar(usuario_id, tarefa_id, inicio, tempo_total_segundos=None):
    return execute(
        f"""
        INSERT INTO sessoes_pomodoro (usuario_id, tarefa_id, inicio, tempo_total_segundos)
        VALUES (%s, %s, %s, %s)
        RETURNING {COLUNAS}
        """,
        (usuario_id, tarefa_id, inicio, tempo_total_segundos),
    )


def finalizar(sessao_id, usuario_id, fim, tempo_foco_segundos, tempo_total_segundos):
    return execute(
        f"""
        UPDATE sessoes_pomodoro
           SET fim = %s,
               tempo_foco_segundos = %s,
               tempo_total_segundos = %s
         WHERE id = %s AND usuario_id = %s
        RETURNING {COLUNAS}
        """,
        (fim, tempo_foco_segundos, tempo_total_segundos, sessao_id, usuario_id),
    )
