from flask import Blueprint, g, jsonify

from app.auth import login_required
from app.errors import ApiError
from app.repositories import metas as repo
from app.validacao import corpo, data, exigir

bp = Blueprint("metas", __name__)

TIPOS_VALIDOS = (
    "tempo_foco_horas",
    "tarefas_concluidas",
    "sessoes_pomodoro",
    "projetos_concluidos",
)

MSG_VALOR = "valor_alvo deve ser um numero maior que zero."


def _validar(tipo, valor_alvo):
    """Confere tipo e devolve o valor_alvo ja como numero.

    Sem a conversao, um valor_alvo em texto (o que todo <input> envia por
    padrao) chegava na comparacao "10" <= 0 e derrubava a rota com 500.
    """
    if tipo not in TIPOS_VALIDOS:
        raise ApiError("Tipo deve ser: " + " ou ".join(TIPOS_VALIDOS) + ".")

    if isinstance(valor_alvo, bool):
        raise ApiError(MSG_VALOR)
    try:
        valor = float(valor_alvo)
    except (TypeError, ValueError):
        raise ApiError(MSG_VALOR)

    if valor <= 0:
        raise ApiError(MSG_VALOR)
    return valor


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

    valor_alvo = _validar(dados["tipo"], dados["valor_alvo"])

    meta = repo.criar(
        g.usuario_id,
        dados["tipo"],
        valor_alvo,
        data(dados["data_limite"], "data_limite"),
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
    data_limite = data(dados.get("data_limite", atual["data_limite"]), "data_limite")

    meta = repo.atualizar(
        meta_id, g.usuario_id, tipo, _validar(tipo, valor_alvo), data_limite
    )
    return jsonify(meta)


@bp.delete("/metas/<int:meta_id>")
@login_required
def excluir(meta_id):
    if repo.excluir(meta_id, g.usuario_id) is None:
        raise ApiError("Meta nao encontrada.", 404)
    return "", 204
