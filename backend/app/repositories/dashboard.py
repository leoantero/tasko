from app.db import query_one


def resumo_semana(usuario_id):
    """Calcula o resumo do dashboard para a ultima semana.

    A distribuição por projeto fica vazia neste primeiro bloco porque a tabela
    sessoes_pomodoro nao possui relacionamento direto com tarefa/projeto.
    """
    total_horas = query_one(
        """
        SELECT COALESCE(SUM(tempo_foco_segundos), 0) / 3600.0 AS total_horas_foco
        FROM sessoes_pomodoro
        WHERE usuario_id = %s
          AND inicio >= NOW() - INTERVAL '7 days'
        """,
        (usuario_id,),
    )

    sessoes = query_one(
        """
        SELECT COUNT(*) AS numero_sessoes
        FROM sessoes_pomodoro
        WHERE usuario_id = %s
          AND inicio >= NOW() - INTERVAL '7 days'
        """,
        (usuario_id,),
    )

    tarefas = query_one(
        """
        SELECT COUNT(*) AS tarefas_concluidas
        FROM tarefas
        WHERE usuario_id = %s
          AND status = 'concluida'
          AND concluida_em >= NOW() - INTERVAL '7 days'
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

    return {
        "total_horas_foco": float((total_horas or {}).get("total_horas_foco", 0) or 0),
        "numero_sessoes": int((sessoes or {}).get("numero_sessoes", 0) or 0),
        "tarefas_concluidas": int((tarefas or {}).get("tarefas_concluidas", 0) or 0),
        "projetos_ativos": int((projetos or {}).get("projetos_ativos", 0) or 0),
        "distribuicao_por_projeto": [],
    }
