from app.db import execute, query, query_one

COLUNAS = "id, usuario_id, tipo, valor_alvo, data_limite, criado_em"


def listar(usuario_id):
    return query(
        f"SELECT {COLUNAS} FROM metas WHERE usuario_id = %s ORDER BY criado_em DESC",
        (usuario_id,),
    )


def buscar(meta_id, usuario_id):
    return query_one(
        f"SELECT {COLUNAS} FROM metas WHERE id = %s AND usuario_id = %s",
        (meta_id, usuario_id),
    )


def criar(usuario_id, tipo, valor_alvo, data_limite):
    return execute(
        f"""
        INSERT INTO metas (usuario_id, tipo, valor_alvo, data_limite)
        VALUES (%s, %s, %s, %s)
        RETURNING {COLUNAS}
        """,
        (usuario_id, tipo, valor_alvo, data_limite),
    )


def atualizar(meta_id, usuario_id, tipo, valor_alvo, data_limite):
    return execute(
        f"""
        UPDATE metas
           SET tipo = %s,
               valor_alvo = %s,
               data_limite = %s
         WHERE id = %s AND usuario_id = %s
        RETURNING {COLUNAS}
        """,
        (tipo, valor_alvo, data_limite, meta_id, usuario_id),
    )


def excluir(meta_id, usuario_id):
    return execute(
        "DELETE FROM metas WHERE id = %s AND usuario_id = %s RETURNING id",
        (meta_id, usuario_id),
    )
