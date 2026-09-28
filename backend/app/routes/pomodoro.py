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

    # Uma sessao por vez: com duas abertas, o tempo de foco de uma delas
    # seria contado em dobro no dashboard.
    if repo.buscar_aberta(g.usuario_id) is not None:
        raise ApiError("Ja existe uma sessao em andamento.", 409)

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

    # O fim e sempre do servidor: a HU05 pede registro automatico, e aceitar
    # o horario do cliente permitia gravar sessao terminando antes de comecar.
    sessao_finalizada = repo.finalizar(
        dados["sessao_id"],
        g.usuario_id,
        datetime.now(timezone.utc),
        dados.get("tempo_foco_segundos"),
    )
    return jsonify(sessao_finalizada)


@bp.get("/sessoes-pomodoro")
@login_required
def listar():
    return jsonify(repo.listar(g.usuario_id))


@bp.get("/sessoes-pomodoro/atual")
@login_required
def atual():
    """Sessao em andamento, ou null. Usada ao abrir o app (HU10)."""
    return jsonify(repo.buscar_aberta(g.usuario_id))


@bp.get("/sessoes-pomodoro/<int:sessao_id>")
@login_required
def detalhar(sessao_id):
    return jsonify(_buscar_ou_404(sessao_id))
