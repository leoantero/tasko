from flask import Flask

from app.config import Config


def create_app(config_class=Config):
    """Cria e configura a instancia da aplicacao Flask."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.validar()

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
