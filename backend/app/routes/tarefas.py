from flask import Blueprint, g, jsonify, request

from app.auth import login_required
from app.errors import ApiError
from psycopg import errors as pg_errors
from app.repositories import projetos as repo_projetos
from app.repositories import tarefas as repo
from app.validacao import corpo, data, exigir, inteiro, texto

bp = Blueprint("tarefas", __name__)

STATUS_VALIDOS = ("pendente", "concluida")
PRIORIDADES = (1, 2, 3)

def _buscar_ou_404(tarefa_id):
    tarefa = repo.buscar(tarefa_id, g.usuario_id)
    if tarefa is None:
        raise ApiError("Tarefa nao encontrada.", 404)
    return tarefa


def _validar(projeto_id, prioridade, status):
    # Sem esta checagem daria para vincular a tarefa a projeto de outro usuario
    if projeto_id and repo_projetos.buscar(projeto_id, g.usuario_id) is None:
        raise ApiError("Projeto nao encontrado.", 404)
    if prioridade is not None and prioridade not in PRIORIDADES:
        raise ApiError("Prioridade deve ser 1, 2 ou 3.")
    if status not in STATUS_VALIDOS:
        raise ApiError(f"Status deve ser: {' ou '.join(STATUS_VALIDOS)}.")


@bp.get("/tarefas")
@login_required
def listar():
    projeto_id = request.args.get("projeto_id", type=int)
    status = request.args.get("status")
    prazo_ate = request.args.get("prazo_ate")
    return jsonify(repo.listar(g.usuario_id, projeto_id, status, prazo_ate))


@bp.post("/tarefas")
@login_required
def criar():
    dados = corpo()
    exigir(dados, "titulo")

    projeto_id = inteiro(dados.get("projeto_id"), "projeto_id")
    prioridade = inteiro(dados.get("prioridade"), "prioridade")
    _validar(projeto_id, prioridade, "pendente")

    tarefa = repo.criar(
        g.usuario_id,
        texto(dados["titulo"], "titulo"),
        projeto_id,
        dados.get("descricao"),
        prioridade,
        data(dados.get("prazo"), "prazo"),
    )
    return jsonify(tarefa), 201


@bp.get("/tarefas/<int:tarefa_id>")
@login_required
def detalhar(tarefa_id):
    return jsonify(_buscar_ou_404(tarefa_id))


@bp.put("/tarefas/<int:tarefa_id>")
@login_required
def atualizar(tarefa_id):
    atual = _buscar_ou_404(tarefa_id)
    dados = corpo()

    projeto_id = inteiro(dados.get("projeto_id", atual["projeto_id"]), "projeto_id")
    prioridade = inteiro(dados.get("prioridade", atual["prioridade"]), "prioridade")
    status = dados.get("status", atual["status"])
    _validar(projeto_id, prioridade, status)

    tarefa = repo.atualizar(
        tarefa_id,
        g.usuario_id,
        dados.get("titulo", atual["titulo"]),
        projeto_id,
        dados.get("descricao", atual["descricao"]),
        prioridade,
        data(dados.get("prazo", atual["prazo"]), "prazo"),
        status,
    )
    return jsonify(tarefa)


@bp.delete("/tarefas/<int:tarefa_id>")
@login_required
def excluir(tarefa_id):
    try:
        if repo.excluir(tarefa_id, g.usuario_id) is None:
            raise ApiError("Tarefa nao encontrada.", 404)
    except pg_errors.ForeignKeyViolation:
        raise ApiError("Esta tarefa possui Pomodoros. Apague-os primeiro.", 409)
    return "", 204
