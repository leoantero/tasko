from time import monotonic

from app.errors import ApiError

TENTATIVAS_MAXIMAS = 5
JANELA_SEGUNDOS = 15 * 60

# Memoria do processo: reinicio zera e cada worker do gunicorn tem a sua.
# Serve contra forca bruta simples; contra ataque distribuido so com Redis
# ou equivalente, que esta fora do escopo do TP.
_falhas = {}


def _recentes(chave, agora):
    return [t for t in _falhas.get(chave, []) if agora - t < JANELA_SEGUNDOS]


def conferir(chave):
    """Recusa novas tentativas quando o limite da janela foi atingido."""
    agora = monotonic()
    tentativas = _recentes(chave, agora)
    _falhas[chave] = tentativas

    if len(tentativas) >= TENTATIVAS_MAXIMAS:
        minutos = int((JANELA_SEGUNDOS - (agora - tentativas[0])) / 60) + 1
        raise ApiError(
            f"Muitas tentativas de login. Tente novamente em {minutos} min.", 429
        )


def registrar_falha(chave):
    agora = monotonic()
    _falhas[chave] = _recentes(chave, agora) + [agora]


def limpar(chave):
    _falhas.pop(chave, None)
