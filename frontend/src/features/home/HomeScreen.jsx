import { useState } from 'react'
import './HomeScreen.css'
import DayRhythm from './DayRhythm.jsx'
import FocusCard from './FocusCard.jsx'
import TodayTasks from './TodayTasks.jsx'
import { AGORA_MIN, blocosHoje, sessaoAtual, tarefasHoje, usuario } from './mockData'
import { saudacao } from './tempo'

const PESO_PRIORIDADE = { alta: 0, media: 1, baixa: 2 }

function HomeScreen({ onSair }) {
  const [tarefas, setTarefas] = useState(tarefasHoje)

  function alternarTarefa(id) {
    setTarefas((atuais) =>
      atuais.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
    )
  }

  const tarefaEmFoco = tarefas.find((t) => t.id === sessaoAtual.tarefaId)
  const pendentes = tarefas.filter((t) => !t.concluida && t.id !== sessaoAtual.tarefaId)
  const proxima = [...pendentes].sort(
    (a, b) => PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade] || a.prazo - b.prazo,
  )[0]
  const concluidas = tarefas.filter((t) => t.concluida).length
  const atrasadas = tarefas.filter((t) => !t.concluida && t.prazo < AGORA_MIN).length

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="home">
      <header className="home-topbar">
        <span className="home-brand">
          <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <circle cx="20" cy="20" r="20" />
            <path d="M20 20 V5 A15 15 0 0 1 34 24 Z" className="home-brand-cut" />
          </svg>
          Tasko
        </span>

        <div className="home-user">
          <span className="home-avatar" aria-hidden="true">
            {usuario.nome[0]}
          </span>
          <button type="button" className="home-sair" onClick={onSair}>
            Sair
          </button>
        </div>
      </header>

      <main className="home-main">
        <section className="home-greeting">
          <p className="home-date">{dataHoje}</p>
          <h1>
            {saudacao(AGORA_MIN)}, {usuario.nome}.
          </h1>
          <p className="home-summary">
            {concluidas} de {tarefas.length} tarefas concluídas
            {atrasadas > 0 && (
              <span className="home-summary-alert">
                {' '}
                · {atrasadas} {atrasadas > 1 ? 'atrasadas' : 'atrasada'}
              </span>
            )}
          </p>
        </section>

        <div className="home-grid">
          <div className="home-col-main">
            <FocusCard sessao={sessaoAtual} tarefa={tarefaEmFoco} proxima={proxima} />
            <DayRhythm blocos={blocosHoje} sessaoInicio={sessaoAtual.inicio} agora={AGORA_MIN} />
          </div>

          <TodayTasks
            tarefas={tarefas}
            emFocoId={sessaoAtual.tarefaId}
            agora={AGORA_MIN}
            onAlternar={alternarTarefa}
          />
        </div>
      </main>
    </div>
  )
}

export default HomeScreen
