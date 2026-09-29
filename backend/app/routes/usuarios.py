from flask import Blueprint, g, jsonify
from psycopg import errors as pg_errors

from app.auth import gerar_hash, gerar_token, login_required, senha_confere
from app.errors import ApiError
from app.limite import conferir_limite, limpar_falhas, registrar_falha
from app.repositories import usuarios as repo
from app.validacao import corpo, email, exigir, texto

bp = Blueprint("usuarios", __name__)

SENHA_MINIMA = 8
NOME_MAXIMO = 120  # VARCHAR(120) em usuarios.nome


@bp.post("/usuarios")
def cadastrar():
    dados = corpo()
    exigir(dados, "nome", "email", "senha")

    if len(dados["senha"]) < SENHA_MINIMA:
        raise ApiError(f"A senha deve ter ao menos {SENHA_MINIMA} caracteres.")

    try:
        usuario = repo.criar(
            texto(dados["nome"], "nome", NOME_MAXIMO),
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
    conferir_limite(chave)

    usuario = repo.buscar_por_email(chave)
    if not usuario or not senha_confere(dados["senha"], usuario["senha_hash"]):
        registrar_falha(chave)
        raise ApiError("Email ou senha invalidos.", 401)

    limpar_falhas(chave)
    return jsonify(token=gerar_token(usuario["id"]))


@bp.post("/renovar")
@login_required
def renovar():
    """Troca um token ainda valido por outro, sem pedir a senha de novo."""
    return jsonify(token=gerar_token(g.usuario_id))


@bp.get("/perfil")
@login_required
def perfil():
    """Token assinado nao garante conta viva: ela pode ter sido apagada."""
    usuario = repo.buscar_por_id(g.usuario_id)
    if usuario is None:
        raise ApiError("Conta nao encontrada.", 401)

    return jsonify(usuario)
