import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import './TaskPanel.css'
import { useDados } from '../../lib/dados'
import ConfirmarExclusao from './ConfirmarExclusao.jsx'
import TaskConcluidas from './TaskConcluidas.jsx'
import TaskForm from './TaskForm.jsx'
import TaskItem from './TaskItem.jsx'
import TaskQuickAdd from './TaskQuickAdd.jsx'
import { ordenarConcluidas, ordenarPendentes } from './tarefas'

function TaskPanel({ projetoId, tarefas }) {
  const { criarTarefa, atualizarTarefa, excluirTarefa } = useDados()
  const id = useId()
  const checkboxes = useRef(new Map())
  const campoNova = useRef(null)
  const focarDepois = useRef(null)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    if (!aviso) return undefined
    const timer = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(timer)
  }, [aviso])

  // Marcar muda a tarefa de seção (o checkbox é recriado) e excluir remove o botão que
  // abriu a confirmação: devolve o foco depois que a tela atualiza e o diálogo fecha
  // (com o modal aberto, o resto da página é inerte e não recebe foco).
  useLayoutEffect(() => {
    if (focarDepois.current === null || editando || excluindo) return
    const alvo = focarDepois.current === 'nova' ? campoNova.current : checkboxes.current.get(focarDepois.current)
    focarDepois.current = null
    alvo?.focus()
  })

  const pendentes = tarefas.filter((t) => t.status === 'pendente').sort(ordenarPendentes)
  const concluidas = tarefas.filter((t) => t.status === 'concluida').sort(ordenarConcluidas)

  async function adicionar(titulo) {
    await criarTarefa({ projeto_id: projetoId, titulo })
    setAviso(`Tarefa "${titulo}" adicionada.`)
  }

  async function alternar(tarefa) {
    const status = tarefa.status === 'concluida' ? 'pendente' : 'concluida'
    focarDepois.current = tarefa.id
    await atualizarTarefa(tarefa.id, { status })
    if (status === 'concluida') setMostrarConcluidas(true)
    setAviso(status === 'concluida' ? 'Tarefa concluída.' : 'Tarefa reaberta.')
  }

  function renderizar(tarefa) {
    return (
      <TaskItem
        key={tarefa.id}
        tarefa={tarefa}
        checkboxRef={(el) => {
          if (el) checkboxes.current.set(tarefa.id, el)
          else checkboxes.current.delete(tarefa.id)
        }}
        onAlternar={() => alternar(tarefa)}
        onEditar={() => setEditando(tarefa)}
        onExcluir={() => setExcluindo(tarefa)}
      />
    )
  }

  return (
    <section className="task-panel" aria-labelledby={`${id}-titulo`}>
      <header className="task-panel-head">
        <h2 id={`${id}-titulo`}>Tarefas</h2>
        <span className="task-panel-contagem">
          {concluidas.length}/{tarefas.length}
        </span>
      </header>

      <TaskQuickAdd campoRef={campoNova} onAdicionar={adicionar} />

      {pendentes.length > 0 ? (
        <ul className="task-list">{pendentes.map(renderizar)}</ul>
      ) : (
        <p className="task-vazio">
          {tarefas.length === 0 ? 'Nenhuma tarefa ainda. Comece pela primeira acima.' : 'Tudo em dia por aqui.'}
        </p>
      )}

      {concluidas.length > 0 && (
        <TaskConcluidas
          quantidade={concluidas.length}
          aberta={mostrarConcluidas}
          onAlternar={() => setMostrarConcluidas((v) => !v)}
        >
          {concluidas.map(renderizar)}
        </TaskConcluidas>
      )}

      {editando && (
        <TaskForm
          tarefa={editando}
          onFechar={() => setEditando(null)}
          onSalvar={async (mudancas) => {
            await atualizarTarefa(editando.id, mudancas)
            setAviso('Tarefa atualizada.')
          }}
        />
      )}

      {excluindo && (
        <ConfirmarExclusao
          tarefa={excluindo}
          onFechar={() => setExcluindo(null)}
          onConfirmar={async () => {
            await excluirTarefa(excluindo.id)
            focarDepois.current = 'nova'
            setAviso(`Tarefa "${excluindo.titulo}" excluída.`)
          }}
        />
      )}

      <p className="sr-only" role="status">
        {aviso}
      </p>
    </section>
  )
}

export default TaskPanel
