import './TasksScreen.css'
import TaskPanel from './TaskPanel.jsx'
import { useDados } from '../../lib/dados'
import { situacaoTarefa } from './tarefas'

// HU11: tarefas que não pertencem a projeto nenhum. A criação e as ações são as mesmas
// da página do projeto — o painel só recebe a lista filtrada e projetoId nulo, o que faz
// o POST /tarefas ir sem projeto_id.
function TasksScreen() {
  const { tarefas } = useDados()

  const avulsas = tarefas.filter((t) => !t.projeto_id)
  const pendentes = avulsas.filter((t) => t.status === 'pendente')
  const atrasadas = pendentes.filter((t) => situacaoTarefa(t).tipo === 'atrasada').length
  const concluidas = avulsas.length - pendentes.length

  return (
    <main className="tasks-screen">
      <header className="tasks-screen-head">
        <h1>Tarefas avulsas</h1>
        <p className="tasks-screen-resumo">
          {pendentes.length} {pendentes.length === 1 ? 'pendente' : 'pendentes'} · {concluidas}{' '}
          {concluidas === 1 ? 'concluída' : 'concluídas'}
          {atrasadas > 0 && (
            <span className="tasks-screen-alerta">
              {' '}
              · {atrasadas} com prazo vencido
            </span>
          )}
        </p>
      </header>

      <TaskPanel
        projetoId={null}
        tarefas={avulsas}
        vazio="Nada solto por aqui. Use esta lista para o que não pertence a um projeto."
      />
    </main>
  )
}

export default TasksScreen
