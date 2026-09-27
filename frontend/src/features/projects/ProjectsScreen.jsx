import { useEffect, useState } from 'react'
import './ProjectsScreen.css'
import ProjectCard from './ProjectCard.jsx'
import ProjectForm from './ProjectForm.jsx'
import { diasAte } from './datas'
import { projetosIniciais } from './mockProjetos'

const FILTROS = [
  { id: 'ativo', rotulo: 'Ativos' },
  { id: 'concluido', rotulo: 'Concluídos' },
  { id: 'todos', rotulo: 'Todos' },
]

// Ativos por prazo mais próximo (sem prazo por último); concluídos pelos mais recentes.
function ordenar(a, b) {
  if (a.status !== b.status) return a.status === 'ativo' ? -1 : 1
  if (a.status === 'concluido') return new Date(b.concluido_em) - new Date(a.concluido_em)
  if (!a.prazo || !b.prazo) return (a.prazo ? -1 : 0) + (b.prazo ? 1 : 0)
  return a.prazo.localeCompare(b.prazo)
}

function quando(dias) {
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  return `em ${dias} dias`
}

function ProjectsScreen() {
  const [projetos, setProjetos] = useState(projetosIniciais)
  const [filtro, setFiltro] = useState('ativo')
  const [categoria, setCategoria] = useState(null)
  const [formAberto, setFormAberto] = useState(false)
  const [novoId, setNovoId] = useState(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    if (!aviso) return undefined
    const id = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(id)
  }, [aviso])

  const ativos = projetos.filter((p) => p.status === 'ativo')
  const contagem = { ativo: ativos.length, concluido: projetos.length - ativos.length, todos: projetos.length }
  const atrasados = ativos.filter((p) => p.prazo && diasAte(p.prazo) < 0).length
  const proximo = ativos.filter((p) => p.prazo && diasAte(p.prazo) >= 0).sort(ordenar)[0]
  const categorias = [...new Set(projetos.map((p) => p.categoria).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )
  const visiveis = projetos
    .filter((p) => (filtro === 'todos' || p.status === filtro) && (!categoria || p.categoria === categoria))
    .sort(ordenar)

  function criar(dados) {
    const projeto = { ...dados, id: Date.now(), status: 'ativo', criado_em: new Date().toISOString(), concluido_em: null }
    setProjetos((atuais) => [projeto, ...atuais])
    setFiltro('ativo')
    setCategoria(null)
    setNovoId(projeto.id)
    setAviso(`Projeto "${projeto.nome}" criado.`)
  }

  return (
    <main className="projects">
      <header className="projects-head">
        <div>
          <h1>Projetos</h1>
          <p className="projects-resumo">
            {contagem.ativo} {contagem.ativo === 1 ? 'ativo' : 'ativos'} · {contagem.concluido}{' '}
            {contagem.concluido === 1 ? 'concluído' : 'concluídos'}
            {atrasados > 0 && <span className="projects-resumo-alerta"> · {atrasados} com prazo vencido</span>}
            {proximo && (
              <>
                <br />
                Próximo prazo: <strong>{proximo.nome}</strong>, {quando(diasAte(proximo.prazo))}
              </>
            )}
          </p>
        </div>
        <button type="button" className="projects-btn-novo" onClick={() => setFormAberto(true)}>
          <span aria-hidden="true">+</span> Novo projeto
        </button>
      </header>

      <div className="projects-filtros">
        <div className="projects-status" role="group" aria-label="Filtrar por situação">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.rotulo} <span className="projects-status-contagem">{contagem[f.id]}</span>
            </button>
          ))}
        </div>

        {categorias.length > 0 && (
          <div className="projects-categorias" role="group" aria-label="Filtrar por categoria">
            <button type="button" className="projects-chip" aria-pressed={!categoria} onClick={() => setCategoria(null)}>
              Todas
            </button>
            {categorias.map((c) => (
              <button key={c} type="button" className="projects-chip" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {visiveis.length === 0 && filtro === 'concluido' ? (
        <p className="projects-vazio">Nenhum projeto concluído{categoria ? ` em ${categoria}` : ''} ainda.</p>
      ) : (
        <ul className="projects-grid">
          {visiveis.map((projeto) => (
            <li key={projeto.id}>
              <ProjectCard projeto={projeto} novo={projeto.id === novoId} />
            </li>
          ))}
          {filtro !== 'concluido' && (
            <li>
              <button type="button" className="projects-novo" onClick={() => setFormAberto(true)}>
                <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                  <path d="M 110 10 A 100 100 0 0 1 10 110" />
                  <path d="M 110 45 A 65 65 0 0 1 45 110" />
                </svg>
                <span className="projects-novo-mais" aria-hidden="true">+</span>
                Novo projeto
              </button>
            </li>
          )}
        </ul>
      )}

      {formAberto && (
        <ProjectForm categorias={categorias} onFechar={() => setFormAberto(false)} onCriar={criar} />
      )}

      <p className="projects-toast" role="status" data-visivel={aviso !== ''}>
        {aviso}
      </p>
    </main>
  )
}

export default ProjectsScreen
