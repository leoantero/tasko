from flask import Blueprint, g, jsonify

from app.auth import login_required
from app.repositories import dashboard as repo

bp = Blueprint("dashboard", __name__)


@bp.get("/dashboard/resumo")
@login_required
def resumo():
    """Resumo semanal de produtividade do usuario logado."""
    return jsonify(repo.resumo_semana(g.usuario_id))
