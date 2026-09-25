import { useRef } from 'react'
import './TodayTasks.css'
import { formatarHora } from './tempo'

const ROTULO_PRIORIDADE = { alta: 'Prioridade alta', media: 'Prioridade média', baixa: 'Prioridade baixa' }

const porPrazo = (a, b) => a.prazo - b.prazo

function TodayTasks({ tarefas, emFocoId, agora, onAlternar }) {
  const checkboxes = useRef(new Map())

  const emFoco = tarefas.filter((t) => t.id === emFocoId && !t.concluida)
  const pendentes = tarefas.filter((t) => !t.concluida && t.id !== emFocoId).sort(porPrazo)
  const concluidas = tarefas.filter((t) => t.concluida).sort(porPrazo)
  const percentual = tarefas.length ? Math.round((concluidas.length / tarefas.length) * 100) : 0

  // A tarefa muda de lista ao ser marcada; devolve o foco ao novo checkbox.
  function alternar(id) {
    onAlternar(id)
    requestAnimationFrame(() => checkboxes.current.get(id)?.focus())
  }

  function renderTarefa(tarefa) {
    const atrasada = !tarefa.concluida && tarefa.prazo < agora
    const foco = tarefa.id === emFocoId && !tarefa.concluida
    const classes = ['task', foco && 'task--foco', tarefa.concluida && 'task--concluida']

    return (
      <li key={tarefa.id} className={classes.filter(Boolean).join(' ')}>
        <input
          type="checkbox"
          className="task-check"
          checked={tarefa.concluida}
          onChange={() => alternar(tarefa.id)}
          aria-label={`Concluir: ${tarefa.titulo}`}
          ref={(el) => {
            if (el) checkboxes.current.set(tarefa.id, el)
            else checkboxes.current.delete(tarefa.id)
          }}
        />
        <div className="task-body">
          <span className="task-title">{tarefa.titulo}</span>
          <span className="task-meta">
            <span
              className={`task-prio task-prio--${tarefa.prioridade}`}
              role="img"
              title={ROTULO_PRIORIDADE[tarefa.prioridade]}
              aria-label={ROTULO_PRIORIDADE[tarefa.prioridade]}
            />
            <span>{tarefa.projeto}</span>
            <span aria-hidden="true">·</span>
            <span>até {formatarHora(tarefa.prazo)}</span>
            {foco && <span className="task-badge task-badge--foco">Em foco</span>}
            {atrasada && <span className="task-badge task-badge--atrasada">Atrasada</span>}
          </span>
        </div>
      </li>
    )
  }

  return (
    <section className="tasks-card" aria-labelledby="tasks-title">
      <header className="tasks-head">
        <h2 id="tasks-title">Tarefas de hoje</h2>
        <span className="tasks-count">
          {concluidas.length}/{tarefas.length}
        </span>
      </header>

      <div
        className="tasks-progress"
        role="progressbar"
        aria-valuenow={percentual}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso das tarefas de hoje"
      >
        <div className="tasks-progress-fill" style={{ width: `${percentual}%` }} />
      </div>

      {tarefas.length === 0 && <p className="tasks-empty">Nenhuma tarefa para hoje.</p>}

      {emFoco.length + pendentes.length > 0 && (
        <ul className="tasks-list">{[...emFoco, ...pendentes].map(renderTarefa)}</ul>
      )}

      {concluidas.length > 0 && (
        <>
          <p className="tasks-group">Concluídas</p>
          <ul className="tasks-list">{concluidas.map(renderTarefa)}</ul>
        </>
      )}
    </section>
  )
}

export default TodayTasks
