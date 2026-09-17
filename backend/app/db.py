from contextlib import contextmanager

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.config import Config

_pool = None


def get_pool():
    """Devolve o pool de conexoes, criando-o na primeira chamada."""
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            conninfo=Config.DATABASE_URL,
            min_size=1,
            max_size=10,
            open=True,
        )
    return _pool


@contextmanager
def get_cursor():
    """Abre um cursor que devolve dicionarios e faz commit ao final.

    Em caso de excecao a transacao e desfeita pelo proprio psycopg.
    """
    with get_pool().connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            yield cur


def query(sql, params=None):
    """Executa um SELECT e devolve todas as linhas."""
    with get_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def query_one(sql, params=None):
    """Executa um SELECT e devolve a primeira linha ou None."""
    with get_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchone()


def execute(sql, params=None):
    """Executa INSERT/UPDATE/DELETE.

    Devolve a linha do RETURNING quando houver, senao None.
    """
    with get_cursor() as cur:
        cur.execute(sql, params)
        if cur.description is None:
            return None
        return cur.fetchone()
