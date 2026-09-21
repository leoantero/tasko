# Tasko — Sistema de Design

Tasko é um app de produtividade que une planejamento (projetos, tarefas, prazos), execução (sessões Pomodoro) e análise (dashboard, histórico, metas). Este é o **ponto de partida** do sistema de design — o suficiente para começar a desenhar telas com consistência, aberto para a equipe de frontend discutir e ajustar. Nada aqui está definitivo.

## Princípios

- **Calmo, não gamificado.** É um app para sustentar foco, não para competir por atenção com badges piscando e cores berrantes. Sem gradientes chamativos, sem confete.
- **Analógico + digital.** Uma referência de "caderno/planner" (fundo levemente quente, tom de papel) combinada com clareza de interface moderna — nem frio demais (SaaS azul genérico), nem lúdico demais (infantil).
- **A cor carrega significado.** Prioridade, status e progresso são comunicados primeiro por cor e forma (antes de depender só de texto), então o contraste e a consistência dos tokens semânticos importam mais do que em um app comum.
- **O timer é o momento de maior atenção do usuário.** A tela de sessão Pomodoro merece tratamento visual diferenciado (tipografia mono para os números, uso mais generoso de espaço, cor de marca como "anel" de progresso).

## Cor

Duas superfícies-base com tom quente (nem branco/preto puro), para reduzir fadiga visual em sessões longas de foco:

- `surface-0` — fundo da página
- `surface-100` — cards, painéis
- `surface-200` — inputs, áreas afundadas
- `border` — bordas e divisores

Texto usa `ink` / `ink-muted` / `ink-faint` em vez de preto/cinza puros, mantendo a mesma temperatura quente da superfície.

**`brand`** (terracota) é a cor primária — CTAs, links, estados ativos. É uma referência sutil ao Pomodoro (tomate) sem ser literal ou infantil: quente, confiante, sem ser um vermelho de alerta. **`accent`** (verde-azulado) é reservado para progresso e conclusão — metas atingidas, barras de progresso, tarefas concluídas — dando ao usuário um sinal de "avanço" distinto do sinal de "ação" da marca.

Prioridade de tarefa usa uma escala semântica própria, separada de `brand`/`accent`, para não confundir "isto é urgente" com "isto é a cor do produto":

- `priority-high` — vermelho
- `priority-medium` — âmbar
- `priority-low` — azul acinzentado

`success` e `danger` são aliases de `accent` e `priority-high`, reaproveitando o mesmo significado em contextos de formulário/feedback (ex.: toast de erro usa `danger`, confirmação usa `success`).

**Contraste:** os valores de `light`/`dark` foram escolhidos mirando 4.5:1 para texto sobre `surface-0`/`surface-100`, mas são um ponto de partida — vale validar com ferramenta de contraste ao aplicar em componentes reais, principalmente `brand` e `priority-medium` sobre `surface-200`.

## Tipografia

- **Inter** (sans) para toda a interface — texto, títulos, botões. Fonte hospedada no Google Fonts, sem custo de licenciamento, boa legibilidade em telas pequenas.
- **IBM Plex Mono** (mono) reservada para números que precisam de leitura rápida e estável: o contador do Pomodoro (`timer-lg`, `timer-sm`) e, possivelmente, métricas do dashboard. Números tabulares em mono evitam que o contador "pule" de largura a cada segundo.

Escala em três grupos — `Display` (títulos), `Text` (UI geral) e `Timer` (contadores) — ver `tokens.json` para os valores exatos de cada estilo.

## Espaçamento

Grade de base 4px (`space-1` a `space-12`). Uso sugerido: `space-3` para padding interno de botões/inputs, `space-4` como gap padrão entre itens de lista, `space-6` para padding de cards, `space-8`/`space-12` para separar seções inteiras de uma página.

## Raio

Cantos modernos, não totalmente retos: `radius-sm` (6px) em inputs e chips, `radius-md` (10px) em botões e cards padrão, `radius-lg` (16px) em cards grandes e no painel do timer, `radius-full` em avatares, pontos de prioridade, pílulas de status e no anel visual do Pomodoro.

## Sombra

Uso deliberadamente escasso — cards no dashboard e listas ficam **planos** (borda + fundo, sem sombra), reforçando o tom calmo. `shadow-sm`/`shadow-md` ficam reservados para elementos que realmente flutuam sobre o conteúdo: modais, popovers, menus, cards em hover/drag.

## Ícones e logo

Ainda não há um kit de ícones nem uma marca definidos. Sugestão de partida para discussão: uma biblioteca de ícones de linha (ex. Lucide ou Phosphor), traço ~1.5px, cantos levemente arredondados para combinar com `radius-sm`/`radius-md`. Enquanto não há logomarca, o nome "Tasko" é tratado como wordmark em `Inter` peso 700 (ver a capa deste sistema).

## Próximos passos sugeridos

Este sistema cobre cor, tipografia, espaçamento, raio e sombra — o suficiente para montar as primeiras telas em Figma/código e ver o que funciona. Ainda faltam (de propósito, para decidir em equipe): componentes reais (botão, input, card de tarefa, badge de prioridade), ícones/logo definitivos, e validação de contraste com os valores finais. Ideias de tela para começar a conversa estão em [Padrões de tela](padroes-de-tela.md).
