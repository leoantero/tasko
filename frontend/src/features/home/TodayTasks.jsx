import { useRef } from 'react'
import './TodayTasks.css'
import { useDados } from '../../lib/dados'
import { ordenarConcluidas, ordenarPendentes, rotuloPrioridade, situacaoTarefa } from '../tasks/tarefas'

const CLASSE_PRIORIDADE = { 3: 'alta', 2: 'media', 1: 'baixa' }

// Tarefas reais (formato da API) que vencem hoje, estão atrasadas, em foco ou foram concluídas hoje.
function TodayTasks({ tarefas, emFocoId, onAlternar }) {
  const { projetos } = useDados()
  const checkboxes = useRef(new Map())

  const emFoco = tarefas.filter((t) => t.id === emFocoId && t.status === 'pendente')
  const pendentes = tarefas.filter((t) => t.status === 'pendente' && t.id !== emFocoId).sort(ordenarPendentes)
  const concluidas = tarefas.filter((t) => t.status === 'concluida').sort(ordenarConcluidas)
  const percentual = tarefas.length ? Math.round((concluidas.length / tarefas.length) * 100) : 0

  // A tarefa muda de lista ao ser marcada; devolve o foco ao novo checkbox.
  async function alternar(tarefa) {
    await onAlternar(tarefa)
    requestAnimationFrame(() => checkboxes.current.get(tarefa.id)?.focus())
  }

  function renderTarefa(tarefa) {
    const concluida = tarefa.status === 'concluida'
    const situacao = situacaoTarefa(tarefa)
    const atrasada = situacao.tipo === 'atrasada'
    const foco = tarefa.id === emFocoId && !concluida
    const projeto = projetos.find((p) => p.id === tarefa.projeto_id)
    const classes = ['task', foco && 'task--foco', concluida && 'task--concluida']

    return (
      <li key={tarefa.id} className={classes.filter(Boolean).join(' ')}>
        <input
          type="checkbox"
          className="task-check"
          checked={concluida}
          onChange={() => alternar(tarefa)}
          aria-label={`Concluir: ${tarefa.titulo}`}
          ref={(el) => {
            if (el) checkboxes.current.set(tarefa.id, el)
            else checkboxes.current.delete(tarefa.id)
          }}
        />
        <div className="task-body">
          <span className="task-title">{tarefa.titulo}</span>
          <span className="task-meta">
            {tarefa.prioridade && (
              <span
                className={`task-prio task-prio--${CLASSE_PRIORIDADE[tarefa.prioridade]}`}
                role="img"
                title={rotuloPrioridade(tarefa.prioridade)}
                aria-label={rotuloPrioridade(tarefa.prioridade)}
              />
            )}
            {projeto && (
              <>
                <span>{projeto.nome}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>{situacao.rotulo}</span>
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
