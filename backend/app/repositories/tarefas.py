from app.db import execute, query, query_one

COLUNAS = """
    id, projeto_id, usuario_id, titulo, descricao, prioridade,
    prazo, status, criado_em, concluida_em
"""

# Maior prioridade primeiro, depois o prazo mais proximo (HU03)
ORDENACAO = """
    ORDER BY prioridade DESC NULLS LAST,
             prazo ASC NULLS LAST,
             criado_em DESC
"""


def listar(usuario_id, projeto_id=None, status=None, prazo_ate=None):
    sql = f"SELECT {COLUNAS} FROM tarefas WHERE usuario_id = %s"
    params = [usuario_id]

    if projeto_id:
        sql += " AND projeto_id = %s"
        params.append(projeto_id)

    if status:
        sql += " AND status = %s"
        params.append(status)

    # prazo_ate inclui as atrasadas, que e o que a tela do dia precisa mostrar
    if prazo_ate:
        sql += " AND prazo <= %s"
        params.append(prazo_ate)

    return query(sql + ORDENACAO, params)


def buscar(tarefa_id, usuario_id):
    return query_one(
        f"SELECT {COLUNAS} FROM tarefas WHERE id = %s AND usuario_id = %s",
        (tarefa_id, usuario_id),
    )


def criar(usuario_id, titulo, projeto_id=None, descricao=None, prioridade=None, prazo=None):
    return execute(
        f"""
        INSERT INTO tarefas
            (usuario_id, titulo, projeto_id, descricao, prioridade, prazo)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING {COLUNAS}
        """,
        (usuario_id, titulo, projeto_id, descricao, prioridade, prazo),
    )


def atualizar(tarefa_id, usuario_id, titulo, projeto_id, descricao, prioridade, prazo, status):
    """Preenche concluida_em automaticamente quando a tarefa e concluida."""
    return execute(
        f"""
        UPDATE tarefas
           SET titulo = %s,
               projeto_id = %s,
               descricao = %s,
               prioridade = %s,
               prazo = %s,
               status = %s,
               concluida_em = CASE
                   WHEN %s = 'concluida' AND concluida_em IS NULL THEN now()
                   WHEN %s <> 'concluida' THEN NULL
                   ELSE concluida_em
               END
         WHERE id = %s AND usuario_id = %s
        RETURNING {COLUNAS}
        """,
        (titulo, projeto_id, descricao, prioridade, prazo, status,
         status, status, tarefa_id, usuario_id),
    )


def excluir(tarefa_id, usuario_id):
    """Solta as sessoes da tarefa antes de apagar, na mesma transacao.

    A sessao nao e apagada junto: o tempo ja focado continua valendo no
    dashboard e no historico, so deixa de apontar para a tarefa.
    """
    return execute(
        """
        WITH soltas AS (
            UPDATE sessoes_pomodoro SET tarefa_id = NULL
             WHERE tarefa_id = %(id)s AND usuario_id = %(usuario)s
        )
        DELETE FROM tarefas
         WHERE id = %(id)s AND usuario_id = %(usuario)s
        RETURNING id
        """,
        {"id": tarefa_id, "usuario": usuario_id},
    )
