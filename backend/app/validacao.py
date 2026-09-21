from flask import request

from app.errors import ApiError


def corpo():
    """JSON do corpo da requisicao, ou dicionario vazio se nao houver."""
    return request.get_json(silent=True) or {}


def exigir(dados, *campos):
    for campo in campos:
        if not dados.get(campo):
            raise ApiError(f"O campo {campo} e obrigatorio.")
