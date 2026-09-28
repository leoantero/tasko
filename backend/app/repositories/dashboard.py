from app.db import query_one, query


def resumo_semana(usuario_id):
    """Calcula o resumo do dashboard dos ultimos 7 dias corridos.

    A janela e sempre CURRENT_DATE - 6 para que o total, a distribuicao por
    projeto e a serie diaria cubram exatamente os mesmos dias e fechem entre si.
    """
    total_horas = query_one(
        """
        SELECT COALESCE(SUM(tempo_foco_segundos), 0) / 3600.0 AS total_horas_foco
        FROM sessoes_pomodoro
        WHERE usuario_id = %s
          AND inicio >= CURRENT_DATE - 6
        """,
        (usuario_id,),
    )

    sessoes = query_one(
        """
        SELECT COUNT(*) AS numero_sessoes
        FROM sessoes_pomodoro
        WHERE usuario_id = %s
          AND inicio >= CURRENT_DATE - 6
        """,
        (usuario_id,),
    )

    tarefas = query_one(
        """
        SELECT COUNT(*) AS tarefas_concluidas
        FROM tarefas
        WHERE usuario_id = %s
          AND status = 'concluida'
          AND concluida_em >= CURRENT_DATE - 6
        """,
        (usuario_id,),
    )

    projetos = query_one(
        """
        SELECT COUNT(*) AS projetos_ativos
        FROM projetos
        WHERE usuario_id = %s AND status = 'ativo'
        """,
        (usuario_id,),
    )

    distribuicao = query(
        """
        -- LEFT JOIN: sessao de tarefa avulsa some com JOIN interno, e o
        -- tempo dela sumiria do grafico sem aparecer em lugar nenhum.
        SELECT
            p.id AS projeto_id,
            COALESCE(p.nome, 'Sem projeto') AS projeto_nome,
            COALESCE(SUM(sp.tempo_foco_segundos), 0)::int AS total_segundos
        FROM sessoes_pomodoro sp
        LEFT JOIN tarefas t ON sp.tarefa_id = t.id
        LEFT JOIN projetos p ON t.projeto_id = p.id
        WHERE sp.usuario_id = %s
          AND sp.inicio >= CURRENT_DATE - 6
        GROUP BY p.id, p.nome
        ORDER BY total_segundos DESC
        """,
        (usuario_id,),
    )

    por_dia = query(
        """
        SELECT dia::date AS dia,
               COALESCE(SUM(sp.tempo_foco_segundos), 0)::int AS total_segundos
        FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, INTERVAL '1 day') AS dia
        LEFT JOIN sessoes_pomodoro sp
               ON sp.usuario_id = %s
              AND sp.inicio >= dia
              AND sp.inicio < dia + INTERVAL '1 day'
        GROUP BY dia
        ORDER BY dia
        """,
        (usuario_id,),
    )

    return {
        "total_horas_foco": float((total_horas or {}).get("total_horas_foco", 0) or 0),
        "numero_sessoes": int((sessoes or {}).get("numero_sessoes", 0) or 0),
        "tarefas_concluidas": int((tarefas or {}).get("tarefas_concluidas", 0) or 0),
        "projetos_ativos": int((projetos or {}).get("projetos_ativos", 0) or 0),
        "distribuicao_por_projeto": distribuicao or [],
        "tempo_por_dia": por_dia or [],
    }
