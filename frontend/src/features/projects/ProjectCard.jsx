import './ProjectCard.css'
import { duracaoCurta } from '../pomodoro/produtividade'
import { formatarData, lerData, progressoPrazo, situacaoPrazo } from './datas'

function ProjectCard({ projeto, novo = false, tarefas = null, href = null }) {
  const situacao = situacaoPrazo(projeto)
  const progresso = progressoPrazo(projeto)
  const classes = [
    'project-card',
    `project-card--${situacao.tipo}`,
    novo && 'project-card--novo',
    href && 'project-card--link',
  ]

  return (
    <article className={classes.filter(Boolean).join(' ')}>
      <header className="project-card-head">
        <span className="project-card-categoria">{projeto.categoria || 'Sem categoria'}</span>
        {projeto.status === 'concluido' && <span className="project-card-selo">Concluído</span>}
      </header>

      <h2 className="project-card-nome">{href ? <a href={href}>{projeto.nome}</a> : projeto.nome}</h2>
      {tarefas?.total > 0 && (
        <p className="project-card-tarefas">
          {tarefas.concluidas} de {tarefas.total} {tarefas.total === 1 ? 'tarefa concluída' : 'tarefas concluídas'}
          {tarefas.focoSeg > 0 && ` · ${duracaoCurta(tarefas.focoSeg)} de foco`}
        </p>
      )}
      {projeto.descricao && <p className="project-card-descricao">{projeto.descricao}</p>}

      <footer className="project-card-prazo">
        {progresso !== null && (
          <div className="project-card-regua" aria-hidden="true">
            <span style={{ width: `${progresso * 100}%` }} />
          </div>
        )}
        <div className="project-card-prazo-texto">
          <span className="project-card-situacao">{situacao.rotulo}</span>
          {projeto.prazo && <span>prazo {formatarData(lerData(projeto.prazo))}</span>}
        </div>
      </footer>
    </article>
  )
}

export default ProjectCard
