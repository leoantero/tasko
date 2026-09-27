import { useEffect, useId, useRef, useState } from 'react'
import ProjectCard from './ProjectCard.jsx'
import { somarDias } from './datas'

const LIMITE_NOME = 120
const LIMITE_CATEGORIA = 60
const ATALHOS_PRAZO = [
  { rotulo: '+1 semana', dias: 7 },
  { rotulo: '+1 mês', dias: 30 },
]

function ProjectForm({ categorias, onFechar, onCriar }) {
  const dialogo = useRef(null)
  const campoNome = useRef(null)
  const id = useId()
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prazo, setPrazo] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!dialogo.current.open) dialogo.current.showModal()
    campoNome.current.focus()
  }, [])

  // close() devolve o foco ao botão que abriu; avisar o pai aqui evita depender
  // do evento "close", que é assíncrono. O onClose do <dialog> cobre o Esc.
  function fechar() {
    dialogo.current.close()
    onFechar()
  }

  function enviar(evento) {
    evento.preventDefault()
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      setErro('Dê um nome ao projeto.')
      campoNome.current.focus()
      return
    }
    onCriar({
      nome: nomeLimpo,
      categoria: categoria.trim() || null,
      descricao: descricao.trim() || null,
      prazo: prazo || null,
    })
    fechar()
  }

  const previa = {
    nome: nome.trim() || 'Nome do projeto',
    categoria: categoria.trim() || null,
    descricao: descricao.trim() || null,
    prazo: prazo || null,
    status: 'ativo',
    criado_em: new Date().toISOString(),
    concluido_em: null,
  }

  return (
    <dialog
      ref={dialogo}
      className="project-dialog"
      aria-labelledby={`${id}-titulo`}
      onClose={onFechar}
      onClick={(evento) => evento.target === dialogo.current && fechar()}
    >
      <div className="project-dialog-corpo">
        <header className="project-dialog-head">
          <h2 id={`${id}-titulo`}>Novo projeto</h2>
          <button type="button" className="project-dialog-fechar" onClick={fechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="project-dialog-grid">
          <form className="project-form" onSubmit={enviar} noValidate>
            <div className="project-field">
              <label htmlFor={`${id}-nome`}>Nome</label>
              <input
                ref={campoNome}
                id={`${id}-nome`}
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setErro('')
                }}
                maxLength={LIMITE_NOME}
                placeholder="Ex.: TCC, Portfólio, Inglês"
                aria-invalid={erro !== ''}
                aria-describedby={`${id}-nome-info`}
                required
              />
              <span id={`${id}-nome-info`} className="project-field-info">
                {erro ? <span className="project-field-erro">{erro}</span> : 'Obrigatório'}
                <span className="project-field-contador">
                  {nome.length}/{LIMITE_NOME}
                </span>
              </span>
            </div>

            <div className="project-field">
              <label htmlFor={`${id}-categoria`}>Categoria</label>
              <input
                id={`${id}-categoria`}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                maxLength={LIMITE_CATEGORIA}
                placeholder="Ex.: Faculdade"
              />
              {categorias.length > 0 && (
                <div className="project-sugestoes" role="group" aria-label="Categorias já usadas">
                  {categorias.map((c) => (
                    <button key={c} type="button" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="project-field">
              <label htmlFor={`${id}-descricao`}>Descrição</label>
              <textarea
                id={`${id}-descricao`}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="O que você quer alcançar com este projeto?"
              />
            </div>

            <div className="project-field">
              <label htmlFor={`${id}-prazo`}>Prazo</label>
              <input id={`${id}-prazo`} type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
              <div className="project-sugestoes" role="group" aria-label="Atalhos de prazo">
                {ATALHOS_PRAZO.map((a) => (
                  <button key={a.dias} type="button" onClick={() => setPrazo(somarDias(a.dias))}>
                    {a.rotulo}
                  </button>
                ))}
                <button type="button" aria-pressed={prazo === ''} onClick={() => setPrazo('')}>
                  Sem prazo
                </button>
              </div>
            </div>

            <footer className="project-form-acoes">
              <button type="button" className="project-btn project-btn--secundario" onClick={fechar}>
                Cancelar
              </button>
              <button type="submit" className="project-btn project-btn--primario">
                Criar projeto
              </button>
            </footer>
          </form>

          <aside className="project-previa" aria-hidden="true">
            <span className="project-previa-rotulo">Pré-visualização</span>
            <ProjectCard projeto={previa} />
          </aside>
        </div>
      </div>
    </dialog>
  )
}

export default ProjectForm
