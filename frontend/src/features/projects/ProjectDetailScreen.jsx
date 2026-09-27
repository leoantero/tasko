import { useEffect } from 'react'
import './ProjectDetailScreen.css'
import { useDados } from '../../lib/dados'
import TaskPanel from '../tasks/TaskPanel.jsx'
import { formatarData, lerData, progressoPrazo, situacaoPrazo } from './datas'

function ProjectDetailScreen({ projetoId }) {
  const { projetos, tarefas } = useDados()
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
        <TaskPanel projetoId={projeto.id} tarefas={doProjeto} />
      </div>
    </main>
  )
}

export default ProjectDetailScreen
