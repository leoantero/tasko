from flask import Blueprint, g, jsonify

from app.auth import login_required
from app.errors import ApiError
from app.repositories import metas as repo
from app.validacao import corpo, exigir

bp = Blueprint("metas", __name__)

TIPOS_VALIDOS = (
    "tempo_foco_horas",
    "tarefas_concluidas",
    "sessoes_pomodoro",
    "projetos_concluidos",
)


@bp.get("/metas")
@login_required
def listar():
    return jsonify(repo.listar(g.usuario_id))


@bp.post("/metas")
@login_required
def criar():
    dados = corpo()
    exigir(dados, "tipo", "valor_alvo", "data_limite")

    tipo = dados["tipo"]
    valor_alvo = dados["valor_alvo"]
    if tipo not in TIPOS_VALIDOS:
        raise ApiError("Tipo deve ser: " + " ou ".join(TIPOS_VALIDOS) + ".")
    if valor_alvo is None or valor_alvo <= 0:
        raise ApiError("valor_alvo deve ser maior que zero.")

    meta = repo.criar(
        g.usuario_id,
        tipo,
        valor_alvo,
        dados["data_limite"],
    )
    return jsonify(meta), 201
