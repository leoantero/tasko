from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.errors import register_error_handlers
from app.routes import metas, pomodoro, projetos, tarefas, usuarios, dashboard


def create_app(config_class=Config):
    """Cria e configura a instancia da aplicacao Flask."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.validar()

    CORS(app)
    register_error_handlers(app)
    app.register_blueprint(usuarios.bp, url_prefix="/api")
    app.register_blueprint(projetos.bp, url_prefix="/api")
    app.register_blueprint(tarefas.bp, url_prefix="/api")
    app.register_blueprint(metas.bp, url_prefix="/api")
    app.register_blueprint(dashboard.bp, url_prefix="/api")
    app.register_blueprint(pomodoro.bp, url_prefix="/api")

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
