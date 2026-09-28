import os

# A porta vem do ambiente porque servicos de hospedagem a definem assim.
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Poucos workers: o pool do psycopg abre ate 10 conexoes por worker e o
# Postgres padrao aceita 100 no total.
workers = int(os.getenv("WEB_CONCURRENCY", "3"))
timeout = 30
graceful_timeout = 30

accesslog = "-"
errorlog = "-"
access_log_format = '%(m)s %(U)s %(s)s %(M)sms'
