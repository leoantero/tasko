from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, g, request
from werkzeug.security import check_password_hash, generate_password_hash

from app.errors import ApiError

EXPIRACAO_HORAS = 24

# scrypt (padrao do Werkzeug) nao existe em todo build do Python
METODO_HASH = "pbkdf2:sha256"


def gerar_hash(senha):
    return generate_password_hash(senha, method=METODO_HASH)


def senha_confere(senha, senha_hash):
    return check_password_hash(senha_hash, senha)


def gerar_token(usuario_id):
    payload = {
        "sub": str(usuario_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRACAO_HORAS),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def _usuario_do_token():
    """Le o header Authorization: Bearer <token> e devolve o id do usuario."""
    cabecalho = request.headers.get("Authorization", "")
    if not cabecalho.startswith("Bearer "):
        raise ApiError("Token nao enviado.", 401)

    try:
        payload = jwt.decode(
            cabecalho.removeprefix("Bearer "),
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"],
        )
    except jwt.ExpiredSignatureError:
        raise ApiError("Token expirado.", 401)
    except jwt.InvalidTokenError:
        raise ApiError("Token invalido.", 401)

    return int(payload["sub"])


def login_required(rota):
    """Protege a rota e deixa o id do usuario logado em g.usuario_id."""

    @wraps(rota)
    def wrapper(*args, **kwargs):
        g.usuario_id = _usuario_do_token()
        return rota(*args, **kwargs)

    return wrapper
