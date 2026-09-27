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
      {aberta && (
        <ul id={id} className="task-list">
          {children}
        </ul>
      )}
    </div>
  )
}

export default TaskConcluidas
