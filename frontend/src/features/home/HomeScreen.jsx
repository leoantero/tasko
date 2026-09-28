import './HomeScreen.css'
import { useDados } from '../../lib/dados'
import { useFoco } from '../pomodoro/foco'
import { ehHoje } from '../pomodoro/produtividade'
import { diasAte } from '../projects/datas'
import { ordenarPendentes, situacaoTarefa } from '../tasks/tarefas'
import DayRhythm from './DayRhythm.jsx'
import FocusCard from './FocusCard.jsx'
import TodayTasks from './TodayTasks.jsx'
import { AGORA_MIN, blocosHoje, sessaoAtual } from './mockData'
import { saudacao } from './tempo'

// HU10: reúne as tarefas do dia e a sessão de foco em andamento, com os mesmos dados
// das outras telas (DadosProvider e FocoProvider).
function HomeScreen({ usuario }) {
  const { tarefas, atualizarTarefa } = useDados()
  const { estado } = useFoco()
  const agora = new Date()

  const emFocoId = estado?.fase === 'foco' ? estado.tarefaId : null

  // Do dia: pendentes que vencem hoje ou já venceram, a que está em foco e as concluídas hoje.
  const doDia = tarefas.filter((t) =>
    t.status === 'pendente'
      ? t.id === emFocoId || (t.prazo && diasAte(t.prazo, agora) <= 0)
      : ehHoje(t.concluida_em, agora),
  )
  const pendentes = tarefas.filter((t) => t.status === 'pendente' && t.id !== emFocoId).sort(ordenarPendentes)
  const proxima = pendentes.find((t) => doDia.includes(t)) ?? pendentes[0]
  const concluidas = doDia.filter((t) => t.status === 'concluida').length
  const atrasadas = doDia.filter((t) => t.status === 'pendente' && situacaoTarefa(t, agora).tipo === 'atrasada').length

  const dataHoje = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main className="home-main">
      <section className="home-greeting">
        <p className="home-date">{dataHoje}</p>
        <h1>
          {saudacao(agora.getHours() * 60 + agora.getMinutes())}, {usuario.nome}.
        </h1>
        <p className="home-summary">
          {concluidas} de {doDia.length} tarefas de hoje concluídas
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
