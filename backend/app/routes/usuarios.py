from flask import Blueprint, g, jsonify, request

from app.auth import gerar_hash, gerar_token, login_required, senha_confere
from app.errors import ApiError
from app.repositories import usuarios as repo

bp = Blueprint("usuarios", __name__)


def _exigir(dados, *campos):
    for campo in campos:
        if not dados.get(campo):
            raise ApiError(f"O campo {campo} e obrigatorio.")


@bp.post("/usuarios")
def cadastrar():
    dados = request.get_json(silent=True) or {}
    _exigir(dados, "nome", "email", "senha")

    usuario = repo.criar(
        dados["nome"].strip(),
        dados["email"].strip().lower(),
        gerar_hash(dados["senha"]),
    )
    return jsonify(usuario), 201


@bp.post("/login")
def login():
    dados = request.get_json(silent=True) or {}
    _exigir(dados, "email", "senha")

    usuario = repo.buscar_por_email(dados["email"].strip().lower())
    if not usuario or not senha_confere(dados["senha"], usuario["senha_hash"]):
        raise ApiError("Email ou senha invalidos.", 401)

    return jsonify(token=gerar_token(usuario["id"]))


@bp.get("/perfil")
@login_required
def perfil():
    return jsonify(repo.buscar_por_id(g.usuario_id))
