import { useId } from 'react'

function TaskConcluidas({ quantidade, aberta, onAlternar, children }) {
  const id = useId()

  return (
    <div className="task-concluidas">
      <button
        type="button"
        className="task-concluidas-toggle"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={onAlternar}
      >
        Concluídas ({quantidade})
      </button>
      <ul id={id} className="task-list" hidden={!aberta}>
        {children}
      </ul>
    </div>
  )
}

export default TaskConcluidas
