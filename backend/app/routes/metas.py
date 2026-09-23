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


def _buscar_ou_404(meta_id):
    meta = repo.buscar(meta_id, g.usuario_id)
    if meta is None:
        raise ApiError("Meta nao encontrada.", 404)
    return meta


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


@bp.get("/metas/<int:meta_id>")
@login_required
def detalhar(meta_id):
    return jsonify(_buscar_ou_404(meta_id))


@bp.put("/metas/<int:meta_id>")
@login_required
def atualizar(meta_id):
    atual = _buscar_ou_404(meta_id)
    dados = corpo()

    tipo = dados.get("tipo", atual["tipo"])
    valor_alvo = dados.get("valor_alvo", atual["valor_alvo"])
    data_limite = dados.get("data_limite", atual["data_limite"])

    if tipo not in TIPOS_VALIDOS:
        raise ApiError("Tipo deve ser: " + " ou ".join(TIPOS_VALIDOS) + ".")
    if valor_alvo is None or valor_alvo <= 0:
        raise ApiError("valor_alvo deve ser maior que zero.")

    meta = repo.atualizar(meta_id, g.usuario_id, tipo, valor_alvo, data_limite)
    return jsonify(meta)


@bp.delete("/metas/<int:meta_id>")
@login_required
def excluir(meta_id):
    if repo.excluir(meta_id, g.usuario_id) is None:
        raise ApiError("Meta nao encontrada.", 404)
    return "", 204
