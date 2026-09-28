from flask import Blueprint, g, jsonify
from psycopg import errors as pg_errors

from app.auth import gerar_hash, gerar_token, login_required, senha_confere
from app.errors import ApiError
from app import limite
from app.repositories import usuarios as repo
from app.validacao import corpo, email, exigir

bp = Blueprint("usuarios", __name__)

SENHA_MINIMA = 8


@bp.post("/usuarios")
def cadastrar():
    dados = corpo()
    exigir(dados, "nome", "email", "senha")

    if len(dados["senha"]) < SENHA_MINIMA:
        raise ApiError(f"A senha deve ter ao menos {SENHA_MINIMA} caracteres.")

    try:
        usuario = repo.criar(
            dados["nome"].strip(),
            email(dados["email"]),
            gerar_hash(dados["senha"]),
        )
    except pg_errors.UniqueViolation:
        raise ApiError("Este email ja esta cadastrado.", 409)

    return jsonify(usuario), 201


@bp.post("/login")
def login():
    dados = corpo()
    exigir(dados, "email", "senha")

    chave = dados["email"].strip().lower()
    limite.conferir(chave)

    usuario = repo.buscar_por_email(chave)
    if not usuario or not senha_confere(dados["senha"], usuario["senha_hash"]):
        limite.registrar_falha(chave)
        raise ApiError("Email ou senha invalidos.", 401)

    limite.limpar(chave)
    return jsonify(token=gerar_token(usuario["id"]))


@bp.get("/perfil")
@login_required
def perfil():
    return jsonify(repo.buscar_por_id(g.usuario_id))
