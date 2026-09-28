# Backend

API em Flask com PostgreSQL, sem ORM: todo SQL fica nos repositórios.

## Como rodar

```bash
python3 -m venv venv && source venv/bin/activate   # na raiz do repositório
pip install -r backend/requirements.txt

cp backend/.env.example backend/.env               # preencha DATABASE_URL
createdb tasko && psql -d tasko -f db/schema.sql

cd backend && flask run --port 5001 --debug
```

A API sobe em `http://localhost:5001`, e as rotas ficam sob `/api`.

## Variáveis de ambiente

| Variável | Para quê | Padrão |
| --- | --- | --- |
| `DATABASE_URL` | conexão com o PostgreSQL | obrigatória |
| `SECRET_KEY` | assinatura dos tokens JWT | chave de desenvolvimento |
| `TOKEN_HORAS` | validade do token | 24 |
| `CORS_ORIGENS` | origens do front, separadas por vírgula | portas 5173, 5174 e 3000 |

O `.env` não vai para o repositório. O `.env.example` é o modelo.

## Estrutura

```
app/
├── __init__.py       create_app: CORS, log, erros e blueprints
├── config.py         variáveis de ambiente
├── db.py             pool psycopg3 e helpers query/execute
├── auth.py           hash de senha, token JWT e @login_required
├── errors.py         erros da API em JSON
├── log.py            uma linha de log por requisição
├── limite.py         limite de tentativas de login
├── validacao.py      corpo, exigir, data, inteiro, email
├── routes/           recebe a requisição e devolve JSON
└── repositories/     escreve o SQL
```

Regra de separação: **rota não escreve SQL, repository não importa Flask.**

Toda consulta filtra por `usuario_id`, que vem do token — nunca do corpo ou
da URL. É isso que impede um usuário acessar dado de outro.

## Armadilhas conhecidas

- **Porta 5000 no macOS** é do Receptor AirPlay. Use `--port 5001`.
- **Python 3.9 do sistema** vem sem `hashlib.scrypt`; por isso o hash de senha
  usa `pbkdf2:sha256`. Prefira Python 3.12.
- **`psql` do instalador EDB** não fica no PATH: `/Library/PostgreSQL/18/bin`.
- **Datas** saem em RFC 822 (`"Thu, 08 Oct 2026 00:00:00 GMT"`), não ISO — o
  front tem helpers próprios em `features/projects/datas.js`.

## Produção

```bash
gunicorn -c gunicorn.conf.py wsgi:app
```

Porta pelo `PORT`, número de workers pelo `WEB_CONCURRENCY`.
