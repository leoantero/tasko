from app.db import execute, query_one


def criar(nome, email, senha_hash):
    return execute(
        """
        INSERT INTO usuarios (nome, email, senha_hash)
        VALUES (%s, %s, %s)
        RETURNING id, nome, email, criado_em
        """,
        (nome, email, senha_hash),
    )


def buscar_por_email(email):
    """Inclui o senha_hash porque e usado na conferencia do login."""
    return query_one(
        "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = %s",
        (email,),
    )


def buscar_por_id(usuario_id):
    return query_one(
        "SELECT id, nome, email, criado_em FROM usuarios WHERE id = %s",
        (usuario_id,),
    )
