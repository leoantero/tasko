import { ROTULO_PRIORIDADE, situacaoTarefa } from './tarefas'

function TaskItem({ tarefa, checkboxRef, onAlternar, onEditar, onExcluir }) {
  const situacao = situacaoTarefa(tarefa)
  const concluida = tarefa.status === 'concluida'

  return (
    <li className={`task-item task-item--${situacao.tipo}`}>
      <input
        ref={checkboxRef}
        type="checkbox"
        className="task-item-check"
        checked={concluida}
        onChange={onAlternar}
        aria-label={`Concluir: ${tarefa.titulo}`}
      />

      <div className="task-item-corpo">
        <span className="task-item-titulo">{tarefa.titulo}</span>
        {tarefa.descricao && <span className="task-item-descricao">{tarefa.descricao}</span>}
        <span className="task-item-meta">
          {tarefa.prioridade && (
            <span
              className={`task-item-prio task-item-prio--${tarefa.prioridade}`}
              role="img"
              title={ROTULO_PRIORIDADE[tarefa.prioridade]}
              aria-label={ROTULO_PRIORIDADE[tarefa.prioridade]}
            />
          )}
          <span className="task-item-situacao">{situacao.rotulo}</span>
        </span>
      </div>

      <div className="task-item-acoes">
        <button type="button" className="task-item-acao" onClick={onEditar} aria-label={`Editar: ${tarefa.titulo}`}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M13.5 3.5l3 3L7 16H4v-3z" />
            <path d="M11.5 5.5l3 3" />
          </svg>
        </button>
        <button
          type="button"
          className="task-item-acao task-item-acao--perigo"
          onClick={onExcluir}
          aria-label={`Excluir: ${tarefa.titulo}`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M4 6h12" />
            <path d="M8 6V4h4v2" />
            <path d="M5.5 6l.8 10h7.4l.8-10" />
          </svg>
        </button>
      </div>
    </li>
  )
}

export default TaskItem
