from flask import Flask

from app.config import Config
from app.errors import register_error_handlers


def create_app(config_class=Config):
    """Cria e configura a instancia da aplicacao Flask."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.validar()

    register_error_handlers(app)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
