from flask import Blueprint, g, jsonify

from app.auth import login_required

bp = Blueprint("pomodoro", __name__)


@bp.post("/sessoes-pomodoro/iniciar")
@login_required
def iniciar():
    """Contrato inicial da API de Pomodoro da HU04."""
    return jsonify({
        "id": None,
        "usuario_id": g.usuario_id,
        "tarefa_id": None,
        "inicio": None,
        "fim": None,
        "tempo_foco_segundos": 0,
        "tempo_total_segundos": 0,
    }), 201


@bp.post("/sessoes-pomodoro/finalizar")
@login_required
def finalizar():
    """Contrato inicial da API de finalizacao da sessao Pomodoro."""
    return jsonify({
        "id": None,
        "usuario_id": g.usuario_id,
        "tarefa_id": None,
        "inicio": None,
        "fim": None,
        "tempo_foco_segundos": 0,
        "tempo_total_segundos": 0,
    })


@bp.get("/sessoes-pomodoro")
@login_required
def listar():
    return jsonify([])
