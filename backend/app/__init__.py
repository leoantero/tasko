from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.db import verificar
from app.errors import register_error_handlers
from app.log import registrar_log
from app.routes import (
    dashboard,
    historico,
    metas,
    pomodoro,
    projetos,
    tarefas,
    usuarios,
)


def create_app(config_class=Config):
    """Cria e configura a instancia da aplicacao Flask."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.validar()

    CORS(app, origins=config_class.CORS_ORIGENS)
    registrar_log(app)
    register_error_handlers(app)
    app.register_blueprint(usuarios.bp, url_prefix="/api")
    app.register_blueprint(projetos.bp, url_prefix="/api")
    app.register_blueprint(tarefas.bp, url_prefix="/api")
    app.register_blueprint(metas.bp, url_prefix="/api")
    app.register_blueprint(dashboard.bp, url_prefix="/api")
    app.register_blueprint(pomodoro.bp, url_prefix="/api")
    app.register_blueprint(historico.bp, url_prefix="/api")

    @app.get("/health")
    def health():
        """Responde 503 com o banco fora, para o monitoramento perceber."""
        try:
            verificar()
        except Exception as erro:
            app.logger.warning("health: banco indisponivel: %s", erro)
            return {"status": "degradado", "banco": "indisponivel"}, 503

        return {"status": "ok", "banco": "ok"}

    return app
