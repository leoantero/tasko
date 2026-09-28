import logging
import time

from flask import g, request

FORMATO = "%(asctime)s %(levelname)s %(message)s"


def registrar_log(app):
    """Uma linha por requisicao, com metodo, rota, status, tempo e usuario.

    O log padrao do Flask so mostra metodo, caminho e status; sem duracao
    e sem usuario nao da para saber qual consulta esta lenta nem de quem.
    """
    logging.basicConfig(level=logging.INFO, format=FORMATO)

    @app.before_request
    def _inicio():
        g.inicio_requisicao = time.perf_counter()

    @app.after_request
    def _fim(resposta):
        inicio = g.pop("inicio_requisicao", None)
        if inicio is None:
            return resposta

        app.logger.info(
            "%s %s %s %dms usuario=%s",
            request.method,
            request.path,
            resposta.status_code,
            (time.perf_counter() - inicio) * 1000,
            g.get("usuario_id", "-"),
        )
        return resposta
