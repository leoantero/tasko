import './ProjectCard.css'
import { formatarData, progressoPrazo, situacaoPrazo } from './datas'

function ProjectCard({ projeto, novo = false }) {
  const situacao = situacaoPrazo(projeto)
  const progresso = progressoPrazo(projeto)
  const classes = ['project-card', `project-card--${situacao.tipo}`, novo && 'project-card--novo']

  return (
    <article className={classes.filter(Boolean).join(' ')}>
      <header className="project-card-head">
        <span className="project-card-categoria">{projeto.categoria || 'Sem categoria'}</span>
        {projeto.status === 'concluido' && <span className="project-card-selo">Concluído</span>}
      </header>

      <h2 className="project-card-nome">{projeto.nome}</h2>
      {projeto.descricao && <p className="project-card-descricao">{projeto.descricao}</p>}

      <footer className="project-card-prazo">
        {progresso !== null && (
          <div className="project-card-regua" aria-hidden="true">
            <span style={{ width: `${progresso * 100}%` }} />
          </div>
        )}
        <div className="project-card-prazo-texto">
          <span className="project-card-situacao">{situacao.rotulo}</span>
          {projeto.prazo && <span>prazo {formatarData(projeto.prazo)}</span>}
        </div>
      </footer>
    </article>
  )
}

export default ProjectCard
