"""Ponto de entrada de producao: gunicorn -c gunicorn.conf.py wsgi:app

Em desenvolvimento continua valendo o run.py, com o recarregamento
automatico do servidor do Flask.
"""

from app import create_app

app = create_app()
