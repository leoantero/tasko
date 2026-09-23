from datetime import datetime, timezone

from flask import Blueprint, g, jsonify

from app.auth import login_required
from app.errors import ApiError
from app.repositories import pomodoro as repo
from app.repositories import tarefas as repo_tarefas
from app.validacao import corpo, exigir

bp = Blueprint("pomodoro", __name__)


def _buscar_ou_404(sessao_id):
    sessao = repo.buscar(sessao_id, g.usuario_id)
    if sessao is None:
        raise ApiError("Sessao nao encontrada.", 404)
    return sessao


@bp.post("/sessoes-pomodoro/iniciar")
@login_required
def iniciar():
    dados = corpo()
    exigir(dados, "tarefa_id")

    tarefa = repo_tarefas.buscar(dados["tarefa_id"], g.usuario_id)
    if tarefa is None:
        raise ApiError("Tarefa nao encontrada.", 404)

    sessao = repo.criar(
        g.usuario_id,
        dados["tarefa_id"],
        datetime.now(timezone.utc),
        dados.get("tempo_total_segundos"),
    )
    return jsonify(sessao), 201


@bp.post("/sessoes-pomodoro/finalizar")
@login_required
def finalizar():
    dados = corpo()
    exigir(dados, "sessao_id")

    sessao = _buscar_ou_404(dados["sessao_id"])
    if sessao["fim"] is not None:
        raise ApiError("Sessao ja finalizada.", 400)

    sessao_finalizada = repo.finalizar(
        dados["sessao_id"],
        g.usuario_id,
        dados.get("fim") or datetime.now(timezone.utc),
        dados.get("tempo_foco_segundos", 0),
        dados.get("tempo_total_segundos", sessao.get("tempo_total_segundos") or 0),
    )
    return jsonify(sessao_finalizada)


@bp.get("/sessoes-pomodoro")
@login_required
def listar():
    return jsonify(repo.listar(g.usuario_id))


@bp.get("/sessoes-pomodoro/<int:sessao_id>")
@login_required
def detalhar(sessao_id):
    return jsonify(_buscar_ou_404(sessao_id))
