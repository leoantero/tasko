import './HomeScreen.css'
import { useDados } from '../../lib/dados'
import { useFoco } from '../pomodoro/foco'
import { ehHoje } from '../pomodoro/produtividade'
import { diasAte } from '../projects/datas'
import DayRhythm from './DayRhythm.jsx'
import FocusCard from './FocusCard.jsx'
import TodayTasks from './TodayTasks.jsx'
import { AGORA_MIN, blocosHoje, sessaoAtual, tarefasHoje } from './mockData'
import { saudacao } from './tempo'

const PESO_PRIORIDADE = { alta: 0, media: 1, baixa: 2 }

function HomeScreen({ usuario }) {
  const tarefas = tarefasHoje
  const { tarefas: todas, atualizarTarefa } = useDados()
  const { estado } = useFoco()
  const emFocoId = estado?.fase === 'foco' ? estado.tarefaId : null

  // Do dia: pendentes que vencem hoje ou já venceram, a que está em foco e as concluídas hoje.
  const doDia = todas.filter((t) =>
    t.status === 'pendente'
      ? t.id === emFocoId || (t.prazo && diasAte(t.prazo) <= 0)
      : ehHoje(t.concluida_em),
  )

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
          tarefas={doDia}
          emFocoId={emFocoId}
          onAlternar={(t) => atualizarTarefa(t.id, { status: t.status === 'concluida' ? 'pendente' : 'concluida' })}
        />
      </div>
    </main>
  )
}

export default HomeScreen
