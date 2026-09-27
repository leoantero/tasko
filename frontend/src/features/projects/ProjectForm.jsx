import { useEffect, useId, useRef, useState } from 'react'

const LIMITE_NOME = 120

function ProjectForm({ onFechar, onCriar }) {
  const dialogo = useRef(null)
  const campoNome = useRef(null)
  const id = useId()
  const [nome, setNome] = useState('')
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
    })
    fechar()
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

            <footer className="project-form-acoes">
              <button type="button" className="project-btn project-btn--secundario" onClick={fechar}>
                Cancelar
              </button>
              <button type="submit" className="project-btn project-btn--primario">
                Criar projeto
              </button>
            </footer>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default ProjectForm
