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
| 409 | conflito (email repetido, sessão já aberta) |
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
| `DELETE /projetos/<id>` | 204. `?tarefas=soltar` (padrão) transforma as tarefas em avulsas; `?tarefas=excluir` apaga junto |

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

## Sessões Pomodoro (HU04, HU05)

| Rota | O que faz |
| --- | --- |
| `POST /sessoes-pomodoro/iniciar` | abre a sessão; exige `tarefa_id` |
| `POST /sessoes-pomodoro/<id>/finalizar` | encerra e grava os tempos |
| `DELETE /sessoes-pomodoro/<id>` | descarta a sessão em andamento |
| `GET /sessoes-pomodoro/atual` | a sessão aberta, ou `null` |
| `GET /sessoes-pomodoro` | todas as sessões, da mais recente |
| `GET /sessoes-pomodoro/<id>` | detalhe |

Regras que o front não precisa reimplementar:

- **Uma sessão aberta por vez.** Iniciar com outra em andamento responde
  409. Sessão aberta há mais de 4h é considerada abandonada e descartada
  automaticamente na próxima tentativa.
- **Os tempos são do servidor** (HU05). `tempo_total_segundos` é sempre o
  decorrido entre `inicio` e `fim`. `tempo_foco_segundos` só vem do cliente
  se ele informar, porque é quem sabe das pausas, e fica limitado ao
  intervalo `[0, decorrido]`. Sem informar, vale o decorrido.
- `GET /sessoes-pomodoro/atual` traz também `tarefa_titulo` e `projeto_id`,
  para a barra do topo não precisar de outra chamada.

## Metas (HU08)

`GET|POST /metas` e `GET|PUT|DELETE /metas/<id>`.

Campos: `tipo`, `valor_alvo` (número maior que zero) e `data_limite`.

Tipos: `tempo_foco_horas`, `tarefas_concluidas`, `sessoes_pomodoro`,
`projetos_concluidos`.

Toda meta vem com **`progresso`**, calculado conforme o tipo entre a
criação da meta e a `data_limite`: o que foi concluído antes de criar não
conta, e depois do prazo o valor congela.

## Dashboard (HU06)

`GET /dashboard/resumo` — janela fixa dos últimos 7 dias corridos:

```json
{
  "total_horas_foco": 3.5,
  "numero_sessoes": 8,
  "tarefas_concluidas": 4,
  "projetos_ativos": 2,
  "distribuicao_por_projeto": [
    {"projeto_id": 1, "projeto_nome": "TCC", "total_segundos": 9000},
    {"projeto_id": null, "projeto_nome": "Sem projeto", "total_segundos": 3600}
  ],
  "tempo_por_dia": [{"dia": "...", "total_segundos": 1800}]
}
```

`tempo_por_dia` traz sempre os 7 dias, com zero nos dias sem sessão. O
total, a distribuição e a série fecham entre si. Tempo de tarefa sem
projeto aparece no grupo `"Sem projeto"`, com `projeto_id: null`.

## Histórico (HU07)

`GET /historico` — sessões finalizadas, tarefas e projetos concluídos numa
lista só, ordenada pelo término, do mais recente ao mais antigo.

Cada evento: `tipo` (`sessao`, `tarefa` ou `projeto`), `id`, `titulo`,
`terminado_em`, `tempo_foco_segundos` (só em sessão) e `projeto_id`.

Filtros: `?tipo=`, `?desde=`, `?ate=` (inclui o dia inteiro) e `?limite=`
(padrão 50, máximo 200).
