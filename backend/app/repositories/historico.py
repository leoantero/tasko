from app.db import query

# Uma linha por evento concluido, com o mesmo formato para os tres tipos.
# tempo_foco_segundos so existe em sessao; projeto_id situa tarefa e sessao.
EVENTOS = """
    SELECT 'sessao' AS tipo,
           s.id,
           COALESCE(t.titulo, 'Sessao sem tarefa') AS titulo,
           s.fim AS terminado_em,
           s.tempo_foco_segundos,
           t.projeto_id
      FROM sessoes_pomodoro s
      LEFT JOIN tarefas t ON s.tarefa_id = t.id
     WHERE s.usuario_id = %(usuario)s AND s.fim IS NOT NULL

     UNION ALL

    SELECT 'tarefa', t.id, t.titulo, t.concluida_em, NULL::int, t.projeto_id
      FROM tarefas t
     WHERE t.usuario_id = %(usuario)s AND t.concluida_em IS NOT NULL

     UNION ALL

    SELECT 'projeto', p.id, p.nome, p.concluido_em, NULL::int, p.id
      FROM projetos p
     WHERE p.usuario_id = %(usuario)s AND p.concluido_em IS NOT NULL
"""


def listar(usuario_id, tipo=None, desde=None, ate=None, limite=50):
    """Historico unificado, do termino mais recente para o mais antigo.

    Os ::tipo nos parametros opcionais sao obrigatorios: sem eles o Postgres
    nao consegue inferir o tipo do parametro dentro do IS NULL.
    """
    return query(
        f"""
        SELECT * FROM ({EVENTOS}) AS h
         WHERE (%(tipo)s::text IS NULL OR h.tipo = %(tipo)s)
           AND (%(desde)s::date IS NULL OR h.terminado_em >= %(desde)s::date)
           AND (%(ate)s::date IS NULL OR h.terminado_em < %(ate)s::date + 1)
         ORDER BY h.terminado_em DESC
         LIMIT %(limite)s
        """,
        {
            "usuario": usuario_id,
            "tipo": tipo,
            "desde": desde,
            "ate": ate,
            "limite": limite,
        },
    )
