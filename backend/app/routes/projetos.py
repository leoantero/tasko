from flask import Blueprint, g, jsonify, request
from psycopg import errors as pg_errors

from app.auth import login_required
from app.errors import ApiError
from app.repositories import projetos as repo
from app.validacao import corpo, exigir

bp = Blueprint("projetos", __name__)

STATUS_VALIDOS = ("ativo", "concluido")


def _buscar_ou_404(projeto_id):
    projeto = repo.buscar(projeto_id, g.usuario_id)
    if projeto is None:
        raise ApiError("Projeto nao encontrado.", 404)
    return projeto


@bp.get("/projetos")
@login_required
def listar():
    return jsonify(repo.listar(g.usuario_id, request.args.get("status")))


@bp.post("/projetos")
@login_required
def criar():
    dados = corpo()
    exigir(dados, "nome")

    projeto = repo.criar(
        g.usuario_id,
        dados["nome"].strip(),
        dados.get("categoria"),
        dados.get("descricao"),
        dados.get("prazo"),
    )
    return jsonify(projeto), 201


@bp.get("/projetos/<int:projeto_id>")
@login_required
def detalhar(projeto_id):
    return jsonify(_buscar_ou_404(projeto_id))


@bp.put("/projetos/<int:projeto_id>")
@login_required
def atualizar(projeto_id):
    atual = _buscar_ou_404(projeto_id)
    dados = corpo()

    status = dados.get("status", atual["status"])
    if status not in STATUS_VALIDOS:
        raise ApiError(f"Status deve ser: {' ou '.join(STATUS_VALIDOS)}.")

    return jsonify(
        repo.atualizar(
            projeto_id,
            g.usuario_id,
            dados.get("nome", atual["nome"]),
            dados.get("categoria", atual["categoria"]),
            dados.get("descricao", atual["descricao"]),
            dados.get("prazo", atual["prazo"]),
            status,
        )
    )


@bp.delete("/projetos/<int:projeto_id>")
@login_required
def excluir(projeto_id):
    try:
        removido = repo.excluir(projeto_id, g.usuario_id)
    except pg_errors.ForeignKeyViolation:
        raise ApiError("Exclua as tarefas do projeto antes de exclui-lo.", 409)

    if removido is None:
        raise ApiError("Projeto nao encontrado.", 404)
    return "", 204
