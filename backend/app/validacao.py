import re
from datetime import date, datetime

from flask import request

from app.errors import ApiError


def corpo():
    """JSON do corpo da requisicao, ou dicionario vazio se nao houver."""
    return request.get_json(silent=True) or {}


def exigir(dados, *campos):
    for campo in campos:
        if not dados.get(campo):
            raise ApiError(f"O campo {campo} e obrigatorio.")


def data(valor, campo):
    """Converte AAAA-MM-DD em date.

    Sem isso o texto invalido chega ao banco e o psycopg levanta DataError,
    que o handler generico transforma em 500 para um erro que e do cliente.
    """
    if valor in (None, ""):
        return None
    if isinstance(valor, date):
        return valor

    try:
        return datetime.strptime(str(valor), "%Y-%m-%d").date()
    except ValueError:
        raise ApiError(f"O campo {campo} deve estar no formato AAAA-MM-DD.")


def inteiro(valor, campo):
    """Converte para int, com 400 em vez do erro de tipo no banco."""
    if valor in (None, ""):
        return None
    if isinstance(valor, bool):
        raise ApiError(f"O campo {campo} deve ser um numero inteiro.")

    try:
        return int(valor)
    except (TypeError, ValueError):
        raise ApiError(f"O campo {campo} deve ser um numero inteiro.")


# Formato minimo: algo@algo.dominio, sem espaco. Validacao de verdade so
# com email de confirmacao, que esta fora do escopo do TP.
FORMATO_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def email(valor, campo="email"):
    """Normaliza o email em minusculas e recusa formato invalido."""
    limpo = str(valor or "").strip().lower()
    if not FORMATO_EMAIL.match(limpo):
        raise ApiError(f"O campo {campo} deve ser um email valido.")
    return limpo
