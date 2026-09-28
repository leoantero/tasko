import { useState } from 'react'
import './HomeScreen.css'
import DayRhythm from './DayRhythm.jsx'
import FocusCard from './FocusCard.jsx'
import TodayTasks from './TodayTasks.jsx'
import { AGORA_MIN, blocosHoje, sessaoAtual, tarefasHoje } from './mockData'
import { saudacao } from './tempo'

const PESO_PRIORIDADE = { alta: 0, media: 1, baixa: 2 }

function HomeScreen({ usuario }) {
  const [tarefas, setTarefas] = useState(tarefasHoje)

  function alternarTarefa(id) {
    setTarefas((atuais) =>
      atuais.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
    )
  }

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
          <FocusCard proxima={proxima} />
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
  )
}

export default HomeScreen
