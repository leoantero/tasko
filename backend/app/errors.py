import psycopg
from flask import jsonify
from psycopg import errors as pg_errors
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Erro previsto da aplicacao, convertido em resposta JSON.

    Uso nas rotas: raise ApiError("Projeto nao encontrado.", 404)
    """

    def __init__(self, mensagem, status=400):
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.status = status


def register_error_handlers(app):
    """Faz toda a API responder erro em JSON, nunca em HTML."""

    @app.errorhandler(ApiError)
    def _api_error(erro):
        return jsonify(erro=erro.mensagem), erro.status

    @app.errorhandler(pg_errors.UniqueViolation)
    def _unique_violation(erro):
        return jsonify(erro="Registro ja cadastrado."), 409

    @app.errorhandler(pg_errors.ForeignKeyViolation)
    def _foreign_key_violation(erro):
        return jsonify(erro="Referencia informada nao existe."), 400

    @app.errorhandler(psycopg.OperationalError)
    def _banco_indisponivel(erro):
        """Banco fora do ar e indisponibilidade temporaria, nao erro nosso."""
        app.logger.error("banco indisponivel: %s", erro)
        return jsonify(erro="Servico indisponivel. Tente novamente."), 503

    @app.errorhandler(HTTPException)
    def _http_error(erro):
        return jsonify(erro=erro.description), erro.code

    @app.errorhandler(Exception)
    def _erro_inesperado(erro):
        app.logger.exception(erro)
        return jsonify(erro="Erro interno no servidor."), 500
