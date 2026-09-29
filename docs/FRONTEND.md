# Frontend do Tasko: estado atual e integração

Resumo para o time: o que o front já faz e o que falta. Rodar: `cd frontend && npm install && npm run dev` (porta 5173; a API é lida de `VITE_API_URL`, padrão `http://localhost:5001/api`, com a API subindo em `flask run --port 5001`).

## Estrutura

- `src/lib/`: `api.js` (fetch com `Authorization: Bearer`), `session.js` (token no `localStorage`), `rota.js` (rotas por hash), `DadosProvider.jsx` (**fonte única** de projetos, tarefas e sessões).
- `src/features/<área>/`: `auth`, `home`, `projects`, `tasks`, `pomodoro`, `layout`. `src/components/Dialogo.jsx` é o painel modal compartilhado.
- Rotas: `#/` (início), `#/dashboard`, `#/historico`, `#/projetos`, `#/projetos/:id`, `#/tarefas` (avulsas), `#/foco` (sessão em andamento).
- Visual: tokens de `docs/design/` em `src/styles/tokens.css`. Acessibilidade conferida em cada tela (teclado, leitor de tela, contraste AA, 320px).

## O que está pronto

| HU | No front | Dados |
|---|---|---|
| HU01 Criar projeto | Grade com filtros, painel "Novo projeto" com prévia e atalhos de prazo | **API real** |
| HU02 Gerenciar tarefas | Página do projeto: criar, editar, concluir, excluir | **API real** |
| HU03 Priorizar | Bandeira com menu na tarefa, campo no "Editar", pendentes agrupadas por prioridade, "Comece por" | **API real** |
| HU04 Pomodoro | Iniciar pela tarefa escolhendo foco e intervalo; tela `#/foco` (pausar, encerrar, intervalo, concluir tarefa); timer na barra do topo | **API real** |
| HU05 Registrar produtividade | Registro automático no fim do tempo; tempo de foco por tarefa, por projeto e "Tempo dedicado" (7 dias + por tarefa) | **API real** |
| HU06 Dashboard | Métricas da semana, série diária e distribuição de tempo por projeto | **API real** (`GET /dashboard/resumo`) |
| HU07 Histórico | Eventos agrupados por dia, duração de foco nas sessões e filtros por tipo e período | **API real** (`GET /historico`) |
| HU09 Login | Cadastro, login, nome do usuário via `/perfil` | **API real** |
| HU10 Tela inicial | Sessão em andamento, tarefas de hoje, ritmo do dia, sugestão da próxima tarefa | **API real** (mesmos dados das outras telas) |
| HU11 Tarefas avulsas | Tela `#/tarefas` com as tarefas sem projeto, reaproveitando o painel da página do projeto; seletor de projeto no "Editar tarefa" | **API real** |

Os mocks foram removidos: o `DadosProvider` carrega projetos, tarefas e sessões da API na
montagem e cada ação chama a rota correspondente, guardando o objeto que o servidor devolve.
As telas não mudaram — continuam sem saber de onde os dados vêm.

## O que falta

1. **HU08 Metas**: tela nova. Rotas prontas: `GET/POST/PUT/DELETE /metas` (com progresso).
2. Editar e concluir projeto ainda não têm tela (a API já tem `PUT /projetos/:id`).
3. A tela de avulsas lista só as tarefas sem projeto; não existe uma listagem de todas as tarefas do usuário.
4. README: completar o texto da HU04 ("…com tempos"). Os 2 tipos de diagrama UML já estão lá (fluxo de arquitetura e sequência da sessão de foco).

## Integração com o backend: feita

Cada ação do `DadosProvider` chama a rota abaixo. As assinaturas não mudaram, então
nenhuma tela precisou mudar.

| Ação do `DadosProvider` | Rota |
|---|---|
| carga inicial (`projetos`, `tarefas`, `sessoes`) | `GET /projetos`, `GET /tarefas`, `GET /sessoes-pomodoro` |
| `criarProjeto(dados)` | `POST /projetos` |
| `criarTarefa(dados)` | `POST /tarefas` (sem `projeto_id` = tarefa avulsa) |
| `atualizarTarefa(id, mudancas)` | `PUT /tarefas/:id` (aceita só os campos que mudaram) |
| `excluirTarefa(id)` | `DELETE /tarefas/:id` (204; as sessões da tarefa são desvinculadas, no servidor e no estado local) |
| `iniciarSessao({ tarefa_id, tempo_total_segundos })` | `POST /sessoes-pomodoro/iniciar` (409 se já houver sessão aberta) |
| `finalizarSessao(id, { tempo_foco_segundos })` | `POST /sessoes-pomodoro/:id/finalizar` |
| (disponível, ainda sem uso na interface) | `DELETE /sessoes-pomodoro/:id` (só sessão aberta; o tempo não é registrado) |

Depois de cada chamada, atualize o estado com **o objeto que a API devolveu** (ele traz `id`, `criado_em`, `concluida_em`, tempos calculados etc.).

Cuidados:

- **Erros**: a API responde `{ erro }`; `api.js` já transforma em `Error(mensagem)`. As telas já mostram `erro.message` onde há formulário ou diálogo.
- **401 (token vencido, 24h)**: o `request` do `api.js` limpa o token e avisa o `App` por evento, em qualquer rota. Erro de rede não desloga. Existe `POST /renovar` se quisermos estender a sessão sem novo login.
- **Datas**: o Flask devolve `DATE`/`TIMESTAMPTZ` como `"Thu, 08 Oct 2026 00:00:00 GMT"`. Para prazos use sempre `lerData`, `diasAte` e `dataParaInput` (`features/projects/datas.js`); nunca `new Date("2026-10-08")` nem `.slice(0, 10)`. Datas-hora (`inicio`, `fim`, `concluida_em`) podem ir direto em `new Date()`. Envie prazos como `"AAAA-MM-DD"`.
- **Projeto da tarefa**: `projeto_id` aceita `null`. Excluir um projeto não apaga as tarefas dele — elas viram avulsas e aparecem em `#/tarefas`.
- **Prioridade** é número (3 alta, 2 média, 1 baixa) ou `null`. Texto numérico (`"2"`) é
  convertido; texto como `"alta"` responde 400. Não use a recusa da API como única
  validação do formulário.
- **Sessão Pomodoro**: o servidor define `inicio`, `fim` e o tempo total (decorrido); o front manda só `tempo_foco_segundos` (sem as pausas). Pausar e intervalo existem só no front.
- **Retomar sessão ao abrir o app**: feito no `FocoProvider`, que consulta `GET /sessoes-pomodoro/atual` ao montar e refaz o estado com `fimEm = inicio + tempo_total_segundos`. Se o tempo já passou, o timer dispara na hora e finaliza. Sessões abertas há mais de 4 horas são descartadas pelo servidor ao iniciar outra.
- **Cliques repetidos**: feito no `TaskPanel` — a tarefa em requisição fica ocupada, o checkbox desabilitado e a falha aparece em uma linha com `role="alert"`.
- **Carregamento**: feito no `App`, que mostra "Carregando seus dados…" enquanto a carga inicial não termina e a mensagem de falha se a API não responder.

## Pendências do backend: resolvidas

As três pendências levantadas aqui foram corrigidas, e **todas as integrações da
tabela acima estão prontas e testadas contra o banco**.

- **Excluir tarefa com Pomodoro registrado** agora responde 204. Em vez de barrar,
  a exclusão desvincula as sessões (`tarefa_id = NULL`): o tempo continua contando
  no dashboard e aparece no histórico como "Sessao sem tarefa". O tratamento do 409
  pode sair do front.
- **`SECRET_KEY` virou obrigatória** — sem ela no `.env`, a API recusa subir, em vez
  de assinar token com chave padrão. O `CORS` passou a aceitar só as origens de
  `CORS_ORIGENS` (padrão: portas 5173, 5174 e 3000).
- **Validação**: título/nome numérico, título vazio no `PUT` e texto acima do limite
  da coluna respondem 400 com a mensagem do campo, não mais 500.

O contrato de todas as rotas, com campos e códigos de erro, está em
[api.md](api.md).
