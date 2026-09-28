# Frontend do Tasko: estado atual e integração

Resumo para o time: o que o front já faz, o que falta e como ligá-lo à API. Rodar: `cd frontend && npm install && npm run dev` (porta 5173; a API é lida de `VITE_API_URL`, padrão `http://localhost:5000/api`).

## Estrutura

- `src/lib/`: `api.js` (fetch com `Authorization: Bearer`), `session.js` (token no `localStorage`), `rota.js` (rotas por hash), `DadosProvider.jsx` (**fonte única** de projetos, tarefas e sessões).
- `src/features/<área>/`: `auth`, `home`, `projects`, `tasks`, `pomodoro`, `layout`. `src/components/Dialogo.jsx` é o painel modal compartilhado.
- Rotas: `#/` (início), `#/projetos`, `#/projetos/:id`, `#/foco` (sessão em andamento).
- Visual: tokens de `docs/design/` em `src/styles/tokens.css`. Acessibilidade conferida em cada tela (teclado, leitor de tela, contraste AA, 320px).

## O que está pronto

| HU | No front | Dados |
|---|---|---|
| HU01 Criar projeto | Grade com filtros, painel "Novo projeto" com prévia e atalhos de prazo | mock |
| HU02 Gerenciar tarefas | Página do projeto: criar, editar, concluir, excluir | mock |
| HU03 Priorizar | Bandeira com menu na tarefa, campo no "Editar", pendentes agrupadas por prioridade, "Comece por" | mock |
| HU04 Pomodoro | Iniciar pela tarefa escolhendo foco e intervalo; tela `#/foco` (pausar, encerrar, intervalo, concluir tarefa); timer na barra do topo | mock |
| HU05 Registrar produtividade | Registro automático no fim do tempo; tempo de foco por tarefa, por projeto e "Tempo dedicado" (7 dias + por tarefa) | mock |
| HU09 Login | Cadastro, login, nome do usuário via `/perfil` | **API real** |
| HU10 Tela inicial | Sessão em andamento, tarefas de hoje, ritmo do dia, sugestão da próxima tarefa | mock (mesmos dados das outras telas) |

"mock" = dados em memória no `DadosProvider`, **no mesmo formato das respostas da API**. As telas não sabem de onde os dados vêm.

## O que falta

1. **HU06 Dashboard**: tela nova. Rota pronta: `GET /dashboard/resumo` (total da semana, sessões, tarefas concluídas, distribuição por projeto, série diária).
2. **HU07 Histórico**: tela nova. Rota pronta: `GET /historico?tipo=&desde=&ate=&limite=` (sessões, tarefas e projetos concluídos).
3. **HU08 Metas**: tela nova. Rotas prontas: `GET/POST/PUT/DELETE /metas` (com progresso).
4. **Ligar o `DadosProvider` à API** (seção abaixo). Editar e concluir projeto ainda não têm tela (a API já tem `PUT /projetos/:id`).
5. README: pelo menos 2 tipos de diagrama UML (regra do trabalho) e completar o texto da HU04 ("…com tempos").

## Integração com o backend

**Regra de ouro:** mude só as ações de `lib/DadosProvider.jsx`, mantendo nome, parâmetros e retorno. Nenhuma tela precisa mudar.

| Ação do `DadosProvider` | Rota |
|---|---|
| carga inicial (`projetos`, `tarefas`, `sessoes`) | `GET /projetos`, `GET /tarefas`, `GET /sessoes-pomodoro` |
| `criarProjeto(dados)` | `POST /projetos` |
| `criarTarefa(dados)` | `POST /tarefas` |
| `atualizarTarefa(id, mudancas)` | `PUT /tarefas/:id` (aceita só os campos que mudaram) |
| `excluirTarefa(id)` | `DELETE /tarefas/:id` (409 se tiver Pomodoros) |
| `iniciarSessao({ tarefa_id, tempo_total_segundos })` | `POST /sessoes-pomodoro/iniciar` (409 se já houver sessão aberta) |
| `finalizarSessao(id, { tempo_foco_segundos })` | `POST /sessoes-pomodoro/:id/finalizar` |
| (nova, se quiserem "Cancelar sessão") | `DELETE /sessoes-pomodoro/:id` (só sessão aberta; o tempo não é registrado) |

Depois de cada chamada, atualize o estado com **o objeto que a API devolveu** (ele traz `id`, `criado_em`, `concluida_em`, tempos calculados etc.).

Cuidados:

- **Erros**: a API responde `{ erro }`; `api.js` já transforma em `Error(mensagem)`. As telas já mostram `erro.message` onde há formulário ou diálogo.
- **401 (token vencido, 24h)**: hoje só o `/perfil` desloga. Faça o `request` do `api.js` limpar o token e voltar ao login em qualquer 401. Erro de rede não deve deslogar.
- **Datas**: o Flask devolve `DATE`/`TIMESTAMPTZ` como `"Thu, 08 Oct 2026 00:00:00 GMT"`. Para prazos use sempre `lerData`, `diasAte` e `dataParaInput` (`features/projects/datas.js`); nunca `new Date("2026-10-08")` nem `.slice(0, 10)`. Datas-hora (`inicio`, `fim`, `concluida_em`) podem ir direto em `new Date()`. Envie prazos como `"AAAA-MM-DD"`.
- **Prioridade** é número (3 alta, 2 média, 1 baixa) ou `null`; texto é recusado.
- **Sessão Pomodoro**: o servidor define `inicio`, `fim` e o tempo total (decorrido); o front manda só `tempo_foco_segundos` (sem as pausas). Pausar e intervalo existem só no front.
- **Retomar sessão ao abrir o app**: se a aba fechar no meio do foco, a sessão fica aberta. Na carga inicial, chame `GET /sessoes-pomodoro/atual`; se vier uma sessão, recrie o estado do `FocoProvider` com `fimEm = inicio + tempo_total_segundos` (enquanto aberta, esse campo guarda a duração escolhida) ou finalize-a se o tempo já passou. Sessões abertas há mais de 4 horas são descartadas pelo servidor ao iniciar outra.
- **Cliques repetidos**: desabilite o checkbox da tarefa enquanto a requisição está em andamento, e trate o erro de `alternar`/`priorizar` no `TaskPanel` (hoje o mock nunca falha).
- **Carregamento**: mostre um estado de "carregando" na carga inicial (hoje o `App` fica em branco enquanto o `/perfil` responde).

## Pendências do backend encontradas pelo front

- Só sessões abertas podem ser apagadas (`DELETE /sessoes-pomodoro/:id`); as finalizadas não, mas o 409 de excluir tarefa pede "Apague-os primeiro": tarefa com Pomodoro registrado nunca pode ser excluída.
- `SECRET_KEY` tem valor padrão se o `.env` não definir (tokens forjáveis); `CORS` aberto para qualquer origem.
- Validação: no `POST`, título/nome numérico vira erro 500; o `PUT /tarefas` aceita título vazio ou só com espaços; textos maiores que o limite do banco viram 500.
