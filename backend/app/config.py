import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuracoes lidas das variaveis de ambiente."""

    SECRET_KEY = os.getenv("SECRET_KEY", "chave-de-desenvolvimento") or ""
    DATABASE_URL = os.getenv("DATABASE_URL") or ""
    JSON_SORT_KEYS = False

    @classmethod
    def validar(cls):
        if not cls.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL nao definida. Copie .env.example para .env."
            )
