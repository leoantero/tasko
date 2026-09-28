import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuracoes lidas das variaveis de ambiente."""

    SECRET_KEY = os.getenv("SECRET_KEY", "chave-de-desenvolvimento") or ""
    DATABASE_URL = os.getenv("DATABASE_URL") or ""
    # Origens do front autorizadas a chamar a API, separadas por virgula.
    CORS_ORIGENS = os.getenv(
        "CORS_ORIGENS",
        "http://localhost:5173,http://localhost:5174,http://localhost:3000",
    ).split(",")
    JSON_SORT_KEYS = False

    @classmethod
    def validar(cls):
        if not cls.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL nao definida. Copie .env.example para .env."
            )
