from app.db import execute, query, query_one

COLUNAS = """
    id, usuario_id, nome, categoria, descricao, prazo,
    status, criado_em, concluido_em
"""


def listar(usuario_id, status=None):
    sql = f"SELECT {COLUNAS} FROM projetos WHERE usuario_id = %s"
    params = [usuario_id]

    if status:
        sql += " AND status = %s"
        params.append(status)

    return query(sql + " ORDER BY criado_em DESC", params)


def buscar(projeto_id, usuario_id):
    """O usuario_id no WHERE impede acessar projeto de outro usuario."""
    return query_one(
        f"SELECT {COLUNAS} FROM projetos WHERE id = %s AND usuario_id = %s",
        (projeto_id, usuario_id),
    )


def criar(usuario_id, nome, categoria=None, descricao=None, prazo=None):
    return execute(
        f"""
        INSERT INTO projetos (usuario_id, nome, categoria, descricao, prazo)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING {COLUNAS}
        """,
        (usuario_id, nome, categoria, descricao, prazo),
    )


def atualizar(projeto_id, usuario_id, nome, categoria, descricao, prazo, status):
    """Preenche concluido_em automaticamente quando o projeto e concluido."""
    return execute(
        f"""
        UPDATE projetos
           SET nome = %s,
               categoria = %s,
               descricao = %s,
               prazo = %s,
               status = %s,
               concluido_em = CASE
                   WHEN %s = 'concluido' AND concluido_em IS NULL THEN now()
                   WHEN %s <> 'concluido' THEN NULL
                   ELSE concluido_em
               END
         WHERE id = %s AND usuario_id = %s
        RETURNING {COLUNAS}
        """,
        (nome, categoria, descricao, prazo, status, status, status, projeto_id, usuario_id),
    )


def excluir(projeto_id, usuario_id):
    """Solta as tarefas do projeto antes de apaga-lo, na mesma transacao.

    A tarefa vira avulsa (HU11) em vez de ser apagada junto: o historico de
    foco dela continua valendo e a pessoa nao perde trabalho registrado.
    """
    return execute(
        """
        WITH soltas AS (
            UPDATE tarefas SET projeto_id = NULL
             WHERE projeto_id = %(id)s AND usuario_id = %(usuario)s
        )
        DELETE FROM projetos
         WHERE id = %(id)s AND usuario_id = %(usuario)s
        RETURNING id
        """,
        {"id": projeto_id, "usuario": usuario_id},
    )
