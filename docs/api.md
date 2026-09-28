# Contrato da API

Base: `http://localhost:5001/api`

Todas as rotas, exceto cadastro e login, exigem o header
`Authorization: Bearer <token>`. O corpo vai em JSON, com
`Content-Type: application/json` — sem esse header o Flask ignora o corpo
em silêncio.

Erro sempre no formato `{"erro": "mensagem"}`:

| Código | Quando |
| --- | --- |
| 400 | campo faltando, formato inválido, valor fora da faixa |
| 401 | token ausente, inválido ou expirado |
| 404 | recurso não existe **ou não é do usuário do token** |
| 409 | conflito (email repetido, sessão já aberta, projeto com tarefas) |
| 429 | muitas tentativas de login |
| 503 | banco indisponível |

Datas de entrada vão como `"AAAA-MM-DD"`. Na resposta, o Flask devolve
`DATE` e `TIMESTAMPTZ` em RFC 822 (`"Thu, 08 Oct 2026 00:00:00 GMT"`).

## Autenticação (HU09)

### POST /usuarios

```json
{"nome": "Luiz", "email": "luiz@exemplo.com", "senha": "12345678"}
```

201 com `{id, nome, email, criado_em}`. Senha mínima de 8 caracteres;
email é normalizado em minúsculas. 409 se o email já existir.

### POST /login

```json
{"email": "luiz@exemplo.com", "senha": "12345678"}
```

200 com `{"token": "..."}`, válido por 24h. A mensagem de erro é a mesma
para email inexistente e senha errada, de propósito. Cinco falhas no
mesmo email em 15 minutos respondem 429.

### POST /renovar

Sem corpo. Troca um token ainda válido por outro com prazo novo.

### GET /perfil

Dados do dono do token: `{id, nome, email, criado_em}`.

## Projetos (HU01)

| Rota | O que faz |
| --- | --- |
| `GET /projetos` | lista; aceita `?status=ativo` ou `?status=concluido` |
| `POST /projetos` | cria; só `nome` é obrigatório |
| `GET /projetos/<id>` | detalhe |
| `PUT /projetos/<id>` | **atualização parcial**: envie só o que mudou |
| `DELETE /projetos/<id>` | 204; 409 se ainda houver tarefas |

Campos: `nome`, `categoria`, `descricao`, `prazo`, `status`
(`ativo` ou `concluido`). Concluir preenche `concluido_em` automaticamente;
reabrir limpa.

## Tarefas (HU02, HU03)

| Rota | O que faz |
| --- | --- |
| `GET /tarefas` | aceita `?projeto_id=`, `?status=`, `?prazo_ate=` |
| `POST /tarefas` | cria; só `titulo` é obrigatório |
| `GET /tarefas/<id>` | detalhe |
| `PUT /tarefas/<id>` | atualização parcial |
| `DELETE /tarefas/<id>` | 204; 409 se houver sessões Pomodoro |

Campos: `titulo`, `descricao`, `projeto_id` (opcional: tarefa pode ficar
solta), `prioridade` (3 alta, 2 média, 1 baixa, `null` sem prioridade),
`prazo`, `status` (`pendente` ou `concluida`).

A lista já vem ordenada por prioridade e depois por prazo, então o front
não precisa reordenar. `?prazo_ate=<hoje>` com `?status=pendente` dá a
lista do dia, incluindo as atrasadas.
