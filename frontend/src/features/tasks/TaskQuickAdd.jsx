import { useId, useState } from 'react'

const LIMITE_TITULO = 150

function TaskQuickAdd({ campoRef, onAdicionar }) {
  const id = useId()
  const [titulo, setTitulo] = useState('')
  const [erro, setErro] = useState('')

  async function enviar(evento) {
    evento.preventDefault()
    const limpo = titulo.trim()
    if (!limpo) return
    try {
      await onAdicionar(limpo)
      setTitulo('')
    } catch (erroApi) {
      setErro(erroApi.message)
    }
  }

  return (
    <>
      <form className="task-add" onSubmit={enviar}>
        <label htmlFor={id} className="sr-only">
          Nova tarefa
        </label>
        <span className="task-add-mais" aria-hidden="true">
          +
        </span>
        <input
          ref={campoRef}
          id={id}
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value)
            setErro('')
          }}
          maxLength={LIMITE_TITULO}
          placeholder="Adicionar uma tarefa…"
          autoComplete="off"
        />
        <button type="submit" className="task-add-btn" disabled={!titulo.trim()}>
          Adicionar
        </button>
      </form>
      {erro && (
        <p className="campo-erro" role="alert">
          {erro}
        </p>
      )}
    </>
  )
}

export default TaskQuickAdd
