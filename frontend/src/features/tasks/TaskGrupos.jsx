import { useId } from 'react'
import './Prioridade.css'
import { PRIORIDADES, rotuloPrioridade } from './tarefas'

// Separa as pendentes por prioridade para deixar claro o que merece atenção primeiro.
// Sem nenhuma prioridade definida, os títulos só ocupariam espaço: vira uma lista única.
function TaskGrupos({ pendentes, renderizar }) {
  const id = useId()

  if (!pendentes.some((t) => t.prioridade)) {
    return <ul className="task-list">{pendentes.map(renderizar)}</ul>
  }

  return PRIORIDADES.map((valor) => {
    const grupo = pendentes.filter((t) => (t.prioridade ?? null) === valor)
    if (grupo.length === 0) return null
    const tituloId = `${id}-${valor ?? 0}`

    return (
      <section key={valor ?? 0} className="task-grupo" aria-labelledby={tituloId}>
        <h3 id={tituloId} className="task-grupo-titulo">
          <span className={`prio-ponto prio-ponto--${valor ?? 0}`} aria-hidden="true" />
          {rotuloPrioridade(valor)}{' '}
          <span className="task-grupo-contagem">{grupo.length}</span>
        </h3>
        <ul className="task-list">{grupo.map(renderizar)}</ul>
      </section>
    )
  })
}

export default TaskGrupos
