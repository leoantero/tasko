from flask import Blueprint, g, jsonify, request

from app.auth import login_required
from app.errors import ApiError
from app.repositories import historico as repo

bp = Blueprint("historico", __name__)

TIPOS_VALIDOS = ("sessao", "tarefa", "projeto")
LIMITE_MAXIMO = 200


@bp.get("/historico")
@login_required
def listar():
    """Sessoes finalizadas, tarefas e projetos concluidos, por termino (HU07)."""
    tipo = request.args.get("tipo")
    if tipo and tipo not in TIPOS_VALIDOS:
        raise ApiError(f"Tipo deve ser: {', '.join(TIPOS_VALIDOS)}.")

    limite = request.args.get("limite", default=50, type=int)
    if not 1 <= limite <= LIMITE_MAXIMO:
        raise ApiError(f"Limite deve ser de 1 a {LIMITE_MAXIMO}.")

    return jsonify(
        repo.listar(
            g.usuario_id,
            tipo,
            request.args.get("desde"),
            request.args.get("ate"),
            limite,
        )
    )
