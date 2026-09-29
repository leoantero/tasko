import { useEffect, useState } from 'react'
import './ProjectDetailScreen.css'
import { useDados } from '../../lib/dados'
import { useFoco } from '../pomodoro/foco'
import IniciarSessao from '../pomodoro/IniciarSessao.jsx'
import ConfirmarExclusaoProjeto from './ConfirmarExclusaoProjeto.jsx'
import ProjectForm from './ProjectForm.jsx'
import { listarCategorias } from './categorias'
import TempoDedicado from '../pomodoro/TempoDedicado.jsx'
import TaskPanel from '../tasks/TaskPanel.jsx'
import { ordenarPendentes, rotuloPrioridade, situacaoTarefa } from '../tasks/tarefas'
import { diasAte, formatarData, lerData, progressoPrazo, situacaoPrazo } from './datas'

const RAIO = 52
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

function ProjectDetailScreen({ projetoId }) {
  const { projetos, tarefas, sessoes, atualizarProjeto, excluirProjeto } = useDados()
  const { estado: foco } = useFoco()
  const [focando, setFocando] = useState(null)
  const [editando, setEditando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')
  const projeto = projetos.find((p) => p.id === projetoId)

  useEffect(() => {
    document.title = `${projeto ? projeto.nome : 'Projeto não encontrado'} · Tasko`
  }, [projeto])

  if (!projeto) {
    return (
      <main className="projeto">
        <a className="projeto-voltar" href="#/projetos">
          Projetos
        </a>
        <h1>Projeto não encontrado</h1>
        <p className="projeto-descricao">Ele pode ter sido excluído ou o endereço está incorreto.</p>
      </main>
    )
  }

  const doProjeto = tarefas.filter((t) => t.projeto_id === projeto.id)
  const concluidas = doProjeto.filter((t) => t.status === 'concluida').length
  const pendentes = doProjeto.filter((t) => t.status === 'pendente')
  const atrasadas = pendentes.filter((t) => situacaoTarefa(t).tipo === 'atrasada').length
  const proxima = pendentes
    .filter((t) => t.prazo && diasAte(t.prazo) >= 0)
    .sort((a, b) => lerData(a.prazo) - lerData(b.prazo))[0]
  // A tarefa que merece atenção primeiro: a do topo da lista (prioridade, depois prazo).
  const comecePor = [...pendentes].sort(ordenarPendentes)[0]
  const comecePorEmFoco = foco?.fase === 'foco' && foco.tarefaId === comecePor?.id
  const percentual = doProjeto.length ? Math.round((concluidas / doProjeto.length) * 100) : 0

  const situacao = situacaoPrazo(projeto)
  const progressoDoPrazo = progressoPrazo(projeto)

  return (
    <main className="projeto">
      <a className="projeto-voltar" href="#/projetos">
        Projetos
      </a>

      <header className={`projeto-head projeto-head--${situacao.tipo}`}>
        <span className="projeto-categoria">
          {projeto.categoria || 'Sem categoria'}
          {projeto.status === 'concluido' && <span className="projeto-selo">Concluído</span>}
        </span>
        <h1>{projeto.nome}</h1>
        {projeto.descricao && <p className="projeto-descricao">{projeto.descricao}</p>}
        <div className="projeto-acoes">
          <button type="button" className="projeto-btn" onClick={() => setEditando(true)}>
            Editar
          </button>
          <button
            type="button"
            className="projeto-btn"
            onClick={async () => {
              const status = projeto.status === 'concluido' ? 'ativo' : 'concluido'
              try {
                await atualizarProjeto(projeto.id, { status })
              } catch (falha) {
                setErro(falha.message)
              }
            }}
          >
            {projeto.status === 'concluido' ? 'Reabrir projeto' : 'Concluir projeto'}
          </button>
          <button type="button" className="projeto-btn projeto-btn--perigo" onClick={() => setExcluindo(true)}>
            Excluir
          </button>
        </div>

        {erro && (
          <p className="projeto-erro" role="alert">
            {erro}
          </p>
        )}

        <div className="projeto-prazo">
          {progressoDoPrazo !== null && (
            <div className="projeto-regua" aria-hidden="true">
              <span style={{ width: `${progressoDoPrazo * 100}%` }} />
            </div>
          )}
          <span className="projeto-situacao">{situacao.rotulo}</span>
          {projeto.prazo && <span>prazo {formatarData(lerData(projeto.prazo))}</span>}
        </div>
      </header>

      <div className="projeto-grid">
        <div className="projeto-principal">
          <TaskPanel projetoId={projeto.id} tarefas={doProjeto} />
          <TempoDedicado tarefas={doProjeto} sessoes={sessoes} />
        </div>

        <aside className="projeto-resumo" aria-label="Resumo das tarefas">
          <div className="projeto-anel">
            <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <circle className="projeto-anel-trilha" cx="60" cy="60" r={RAIO} />
              <circle
                className="projeto-anel-progresso"
                cx="60"
                cy="60"
                r={RAIO}
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={CIRCUNFERENCIA * (1 - percentual / 100)}
              />
            </svg>
            <span className="projeto-anel-texto">
              <strong>{percentual}%</strong>
              concluído
            </span>
          </div>

          <dl className="projeto-numeros">
            <div>
              <dt>Pendentes</dt>
              <dd>{pendentes.length}</dd>
            </div>
            <div>
              <dt>Atrasadas</dt>
              <dd className={atrasadas > 0 ? 'projeto-alerta' : undefined}>{atrasadas}</dd>
            </div>
          </dl>

          <div className="projeto-proxima">
            <span className="projeto-proxima-rotulo">Comece por</span>
            {comecePor ? (
              <>
                <strong>{comecePor.titulo}</strong>
                <span>
                  {rotuloPrioridade(comecePor.prioridade)} · {situacaoTarefa(comecePor).rotulo}
                </span>
                <button
                  type="button"
                  className="projeto-focar"
                  onClick={() => (comecePorEmFoco ? (window.location.hash = '#/foco') : setFocando(comecePor))}
                >
                  {comecePorEmFoco ? 'Ver sessão em andamento' : 'Iniciar foco'}
                </button>
              </>
            ) : (
              <span>Nenhuma tarefa pendente.</span>
            )}
          </div>

          <div className="projeto-proxima">
            <span className="projeto-proxima-rotulo">Próxima entrega</span>
            {proxima ? (
              <>
                <strong>{proxima.titulo}</strong>
                <span>{situacaoTarefa(proxima).rotulo}</span>
              </>
            ) : (
              <span>Nenhuma tarefa com prazo pela frente.</span>
            )}
          </div>
        </aside>
      </div>

      {focando && <IniciarSessao tarefa={focando} onFechar={() => setFocando(null)} />}

      {excluindo && (
        <ConfirmarExclusaoProjeto
          projeto={projeto}
          quantasTarefas={doProjeto.length}
          onFechar={() => setExcluindo(false)}
          onConfirmar={async (destino) => {
            await excluirProjeto(projeto.id, destino)
            window.location.hash = '#/projetos'
          }}
        />
      )}

      {editando && (
        <ProjectForm
          projeto={projeto}
          categorias={listarCategorias(projetos)}
          onFechar={() => setEditando(false)}
          onSalvar={(mudancas) => atualizarProjeto(projeto.id, mudancas)}
        />
      )}
    </main>
  )
}

export default ProjectDetailScreen
