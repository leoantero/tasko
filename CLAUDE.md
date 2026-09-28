# Instruções para agentes de IA neste repositório

Este é o TP1 de Engenharia de Software (UFMG, prof. Marco Tulio Valente): um sprint em equipe de 4 pessoas, com uso obrigatório de LLM/agente de código. As regras abaixo vêm do enunciado do trabalho e **têm prioridade sobre qualquer prática "padrão" de commit/PR que o agente use por default.**

## A IA é ferramenta, não autora

- Todo código gerado precisa ser **entendido e aprovado por um membro do time** antes de ser aceito — não existe "aceitar tudo e seguir em frente". Se algo não ficou claro, pergunte à pessoa antes de assumir.
- **Todos os membros do time usam IA neste repo**, não só quem está com o terminal aberto agora. Não tente "adiantar" trabalho de outra área (ex.: se você é o dev frontend, não implemente endpoints de backend só porque parece rápido) — isso tira a chance de outra pessoa commitar naquela parte e trabalhar seu próprio pedaço.
- Cada pessoa do time precisa ter commits próprios (mínimo 15% dos commits/membro). Não faça commits em nome de outra pessoa nem acumule trabalho de várias áreas num commit só.

## Baby steps: um pedido pequeno por vez

- **Nunca implemente uma história de usuário inteira (ou várias) num prompt só.** O README lista ~8 HUs — elas existem para serem quebradas em pedaços pequenos, sessão a sessão, não resolvidas de uma vez.
- Ao receber um pedido grande ("implementa o dashboard", "faz o frontend todo"), pare e proponha a quebra em passos menores antes de sair escrevendo código. Prefira: 1 componente, 1 tela, 1 endpoint, 1 ajuste por vez.
- Isso não é só estilo — é necessário por causa do limite de commit abaixo. Um pedido grande normalmente não cabe num commit válido.

## Limite de commit: 100 LOC

- **Cada commit deve ter no máximo 100 linhas alteradas** (adições + remoções). Exceções só são aceitas quando genuinamente inevitáveis (ex.: scaffolding gerado por `create-vite`, `npx create-react-app`, migração inicial de banco) e **devem ser justificadas no corpo da mensagem do commit**, explicando por que não dava para dividir.
- Antes de commitar, cheque o tamanho do diff (`git diff --stat`). Se passar de 100 linhas e não for um caso de scaffolding, divida em commits menores (por exemplo, separar marcação/estilo de lógica, ou um componente por commit) em vez de pedir para ignorar a regra.
- Nunca use `--no-verify` ou pule hooks para "passar" de um commit grande.

## Conventional Commits

Toda mensagem de commit segue o padrão `tipo: descrição` (em inglês ou português, mas consistente com o que o time já vem usando):

```
feat: add dark launch support for new billing flow
fix: prevent null pointer in customer repository
refactor: extract payment validation service
docs: update migration strategy documentation
style: simplify conditional formatting in reports
test: add integration test for login endpoint
perf: optimize cache lookup for session tokens
build: upgrade spring boot dependencies
chore: remove deprecated feature flags
revert: rollback unstable notification service
```

## Escopo do TP1

- **Arquitetura fixa**: backend = API + banco de dados; frontend = web. Nada de arquiteturas alternativas.
- **Sem testes automatizados neste TP** (é o foco do TP2) — não gere suítes de teste a menos que peçam explicitamente.
- O README precisa manter uma seção de **documentação preliminar em UML** (mínimo 2 tipos de diagrama, sugestão Mermaid) — se a arquitetura ou o modelo de dados mudar de forma relevante, atualize os diagramas também, mas isso é responsabilidade de quem revisa, não algo para gerar automaticamente sem revisão.
- Histórias de usuário (HU01–HU08) estão no `README.md` — qualquer implementação deve mapear claramente para uma delas. Se um pedido não corresponder a nenhuma HU existente, sinalize isso antes de implementar.

## Stack

- Frontend: React
- Backend: Python, Flask — rotas organizadas por recurso (projetos, tarefas, sessões, metas, dashboard)
  - psycopg3 — acesso ao banco com SQL direto, sem ORM
  - Flask-Cors — libera o front (porta diferente) a chamar a API
  - PyJWT — autenticação por token; rotas protegidas esperam o token no header
  - python-dotenv — config sensível (secret key, connection string) em `.env`, fora do repo (ver `.env.example`)
  - gunicorn — só em produção; em desenvolvimento roda o servidor do próprio Flask
- Banco: PostgreSQL

## Backend

- A aplicação é criada por uma função `create_app()`.
- Dentro de `app/`: `routes/` recebe a requisição e devolve JSON; `repositories/` faz o SQL.
- Regra de separação: **rota não escreve SQL, repository não importa Flask**. Se um pedido de implementação misturar as duas coisas no mesmo lugar, pare e reorganize antes de commitar.

## Frontend

O sistema de design (paleta clara/escura, tipografia, espaçamento, raio) foi definido colaborativamente. A fonte de verdade para agentes é local, em `docs/design/`:

- `docs/design/tokens.json` — valores de cor (claro/escuro), tipografia, espaçamento, raio e sombra
- `docs/design/DESIGN-SYSTEM.md` — brand book: princípios e a justificativa de cada escolha
- `docs/design/padroes-de-tela.md` — rascunhos de tela por HU, com perguntas em aberto

Use esses arquivos em vez de inventar valores novos. O artifact original (https://claude.ai/artifact/UQdpJUS1hXPLQAnzX8sHtV) segue existindo para discussão/comentários da equipe, mas não é acessível por uma sessão de terminal — não peça para o agente abrir esse link. É um ponto de partida, não algo fechado: se um valor não fizer sentido na prática, discuta o ajuste com quem está pilotando antes de só substituir.

Login e cadastro são a HU09 (`features/auth/`): o token fica no `localStorage` (`lib/session.js`) e as rotas protegidas do backend esperam `Authorization: Bearer <token>`.

### Dados e integração com a API

- `lib/DadosProvider.jsx` é a única fonte de projetos, tarefas e sessões Pomodoro para as telas (hoje um mock em memória). Para integrar a API, mude só as ações desse arquivo, mantendo as assinaturas; as telas não mudam. A tela inicial (HU10) ainda usa o mock próprio `features/home/mockData.js`.
- Prioridade da tarefa (HU03) é número: 3 alta, 2 média, 1 baixa, `null` sem prioridade (`PRIORIDADES` em `features/tasks/tarefas.js`).
- Pomodoro (HU04): `features/pomodoro/FocoProvider.jsx` guarda a sessão em curso (fases foco → fim-foco → intervalo → fim-intervalo) acima das telas, para o timer seguir ao navegar. Ele registra a sessão pelo `DadosProvider` (`iniciarSessao`/`finalizarSessao`, formato de `/api/sessoes-pomodoro`). "Pausar" congela o foco e não conta como tempo focado; o intervalo não é salvo na API.
- Datas: o `jsonify` do Flask devolve `DATE`/`TIMESTAMPTZ` como RFC 822 (`"Thu, 08 Oct 2026 00:00:00 GMT"`), não ISO. Use sempre `lerData`, `diasAte` e `dataParaInput` de `features/projects/datas.js`; nunca `new Date("2026-10-08")` (vira o dia anterior no Brasil) nem `.slice(0, 10)`.
- Painéis modais: use `components/Dialogo.jsx` (foco, Esc, fundo e StrictMode já tratados).
