import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import './TaskPanel.css'
import { useDados } from '../../lib/dados'
import { useFoco } from '../pomodoro/foco'
import { focoPorTarefa } from '../pomodoro/produtividade'
import IniciarSessao from '../pomodoro/IniciarSessao.jsx'
import ConfirmarExclusao from './ConfirmarExclusao.jsx'
import TaskConcluidas from './TaskConcluidas.jsx'
import TaskForm from './TaskForm.jsx'
import TaskGrupos from './TaskGrupos.jsx'
import TaskItem from './TaskItem.jsx'
import TaskQuickAdd from './TaskQuickAdd.jsx'
import { ordenarConcluidas, ordenarPendentes, rotuloPrioridade } from './tarefas'

function TaskPanel({ projetoId, tarefas, vazio = 'Nenhuma tarefa ainda. Comece pela primeira acima.' }) {
  const { sessoes, criarTarefa, atualizarTarefa, excluirTarefa } = useDados()
  const { estado: foco } = useFoco()
  const id = useId()
  const painel = useRef(null)
  const campoNova = useRef(null)
  const focarDepois = useRef(null)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)
  const [focando, setFocando] = useState(null)
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')
  const [ocupadas, setOcupadas] = useState(() => new Set())

  useEffect(() => {
    if (!aviso) return undefined
    const timer = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(timer)
  }, [aviso])

  // Marcar ou mudar a prioridade leva a tarefa para outra seção (o botão é recriado) e
  // excluir remove o botão que abriu a confirmação: devolve o foco depois que a tela
  // atualiza e o diálogo fecha (com o modal aberto, o resto da página é inerte).
  // O pedido só é consumido quando a tarefa já tem o valor novo e o botão existe
  // (a seção de concluídas pode abrir num render posterior; com a API, o valor chega depois).
  useLayoutEffect(() => {
    const pedido = focarDepois.current
    if (pedido === null || editando || excluindo) return
    let alvo = campoNova.current
    if (pedido !== 'nova') {
      if ((tarefas.find((t) => t.id === pedido.id)?.[pedido.campo] ?? null) !== pedido.valor) return
      alvo = painel.current.querySelector(`[data-tarefa="${pedido.id}"] ${pedido.alvo}`)
      if (!alvo || alvo.closest('[hidden]')) return
    }
    focarDepois.current = null
    alvo.focus()
  })

  const pendentes = tarefas.filter((t) => t.status === 'pendente').sort(ordenarPendentes)
  const concluidas = tarefas.filter((t) => t.status === 'concluida').sort(ordenarConcluidas)
  const focoDaTarefa = focoPorTarefa(sessoes)

  // Concluir e priorizar viram requisição: sem travar a tarefa, um clique repetido
  // manda dois PUTs e a lista pisca entre as duas respostas. O mock nunca falhava,
  // então também não havia o que mostrar quando a API recusa.
  async function comTarefaOcupada(tarefa, acao) {
    if (ocupadas.has(tarefa.id)) return
    setOcupadas((atuais) => new Set(atuais).add(tarefa.id))
    setErro('')
    try {
      await acao()
    } catch (falha) {
      focarDepois.current = null
      setErro(falha.message)
    } finally {
      setOcupadas((atuais) => {
        const proximas = new Set(atuais)
        proximas.delete(tarefa.id)
        return proximas
      })
    }
  }

  async function adicionar(titulo) {
    await criarTarefa({ projeto_id: projetoId, titulo })
    setAviso(`Tarefa "${titulo}" adicionada.`)
  }

  function alternar(tarefa) {
    const status = tarefa.status === 'concluida' ? 'pendente' : 'concluida'
    return comTarefaOcupada(tarefa, async () => {
      focarDepois.current = { id: tarefa.id, campo: 'status', valor: status, alvo: '.task-item-check' }
      await atualizarTarefa(tarefa.id, { status })
      if (status === 'concluida') setMostrarConcluidas(true)
      setAviso(status === 'concluida' ? 'Tarefa concluída.' : 'Tarefa reaberta.')
    })
  }

  function priorizar(tarefa, prioridade) {
    return comTarefaOcupada(tarefa, async () => {
      focarDepois.current = { id: tarefa.id, campo: 'prioridade', valor: prioridade, alvo: '.prio-bandeira' }
      await atualizarTarefa(tarefa.id, { prioridade })
      setAviso(`${rotuloPrioridade(prioridade)}: ${tarefa.titulo}.`)
    })
  }

  function renderizar(tarefa) {
    const emFoco = foco?.fase === 'foco' && foco.tarefaId === tarefa.id
    return (
      <TaskItem
        key={tarefa.id}
        tarefa={tarefa}
        emFoco={emFoco}
        focoSeg={focoDaTarefa.get(tarefa.id)}
        ocupada={ocupadas.has(tarefa.id)}
        onFocar={() => (emFoco ? (window.location.hash = '#/foco') : setFocando(tarefa))}
        onAlternar={() => alternar(tarefa)}
        onPriorizar={(prioridade) => priorizar(tarefa, prioridade)}
        onEditar={() => setEditando(tarefa)}
        onExcluir={() => setExcluindo(tarefa)}
      />
    )
  }

  return (
    <section ref={painel} className="task-panel" aria-labelledby={`${id}-titulo`}>
      <header className="task-panel-head">
        <h2 id={`${id}-titulo`}>Tarefas</h2>
        <span className="task-panel-contagem">
          {concluidas.length}/{tarefas.length}
        </span>
      </header>

      <TaskQuickAdd campoRef={campoNova} onAdicionar={adicionar} />

      {pendentes.length > 0 ? (
        <TaskGrupos pendentes={pendentes} renderizar={renderizar} />
      ) : (
        <p className="task-vazio">
          {tarefas.length === 0 ? vazio : 'Tudo em dia por aqui.'}
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
            // Mudar a prioridade leva a tarefa para outro grupo: o foco volta ao "Editar" dela.
            focarDepois.current = {
              id: editando.id,
              campo: 'prioridade',
              valor: mudancas.prioridade,
              alvo: '.task-item-acao--editar',
            }
            setAviso('Tarefa atualizada.')
          }}
        />
      )}

      {focando && <IniciarSessao tarefa={focando} onFechar={() => setFocando(null)} />}

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

      {erro && (
        <p className="task-erro" role="alert">
          {erro}
        </p>
      )}

      <p className="sr-only" role="status">
        {aviso}
      </p>
    </section>
  )
}

export default TaskPanel
