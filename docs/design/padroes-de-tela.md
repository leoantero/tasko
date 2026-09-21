# Padrões de tela — ideias iniciais

Rascunhos conceituais para abrir a discussão sobre as telas principais, ligados às HU do README do projeto. Não são especificações fechadas — são ganchos para a conversa entre frontend, backend e o resto da equipe.

## Dashboard (HU06)

- Header com saudação + resumo rápido (tempo focado na semana) em `display-md`.
- Cards de métrica em `surface-100`, sem sombra, usando `accent` para indicar progresso positivo (ex.: "3 de 5 metas da semana").
- Distribuição de tempo por projeto como gráfico simples (barras horizontais ou donut), cada projeto com uma cor própria dentro da paleta — vale definir uma escala de cores por projeto como extensão futura dos tokens.
- Prioridade visual: o que está atrasado (`danger`) aparece antes do que está em dia.

## Lista de tarefas (HU02, HU03)

- Cada tarefa é uma linha/card com: ponto de prioridade (`priority-high/medium/low`, `radius-full`), título (`body-lg`), meta (projeto, prazo em `body-sm`/`ink-muted`).
- Concluir uma tarefa: risco no texto + transição para `accent`/`success`, sem remover a linha imediatamente (dar um instante de confirmação visual).
- Prazo vencido: badge com `danger` em `label`.

## Sessão Pomodoro (HU04, HU05)

- Tela com foco quase total no timer: número grande em `timer-lg` (mono), anel de progresso circular em `brand` sobre `surface-200`, `radius-full`.
- Estado de pausa (break) pode usar `accent` no lugar de `brand` no anel, para diferenciar visualmente foco vs. descanso.
- Pouquíssimos elementos de UI na tela ativa — botão de pausar/encerrar como praticamente a única ação visível, respeitando o princípio "calmo, não gamificado".

## Projetos (HU01)

- Cards de projeto em grid, `radius-lg`, com nome (`display-md` ou `body-lg` conforme densidade), categoria como `label`, barra de progresso fina em `accent`.
- Prazo do projeto em `body-sm`; se vencido, mesmo tratamento de `danger` usado nas tarefas, para manter consistência do sinal "atrasado" em qualquer nível (tarefa ou projeto).

## Histórico e metas (HU07, HU08)

- Histórico como linha do tempo/lista agrupada por data, reaproveitando o mesmo padrão de linha da lista de tarefas (consistência > novidade).
- Metas como cards com barra de progresso (`accent`) e um valor numérico destacado — candidato natural para `timer-sm`/mono, já que é uma métrica que o usuário vai "ler rápido".

---

**Perguntas em aberto para o time de frontend:**

1. Densidade: lista de tarefas mais compacta (mobile-first) ou mais espaçada (desktop-first)? Isso afeta se `space-3` ou `space-4` vira o padrão de item de lista.
2. O anel do Pomodoro é SVG customizado ou uma lib de progress ring? Impacta se vale a pena tokenizar `stroke-width` como um espaçamento.
3. Cores por projeto (dashboard) — paleta fixa de N cores ou cor livre escolhida pelo usuário na criação do projeto?
